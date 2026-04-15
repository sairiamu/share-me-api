import express from 'express';
import multer from 'multer';
import { uploadNote } from '../services/fileUpload.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // temp storage

router.post('/upload', upload.single('note'), async (req, res) => {
  try {
    const { title, uploadedBy } = req.body;
    const filePath = req.file.path;

    const result = await uploadNote(filePath, title, uploadedBy);

    res.json({ success: true, noteId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
