from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from google import genai
import os
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/morning-coach", response_model=schemas.AIMessage)
def get_morning_coach(db: Session = Depends(get_db)):
    today = date.today()
    ai_msg = db.query(models.AIMessage).filter(models.AIMessage.date == today).first()
    
    if ai_msg:
        return ai_msg
        
    # Generate new message
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return schemas.AIMessage(date=today, generated_message="Welcome back. Let's make today count by focusing on consistency.")
        
    client = genai.Client(api_key=api_key)
    
    # Get yesterday's metrics
    yesterday = db.query(models.DailyMetrics).order_by(models.DailyMetrics.date.desc()).first()
    
    prompt = f"""
    You are a calm, minimalist productivity coach for a single user.
    Generate a short, supportive headline (1 or 2 lines maximum) based on yesterday's performance.
    - Realistic, supportive, never fake or toxic positive.
    - Acknowledge reality and encourage the next step.
    DO NOT wrap the text in quotes.
    
    Yesterday's Stats:
    - Completion: {yesterday.completion_percentage if yesterday else 0}%
    - Consistency Score: {yesterday.consistency_score if yesterday else 0}/100
    - Tasks Completed: {yesterday.tasks_completed if yesterday else 0}
    
    Output ONLY the message.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt
        )
        msg_text = response.text.strip().strip('"').strip("'")
    except Exception as e:
        msg_text = "Let's build on yesterday's momentum. Focus on completing your highest priority task first."
        
    ai_msg = models.AIMessage(date=today, generated_message=msg_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg

@router.get("/mission")
def get_todays_mission(db: Session = Depends(get_db)):
    # Find highest priority pending task
    task = db.query(models.Task).filter(models.Task.status == "Pending").order_by(
        models.Task.priority.desc(), models.Task.created_at.asc()
    ).first()
    
    if not task:
        return {"mission": None}
        
    return {
        "mission": {
            "title": task.title,
            "estimated_duration": task.estimated_duration or 30,
            "recommendation": "Recommended to start early."
        }
    }

@router.get("/chat/history", response_model=List[schemas.ChatMessage])
def get_chat_history(db: Session = Depends(get_db)):
    # Retrieve all chat history ordered by creation time
    messages = db.query(models.ChatHistory).order_by(models.ChatHistory.created_at.asc()).all()
    return messages

@router.post("/chat", response_model=schemas.ChatMessage)
def send_chat_message(req: schemas.ChatMessageCreate, db: Session = Depends(get_db)):
    # 1. Save user's message
    user_msg = models.ChatHistory(role="user", message=req.message)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 2. Gather context
    today = date.today()
    tasks_today = db.query(models.Task).all()
    pending_tasks = [t for t in tasks_today if t.status == 'Pending']
    completed_tasks = [t for t in tasks_today if t.status == 'Completed']
    
    non_negotiables = db.query(models.NonNegotiable).all()
    nn_logs = db.query(models.NonNegotiableLog).filter(models.NonNegotiableLog.date == today).all()
    
    nn_status = []
    for nn in non_negotiables:
        log = next((l for l in nn_logs if l.non_negotiable_id == nn.id), None)
        status = "Completed" if log and log.completed else "Pending"
        nn_status.append(f"{nn.title}: {status}")

    metrics = db.query(models.DailyMetrics).order_by(models.DailyMetrics.date.desc()).first()
    metrics_summary = f"Consistency Score: {metrics.consistency_score if metrics else 0}/100, Current Streak: {metrics.streak if metrics else 0} days."

    tasks_summary = "Pending Tasks:\n" + "\n".join([f"- {t.title} ({t.priority})" for t in pending_tasks])
    tasks_summary += "\nCompleted Tasks:\n" + "\n".join([f"- {t.title}" for t in completed_tasks])
    
    context = f"""
    Current Context for Today ({today}):
    {metrics_summary}

    Non-Negotiable Habits:
    {chr(10).join(nn_status)}

    {tasks_summary}
    """

    # 3. Retrieve recent history for context
    history = db.query(models.ChatHistory).order_by(models.ChatHistory.created_at.asc()).all()[-20:]
    
    # 4. Construct Prompt
    system_prompt = f"""
    You are an expert ADHD specialist and a supportive, positive friend to the user.
    You must use very informal, casual English (no textbook or rigid formatting).
    Your goal is to help the user manage their ADHD, stay on top of their tasks, and offer highly practical, bite-sized recommendations.
    Always treat them like a friend. Be empathetic, encouraging, and understanding of executive dysfunction.
    
    Here is their live data for today from their Momentum app:
    {context}
    """

    chat_transcript = ""
    for msg in history:
        prefix = "User: " if msg.role == "user" else "Assistant: "
        chat_transcript += f"{prefix}{msg.message}\n"

    final_prompt = f"{system_prompt}\n\nChat Transcript:\n{chat_transcript}\n\nRespond to the User's latest message as the Assistant. Keep it concise."

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        err_msg = models.ChatHistory(role="assistant", message="Hey! I need my Gemini API key to chat with you. Please add it to the backend environment variables.")
        db.add(err_msg)
        db.commit()
        db.refresh(err_msg)
        return err_msg
        
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=final_prompt
        )
        ai_response_text = response.text.strip()
    except Exception as e:
        ai_response_text = "I'm having a little trouble connecting right now. Can we try again in a sec?"
        print("Gemini Error:", e)

    # 5. Save assistant's response
    assistant_msg = models.ChatHistory(role="assistant", message=ai_response_text)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg
