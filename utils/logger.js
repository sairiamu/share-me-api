import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'share-me-api' },
    transports: [
        // Console output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    return `${timestamp} [${level}]: ${message}`;
                })
            )
        }),
        // Error logs file
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        // Combined logs file
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log')
        })
    ]
});

export default logger;
