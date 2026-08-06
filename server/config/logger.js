import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const errorLogPath = path.join(logDir, 'error.log');
const combinedLogPath = path.join(logDir, 'combined.log');

const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let logLine = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  if (meta.method && meta.route) {
    logLine += ` | HTTP ${meta.method} ${meta.route} ${meta.statusCode || ''}`;
  }
  if (meta.stack) {
    logLine += `\nStack: ${meta.stack}`;
  }
  return logLine + '\n';
};

const writeLog = (level, message, meta = {}) => {
  const formatted = formatLog(level, message, meta);
  
  // Console logging in development
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    if (level === 'error') {
      console.error(`🚨 ${formatted.trim()}`);
    } else {
      console.log(`ℹ️ ${formatted.trim()}`);
    }
  }

  // File Logging
  fs.appendFile(combinedLogPath, formatted, (err) => {
    if (err) console.error('Failed to write to combined.log:', err);
  });

  if (level === 'error') {
    fs.appendFile(errorLogPath, formatted, (err) => {
      if (err) console.error('Failed to write to error.log:', err);
    });
  }
};

export const logger = {
  info(message, meta) { writeLog('info', message, meta); },
  warn(message, meta) { writeLog('warn', message, meta); },
  error(message, meta) { writeLog('error', message, meta); },
  debug(message, meta) { writeLog('debug', message, meta); },
  log(level, message, meta) { writeLog(level, message, meta); }
};

// Global Unhandled Exception & Promise Rejection Handlers
process.on('uncaughtException', (err) => {
  logger.error(`[UNCAUGHT EXCEPTION]: ${err.message}`, { stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;
  logger.error(`[UNHANDLED REJECTION]: ${message}`, { stack });
});

export default logger;
