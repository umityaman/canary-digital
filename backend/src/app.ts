import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import morgan from 'morgan';
import logger, { stream } from './config/logger';
import { 
  initializeSentry, 
  sentryRequestHandler, 
  sentryTracingHandler, 
  sentryErrorHandler 
} from './config/sentry';
import { setupSwagger } from './config/swagger';

const app = express();

// Initialize Sentry (must be first!)
initializeSentry(app);

// Sentry request handler (must be before all other handlers)
app.use(sentryRequestHandler());

// Sentry tracing handler
app.use(sentryTracingHandler());

// HTTP request logging with Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream }));

// Trust proxy for Railway/Vercel/Cloudflare
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS Configuration - Production Ready
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative frontend port
  'http://localhost:19000', // Expo dev
  'http://localhost:19006', // Expo web
  'https://frontend-jecbee0xl-umityamans-projects.vercel.app', // Production Vercel URL
  process.env.FRONTEND_URL, // Production frontend URL (configurable)
  process.env.MOBILE_APP_URL, // Mobile app URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // TEMPORARY: Allow all Vercel preview deployments
    if (origin && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // Cache preflight for 10 minutes
}));

// Performance monitoring middleware
import performanceMiddleware from './config/performance';
app.use(performanceMiddleware);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting - Tiered Approach
const createRateLimiter = (windowMs: number, max: number, message: string) => 
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for whitelisted IPs (optional)
    skip: (req) => {
      const whitelist = (process.env.RATE_LIMIT_WHITELIST || '').split(',');
      return whitelist.includes(req.ip || '');
    },
  });

// General API rate limit: 100 requests per minute
app.use('/api/', createRateLimiter(
  1 * 60 * 1000, // 1 minute
  100,
  'Too many requests from this IP, please try again after a minute'
));

// Stricter limit for authentication endpoints: 5 requests per 15 minutes
app.use('/api/auth/login', createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many login attempts, please try again after 15 minutes'
));

app.use('/api/auth/register', createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many registration attempts, please try again after an hour'
));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Setup Swagger Documentation
setupSwagger(app);

app.get('/api/health', (req, res)=> res.json({ok:true, timestamp: new Date().toISOString()}));

// Routes
app.use('/api/auth', require('./routes/auth').default);
app.use('/api/auth', require('./routes/googleAuth').default); // Google OAuth routes
app.use('/api/categories', require('./routes/categories').default); // Category management
app.use('/api/equipment', require('./routes/equipment').default);
app.use('/api/orders', require('./routes/orders').default);
app.use('/api/customers', require('./routes/customers').default);
app.use('/api/suppliers', require('./routes/suppliers').default);
app.use('/api/inspections', require('./routes/inspections').default);
app.use('/api/calendar', require('./routes/calendar').default);
app.use('/api/technical-service', require('./routes/technicalService').default);
app.use('/api/test', require('./routes/test').default); // Test endpoints
app.use('/api/profile', require('./routes/profile').default);
app.use('/api/dashboard', require('./routes/dashboard').default);
app.use('/api/booqable', require('./routes/booqable').default); // Booqable integration
app.use('/api/scan', require('./routes/scan').default); // QR/Barcode scanning
app.use('/api/notifications', require('./routes/notifications').default); // Notification system
app.use('/api/pricing', require('./routes/pricing').default); // Smart pricing system
app.use('/api/reservations', require('./routes/reservations').default); // Reservation system
app.use('/api/reports', require('./routes/reports').default); // Reporting and analytics
app.use('/api/monitoring', require('./routes/monitoring').default); // Performance monitoring
app.use('/api/invoices', require('./routes/invoice').default); // Invoicing & Paraşüt integration
app.use('/api/payment', require('./routes/payment').default); // Payment & iyzico integration

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  // Log error details
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack, 
    path: req.path, 
    method: req.method,
    query: req.query,
    body: req.body,
    user: req.user?.id,
  });

  // Send appropriate response
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;

  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
  });
});

export default app;
