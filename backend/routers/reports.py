from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from collections import Counter
from google import genai
import os
from database import get_db
import models
from fpdf import FPDF

router = APIRouter()

def get_ist_date():
    return (datetime.utcnow() + timedelta(hours=5, minutes=30)).date()

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Momentum - Weekly Productivity Report', align='C', new_x="LMARGIN", new_y="NEXT")
        # ln(5) removed to reduce space

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

@router.get("/weekly")
def get_weekly_report(db: Session = Depends(get_db)):
    today = get_ist_date()
    
    # Python weekday(): Monday=0, Sunday=6
    # Calculate days since the most recent Sunday
    days_since_sunday = (today.weekday() + 1) % 7
    
    if days_since_sunday == 0:
        # If today is Sunday, generate report for the PREVIOUS week (Sunday to Saturday)
        start_of_week = today - timedelta(days=7)
    else:
        # If today is Mon-Sat, generate report for the CURRENT week (Sunday to Saturday)
        start_of_week = today - timedelta(days=days_since_sunday)
        
    end_of_week = start_of_week + timedelta(days=6)
    
    # Fetch Data for the week
    tasks_this_week = db.query(models.Task).filter(
        models.Task.created_at >= start_of_week,
        models.Task.created_at <= end_of_week + timedelta(days=1)
    ).all()
    
    completed_tasks = [t for t in tasks_this_week if t.status == 'Completed']
    pending_tasks = [t for t in tasks_this_week if t.status != 'Completed']
    
    # 1. Advanced Metrics Calculation
    completion_rate = round((len(completed_tasks) / len(tasks_this_week) * 100)) if tasks_this_week else 0
    
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    completed_days = [t.completed_at.weekday() for t in completed_tasks if t.completed_at]
    best_day = day_names[Counter(completed_days).most_common(1)[0][0]] if completed_days else "N/A"
    
    categories = [t.category for t in completed_tasks if t.category]
    best_category = Counter(categories).most_common(1)[0][0] if categories else "N/A"
    
    metrics = db.query(models.DailyMetrics).filter(models.DailyMetrics.date <= end_of_week).order_by(models.DailyMetrics.date.desc()).first()
    consistency_score = metrics.consistency_score if metrics else 0
    current_streak = metrics.streak if metrics else 0
    longest_streak = metrics.longest_streak if metrics else 0

    # 2. Previous Week Data
    prev_start = start_of_week - timedelta(days=7)
    prev_end = end_of_week - timedelta(days=7)
    prev_tasks = db.query(models.Task).filter(
        models.Task.created_at >= prev_start,
        models.Task.created_at <= prev_end + timedelta(days=1)
    ).all()
    prev_completed = len([t for t in prev_tasks if t.status == 'Completed'])
    prev_total = len(prev_tasks)
    prev_rate = round((prev_completed / prev_total * 100)) if prev_total > 0 else 0
    
    prev_metrics = db.query(models.DailyMetrics).filter(models.DailyMetrics.date <= prev_end).order_by(models.DailyMetrics.date.desc()).first()
    prev_streak = prev_metrics.streak if prev_metrics else 0
    
    # 3. Habit Specifics
    non_negotiables = db.query(models.NonNegotiable).all()
    nn_logs = db.query(models.NonNegotiableLog).filter(
        models.NonNegotiableLog.date >= start_of_week,
        models.NonNegotiableLog.date <= end_of_week,
        models.NonNegotiableLog.completed == True
    ).all()
    
    nn_summary = []
    for nn in non_negotiables:
        logs_for_nn = [l for l in nn_logs if l.non_negotiable_id == nn.id]
        completed_days_str = ", ".join([day_names[l.date.weekday()] for l in logs_for_nn])
        nn_summary.append(f"- {nn.title}: Completed {len(logs_for_nn)}/7 days. (Days done: {completed_days_str if completed_days_str else 'None'})")
        
    # 4. Task Specifics
    completed_task_titles = [f"- {t.title} (Cat: {t.category}, Completed: {t.completed_at.strftime('%A %I:%M %p')})" for t in completed_tasks if t.completed_at]
    pending_task_titles = [f"- {t.title} (Cat: {t.category})" for t in pending_tasks]
    
    # Call Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        report_text = "API Key not found. Please set GEMINI_API_KEY in the environment to generate AI reports."
    else:
        try:
            client = genai.Client(api_key=api_key)
            prompt = f"""
            You are a calm, minimalist, highly observant productivity coach writing a personal Weekly Report for a user.
            You must analyze the following raw data and write a highly structured, insightful, and premium report.
            
            Never exaggerate. Never use toxic positivity (Do NOT use words like Amazing, Outstanding, Incredible, Perfect, Phenomenal).
            Use calm, professional words (e.g. Consistent, Steady, Meaningful, Balanced, Reliable, Sustainable, Calm, Disciplined).
            Always acknowledge reality and explain WHY the numbers matter instead of just repeating them.
            
            [DATA SECTION]
            CURRENT WEEK: {start_of_week.strftime('%B %d, %Y')} to {end_of_week.strftime('%B %d, %Y')}
            Completion Rate: {completion_rate}%
            Tasks Completed: {len(completed_tasks)} / {len(tasks_this_week)}
            Consistency Score: {consistency_score}/100
            Current Streak: {current_streak} Days
            Longest Streak: {longest_streak} Days
            Best Day: {best_day}
            Most Productive Category: {best_category}
            
            PREVIOUS WEEK COMPARISON:
            Completion Rate: {prev_rate}%
            Tasks Completed: {prev_completed} / {prev_total}
            Previous Streak: {prev_streak} Days
            
            SPECIFIC COMPLETED TASKS (With timestamps for BPT observation):
            {chr(10).join(completed_task_titles) if completed_task_titles else "None"}
            
            SPECIFIC PENDING TASKS:
            {chr(10).join(pending_task_titles) if pending_task_titles else "None"}
            
            NON-NEGOTIABLES (Habits):
            {chr(10).join(nn_summary)}
            
            [OUTPUT STRUCTURE]
            You MUST follow this exact structure in your response. Do not include the date. Start directly with the first section heading. Do NOT add empty lines between a heading and its bullet points.
            
            **Week at a Glance**
            - Completion Rate: {completion_rate}%
            - Tasks Completed: {len(completed_tasks)} / {len(tasks_this_week)}
            - Consistency Score: {consistency_score}
            - Current Streak: {current_streak} Days
            - Longest Streak: {longest_streak} Days
            - Best Day: {best_day}
            - Most Productive Category: {best_category}
            
            **Weekly Reflection**
            (3-5 sentences. Compare with last week if data allows. Make it feel human and reflective.)
            
            **Task Highlights**
            (Mention specific completed/pending tasks by name. Do not just say "you did 19 tasks".)
            
            **Habit Consistency**
            (Describe patterns in habits, e.g., "You exercised every day except Tuesday".)
            
            **One Focus For Next Week**
            (Provide ONE clear, actionable recommendation.)
            """
            
            response = client.models.generate_content(
                model='gemini-3.1-flash-lite',
                contents=prompt
            )
            report_text = response.text.strip()
        except Exception as e:
            report_text = f"An error occurred generating the AI report: {str(e)}"
            
    # Generate PDF using fpdf2
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("helvetica", size=12)
    
    pdf.set_font("helvetica", "I", 11)
    pdf.cell(0, 10, f"Week of {start_of_week.strftime('%B %d, %Y')} to {end_of_week.strftime('%B %d, %Y')}", align='C', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)
    
    pdf.set_font("helvetica", size=11)
    
    # fpdf2 supports basic markdown with markdown=True, align='L' prevents weird word spacing
    pdf.multi_cell(0, 7, report_text, markdown=True, align='L')
    
    # Output returns bytearray in fpdf2
    pdf_bytes = pdf.output()
    
    return Response(content=bytes(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="Momentum_Weekly_Report_{end_of_week}.pdf"'})
