from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "Other"
    priority: Optional[str] = "Medium"
    estimated_duration: Optional[int] = None
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    estimated_duration: Optional[int] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None

class Task(TaskBase):
    id: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    consistency_weight: float

    class Config:
        from_attributes = True

class DailyMetricsBase(BaseModel):
    date: date
    tasks_created: int
    tasks_completed: int
    completion_percentage: float
    consistency_score: float
    streak: int
    longest_streak: int

class DailyMetrics(DailyMetricsBase):
    class Config:
        from_attributes = True

class AIMessageBase(BaseModel):
    date: date
    generated_message: str

class AIMessage(AIMessageBase):
    class Config:
        from_attributes = True

class NonNegotiableBase(BaseModel):
    title: str
    duration_days: int = 30

class NonNegotiableCreate(NonNegotiableBase):
    pass

class NonNegotiable(NonNegotiableBase):
    id: int
    created_at: datetime
    # We will compute if it's completed today on the fly
    completed_today: bool = False
    remaining_days: int = 0

    class Config:
        from_attributes = True

class NonNegotiableLogCreate(BaseModel):
    date: Optional[date] = None
    completed: bool
