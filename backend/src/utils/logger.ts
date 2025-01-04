import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import chalk from 'chalk';

const { combine, timestamp, printf, errors } = format;

// Custom console format
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const levelColorMap: { [key: string]: Function } = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.green,
    http: chalk.magenta,
    debug: chalk.blue,
  };

  const colorizer = levelColorMap[level] || chalk.white;
  const timestampStr = chalk.gray(`[${timestamp}]`);
  const levelStr = colorizer(`[${level.toUpperCase()}]`);
  const messageStr = colorizer(message);
  
  let logMessage = `${timestampStr} ${levelStr}: ${messageStr}`;
  
  // Add stack trace for errors
  if (stack) {
    logMessage += `\n${chalk.red(stack)}`;
  }
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    logMessage += `\n${chalk.cyan(JSON.stringify(metadata, null, 2))}`;
  }
  
  return logMessage;
});

// File rotation transport configuration
const fileRotateTransport = new transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  format: combine(
    timestamp(),
    format.json()
  ),
});

// Create the logger
export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    // Console transport with custom formatting
    new transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        consoleFormat
      ),
    }),
    // Rotating file transport for all logs
    fileRotateTransport,
    // Separate file for errors
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp(),
        format.json()
      ),
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new transports.File({ 
      filename: 'logs/exceptions.log',
      format: combine(
        timestamp(),
        format.json()
      ),
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new transports.File({ 
      filename: 'logs/rejections.log',
      format: combine(
        timestamp(),
        format.json()
      ),
    }),
  ],
  // Prevent exit on error
  exitOnError: false,
});

// Create morgan middleware with custom token formatting
export const morganMiddleware = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res) || '-',
      url: tokens.url(req, res) || '-',
      status: Number.parseFloat(tokens.status(req, res) || '0'),
      content_length: tokens.res(req, res, 'content-length') || '0',
      response_time: Number.parseFloat(tokens['response-time'](req, res) || '0'),
      remote_addr: tokens['remote-addr'](req, res) || '-',
      user_agent: tokens['user-agent'](req, res) || '-',
    });
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.http('Incoming Request', data);
      },
    },
  }
);

// Export helper functions for consistent logging
export const logHelpers = {
  success: (message: string, meta = {}) => {
    logger.info(message, meta);
  },
  error: (message: string, error: Error | unknown, meta = {}) => {
    if (error instanceof Error) {
      logger.error(message, {
        ...meta,
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error(message, { ...meta, error });
    }
  },
  warn: (message: string, meta = {}) => {
    logger.warn(message, meta);
  },
  debug: (message: string, meta = {}) => {
    logger.debug(message, meta);
  },
  http: (message: string, meta = {}) => {
    logger.http(message, meta);
  },
}; 