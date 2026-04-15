import cloudinary from '../config/cloudinary.js';
import pool from '../config/mysql-sch.js';

/**
 * Upload a note file to Cloudinary and save metadata in MySQL
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
      VALUES (?, ?, ?, ?)
    `;
    const [dbResult] = await pool.execute(sql, [
      title,
      result.secure_url,
      result.format,
      uploadedBy
    ]);

    console.log('Note uploaded successfully with ID:', dbResult.insertId);
    return dbResult;
  } catch (err) {
    console.error('Error uploading note:', err);
    throw err;
  }
}
