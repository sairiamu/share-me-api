import cloudinary from '../config/cloudinary.js';
import pool from '../config/mysql-sch.js';

/**
 * Upload a note file to Cloudinary and save metadata in PostgreSQL
 * @param {string} filePath - local path from multer
 * @param {string} title - note title
 * @param {string} uploadedBy - user email or id
 */
export async function uploadNote(filePath, title, uploadedBy) {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto" // auto-detect pdf, doc, etc.
    });

    // Save metadata in DB
    const sql = `
      INSERT INTO notes (title, file_url, file_type, uploaded_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const dbResult = await pool.query(sql, [
      title,
      result.secure_url,
      result.format,
      uploadedBy
    ]);

    console.log('Note uploaded successfully with ID:', dbResult.rows[0].id);
    return { id: dbResult.rows[0].id, file_url: result.secure_url };
  } catch (err) {
    console.error('Error uploading note:', err);
    throw err;
  }
}
