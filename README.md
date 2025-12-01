# Blood Link Server

Server API for the Blood Link application — a TypeScript + Express + MongoDB backend that manages donor registrations, blood requests, and reports.

## 🔧 Tech stack

- Node.js + TypeScript
- Express
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing
- dotenv for environment configuration

## 🚀 Features

- Donor registration and login (JWT-based auth)
- Donor profile and listing
- Create / list / update / delete blood requests
- Submit and administrate incident reports (optionally anonymous)
- Input validations on models using Mongoose schemas

## 📁 Project structure

Top-level files we'll care about:

- `src/index.ts` — server entry and route registration
- `src/middlewares/authToken.ts` — JWT authentication middleware
- `src/modules/donor` — donor model + controller (register/login/profile/list)
- `src/modules/bloodRequest` — blood-request model + controller (CRUD)
- `src/modules/report` — reporting model + controller (submit/list)

## ⚙️ Getting started

Prerequisites: Node.js v16+ and a running MongoDB (local or cloud).

1. Install dependencies

```powershell
npm install
```

2. Local development

```powershell
npm run dev
```

This runs `nodemon --exec ts-node src/index.ts` and starts the server on PORT (defaults to 3000).

3. Build & run production

```powershell
npm run build
npm start
```

## 🧩 Environment variables

Create a `.env` file (or configure in your environment):

- `MONGODB_URI` — MongoDB connection string (defaults to mongodb://localhost:27017/blood-link)
- `JWT_SECRET` — secret key used to sign JWT tokens (use a strong secret)
- `PORT` — (optional) port number the server listens on (default 3000)

## 🔐 Authentication

Routes that require authentication expect an Authorization header with a Bearer token:

Header example:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are issued for donors on registration and login and expire in 7 days (by default code).

## 📬 API Endpoints (overview)

Base path: `/api/v1`

Donor routes (`/api/v1/donor`)

- POST `/register` — Register a new donor. Returns { token, donor }
- POST `/login` — Login and receive a token.
- GET `/profile` — Protected — returns donor profile from token
- GET `/` — List donors (filters: `bloodGroup`, `gender`, `location`, pagination `page`, `limit`)

Blood Requests (`/api/v1/blood-requests`)

- POST `/` — Create a blood request (public).
- GET `/` — List blood requests — supports query filters `urgencyLevel`, `bloodGroup`, pagination `page`, `limit`.
- GET `/:id` — Get a single blood request by ID.
- PUT `/:id` — Update blood request — requires auth (admin/donor token per implementation).
- DELETE `/:id` — Delete blood request — requires auth.

Reports (`/api/v1/reports`)

- POST `/` — Create a report (can be anonymous).
- GET `/` — Protected — list reports (filters `category`, `anonymous`, `page`, `limit`).
- GET `/:id` — Protected — get a report by id.
- DELETE `/:id` — Protected — delete a report.

## 📦 Example request bodies

Register donor (POST /api/v1/donor/register)

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "Female",
  "bloodGroup": "A+",
  "weight": 60,
  "address": "123 Main Street, City",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

Create a blood request (POST /api/v1/blood-requests)

```json
{
  "patientName": "John Smith",
  "bloodGroup": "O+",
  "urgencyLevel": "High",
  "unitsNeeded": 2,
  "requiredBy": "2025-12-10T12:00:00Z",
  "hospitalName": "City Hospital",
  "doctorName": "Dr. A",
  "primaryContact": "+1987654321",
  "emergencyContact": "+1987654322",
  "location": "City, Country",
  "medicalReason": "Severe surgery"
}
```

File a report (POST /api/v1/reports)

```json
{
  "userType": "recipient",
  "userIdentification": "victim@example.com",
  "reportCategory": "fraud",
  "detailedDescription": "Received fake donation request",
  "supportingEvidence": "https://example.com/screenshot.png",
  "anonymous": false
}
```

## ⚠️ Notes & shortcuts

- The API uses strong validations at the model layer — date checks, required fields, enums, and format validators (email/phone).
- The donor model checks age (must be between 18 and 65) at save time.
- The blood request model currently has a `requiredBy` pre-save validation that checks against a fixed date — that may be a code artifact to revise.

## 🛠 Contributing

Bug fixes and documentation updates are welcome. Please open a PR and include a description of the change and why it’s needed.

---

_**- Create By Ayaj Uddin Tanif (Full Stack Web Developer)**_
