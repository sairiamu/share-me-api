import express from 'express';
import {
  uploadNoteHandler,
  getNotesHandler,
  getNoteHandler,
  deleteNoteHandler
} from '../controller/notes.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all notes (public)
router.get('/notes', getNotesHandler);

// Protected routes
router.post('/notes', authenticateToken, uploadNoteHandler);
router.get('/notes/:id', authenticateToken, getNoteHandler);
router.delete('/notes/delete-notes/:id', authenticateToken, deleteNoteHandler);

export default router;