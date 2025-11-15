# HawkerSG

<p align="center">
  <img src="DemoImages/HawkerSGHomePage.gif" alt="HawkerSG Demo" width="600">
  <br>
  <em>Demo Video</em>
</p>



<p align="center">
    <a href="[https://www.youtube.com/watch?v=yMwcUj8wCmo](https://youtu.be/DeGJBotqPmE)">Demo Video</a>
</p>

HawkerSG is a full-stack prototype that helps diners discover hawker centres and stalls, manage personal favourites, and let business owners maintain their listings. The repository contains a FastAPI backend that exposes the REST API and seeds hawker-centre data gathered from the Singapore Food Agency (SFA), alongside a Vite + React frontend for the consumer- and business-facing experiences.

## Repository layout

| Path | Description |
|------|-------------|
| [`backend/`](backend/) | FastAPI application, SQLAlchemy database models, data seeding utilities, and services. |
| [`frontend/`](frontend/) | Vite + React + TypeScript web application that consumes the backend API. |
| [`DemoImages/`](DemoImages/) | Assorted mockups used during design discussions. 

Each sub-project has its own README with detailed setup instructions. The sections below provide a high-level overview and the minimal steps to get both tiers running for local development.

## Tech stack

- **Backend:** Python 3.12+, FastAPI, SQLAlchemy, SQLite, PyInstrument middleware for profiling, plus CLI utilities for ingesting SFA data dumps.
- **Frontend:** Node.js 18+ (Vite 5 requirement), React 18, React Router, Tailwind CSS, Framer Motion animations, Lucide icons.

## Quick start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd hawkersg
   ```
2. **Start the backend API**
   ```bash
   cd backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8001
   ```
   The FastAPI docs are then available at http://localhost:8001/docs.
3. **Start the frontend dev server**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Vite defaults to http://localhost:5173 and proxies requests to `http://localhost:8001` as configured in the React code (`API_BASE_URL`).

Refer to [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for deeper dives into configuration, data seeding, and available scripts.


Feel free to file issues for feature requests, data corrections, or bug reports.
