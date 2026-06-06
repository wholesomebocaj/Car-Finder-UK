# Budget Luxury Car Finder UK

A local full-stack web app for manually tracking, scoring, comparing, and ranking used budget luxury cars from Auto Trader listings.

This project does not scrape Auto Trader. You manually enter listing details or paste important notes into the form. Later, the backend can be extended to use official UK vehicle APIs if API keys are available.

## Stack

- Backend: Python, FastAPI, SQLAlchemy, SQLite
- Frontend: React, Vite, JavaScript
- API communication: `fetch`
- Styling: custom modern CSS

## Project Structure

```text
budget-luxury-car-finder/
  backend/
    app/
      main.py
      database.py
      models.py
      schemas.py
      scoring.py
      seed_data.py
      routers/
        cars.py
        recommendations.py
      data/
        recommended_models.json
        avoid_models.json
    requirements.txt
    README.md
  frontend/
    src/
      App.jsx
      main.jsx
      api.js
      components/
      styles/
    package.json
    README.md
```

## Run the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On macOS or Linux:

```bash
source venv/bin/activate
```

The backend runs at `http://127.0.0.1:8000`.

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Scoring Logic

Scoring lives in `backend/app/scoring.py`.

Each car starts at 50 points. The app then applies bonuses and penalties for:

- Price against the GBP 6,000 budget
- Automatic gearbox requirement
- Road tax under GBP 250
- Mileage band
- Service history
- Insurance group
- MOT risk keywords
- Recommended model matches
- Avoid model matches
- Manual comfort, reliability, and gearbox-risk inputs

The final score is clamped to 0-100 and returned with warnings, hard flags, and a score breakdown.

## Edit Recommended or Avoid Data

Recommended cars:

```text
backend/app/data/recommended_models.json
```

Avoid warnings:

```text
backend/app/data/avoid_models.json
```

After editing either file, restart the backend server so the API returns the latest model intelligence.

## Reg Lookup Ready

The app has placeholder DVLA and MOT service modules for future official API integration:

```text
backend/app/services/dvla_service.py
backend/app/services/mot_service.py
```

The current lookup endpoint is:

```text
POST /api/vehicle/lookup
```

It reads credentials from environment variables and returns a friendly "not connected yet" response when keys are missing. Copy `.env.example` to your own local `.env` if you want to prepare credentials later.

## What To Improve Next

- Add edit screens for saved cars.
- Add CSV import/export for shortlists.
- Replace the placeholder DVLA/MOT lookup services with official API calls.
- Add insurance quote notes per listing.
- Add ownership-cost estimates for tyres, servicing, cambelts, gearbox servicing, and hybrid battery checks.
- Add image uploads for screenshots or seller photos.
