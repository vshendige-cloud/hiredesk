import winston from 'winston';

// Legacy logging setup. Chapter 8 migrates the service to Fastify's built-in
// Pino logger and removes the remaining console.* calls.
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console({ silent: process.env.NODE_ENV === 'test' })],
});
