import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import apiRouter from './routes/api.js';

import { 
  handleAdmsHandshake, 
  handleAdmsHeartbeat, 
  handleAdmsAttendancePunch, 
  handleAdmsUniversal,
  pushUserToDevice,
  recentPunches 
} from './services/biometricAdmsService.js';
import { store } from './data/store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const BIOMETRIC_PORT = 8001;

// Middleware
app.set('etag', false);
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

// Accept raw text / tab-separated payloads for biometric machines
app.use(express.text({ type: ['text/*', 'application/octet-stream', 'application/x-www-form-urlencoded'], limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// ================= TIMEWATCH / ZKTECO / ESSL BIOMETRIC ADMS ROUTES =================
app.all(['/', '/iclock/cdata', '/cdata', '/iclock/getrequest', '/getrequest', '/iclock/fdata', '/fdata', '/iclock/devicecmd'], handleAdmsUniversal);

// Endpoint to view real-time biometric punches
app.get('/api/biometric/punches', (req, res) => {
  res.json({
    success: true,
    count: recentPunches.length,
    punches: recentPunches
  });
});

// Connect to MongoDB Atlas (with graceful background retry)
connectDB();

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    mode: 'PRODUCTION_LIVE',
    service: 'Brain Dock Library API Engine',
    timestamp: new Date().toISOString(),
    biometricListener: {
      ports: [PORT, BIOMETRIC_PORT],
      connectedDevice: '140000103DFFFFFF (TimeWatch Bio-1SE)',
      hardwareIp: '192.168.0.179',
      protocol: 'EBKN / FK Web Protocol Native',
      recentPunchesCount: recentPunches.length,
      status: 'Active & Listening'
    },
    database: getDBStatus(),
    cloudinary: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      status: 'Connected'
    }
  });
});

// Auto-sync admitted students to TimeWatch device on boot
setTimeout(() => {
  (store.admissions || []).forEach(adm => {
    pushUserToDevice({ pin: adm.seatNumber, name: adm.studentName });
  });
}, 2000);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 BRAIN DOCK LIBRARY BACKEND ACTIVE ON PORT: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Also listen on port 8001 for TimeWatch Bio-1SE default port
app.listen(BIOMETRIC_PORT, () => {
  console.log(`📡 BIOMETRIC ADMS ENGINE LISTENING ON PORT: ${BIOMETRIC_PORT}`);
});
