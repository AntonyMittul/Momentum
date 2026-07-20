from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.post("/reset")
def reset_data(db: Session = Depends(get_db)):
    db.query(models.Task).delete()
    db.query(models.DailyMetrics).delete()
    db.query(models.AIMessage).delete()
    db.commit()
    return {"status": "ok", "message": "All data reset."}
