import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// Security Middleware Imports
import {
  helmetSecurity,
  corsConfig,
  globalRateLimiter,
  sanitizeMongoQueries,
  sanitizeXSS
} from './middleware/securityMiddleware.js';

// Logging Middleware Imports
import { httpLogger } from './middleware/loggerMiddleware.js';
import logger from './config/logger.js';

// Swagger UI Imports
import { serveSwaggerUiHtml } from './docs/swagger.js';

// Error Handling Middleware Imports
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// API v1 Router Import
import v1Routes from './routes/v1/index.js';

// Initialize Environment Variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. HTTP Security Headers (Helmet)
app.use(helmetSecurity);

// 2. Cross-Origin Resource Sharing (CORS)
app.use(corsConfig);

// 3. Centralized HTTP Request Logger (Morgan -> Winston)
app.use(httpLogger);

// 4. Global API Rate Limiting (100 req / 15 mins)
app.use('/api', globalRateLimiter);

// 5. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Data Sanitization against NoSQL Query Injection & XSS
app.use(sanitizeMongoQueries);
app.use(sanitizeXSS);

// Static uploads directory for PDF files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. Interactive Swagger API Documentation Endpoint (/api-docs)
app.get('/api-docs', serveSwaggerUiHtml);

// 8. Connect MongoDB Database
connectDB();

// 9. Mount REST API v1 Versioned Routes
app.use('/api/v1', v1Routes);

// 10. Backward Compatibility Legacy Aliases (/api/* -> /api/v1/*)
app.use('/api/auth', (req, res, next) => { req.url = `/auth${req.url}`; v1Routes(req, res, next); });
app.use('/api/user', (req, res, next) => { req.url = `/user${req.url}`; v1Routes(req, res, next); });
app.use('/api/resume', (req, res, next) => { req.url = `/resume${req.url}`; v1Routes(req, res, next); });
app.use('/api/interview', (req, res, next) => { req.url = `/interview${req.url}`; v1Routes(req, res, next); });
app.use('/api/dashboard', (req, res, next) => { req.url = `/dashboard${req.url}`; v1Routes(req, res, next); });

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: 'v1.0.0',
    documentation: '/api-docs',
    security: 'hardened',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: 'v1.0.0',
    documentation: '/api-docs',
    security: 'hardened',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 11. 404 Not Found Handler
app.use(notFoundHandler);

// 12. Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Express Security-Hardened Server running on port ${PORT}`);
    logger.info(`📘 Interactive Swagger API Specs available at http://localhost:${PORT}/api-docs`);
    logger.info(`🔒 Helmet, CORS, Rate Limit, Mongo Sanitize & XSS Protections ACTIVE`);
  });
}

export default app;
