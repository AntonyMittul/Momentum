from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import tasks, metrics, ai, settings, non_negotiables, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Momentum API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Momentum API is running."}

app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(non_negotiables.router, prefix="/api/non-negotiables", tags=["Non-Negotiables"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
