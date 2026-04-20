import express from "express";
import dotenv from 'dotenv';
import process from "node:process";
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import notesRouter from './routes/notes-router.js';
import profileRouter from './routes/profile.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 8989;
const app = express();

// ========== SECURITY MIDDLEWARE ==========
// Helmet - Set security HTTP headers
app.use(helmet());

//app.get('/', (req, res) => res.json({ status: 'ok', service: 'share-me-api' }));
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png',  (req, res) => res.status(204).end());
// CORS - Allow cross-origin requests
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    skipSuccessfulRequests: true
});

app.use(limiter);

// ========== LOGGING MIDDLEWARE ==========
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// ========== BODY PARSER ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH CHECK ==========
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString()
    });
});

// ========== API ROUTES ==========
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/profile', profileRouter);

// Landing page
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Share-Me API",
        version: "1.0.0",
        documentation: "/api/docs"
    });
});

// ========== ERROR HANDLING ==========
// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

// ========== START SERVER ==========
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// 
//export default app;