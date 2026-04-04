import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patient.js';
import messagesRoutes from './routes/messages.js';

dotenv.config();

const app = express();

/* -------------------- Middleware -------------------- */
// Custom CORS & Private Network Access handling
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://mediconnect-in.onrender.com',
  'https://mediconnect-frontend.onrender.com',
  'https://www.mediconnecthub.in'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && (allowedOrigins.has(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');

    // Browser Private Network Access: if the preflight asks to access a private network,
    // respond with this header to allow it for supported browsers (Chrome, Edge, etc.).
    if (req.headers['access-control-request-private-network']) {
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    // For OPTIONS preflight, return immediately with no body
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- STATIC FILES (IMPORTANT) -------------------- */
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);

/* -------------------- Routes -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/messages', messagesRoutes);

/* -------------------- Root Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("API Working");
});

/* -------------------- Health Check -------------------- */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MediConnect API running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected'
  });
});

/* -------------------- MongoDB Connection -------------------- */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
