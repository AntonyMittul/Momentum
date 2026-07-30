from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import models, schemas
from database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Goal])
def read_goals(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).order_by(models.Goal.created_at.desc()).offset(skip).limit(limit).all()
    return goals

@router.post("/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    db_goal = models.Goal(
        title=goal.title,
        type=goal.type,
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.put("/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal: schemas.GoalUpdate, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    if goal.title is not None:
        db_goal.title = goal.title
    if goal.type is not None:
        db_goal.type = goal.type
    if goal.status is not None:
        if db_goal.status != "Completed" and goal.status == "Completed":
            db_goal.completed_at = datetime.utcnow()
        elif goal.status != "Completed":
            db_goal.completed_at = None
        db_goal.status = goal.status
        
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.delete("/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    db.delete(db_goal)
    db.commit()
    return {"ok": True}
