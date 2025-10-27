import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import morgan from 'morgan';
import logger, { stream } from './config/logger';
import { initializeScheduler } from './utils/scheduler';
// Temporarily disable Sentry due to TypeScript errors
// import { 
//   initializeSentry, 
//   sentryRequestHandler, 
//   sentryTracingHandler, 
//   sentryErrorHandler 
// } from './config/sentry';
import { setupSwagger } from './config/swagger';

const app = express();

// Initialize reminder scheduler
initializeScheduler();

// Initialize Sentry (must be first!) - TEMPORARILY DISABLED
// initializeSentry(app);

// Sentry request handler (must be before all other handlers) - TEMPORARILY DISABLED
// app.use(sentryRequestHandler());

// Sentry tracing handler - TEMPORARILY DISABLED
// app.use(sentryTracingHandler());

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
  'https://canary-frontend-672344972017.europe-west1.run.app', // GCP Cloud Run Frontend
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

// Helper function to safely load routes
const safeLoadRoute = (path: string, routeFile: string, description: string) => {
  try {
    const route = require(routeFile);
    if (route && route.default) {
      app.use(path, route.default);
      logger.info(`✅ Loaded route: ${path}`);
    } else {
      logger.warn(`⚠️  Route ${routeFile} has no default export, skipping`);
    }
  } catch (error: any) {
    logger.error(`❌ Failed to load route ${path}: ${error.message}`);
    logger.error(error.stack);
  }
};

// Routes - Load each with error handling
safeLoadRoute('/api/auth', './routes/auth', 'Authentication');
safeLoadRoute('/api/auth', './routes/googleAuth', 'Google OAuth');
safeLoadRoute('/api/categories', './routes/categories', 'Category management');
safeLoadRoute('/api/equipment', './routes/equipment', 'Equipment');
safeLoadRoute('/api/orders', './routes/orders', 'Orders');
safeLoadRoute('/api/customers', './routes/customers', 'Customers');
safeLoadRoute('/api/suppliers', './routes/suppliers', 'Suppliers');
safeLoadRoute('/api/inspections', './routes/inspections', 'Inspections');
safeLoadRoute('/api/calendar', './routes/calendar', 'Calendar');
safeLoadRoute('/api/technical-service', './routes/technicalService', 'Technical Service');
safeLoadRoute('/api/test', './routes/test', 'Test endpoints');
safeLoadRoute('/api/test-reports', './routes/test-reports', 'Report testing');
safeLoadRoute('/api/test-email', './routes/email-test', 'Email testing');
safeLoadRoute('/api/test-whatsapp', './routes/whatsapp-test', 'WhatsApp testing');
safeLoadRoute('/api/profile', './routes/profile', 'Profile');
safeLoadRoute('/api/dashboard', './routes/dashboard', 'Dashboard');
safeLoadRoute('/api/analytics', './routes/analytics', 'Analytics');
safeLoadRoute('/api/booqable', './routes/booqable', 'Booqable integration');
safeLoadRoute('/api/scan', './routes/scan', 'QR/Barcode scanning');
safeLoadRoute('/api/notifications', './routes/notifications', 'Notifications');
safeLoadRoute('/api/pricing', './routes/pricing', 'Smart pricing');
safeLoadRoute('/api/reservations', './routes/reservations', 'Reservations');
safeLoadRoute('/api/reports', './routes/reports', 'Reports');
safeLoadRoute('/api/report-templates', './routes/reportTemplates', 'Report Templates');
safeLoadRoute('/api/generated-reports', './routes/generatedReports', 'Generated Reports');
safeLoadRoute('/api/monitoring', './routes/monitoring', 'Monitoring');
safeLoadRoute('/api/invoices', './routes/invoice', 'Invoicing');
safeLoadRoute('/api/offers', './routes/offer', 'Offers & Quotes');
safeLoadRoute('/api/accounting', './routes/accounting', 'Accounting & Stats');
safeLoadRoute('/api/checks', './routes/checks', 'Check Management');
safeLoadRoute('/api/promissory-notes', './routes/promissory-notes', 'Promissory Notes');
safeLoadRoute('/api/reminders', './routes/reminders', 'Email Reminders');
safeLoadRoute('/api/aging', './routes/aging', 'Aging Analysis');
safeLoadRoute('/api/account-cards', './routes/account-cards', 'Account Cards (Cari Hesap)');
safeLoadRoute('/api/einvoice', './routes/einvoice', 'E-Invoice (E-Fatura GİB)');
safeLoadRoute('/api/earchive', './routes/earchive', 'E-Archive Invoice (E-Arşiv Fatura)');
safeLoadRoute('/api/migration', './routes/migration', 'Database Migration (Temporary)');
safeLoadRoute('/api/seed', './routes/seed', 'Database Seeding (Admin only)');
safeLoadRoute('/api/payment', './routes/payment', 'Payment');
safeLoadRoute('/api/payments', './routes/payments', 'Iyzipay payments');
safeLoadRoute('/api/pdf', './routes/pdf', 'PDF generation');
safeLoadRoute('/api/2fa', './routes/twoFactor', '2FA');
safeLoadRoute('/api/push', './routes/push', 'Push notifications');
safeLoadRoute('/api/search', './routes/search', 'Search');
safeLoadRoute('/api/documents', './routes/documents', 'Documents');
safeLoadRoute('/api/parasut', './routes/parasut', 'Parasut');
safeLoadRoute('/api/whatsapp', './routes/whatsapp', 'WhatsApp');
safeLoadRoute('/api/email', './routes/email', 'Email');
safeLoadRoute('/api/social-media', './routes/social-media', 'Social Media');

// CMS Module Routes
safeLoadRoute('/api/cms/pages', './routes/cms-pages', 'CMS Pages');
safeLoadRoute('/api/cms/blog', './routes/cms-blog', 'CMS Blog');
safeLoadRoute('/api/cms/media', './routes/cms-media', 'CMS Media');
safeLoadRoute('/api/cms/menus', './routes/cms-menus', 'CMS Menus');

// AI Chatbot Module Routes
safeLoadRoute('/api/chatbot', './routes/chatbot', 'AI Chatbot');

logger.info('🎯 All routes loaded successfully');

// Sentry error handler (must be before other error handlers) - TEMPORARILY DISABLED
// app.use(sentryErrorHandler());

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
