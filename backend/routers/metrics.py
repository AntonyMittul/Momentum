from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.DailyMetrics])
def read_metrics(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    metrics = db.query(models.DailyMetrics).order_by(models.DailyMetrics.date.desc()).offset(skip).limit(limit).all()
    return metrics

@router.post("/calculate")
def calculate_metrics_for_today(db: Session = Depends(get_db)):
    today = date.today()
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
    
    tasks_today = [t for t in tasks if (t.created_at.date() == today or (t.completed_at and t.completed_at.date() == today) or (t.deadline and t.deadline.date() == today) or t.status != "Completed")]
    
    completed_today = [t for t in tasks_today if t.status == "Completed" and t.completed_at and t.completed_at.date() == today]
    high_priority_completed = [t for t in completed_today if t.priority == "High"]
    
    metrics.tasks_created = len(tasks_today)
    metrics.tasks_completed = len(completed_today)
    metrics.completion_percentage = (len(completed_today) / len(tasks_today) * 100) if len(tasks_today) > 0 else 0
    
    # Consistency Score Formula
    # 40% Task Completion Rate
    # 30% High Priority Tasks Completed
    # 20% Task Difficulty (using consistency_weight)
    # 10% Streak Bonus
    
    comp_rate_score = metrics.completion_percentage * 0.4
    high_pri_score = min((len(high_priority_completed) / max(len([t for t in tasks_today if t.priority == "High"]), 1)) * 100, 100) * 0.3
    
    # Simple difficulty score
    difficulty_score = min(sum([t.consistency_weight for t in completed_today]) * 10, 100) * 0.2
    
    # Basic streak logic: if completion > 50% increase streak
    # For now, just placeholder streak
    current_streak = metrics.streak or 0
    streak_score = min(current_streak * 5, 100) * 0.1
    
    metrics.consistency_score = round(comp_rate_score + high_pri_score + difficulty_score + streak_score, 1)
    
    db.commit()
    db.refresh(metrics)
    return metrics
