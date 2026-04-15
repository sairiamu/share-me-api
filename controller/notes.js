import pool from '../config/mysql-sch.js';
import { uploadNote } from '../services/fileUpload.js';
import multer from 'multer';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' }); // temp storage

export const uploadNoteHandler = [
  authenticateToken,
  upload.single('note'),
  async (req, res) => {
    try {
      const { title } = req.body;
      const uploadedBy = req.user.email; // from JWT
      const filePath = req.file.path;

      const result = await uploadNote(filePath, title, uploadedBy);

      // Clean up temp file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Note uploaded successfully',
        noteId: result.id,
        fileUrl: result.file_url
      });
    } catch (err) {
      // Clean up temp file on error
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Upload error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
];

export const getNotesHandler = [
  authenticateToken,
  async (req, res) => {
    try {
      const sql = `
        SELECT id, title, file_url, file_type, created_at
        FROM notes
        WHERE uploaded_by = $1
        ORDER BY created_at DESC
      `;
      const result = await pool.query(sql, [req.user.email]);

      res.json({
        success: true,
        notes: result.rows
      });
    } catch (err) {
      console.error('Get notes error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
];

export const getNoteHandler = [
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const sql = `
        SELECT id, title, file_url, file_type, uploaded_by, created_at
        FROM notes
        WHERE id = $1 LIMIT 1
      `;
      const result = await pool.query(sql, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      const note = result.rows[0];

      // Check ownership
      if (note.uploaded_by !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        note
      });
    } catch (err) {
      console.error('Get note error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
];

export const deleteNoteHandler = [
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      // First check ownership
      const checkSql = `SELECT uploaded_by FROM notes WHERE id = $1`;
      const checkResult = await pool.query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      if (checkResult.rows[0].uploaded_by !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Delete from DB
      const deleteSql = `DELETE FROM notes WHERE id = $1`;
      await pool.query(deleteSql, [id]);

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (err) {
      console.error('Delete note error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
];