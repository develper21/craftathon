# MediTrack Backend

**Express.js + Prisma + PostgreSQL API** for medication adherence tracking system.

---

## 🎯 Overview

Backend API that provides endpoints for:
- **Authentication** - User registration, login, email verification, password reset
- **Medication Management** - CRUD operations for medications
- **Dose Logging** - Track individual dose taken/missed
- **Adherence Tracking** - Calculate and retrieve adherence statistics
- **Patient Management** - Caregiver-patient relationships
- **Notifications** - System and real-time notifications
- **Reports** - Adherence reports and analytics

---

## 📋 Prerequisites

- Node.js v18+
- PostgreSQL (local or cloud)
- npm or yarn

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/meditrack_db"

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@meditrack.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on: **http://localhost:5000**

---

## 📦 NPM Scripts

```bash
npm run dev          # Start with nodemon (development)
npm start            # Start production server
npm run build        # Generate Prisma client + push schema
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create and apply migrations
npm run db:push      # Push schema changes
npm run db:reset     # Drop and recreate database
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio UI
```

---

## 📁 Project Structure

```
src/
├── config/
│   └── prisma.js              # Prisma client singleton
├── controllers/               # Business logic
│   ├── auth.controller.js     # Authentication logic
│   ├── user.controller.js     # User management
│   ├── medication.controller.js
│   ├── dose.controller.js
│   ├── adherence.controller.js
│   ├── caregiver.controller.js
│   ├── notification.controller.js
│   └── report.controller.js
├── routes/                    # API endpoints
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── medication.routes.js
│   ├── dose.routes.js
│   ├── adherence.routes.js
│   ├── caregiver.routes.js
│   ├── notification.routes.js
│   ├── report.routes.js
│   └── health.routes.js
├── middlewares/
│   ├── auth.js               # JWT authentication
│   ├── errorHandler.js       # Global error handling
│   ├── notFound.js          # 404 handler
│   └── validate.js          # Input validation
├── services/
│   ├── adherence.service.js  # Adherence calculations
│   └── notification.service.js
├── jobs/
│   └── cron.js              # Scheduled tasks (reminders)
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Database seed script
├── utils/
│   ├── apiResponse.js       # Standard response format
│   ├── AppError.js          # Custom error class
│   ├── jwt.js               # JWT utilities
│   ├── email.js             # Email service
│   ├── logger.js            # Winston logger
│   └── scheduleHelper.js    # Medication scheduling logic
├── app.js                    # Express app setup
└── index.js                  # Server entry point
```

---

## 🔑 API Endpoints

### Authentication (`/api/auth`)

```bash
POST   /auth/signup              # Register new user
POST   /auth/login               # Login (returns JWT token)
POST   /auth/verify-email/:token # Verify email OTP
POST   /auth/resend-otp          # Resend verification OTP
POST   /auth/forgot-password     # Request password reset
POST   /auth/reset-password/:token # Reset password
GET    /auth/health              # Health check
```

### User (`/api/user`)

```bash
GET    /user/profile             # Get logged-in user profile
PUT    /user/profile             # Update profile
POST   /user/change-password     # Change password
DELETE /user/account             # Delete account
```

### Medication (`/api/medication`)

```bash
GET    /medication               # Get all medications (patient)
POST   /medication               # Create medication
PUT    /medication/:id           # Update medication
DELETE /medication/:id           # Delete medication
GET    /medication/:id           # Get single medication
```

### Dose (`/api/dose`)

```bash
GET    /dose                     # Get all doses (paginated)
POST   /dose                     # Log a dose (taken/missed)
PUT    /dose/:id                # Update dose record
DELETE /dose/:id                # Delete dose record
GET    /dose/today              # Get today's doses
GET    /dose/medication/:medId  # Get doses for medication
```

### Adherence (`/api/adherence`)

```bash
GET    /adherence                # Get current adherence %
GET    /adherence/month/:month   # Get monthly adherence %
GET    /adherence/trend          # Get adherence trend (7 days)
GET    /adherence/patient/:id    # Get patient adherence (caregiver only)
GET    /adherence/summary/:medId # Get medication-specific adherence
```

### Caregiver (`/api/caregiver`)

```bash
GET    /caregiver/patients       # Get caregiver's patients
GET    /caregiver/patient/:id    # Get patient full details
POST   /caregiver/patient        # Link patient to caregiver
DELETE /caregiver/patient/:id    # Unlink patient
GET    /caregiver/reports        # Get adherence reports for patients
GET    /caregiver/alerts         # Get patient adherence alerts
```

### Notification (`/api/notification`)

```bash
GET    /notification             # Get notifications (paginated)
POST   /notification/read/:id    # Mark notification as read
PUT    /notification/:id         # Update notification
DELETE /notification/:id         # Delete notification
POST   /notification/read-all    # Mark all as read
POST   /notification/delete-all  # Delete all notifications
```

### Report (`/api/report`)

```bash
GET    /report                   # Get all reports (caregiver/admin)
POST   /report                   # Create report
GET    /report/:id               # Get report details
PUT    /report/:id               # Update report
DELETE /report/:id               # Delete report
GET    /report/patient/:patientId # Get patient reports (caregiver)
```

