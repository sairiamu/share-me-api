// userService.js
import pool from '../config/mysql-sch.js';
import { ComparePassword } from '../auth/passwordHash.js';

const signin = async (email, password) => {
    try {
        const sql = `
            SELECT * FROM users WHERE email = ?
        `;
        const [rows] = await pool.execute(sql, [email]);

        if (rows.length === 0) {
            console.log('No user found with that email');
            return null;
        }

        const user = rows[0];

        // Compare provided password with stored hash
        const match =  ComparePassword(password, user.password);

        if (!match) {
            console.log('Invalid password');
            return null;
        }

        console.log('Login successful for:', user.email);
        return user;
    } catch (err) {
        console.error('Error during login:', err);
        throw err;
    }
}
