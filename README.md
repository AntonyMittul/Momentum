# Momentum 🚀

**Momentum** is a distraction-free AI productivity companion designed to help you stay focused, build consistent habits, and track your daily tasks effectively.

## Features

- **Dashboard**: A clean, distraction-free environment that automatically sorts your daily tasks by priority. Features a smart AI morning coach that gives you a customized motivational message based on your active tasks.
- **Tasks**: Efficient task management sorted strictly by High, Medium, and Low priorities. You can easily create, edit, check off, and delete tasks.
- **Non-Negotiables**: A dedicated space for your daily habits that you must follow without question (e.g., 2 liters of water, 30 minutes of reading). Set a timeframe and track your momentum every day.
- **Insights**: Beautiful graphs and a GitHub-style contribution calendar tracking your daily consistency score, your current streak, and your longest streak.
- **AI Weekly PDF Reports**: Every Sunday, automatically generate and download an AI-written PDF report summarizing your completed tasks, streaks, and non-negotiable adherence to review your week and prepare for the next.
- **Custom Appearances**: Sleek global theming with smooth transition animations. Choose from White, Black, or Charcoal Grey to perfectly match your environment.

## Technology Stack

- **Frontend**: Next.js 15, React, Tailwind CSS v4, Framer Motion, Recharts
- **Backend**: FastAPI, SQLite, SQLAlchemy, FPDF2 for PDF Generation
- **AI**: Google Gemini 1.5 Flash (via `google-generativeai`)

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AntonyMittul/Momentum.git
   cd Momentum
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate # (or venv/bin/activate on Mac/Linux)
   pip install -r requirements.txt
   
   # Create a .env file and add your GEMINI_API_KEY
   echo "GEMINI_API_KEY=your_key_here" > .env
   
   # Run the FastAPI server
   uvicorn main:app --reload --port 8000
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to start building momentum!
