# MediConnect Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the backend directory:
```
PORT=5000
DB_URI=mongodb://localhost:27017/mediconnect
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

3. Make sure MongoDB is running

4. Start the server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login
- GET /api/auth/me - Get current user

### Doctor Routes (require doctor/admin role)
- GET /api/doctor/dashboard
- GET /api/doctor/patients
- POST /api/doctor/patient
- GET /api/doctor/appointments
- POST /api/doctor/prescription

### Patient Routes (require patient/admin role)
- GET /api/patient/doctors
- POST /api/patient/appointment
- GET /api/patient/appointments
- GET /api/patient/prescriptions

### Student Routes (require student/admin role)
- GET /api/student/dashboard
- GET /api/student/assigned
- POST /api/student/case-study

### Admin Routes
- GET /api/admin/users
- GET /api/admin/analytics




