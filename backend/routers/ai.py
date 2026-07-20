from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import google.generativeai as genai
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
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-3.1-flash-lite')
    
    # Get yesterday's metrics
    yesterday = db.query(models.DailyMetrics).order_by(models.DailyMetrics.date.desc()).first()
    
    prompt = f"""
    You are a calm, minimalist productivity coach for a single user.
    Generate ONE short morning message (under 80 words) based on yesterday's performance.
    - Realistic, supportive, never fake or toxic positive.
    - Acknowledge reality and encourage the next step.
    
    Yesterday's Stats:
    - Completion: {yesterday.completion_percentage if yesterday else 0}%
    - Consistency Score: {yesterday.consistency_score if yesterday else 0}/100
    - Tasks Completed: {yesterday.tasks_completed if yesterday else 0}
    
    Output ONLY the message.
    """
    
    try:
        response = model.generate_content(prompt)
        msg_text = response.text.strip()
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
