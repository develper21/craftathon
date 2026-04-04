# Craftathon - Medication Adherence Platform

A full-stack medication adherence and patient care platform built with Node.js, Express, Prisma, PostgreSQL, and React (Vite).

## 🚀 Key Features

- User roles: patient, caregiver, admin
- Medication management (CRUD, schedules)
- Dose tracking and adherence reporting
- Reminders and notification system
- Patient/caregiver assignments
- Health check endpoints and action reports
- JWT authentication and authorization
- API rate handling and error middleware

## 🛠️ Tech Stack

Backend
- Node.js + Express.js (v4.21.1)
- Prisma ORM (v5.22.0) + PostgreSQL
- JWT via `jsonwebtoken` (v9.0.2)
- Password hashing via `bcryptjs` (v2.4.3)
- Cron jobs with `node-cron` (v3.0.3)
- Email notifications via `nodemailer` (v8.0.4)
- Logging with `winston` (v3.17.0)
- Validation with `express-validator` (v7.2.0)

Frontend
- React (v18.2.0) + Vite (v8.0.3)
- @vitejs/plugin-react (v5.0.0)
- Tailwind CSS (v3.3.6)
- React Router DOM (v6.20.0)
- Context API for auth state
- Lucide React (v1.7.0) for icons

## 📁 Repository Structure

```
craftathon/
├── backend/
│   ├── node_modules/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── config/prisma.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── frontend/
    ├── node_modules/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── routes/
    ├── package.json
    ├── vite.config.js
    └── README.md
```

## ⚙️ Setup Instructions

### 1) Backend

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and set values:

- `PORT=5000`
- `DATABASE_URL=postgresql://user:password@localhost:5432/craftathon?schema=public`
- `JWT_SECRET=your_jwt_secret`
- `EMAIL_USER=your_email@gmail.com`
- `EMAIL_PASS=your_email_password`
- `FRONTEND_URL=http://localhost:5173`

4. Initialize database:
- `npx prisma generate`
- `npx prisma db push`
- `npm run db:seed`

5. Run backend:
- `npm run dev`

API base: `http://localhost:5000/api/v1`

### 2) Frontend

1. `cd frontend`
2. `npm install`
3. Start:
- `npm run dev`

Frontend base: `http://localhost:5173`

## 🔐 Auth & API Routes

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Users
- `GET /api/v1/users/` (admin)
- `GET /api/v1/users/:id`
- `PUT /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

### Medications
- `GET /api/v1/medications`
- `POST /api/v1/medications`
- `GET /api/v1/medications/:id`
- `PUT /api/v1/medications/:id`
- `DELETE /api/v1/medications/:id`

### Doses
- `POST /api/v1/doses`
- `GET /api/v1/doses` 
- `PUT /api/v1/doses/:id`

### Adherence
- `GET /api/v1/adherence` 
- `POST /api/v1/adherence`

### Caregivers
- `GET /api/v1/caregivers`
- `POST /api/v1/caregivers`

### Notifications
- `GET /api/v1/notifications`
- `POST /api/v1/notifications`

### Reports
- `GET /api/v1/reports`
- `POST /api/v1/reports`

### Health
- `GET /api/v1/health` (status)

## 🧪 Testing & Validation

- Uses `express-validator` in middlewares for request body checks
- Error handling via `errorHandler` in `src/middlewares/errorHandler.js`

## � Troubleshooting

### Frontend Dependency Conflicts
If you encounter `ERESOLVE` errors during `npm install` (e.g., Vite and @vitejs/plugin-react version mismatch):
- Ensure `@vitejs/plugin-react` is at least v5.0.0 for Vite v8 compatibility
- Run `npm install --legacy-peer-deps` if conflicts persist
- Or update `.npmrc` with `legacy-peer-deps=true`

### Database Connection Issues
- Verify PostgreSQL is running and `DATABASE_URL` is correct
- Run `npx prisma db push` after schema changes
- Use `npx prisma studio` to inspect data

### Port Conflicts
- Backend runs on port 5000, frontend on 5173
- Change ports in `.env` or `vite.config.js` if needed

## �🚀 Deployment Notes

- Set all env vars in your hosting provider (Render, Railway, Heroku, Vercel)
- Ensure production DB URL and JWT secret are secure
- Build frontend with `npm run build` and serve on static host
- Configure backend CORS `FRONTEND_URL`

## 📄 License
MIT

---

Made with ❤️ by the Craftathon team


