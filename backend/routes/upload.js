import express from 'express';
import { uploadImage, uploadVideo, cloudinary } from '../config/cloudinary.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── Upload thumbnail image ──────────────────────────────────────────────────
// POST /api/upload/image
// Access: Admin only
router.post(
  '/image',
  protect,
  authorize('admin'),
  uploadImage.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({
      url:       req.file.path,
      public_id: req.file.filename,
    });
  }
);

// ── Upload video ────────────────────────────────────────────────────────────
// POST /api/upload/video
// Access: Admin only
router.post(
  '/video',
  protect,
  authorize('admin'),
  uploadVideo.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({
      url:       req.file.path,
      public_id: req.file.filename,
    });
  }
);

// ── Delete a Cloudinary asset ───────────────────────────────────────────────
// DELETE /api/upload/:public_id
// Access: Admin only
router.delete('/:public_id', protect, authorize('admin'), async (req, res) => {
  try {
    const { resource_type = 'image' } = req.query;
    await cloudinary.uploader.destroy(req.params.public_id, { resource_type });
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
