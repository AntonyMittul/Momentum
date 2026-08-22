from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import models
from database import get_db
from routers.reports import generate_weekly_pdf_bytes, get_ist_date
from routers.email_utils import send_email

router = APIRouter(prefix="/cron", tags=["Cron Jobs"])

def verify_cron_secret(x_cron_secret: str = Header(None)):
    secret = os.getenv("CRON_SECRET_KEY")
    if not secret:
        raise HTTPException(status_code=500, detail="CRON_SECRET_KEY not configured on server")
    if x_cron_secret != secret:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@router.post("/inactivity-check")
def run_inactivity_check(db: Session = Depends(get_db), authorized: bool = Depends(verify_cron_secret)):
    """
    Checks for inactivity and sends a reminder email if necessary.
    Rules:
    1. If no tasks created for today by noon or EOD, send a reminder.
    2. If a task is created but pending for > 6 hours, send a reminder.
    """
    now_utc = datetime.utcnow()
    ist_now = now_utc + timedelta(hours=5, minutes=30)
    today = ist_now.date()
    
    # Calculate start of week (Sunday) for weekly goals
    days_since_sunday = (ist_now.weekday() + 1) % 7
    start_of_week = (ist_now - timedelta(days=days_since_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get pending weekly goals
    weekly_goals = db.query(models.Goal).filter(
        models.Goal.type == 'weekly',
        models.Goal.created_at >= start_of_week
    ).all()
    pending_weekly_goals = [g for g in weekly_goals if g.status != "Completed"]
    
    weekly_goals_html = ""
    if pending_weekly_goals:
        goals_list = "".join([f"<li>{g.title}</li>" for g in pending_weekly_goals])
        weekly_goals_html = f"""
        <hr style="margin-top: 20px; border: 1px solid #eee;" />
        <h3>🎯 This Week's Pending Goals</h3>
        <ul>{goals_list}</ul>
        """

    # Get today's tasks
    tasks_today = db.query(models.Task).filter(
        models.Task.created_at >= datetime(today.year, today.month, today.day)
    ).all()

    # 1. No tasks created today check
    if len(tasks_today) == 0:
        html = f"""
        <h2>Momentum Inactivity Reminder</h2>
        <p>Hi Antony,</p>
        <p>You haven't created any tasks for today yet. Take a moment to plan your day and keep your momentum going!</p>
        <p>Log in: <a href="https://momentum-self-improvement.vercel.app/">Momentum App</a></p>
        {weekly_goals_html}
        """
        success = send_email(
            subject="Momentum: Time to plan your day!",
            html_body=html
        )
        return {"status": "sent_no_tasks", "success": success}

    # 2. Check for pending tasks > 6 hours old OR if it's the end of the day (e.g. 9 PM IST check)
    pending_tasks = [t for t in tasks_today if t.status != "Completed"]
    if len(pending_tasks) > 0:
        # Check if any pending task is older than 6 hours
        needs_reminder = False
        if ist_now.hour >= 20: # If it's 8 PM IST or later, always remind about pending tasks
            needs_reminder = True
        else:
            for t in pending_tasks:
                hours_old = (now_utc - t.created_at).total_seconds() / 3600
                if hours_old >= 6:
                    needs_reminder = True
                    break
        
        if needs_reminder:
            task_list_html = "".join([f"<li>{t.title} ({t.category})</li>" for t in pending_tasks])
            html = f"""
            <h2>Momentum Inactivity Reminder</h2>
            <p>Hi Antony,</p>
            <p>You have <strong>{len(pending_tasks)} uncompleted tasks</strong> remaining for today:</p>
            <ul>
                {task_list_html}
            </ul>
            <p>Don't lose your momentum! Log in and check them off.</p>
            <p>Log in: <a href="https://momentum-self-improvement.vercel.app/">Momentum App</a></p>
            {weekly_goals_html}
            """
            success = send_email(
                subject=f"Momentum: You have {len(pending_tasks)} pending tasks",
                html_body=html
            )
            return {"status": "sent_pending_tasks", "success": success}

    return {"status": "no_reminder_needed", "reason": "All tasks completed or none are > 6 hours old yet"}


@router.post("/weekly-report")
def run_weekly_report_cron(db: Session = Depends(get_db), authorized: bool = Depends(verify_cron_secret)):
    """
    Generates the weekly report PDF and emails it.
    """
    try:
        pdf_bytes, end_of_week = generate_weekly_pdf_bytes(db)
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

    html = f"""
    <h2>Your Weekly Momentum Report is Here!</h2>
    <p>Hi Antony,</p>
    <p>Your AI-generated weekly productivity report for the week ending {end_of_week} is attached.</p>
    <p>Keep up the great work!</p>
    """
    
    filename = f"Momentum_Weekly_Report_{end_of_week}.pdf"
    success = send_email(
        subject=f"Momentum Weekly Report: {end_of_week}",
        html_body=html,
        attachment_bytes=bytes(pdf_bytes),
        attachment_name=filename
    )

    if success:
        return {"status": "success", "message": "Weekly report emailed successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")

@router.post("/weekly-goals-reminder")
def run_weekly_goals_reminder(db: Session = Depends(get_db), authorized: bool = Depends(verify_cron_secret)):
    """
    Sends a bi-daily reminder of pending weekly goals.
    """
    now_utc = datetime.utcnow()
    ist_now = now_utc + timedelta(hours=5, minutes=30)
    
    days_since_sunday = (ist_now.weekday() + 1) % 7
    start_of_week = (ist_now - timedelta(days=days_since_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    weekly_goals = db.query(models.Goal).filter(
        models.Goal.type == 'weekly',
        models.Goal.created_at >= start_of_week
    ).all()
    
    pending_goals = [g for g in weekly_goals if g.status != "Completed"]
    
    if not pending_goals:
        return {"status": "no_reminder_needed", "reason": "No pending weekly goals"}
        
    goals_list = "".join([f"<li>{g.title}</li>" for g in pending_goals])
    
    html = f"""
    <h2>🎯 Momentum Goals Reminder</h2>
    <p>Hi Antony,</p>
    <p>Just checking in on your goals for this week! You still have the following goals pending:</p>
    <ul>
        {goals_list}
    </ul>
    <p>Log in and knock them out: <a href="https://momentum-self-improvement.vercel.app/">Momentum App</a></p>
    """
    
    success = send_email(
        subject="Momentum: Weekly Goals Check-in",
        html_body=html
    )
    
    if success:
        return {"status": "sent_goals_reminder", "success": True}
    else:
        raise HTTPException(status_code=500, detail="Failed to send goals reminder email")

