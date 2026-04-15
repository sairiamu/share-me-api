import pool from "../config/mysql-sch.js";

async function addUser(email, name, password, phone) {
  try {
    const sql = `
      INSERT INTO users (email, name, password, phone)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [email, name, password, phone]);

    console.log('User added successfully with ID:', result.insertId);
    return result;
  } catch (err) {
    console.error('Error inserting user:', err);
    throw err;
  }
}

module.exports = { addUser };
