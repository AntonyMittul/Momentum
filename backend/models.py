from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, Text
from datetime import datetime, date, timedelta
from database import Base

def get_ist_now():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)

def get_ist_date():
    return get_ist_now().date()

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, index=True)
    priority = Column(String, index=True) # High, Medium, Low
    estimated_duration = Column(Integer, nullable=True) # in minutes
    deadline = Column(DateTime, nullable=True)
    status = Column(String, default="Pending") # Pending, Completed, Overdue
    created_at = Column(DateTime, default=get_ist_now)
    completed_at = Column(DateTime, nullable=True)
    consistency_weight = Column(Float, default=1.0)

class DailyMetrics(Base):
    __tablename__ = "daily_metrics"

    date = Column(Date, primary_key=True, index=True, default=get_ist_date)
    tasks_created = Column(Integer, default=0)
    tasks_completed = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    consistency_score = Column(Float, default=0.0)
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)

class AIMessage(Base):
    __tablename__ = "ai_messages"
    
    date = Column(Date, primary_key=True, index=True, default=get_ist_date)
    generated_message = Column(Text, nullable=False)

class NonNegotiable(Base):
    __tablename__ = "non_negotiables"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    duration_days = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime, default=get_ist_now)

class NonNegotiableLog(Base):
    __tablename__ = "non_negotiable_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    non_negotiable_id = Column(Integer, index=True, nullable=False)
    date = Column(Date, index=True, default=get_ist_date)
    completed = Column(Boolean, default=False)

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=True)
    content = Column(Text, nullable=False)
    color = Column(String, default="bg-yellow-200")
    created_at = Column(DateTime, default=get_ist_now)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False) # 'user' or 'assistant'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_ist_now)

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    type = Column(String, index=True, nullable=False) # 'weekly' or 'monthly'
    status = Column(String, default="Pending") # 'Pending', 'Ongoing', 'Completed'
    created_at = Column(DateTime, default=get_ist_now)
    completed_at = Column(DateTime, nullable=True)
