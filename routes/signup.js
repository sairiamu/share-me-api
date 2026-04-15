import pool from "../config/mysql-sch.js";

async function addUser(email, name, password, phone) {
  try {
    const sql = `
      INSERT INTO users (email, name, password, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const result = await pool.query(sql, [email, name, password, phone]);

    console.log('User added successfully with ID:', result.rows[0].id);
    return result.rows[0];
  } catch (err) {
    console.error('Error inserting user:', err);
    throw err;
  }
}

export { addUser };
