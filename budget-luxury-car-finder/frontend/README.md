# Frontend

React + Vite frontend for Budget Luxury Car Finder UK.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server normally runs at `http://localhost:5173`.

## API URL

By default the frontend calls `http://127.0.0.1:8000`.

To use another backend URL, create a `.env` file in `frontend/`:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

## Components

- `Dashboard.jsx` ranks, filters, sorts, and displays saved cars.
- `AddCarForm.jsx` saves manual listing details to the FastAPI backend.
- `CompareCars.jsx` compares 2 to 4 saved cars side-by-side.
- `Recommendations.jsx` displays the built-in recommended model database.
- `AvoidList.jsx` displays known risk models.
- `ScoreBreakdown.jsx` explains each score.

## Reg Lookup UI

`AddCarForm.jsx` includes an optional registration number field and a `Lookup vehicle data` button. The lookup keeps manual entry as the main workflow and shows a friendly not-connected message until the backend has real DVLA/MOT API integration.
