import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    },
    max: 10, // Max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;