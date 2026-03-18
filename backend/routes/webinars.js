import express from 'express';
import Webinar from '../models/Webinar.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/webinars
// @desc    Get all webinars
// @access  Public
router.get('/', async (req, res) => {
  try {
    const webinars = await Webinar.find();
    res.json(webinars);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/webinars
// @desc    Create a webinar
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const webinar = new Webinar(req.body);
    await webinar.save();
    res.status(201).json(webinar);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/webinars/:id
// @desc    Delete a webinar
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) {
      return res.status(404).json({ message: 'Webinar not found' });
    }
    await webinar.deleteOne();
    res.json({ message: 'Webinar removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
