# Buyer Onboarding Microservice System Report

## 1. System Overview

This system is a buyer onboarding microservice that separates the buyer experience from the admin experience. It includes a React frontend, a FastAPI backend, and a PostgreSQL database. The frontend is designed around explicit role-based navigation:

- Home page
- Buyer login page
- Buyer dashboard
- Admin login page
- Admin dashboard

The backend exposes CRUD APIs for buyers, buyer authentication, and admin approval actions.

## 2. Goals

- Provide a clear buyer onboarding flow.
- Separate buyer and admin entry points.
- Support secure buyer signup with password confirmation.
- Collect richer onboarding details from buyers.
- Allow admins to review and approve buyer accounts.
- Surface admin changes as buyer notifications.
- Keep the backend Lambda-ready for API Gateway deployment.

## 3. Technology Used

### Frontend

- React 18
- Vite
- Axios
- Modern functional components and hooks

### Backend

- FastAPI
- Mangum
- SQLAlchemy
- Pydantic
- Pydantic Settings

### Database

- PostgreSQL

### Runtime / Deployment Compatibility

- Local development with Uvicorn
- AWS Lambda compatibility through Mangum

## 4. Architecture

The backend uses a layered structure:

- API routes handle HTTP requests and responses.
- Service layer contains business rules.
- Repository layer performs database access.
- SQLAlchemy models describe the table structure.
- Pydantic schemas validate and shape request and response payloads.

The frontend uses role-based screen state:

- Home screen offers Buyer or Admin.
- Buyer login screen handles buyer email/password login and signup.
- Admin login screen handles admin login.
- Buyer dashboard shows the buyer profile and notifications.
- Admin dashboard shows the buyer registry and management controls.

## 5. Data Model

The buyers table stores:

- id
- name
- email
- password_hash
- phone
- company_name
- business_type
- address
- onboarding_goal
- status
- notification
- notification_seen_at
- created_at

## 6. API Endpoints

- `POST /buyer` - create a buyer account
- `POST /buyer/login` - buyer login
- `GET /buyer/{id}` - fetch buyer profile
- `PUT /buyer/{id}` - update buyer profile
- `POST /buyer/{id}/approve` - approve buyer account
- `DELETE /buyer/{id}` - delete buyer account
- `GET /buyers` - list all buyers

## 7. Buyer Flow

1. Open the home page.
2. Click Buyer.
3. Choose buyer login or sign up.
4. Sign up provides password confirmation and important onboarding questions.
5. After login, the buyer dashboard shows profile details.
6. Buyer notifications appear when the admin approves or updates the account.

## 8. Admin Flow

1. Open the home page.
2. Click Admin.
3. Log in as admin.
4. Admin dashboard loads the buyer registry.
5. Admin can view, edit, approve, and delete buyer accounts.
6. Changes are saved to the database and reflected in buyer notifications.

## 9. Validation And Error Handling

- Frontend validation checks required fields, email format, password confirmation, and minimum onboarding detail length.
- Backend validation checks payload types and normalized string values through Pydantic.
- Duplicate buyer emails are rejected.
- Missing buyers return 404 errors.
- Login failures return 401 errors.
- Duplicate email conflicts return 409 errors.
- Database or server failures return 500 errors.

## 10. Performance And Behavior Notes

- Buyer lists are fetched on demand for the admin dashboard.
- Buyer notifications are refreshed periodically in the buyer dashboard after login.
- The frontend uses a single-page app flow with local state instead of a full auth server, which keeps the demo responsive and simple.
- Passwords are hashed before persistence, but the current implementation uses a lightweight SHA-256 approach suitable for the demo environment rather than production-grade password storage.

## 11. Deployment Readiness

The backend can run in two modes:

- Local Uvicorn server for development.
- AWS Lambda through Mangum behind API Gateway.

The frontend can be deployed as a static site and pointed to the API Gateway URL through `VITE_API_BASE_URL`.

## 12. Files Of Interest

- [README.md](README.md)
- [database/schema.sql](database/schema.sql)
- [backend/app/main.py](backend/app/main.py)
- [backend/app/services/buyer_service.py](backend/app/services/buyer_service.py)
- [frontend/src/App.jsx](frontend/src/App.jsx)
- [frontend/src/components/BuyerForm.jsx](frontend/src/components/BuyerForm.jsx)
- [frontend/src/components/BuyerModal.jsx](frontend/src/components/BuyerModal.jsx)
- [frontend/src/components/BuyerTable.jsx](frontend/src/components/BuyerTable.jsx)