# Backend

FastAPI backend for Budget Luxury Car Finder UK.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On macOS or Linux, activate the virtual environment with:

```bash
source venv/bin/activate
```

The API runs at `http://127.0.0.1:8000`.

## Endpoints

- `GET /api/cars`
- `GET /api/cars/{id}`
- `POST /api/cars`
- `PUT /api/cars/{id}`
- `DELETE /api/cars/{id}`
- `GET /api/cars/ranked`
- `GET /api/recommendations`
- `GET /api/avoid`

## Scoring

The scoring logic lives in `app/scoring.py`. It starts each car at 50 points, applies the budget, gearbox, road tax, mileage, service history, insurance, MOT, recommended-model, and avoid-model rules, then clamps the final score to 0-100.

## Data Files

Recommended models live in `app/data/recommended_models.json`.
Avoid warnings live in `app/data/avoid_models.json`.

## Reg Lookup Ready

Placeholder services live in:

- `app/services/dvla_service.py`
- `app/services/mot_service.py`

They read:

- `DVLA_API_KEY`
- `MOT_CLIENT_ID`
- `MOT_CLIENT_SECRET`
- `MOT_API_KEY`

The endpoint `POST /api/vehicle/lookup` returns a clear not-connected message until real API credentials and live API calls are added.
