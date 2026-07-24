from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta, datetime
from database import get_db
import models, schemas
from pydantic import BaseModel

class CalculateRequest(BaseModel):
    tz_offset: int = 0

router = APIRouter()

@router.get("/", response_model=List[schemas.DailyMetrics])
def read_metrics(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    metrics = db.query(models.DailyMetrics).order_by(models.DailyMetrics.date.desc()).offset(skip).limit(limit).all()
    return metrics

@router.post("/calculate")
def calculate_metrics_for_today(req: CalculateRequest, db: Session = Depends(get_db)):
    # Calculate today's local date based on tz_offset
    # tz_offset is the JS getTimezoneOffset() (minutes to add to local to get UTC).
    # So local_time = utc_time - tz_offset
    now_utc = datetime.utcnow()
    local_now = now_utc - timedelta(minutes=req.tz_offset)
    today = local_now.date()
    
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
    
    tasks = db.query(models.Task).all()
    
    # To perfectly align with the dashboard, "tasks today" are strictly the tasks created today in local time.
    tasks_today = []
    for t in tasks:
        if t.created_at:
            t_local = t.created_at - timedelta(minutes=req.tz_offset)
            if t_local.date() == today:
                tasks_today.append(t)
    
    completed_today = [t for t in tasks_today if t.status == "Completed"]
    
    metrics.tasks_created = len(tasks_today)
    metrics.tasks_completed = len(completed_today)
    metrics.completion_percentage = (len(completed_today) / len(tasks_today) * 100) if len(tasks_today) > 0 else 0
    
    # Simplified Consistency Score: 
    # Directly tied to completion percentage so it feels intuitive.
    # A perfect day of completing all tasks equals a score of 100.
    metrics.consistency_score = round(metrics.completion_percentage, 1)
    
    db.commit()
    db.refresh(metrics)
    return metrics
