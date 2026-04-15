import pool from '../config/mysql-sch.js';
import { HashPassword } from '../auth/passwordHash.js';
import { signupSchema } from '../schema/signup.js';
import { signinSchema } from '../schema/signin.js';
import { ComparePassword } from '../auth/passwordHash.js';
import { generateToken } from '../auth/jwt-sch.js';

export const signupHandler = async (req, res) => {
    try {
        // Validate input
        const validation = signupSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                errors: validation.error.errors
            });
        }

        const { email, name, password, phone } = validation.data;

        // Hash password
        const hashedPassword = HashPassword(password);

        // Insert user into DB
        const sql = `
            INSERT INTO users (email, name, password, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const result = await pool.query(sql, [email, name, hashedPassword, phone]);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.rows[0].id
        });
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }
        console.error('Signup error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const signinHandler = async (req, res) => {
    try {
        // Validate input
        const validation = signinSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                errors: validation.error.errors
            });
        }

        const { email, password } = validation.data;

        // Lookup user
        const sql = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(sql, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        // Compare password
        const isValidPassword = ComparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name
        });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (err) {
        console.error('Signin error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};