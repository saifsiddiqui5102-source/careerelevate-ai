// ===============================
// Security Middleware Suite
// ===============================

// ==========================================
// 1. Helmet-like Security Headers
// ==========================================
export const helmetSecurity = (req, res, next) => {
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=15552000; includeSubDomains"
  );
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");

  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https://images.unsplash.com; " +
      "connect-src 'self' http://localhost:3000 http://127.0.0.1:3000 http://localhost:5000 https://careerelevate-api.onrender.com https://careerelevate-ai.netlify.app;"
  );

  next();
};

// ==========================================
// 2. CORS Configuration
// ==========================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://careerelevate-ai.netlify.app",
  process.env.CLIENT_URL,
].filter(Boolean);

export const corsConfig = (req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || allowedOrigins[0]);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

// ==========================================
// 3. Global Rate Limiter
// ==========================================

const ipBuckets = new Map();

const cleanOldIpEntries = (windowMs) => {
  const now = Date.now();

  for (const [ip, data] of ipBuckets.entries()) {
    if (now - data.startTime > windowMs) {
      ipBuckets.delete(ip);
    }
  }
};

export const globalRateLimiter = (req, res, next) => {
  const windowMs = 15 * 60 * 1000;

  cleanOldIpEntries(windowMs);

  const ip =
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  const now = Date.now();

  if (!ipBuckets.has(ip)) {
    ipBuckets.set(ip, {
      count: 1,
      startTime: now,
    });
  } else {
    const bucket = ipBuckets.get(ip);

    if (now - bucket.startTime < windowMs) {
      bucket.count++;

      if (bucket.count > 150) {
        return res.status(429).json({
          success: false,
          message:
            "Too many requests. Please try again after 15 minutes.",
        });
      }
    } else {
      ipBuckets.set(ip, {
        count: 1,
        startTime: now,
      });
    }
  }

  next();
};

// ==========================================
// 4. Auth Rate Limiter
// ==========================================

export const authRateLimiter = (req, res, next) => {
  const windowMs = 15 * 60 * 1000;

  const ip =
    (req.ip ||
      req.connection?.remoteAddress ||
      "127.0.0.1") + "-auth";

  const now = Date.now();

  if (!ipBuckets.has(ip)) {
    ipBuckets.set(ip, {
      count: 1,
      startTime: now,
    });
  } else {
    const bucket = ipBuckets.get(ip);

    if (now - bucket.startTime < windowMs) {
      bucket.count++;

      if (bucket.count > 30) {
        return res.status(429).json({
          success: false,
          message:
            "Too many authentication attempts. Please wait 15 minutes.",
        });
      }
    } else {
      ipBuckets.set(ip, {
        count: 1,
        startTime: now,
      });
    }
  }

  next();
};

// ==========================================
// 5. MongoDB Query Sanitization
// ==========================================

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  for (const key in obj) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
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

// ==========================================
// 6. XSS Sanitization
// ==========================================

const escapeHtmlString = (str) => {
  if (typeof str !== "string") return str;

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

const sanitizeXssObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = escapeHtmlString(obj[key]);
    } else if (typeof obj[key] === "object") {
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