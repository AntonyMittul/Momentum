from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime, timedelta
from database import get_db

def get_ist_date():
    return (datetime.utcnow() + timedelta(hours=5, minutes=30)).date()
import models, schemas
from pydantic import BaseModel

class CalculateRequest(BaseModel):
    tz_offset: int = 0

router = APIRouter()

@router.get("/", response_model=List[schemas.DailyMetrics])
def read_metrics(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    metrics = db.query(models.DailyMetrics).order_by(models.DailyMetrics.date.desc()).offset(skip).limit(limit).all()
    return metrics

@router.get("/non-negotiables")
def get_nn_metrics(db: Session = Depends(get_db)):
    today = get_ist_date()
    start_date = today - timedelta(days=29)
    
    nns = db.query(models.NonNegotiable).all()
    if not nns:
        return []
        
    total_nns = len(nns)
    logs = db.query(models.NonNegotiableLog).filter(models.NonNegotiableLog.date >= start_date).all()
    
    results = []
    for i in range(30):
        d = start_date + timedelta(days=i)
        completed_on_day = sum(1 for log in logs if log.date == d and log.completed)
        score = (completed_on_day / total_nns) * 100 if total_nns > 0 else 0
        
        results.append({
            "date": d.isoformat(),
            "consistency_score": round(score, 1)
        })
        
    results.reverse() # Newest first, to match read_metrics ordering
    return results

@router.post("/calculate", response_model=schemas.DailyMetrics)
def calculate_metrics_for_today(req: CalculateRequest, db: Session = Depends(get_db)):
    # Use IST natively
    today = get_ist_date()
    
    # Find today's metrics or create
    metrics = db.query(models.DailyMetrics).filter(models.DailyMetrics.date == today).first()
    if not metrics:
        metrics = models.DailyMetrics(date=today)
        db.add(metrics)

    # Get all tasks created today or completed today or pending today
    # For a simple implementation, let's just get all tasks that are active today
    # tasks created today OR (status pending/overdue) OR completed today
    # A more rigorous approach is just calculating based on what was completed vs created today.
    
    # We'll consider today's scope: Tasks created today OR completed today OR due today
    # Actually, simpler: all tasks not completed before today.
    # But let's just count all completed today vs all tasks that are due or created today.
    
    all_tasks = db.query(models.Task).all()
    
    # To perfectly align with the dashboard, "tasks today" are strictly the tasks created today in local time.
    tasks_today = []
    if all_tasks:
        for t in all_tasks:
            # t.created_at is already in IST
            if t.created_at and t.created_at.date() == today:
                tasks_today.append(t)
    
    completed_today = [t for t in tasks_today if t.status == "Completed"]
    
    metrics.tasks_created = len(tasks_today)
    metrics.tasks_completed = len(completed_today)
    metrics.completion_percentage = (len(completed_today) / len(tasks_today) * 100) if len(tasks_today) > 0 else 0
    
    # Simplified Consistency Score: 
    # Directly tied to completion percentage so it feels intuitive.
    # A perfect day of completing all tasks equals a score of 100.
    metrics.consistency_score = round(metrics.completion_percentage, 1)
    
    # Recalculate streaks historically to ensure perfect accuracy
    all_metrics = db.query(models.DailyMetrics).filter(models.DailyMetrics.date <= today).order_by(models.DailyMetrics.date.asc()).all()
    
    current_streak = 0
    longest_streak = 0
    prev_date = None
    
    for m in all_metrics:
        # If there is a gap of more than 1 day between recorded metrics, the streak is broken
        if prev_date is not None and (m.date - prev_date).days > 1:
            current_streak = 0
            
        if m.consistency_score >= 100:
            current_streak += 1
            if current_streak > longest_streak:
                longest_streak = current_streak
        else:
            current_streak = 0
            
        m.streak = current_streak
        m.longest_streak = longest_streak
        prev_date = m.date
    
    db.commit()
    db.refresh(metrics)
    return metrics
