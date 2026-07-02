# Buyer Onboarding Microservice

This repository contains a complete buyer onboarding system with a separated buyer portal and admin portal, a FastAPI backend, a PostgreSQL database, and a React/Vite frontend.

The application is structured so the front page only offers two choices. From there:
- Buyer users go to a dedicated buyer login page and then a buyer dashboard.
- Admin users go to a dedicated admin login page and then an admin dashboard.

Buyer signup collects password confirmation plus important onboarding fields, while the admin side can review, approve, edit, and delete buyer records. Buyer notifications are displayed inside the buyer dashboard when the admin updates or approves the account.

## Tech Stack

- Frontend: React 18, Vite, Axios
- Backend: FastAPI, Mangum, SQLAlchemy, Pydantic
- Database: PostgreSQL
- Runtime notes: Python 3.14 in this workspace, with `psycopg[binary]` used for PostgreSQL access

## How It Works

1. The browser opens the home page.
2. The user chooses either Buyer or Admin.
3. The selected role opens its own login page.
4. After login, the role-specific dashboard opens.
5. Buyers can view their own profile and notifications.
6. Admins can review the buyer registry, approve accounts, and update buyer details.

## Main Features

- Separate home page with two actions only: Buyer and Admin.
- Separate buyer login page and buyer dashboard.
- Separate admin login page and admin dashboard.
- Buyer signup with password and retype-password validation.
- Rich buyer onboarding form with company name, business type, address, and onboarding goal.
- Admin approval action for pending buyers.
- Buyer notification banner that updates when admin changes a profile or approves the account.
- Buyer profile circle/avatar and top-bar actions such as profile, refresh, and logout.
- Strict input validation in both backend and frontend.
- Duplicate email protection on buyer creation.
- AWS Lambda compatibility via Mangum.

## Project Layout

```text
Onboarding_System-_Aximly/
├── database/
│   └── schema.sql
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── buyers.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   └── buyer.py
│   │   ├── repositories/
│   │   │   └── buyer_repository.py
│   │   ├── schemas/
│   │   │   └── buyer.py
│   │   ├── services/
│   │   │   └── buyer_service.py
│   │   └── main.py
│   ├── .env.example
│   ├── lambda_handler.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── buyers.js
│   │   ├── components/
│   │   │   ├── BuyerEditForm.jsx
│   │   │   ├── BuyerForm.jsx
│   │   │   ├── BuyerModal.jsx
│   │   │   └── BuyerTable.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── .gitignore
```

## Backend API Summary

- `POST /buyer` creates a new buyer account.
- `POST /buyer/login` logs a buyer in by email and password.
- `GET /buyer/{id}` retrieves a buyer profile.
- `PUT /buyer/{id}` updates a buyer profile.
- `POST /buyer/{id}/approve` approves a buyer from the admin side.
- `DELETE /buyer/{id}` removes a buyer.
- `GET /buyers` returns all buyers for the admin dashboard.

## Backend Behavior

The backend is layered into model, repository, service, and route modules. Request payloads are validated with Pydantic. The service layer handles duplicate email checks, password hashing, login verification, admin approval, and notification updates. SQLAlchemy is used for persistence, and the Lambda entry point wraps the FastAPI app through Mangum.

## Database Schema

The PostgreSQL buyers table stores:

- `id`
- `name`
- `email`
- `password_hash`
- `phone`
- `company_name`
- `business_type`
- `address`
- `onboarding_goal`
- `status`
- `notification`
- `notification_seen_at`
- `created_at`

## Frontend Behavior

The React app uses a state-based flow to separate the system by role:

- Home page: shows two cards, Buyer and Admin.
- Buyer login page: accepts email and password, plus a separate signup form.
- Admin login page: accepts admin email and password.
- Buyer dashboard: shows profile details, status, and notifications.
- Admin dashboard: shows metrics, buyer list, and actions to view, edit, delete, or approve.

The frontend uses Axios to call the API Gateway or local backend base URL configured in `VITE_API_BASE_URL`.

## Validation And Rules

- Buyer signup requires password and retype password to match.
- Buyer signup requires company name, business type, address, and onboarding goal.
- Email addresses are normalized and duplicate emails are rejected.
- Status can be updated by the admin, and approval changes the notification shown to the buyer.
- Buyer login is email plus password.
- Admin login is separate from buyer login.

## Local Setup

1. Start PostgreSQL with `docker compose up -d`.
2. Apply `database/schema.sql` to the `buyers_db` database.
3. Copy `backend/.env.example` to `backend/.env`.
4. Copy `frontend/.env.example` to `frontend/.env`.
5. Install backend dependencies from `backend/requirements.txt`.
6. Install frontend dependencies from `frontend/package.json`.
7. Start the backend with Uvicorn.
8. Start the frontend with Vite.

## Runtime Note

The backend uses `psycopg[binary]` with SQLAlchemy because the workspace is currently using Python 3.14, and `psycopg2-binary` was not installing cleanly in this environment.
