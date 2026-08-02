from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date, timedelta
from database import get_db
import models, schemas
from sqlalchemy import cast, Date

def get_ist_now():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)

router = APIRouter()

@router.get("/migrate-timezones")
def migrate_timezones(db: Session = Depends(get_db)):
    # Idempotency check using a dummy goal
    migration_check = db.query(models.Goal).filter(models.Goal.title == "SYSTEM_UTC_IST_MIGRATION").first()
    if migration_check:
        return {"message": "Migration already completed previously. No action taken."}
        
    cutoff = datetime(2026, 8, 2, 20, 0, 0)
    
    # 1. Tasks
    tasks = db.query(models.Task).all()
    for t in tasks:
        if t.created_at and t.created_at < cutoff:
            t.created_at = t.created_at + timedelta(hours=5, minutes=30)
            if t.completed_at:
                t.completed_at = t.completed_at + timedelta(hours=5, minutes=30)
                
    # 2. Goals
    goals = db.query(models.Goal).filter(models.Goal.title != "SYSTEM_UTC_IST_MIGRATION").all()
    for g in goals:
        if g.created_at and g.created_at < cutoff:
            g.created_at = g.created_at + timedelta(hours=5, minutes=30)
            if g.completed_at:
                g.completed_at = g.completed_at + timedelta(hours=5, minutes=30)
                
    # 3. NonNegotiables
    nns = db.query(models.NonNegotiable).all()
    for nn in nns:
        if nn.created_at and nn.created_at < cutoff:
            nn.created_at = nn.created_at + timedelta(hours=5, minutes=30)
            
    # 4. Notes
    notes = db.query(models.Note).all()
    for n in notes:
        if n.created_at and n.created_at < cutoff:
            n.created_at = n.created_at + timedelta(hours=5, minutes=30)
            
    # 5. ChatHistory
    chats = db.query(models.ChatHistory).all()
    for c in chats:
        if c.created_at and c.created_at < cutoff:
            c.created_at = c.created_at + timedelta(hours=5, minutes=30)
            
    # Mark migration as complete
    db.add(models.Goal(title="SYSTEM_UTC_IST_MIGRATION", type="weekly", status="Completed"))
    db.commit()
    
    return {"message": "Successfully migrated all historical UTC timestamps to IST!"}

@router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, target_date: date = None, db: Session = Depends(get_db)):
    query = db.query(models.Task).order_by(models.Task.created_at.desc())
    if target_date:
        query = query.filter(cast(models.Task.created_at, Date) == target_date)
    return query.offset(skip).limit(limit).all()

@router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task.model_dump(exclude_unset=True)
    
    # Handle completion logic
    if "status" in update_data and update_data["status"] == "Completed" and db_task.status != "Completed":
        db_task.completed_at = get_ist_now()
    elif "status" in update_data and update_data["status"] != "Completed":
        db_task.completed_at = None

    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"ok": True}
