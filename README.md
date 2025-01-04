# MRP System

A Material Requirements Planning (MRP) system built with FastAPI backend and Next.js frontend.

## Features

- Parts Management
- Production Runs Tracking
- Quality Checks Recording

## Setup

### Backend

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run the server:
```bash
python -m uvicorn main:app --reload
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Usage

Visit http://localhost:3000 to access the application. The following pages are available:

- `/parts` - Manage parts inventory
- `/production-runs` - Track production runs
- `/quality-checks` - Record quality checks 