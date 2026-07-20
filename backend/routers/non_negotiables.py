from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.NonNegotiable])
def get_non_negotiables(target_date: date = None, db: Session = Depends(get_db)):
    if target_date is None:
        target_date = date.today()
        
    items = db.query(models.NonNegotiable).all()
    results = []
    
    for item in items:
        # Check if completed on target_date
        log = db.query(models.NonNegotiableLog).filter(
            models.NonNegotiableLog.non_negotiable_id == item.id,
            models.NonNegotiableLog.date == target_date
        ).first()
        
        # Count total completed logs
        completed_count = db.query(models.NonNegotiableLog).filter(
            models.NonNegotiableLog.non_negotiable_id == item.id,
            models.NonNegotiableLog.completed == True
        ).count()
        
        data = {
            "id": item.id,
            "title": item.title,
            "duration_days": item.duration_days,
            "created_at": item.created_at,
            "completed_today": log.completed if log else False,
            "remaining_days": max(0, item.duration_days - completed_count)
        }
        results.append(data)
        
    return results

@router.post("/", response_model=schemas.NonNegotiable)
def create_non_negotiable(nn: schemas.NonNegotiableCreate, db: Session = Depends(get_db)):
    db_item = models.NonNegotiable(**nn.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    data = {
        "id": db_item.id,
        "title": db_item.title,
        "duration_days": db_item.duration_days,
        "created_at": db_item.created_at,
        "completed_today": False,
        "remaining_days": db_item.duration_days
    }
    return data

@router.delete("/{nn_id}")
def delete_non_negotiable(nn_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.NonNegotiable).filter(models.NonNegotiable.id == nn_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Also clean up logs
    db.query(models.NonNegotiableLog).filter(models.NonNegotiableLog.non_negotiable_id == nn_id).delete()
    
    db.delete(db_item)
    db.commit()
    return {"ok": True}

@router.post("/{nn_id}/toggle", response_model=schemas.NonNegotiable)
def toggle_non_negotiable(nn_id: int, log_data: schemas.NonNegotiableLogCreate, db: Session = Depends(get_db)):
    db_item = db.query(models.NonNegotiable).filter(models.NonNegotiable.id == nn_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Not found")
        
    target_date = log_data.date or date.today()
    
    log = db.query(models.NonNegotiableLog).filter(
        models.NonNegotiableLog.non_negotiable_id == nn_id,
        models.NonNegotiableLog.date == target_date
    ).first()
    
    if log:
        log.completed = log_data.completed
    else:
        log = models.NonNegotiableLog(
            non_negotiable_id=nn_id,
            date=target_date,
            completed=log_data.completed
        )
        db.add(log)
        
    db.commit()
    
    # Recalculate remaining days
    completed_count = db.query(models.NonNegotiableLog).filter(
        models.NonNegotiableLog.non_negotiable_id == nn_id,
        models.NonNegotiableLog.completed == True
    ).count()
    
    data = {
        "id": db_item.id,
        "title": db_item.title,
        "duration_days": db_item.duration_days,
        "created_at": db_item.created_at,
        "completed_today": log_data.completed,
        "remaining_days": max(0, db_item.duration_days - completed_count)
    }
    return data
