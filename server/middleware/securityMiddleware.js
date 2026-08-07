// Pure Native Security Middleware Suite (Zero-Dependency High Performance)

// 1. Helmet HTTP Security Headers
export const helmetSecurity = (req, res, next) => {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com blob:;connect-src 'self'
http://localhost:5000
http://localhost:3000
https://careerelevate-api.onrender.com
https://careerelevate-ai.netlify.app
  );
  next();
};

// 2. Strict Whitelisted CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

export const corsConfig = (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
};

// Rate Limit Bucket Store
const ipBuckets = new Map();

const cleanOldIpEntries = (windowMs) => {
  const now = Date.now();
  for (const [ip, data] of ipBuckets.entries()) {
    if (now - data.startTime > windowMs) {
      ipBuckets.delete(ip);
    }
  }
};

// 3. Global API Rate Limiter (100 requests per 15 mins)
export const globalRateLimiter = (req, res, next) => {
  cleanOldIpEntries(15 * 60 * 1000);
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;

  if (!ipBuckets.has(ip)) {
    ipBuckets.set(ip, { count: 1, startTime: now });
  } else {
    const bucket = ipBuckets.get(ip);
    if (now - bucket.startTime < windowMs) {
      bucket.count += 1;
      if (bucket.count > 150) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests from this IP. Please try again after 15 minutes.'
        });
      }
    } else {
      ipBuckets.set(ip, { count: 1, startTime: now });
    }
  }
  next();
};

// Auth Route Specific Rate Limiter (20 requests per 15 mins)
export const authRateLimiter = (req, res, next) => {
  const ip = (req.ip || '127.0.0.1') + '-auth';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;

  if (!ipBuckets.has(ip)) {
    ipBuckets.set(ip, { count: 1, startTime: now });
  } else {
    const bucket = ipBuckets.get(ip);
    if (now - bucket.startTime < windowMs) {
      bucket.count += 1;
      if (bucket.count > 30) {
        return res.status(429).json({
          success: false,
          message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
        });
      }
    } else {
      ipBuckets.set(ip, { count: 1, startTime: now });
    }
  }
  next();
};

// 4. Mongo Query Sanitize (NoSQL Injection Prevention)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key in obj) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

export const sanitizeMongoQueries = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

// 5. XSS Input Sanitization
const escapeHtmlString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const sanitizeXssObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = escapeHtmlString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeXssObject(obj[key]);
    }
  }
  return obj;
};

export const sanitizeXSS = (req, res, next) => {
  if (req.body) sanitizeXssObject(req.body);
  if (req.query) sanitizeXssObject(req.query);
  if (req.params) sanitizeXssObject(req.params);
  next();
};
