from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import date, timedelta
import google.generativeai as genai
import os
from database import get_db
import models
from fpdf import FPDF

router = APIRouter()

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Momentum - Weekly Productivity Report', align='C', new_x="LMARGIN", new_y="NEXT")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

@router.get("/weekly")
def get_weekly_report(db: Session = Depends(get_db)):
    today = date.today()
    # Find the Monday of the current week (0 = Monday, 6 = Sunday)
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    # Fetch Data for the week
    tasks_this_week = db.query(models.Task).filter(
        models.Task.created_at >= start_of_week,
        models.Task.created_at <= end_of_week + timedelta(days=1)
    ).all()
    
    completed_tasks = [t for t in tasks_this_week if t.status == 'Completed']
    pending_tasks = [t for t in tasks_this_week if t.status != 'Completed']
    
    # Fetch non-negotiables stats
    non_negotiables = db.query(models.NonNegotiable).all()
    nn_logs = db.query(models.NonNegotiableLog).filter(
        models.NonNegotiableLog.date >= start_of_week,
        models.NonNegotiableLog.date <= end_of_week,
        models.NonNegotiableLog.completed == True
    ).all()
    
    # Prepare summary text for Gemini
    nn_summary = []
    for nn in non_negotiables:
        logs_for_nn = len([l for l in nn_logs if l.non_negotiable_id == nn.id])
        nn_summary.append(f"- {nn.title}: Completed {logs_for_nn} times this week.")
        
    tasks_summary = f"Total Tasks Created: {len(tasks_this_week)}\nTotal Completed: {len(completed_tasks)}\nPending: {len(pending_tasks)}"
    
    # Call Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        report_text = "API Key not found. Please set GEMINI_API_KEY in the environment to generate AI reports."
    else:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-3.1-flash-lite')
            prompt = f"""
            You are a calm, minimalist productivity coach for a single user.
            Write a supportive and reflective weekly review report.
            The user relies on you to review their week and keep them motivated without toxic positivity.
            
            Week: {start_of_week.strftime('%B %d, %Y')} to {end_of_week.strftime('%B %d, %Y')}
            
            Task Stats:
            {tasks_summary}
            
            Non-Negotiables (Daily Habits) Progress:
            {chr(10).join(nn_summary)}
            
            Please write a well-structured report with the following sections (Keep it under 350 words):
            1. Weekly Reflection (A short paragraph summarizing the week's effort)
            2. Task Highlights (A brief note on task completion)
            3. Habit Consistency (A brief review of the non-negotiables)
            4. Looking Ahead (A motivating closing thought for next week)
            
            Output ONLY the report text. Do not use asterisks or markdown formatting as it will be rendered in a plain text PDF. Just use plain text with line breaks.
            """
            
            response = model.generate_content(prompt)
            report_text = response.text.strip()
        except Exception as e:
            report_text = f"An error occurred generating the AI report: {str(e)}"
            
    # Generate PDF using fpdf2
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("helvetica", size=12)
    
    pdf.set_font("helvetica", style='B', size=12)
    pdf.cell(0, 10, f"Week of {start_of_week.strftime('%B %d, %Y')} - {end_of_week.strftime('%B %d, %Y')}", new_x="LMARGIN", new_y="NEXT", align='L')
    pdf.ln(5)
    
    pdf.set_font("helvetica", size=11)
    pdf.multi_cell(0, 7, report_text)
    
    # Output returns bytearray in fpdf2
    pdf_bytes = pdf.output()
    
    return Response(content=bytes(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="Momentum_Weekly_Report_{end_of_week}.pdf"'})
