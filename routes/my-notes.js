// notesRoute.js
import express from 'express';
import pool from '../config/mysql-sch.js';
import { authenticateToken } from '';

const router = express.Router();

/**
 * Get all notes uploaded by the authenticated user
 */
router.get('/notes', authenticateToken, async (req, res) => {
  try {
    const sql = `SELECT id, title, file_url, file_type, created_at 
                 FROM notes 
                 WHERE uploaded_by = ? 
                 ORDER BY created_at DESC`;

    const [rows] = await pool.execute(sql, [req.user.email]);

    res.json({ success: true, notes: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get a single note by ID, only if it belongs to the authenticated user
 */
router.get('/note/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `SELECT id, title, file_url, file_type, uploaded_by, created_at 
                 FROM notes 
                 WHERE id = ? LIMIT 1`;

    const [rows] = await pool.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const note = rows[0];

    // Restrict access: only uploader can view
    if (note.uploaded_by !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
