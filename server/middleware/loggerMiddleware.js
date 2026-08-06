import logger from '../config/logger.js';

// HTTP Request Logging Middleware (Morgan-compatible)
export const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(message, { method: req.method, route: req.originalUrl, statusCode: res.statusCode });
    } else {
      logger.info(message, { method: req.method, route: req.originalUrl, statusCode: res.statusCode });
    }
  });

  next();
};

// Domain Loggers for specific system operations
export const logDomainEvent = {
  auth(action, email, success = true, meta = {}) {
    const level = success ? 'info' : 'warn';
    logger.log(level, `[AUTH EVENT] Action: ${action} | User: ${email} | Success: ${success}`, meta);
  },

  resumeUpload(filename, wordCount, userId = 'Anonymous') {
    logger.info(`[RESUME UPLOAD] File: ${filename} | Words: ${wordCount} | UserId: ${userId}`);
  },

  resumeAnalysis(overallScore, missingSkillsCount, userId = 'Anonymous') {
    logger.info(`[RESUME ANALYSIS] Score: ${overallScore}% | Missing Skills: ${missingSkillsCount} | UserId: ${userId}`);
  },

  geminiRequest(promptType, durationMs, success = true) {
    logger.info(`[GEMINI AI API] Prompt: ${promptType} | Duration: ${durationMs}ms | Success: ${success}`);
  },

  dashboardRequest(userId, section = 'Summary') {
    logger.info(`[DASHBOARD REQUEST] Section: ${section} | UserId: ${userId || 'Anonymous'}`);
  },

  dbError(operation, error) {
    logger.error(`[DATABASE ERROR] Operation: ${operation} | Error: ${error.message}`, { stack: error.stack });
  }
};
