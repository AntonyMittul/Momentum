from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import date, timedelta
from google import genai
import os
from database import get_db
import models
from fpdf import FPDF

router = APIRouter()

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Momentum - Weekly Productivity Report', align='C', new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

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
            client = genai.Client(api_key=api_key)
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
            **Weekly Reflection**
            **Task Highlights**
            **Habit Consistency**
            **Looking Ahead**
            
            FORMATTING RULES:
            - Do not include the date or any title heading at the beginning. Start directly with the first section heading.
            - Ensure there is an empty line between each heading and its content.
            - Use bullet points instead of paragraphs for the content inside each section to make it easy to read.
            - Bold all the important metrics and numbers in the text (e.g., **13 out of 23 tasks**, **6 days**).
            - Use standard markdown bold formatting: **Text**
            """
            
            response = client.models.generate_content(
                model='gemini-3.1-flash-lite',
                contents=prompt
            )
            report_text = response.text.strip()
        except Exception as e:
            report_text = f"An error occurred generating the AI report: {str(e)}"
            
    # Generate PDF using fpdf2
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("helvetica", size=12)
    
    pdf.set_font("helvetica", size=11)
    
    # fpdf2 supports basic markdown with markdown=True
    pdf.multi_cell(0, 7, report_text, markdown=True)
    
    # Output returns bytearray in fpdf2
    pdf_bytes = pdf.output()
    
    return Response(content=bytes(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="Momentum_Weekly_Report_{end_of_week}.pdf"'})