### Health (`/api/health`)

```bash
GET    /health                   # API health check
```

---

## 🔐 Authentication

### Flow
1. User sends **email + password** to `/auth/signup`
2. Email OTP sent → User verifies at `/auth/verify-email/:token`
3. User can then **login** at `/auth/login` with email + password
4. Server returns **JWT token** (valid for 7 days)
5. Token sent in `Authorization: Bearer <token>` header for protected routes
6. All protected routes verified by `auth` middleware

### JWT Token Structure
```javascript
{
  userId: "uuid",
  email: "user@example.com",
  role: "patient|caregiver|admin",
  iat: 1234567890,
  exp: 1234567890
}
```

---

## 📊 Database Schema

### User Table
```prisma
model User {
  id                String
  email             String (unique)
  password          String (hashed)
  name              String
  role              String (patient, caregiver, admin)
  isEmailVerified   Boolean
  isActive          Boolean
  phone             String
  dateOfBirth       Date
  address           String
  
  // Relations
  medications       Medication[]
  doses             Dose[]
  notifications     Notification[]
  caregiverLink     CaregiverPatient[] @relation("CaregiverLink")
  patientLink       CaregiverPatient[] @relation("PatientLink")
}
```

### Medication Table
```prisma
model Medication {
  id              String
  userId          String
  name            String
  dosage          String
  unit            String
  frequency       String (once, twice, thrice, etc)
  times           String[] (medication times)
  startDate       DateTime
  endDate         DateTime
  reason          String
  
  // Relations
  user            User
  doses           Dose[]
}
```

### Dose Table
```prisma
model Dose {
  id              String
  medicationId    String
  userId          String
  scheduledTime   DateTime
  takenTime       DateTime
  status          String (taken, missed, skipped)
  notes           String
  
  // Relations
  medication      Medication
  user            User
}
```

---

## ✨ Key Features

### 1. Email Verification
- OTP-based email verification on signup
- Resend OTP functionality
- Email-based password reset

### 2. Medication Scheduling
- Set medication times (morning, afternoon, evening, etc.)
- Flexible frequency (once daily, twice daily, etc.)
- Start and end dates for medications

### 3. Dose Tracking
- Log doses as taken/missed
- Track scheduled vs actual times
- Add notes to doses
- Historical dose records

### 4. Adherence Calculation
- Daily adherence percentage
- Monthly adherence trends
- 7-day rolling average
- Medication-specific adherence

### 5. Caregiver Features
- Link to multiple patients
- View patient medication history
- Get adherence alerts
- Generate adherence reports

### 6. Notifications
- Medication reminders (via cron)
- Adherence alerts (missed doses)
- System notifications
- Mark read/delete functionality

### 7. Logging
- Winston logger for all requests
- Error logging with stack traces
- Request/response logging via Morgan

---

## 🧪 Testing with Sample Data

### Seed Database
```bash
npm run db:seed
```

### Sample Users (after seeding)
```
Patient:
  Email: patient@example.com
  Password: password123

Caregiver:
  Email: caregiver@example.com
  Password: password123

Admin:
  Email: admin@example.com
  Password: password123
```

---

## 🐛 Error Handling

All errors return standardized JSON format:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message here",
  "success": false
}
```

### HTTP Status Codes
- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Server Error

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development, production |
| `DATABASE_URL` | PostgreSQL connection string | postgresql://... |
| `JWT_SECRET` | JWT signing secret | your_secret_key |
| `JWT_EXPIRE` | JWT expiry time | 7d, 24h |
| `SMTP_HOST` | Email SMTP host | smtp.gmail.com |
| `SMTP_PORT` | Email SMTP port | 587 |
| `SMTP_USER` | Email username | user@gmail.com |
| `SMTP_PASS` | Email app password | app_password |
| `EMAIL_FROM` | From email address | noreply@example.com |
| `FRONTEND_URL` | Frontend URL | http://localhost:5173 |

---

## 🚢 Deployment

### Deploy to Render/Railway/Heroku

1. **Create account** on Render/Railway
2. **Connect GitHub repository**
3. **Set environment variables** from `.env`
4. **Select PostgreSQL database** addon
5. **Deploy!**

### Important Notes
- Change `NODE_ENV` to `production`
- Update `FRONTEND_URL` to production URL
- Use strong `JWT_SECRET`
- Enable HTTPS

---

## 🆘 Troubleshooting

### `DATABASE_URL is not set`
- Create `.env` file
- Set `DATABASE_URL` with PostgreSQL connection string

### `Cannot find module @prisma/client`
- Run: `npm run db:generate`

### Port already in use
- Change `PORT` in `.env`
- Or kill process: `lsof -i :5000`

### Email not sending
- Check SMTP credentials in `.env`
- Use Gmail app password (not regular password)
- Enable "Less secure apps" in Gmail settings

### Database migration errors
- Run: `npm run db:reset` (⚠️ drops all data)
- Then: `npm run db:seed`

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/NewFeature`
2. Commit changes: `git commit -m 'Add NewFeature'`
3. Push: `git push origin feature/NewFeature`
4. Open Pull Request

---

**Last Updated**: April 2026




