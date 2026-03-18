import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { level, search } = req.query;
    let query = {};
    if (level && level !== 'all') query.level = level;
    if (search) query.title = { $regex: search, $options: 'i' };
    const courses = await Course.find(query);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create course (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const course = new Course(req.body);
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update course (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Course (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await course.deleteOne();
    res.json({ message: 'Course removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enroll in course
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    user.enrolledCourses.push(course._id);
    await user.save();

    // Increment student count
    course.studentsCount = (course.studentsCount || 0) + 1;
    await course.save();

    res.json({ message: 'Enrolled successfully', enrolledCourses: user.enrolledCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
