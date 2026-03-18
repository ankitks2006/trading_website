import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Access to 5 beginner courses',
      'Community forum access',
      'Monthly market updates',
      'Email support'
    ],
    color: 'secondary',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      'Access to all 25+ courses',
      'Live webinar access',
      'Weekly market analysis',
      'Priority email support',
      'Course certificates',
      'Trading signals'
    ],
    color: 'accent',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    features: [
      'Everything in Premium',
      '1-on-1 mentorship sessions',
      'Daily market analysis',
      'WhatsApp support group',
      'Early webinar access',
      'Exclusive trading kits',
      'Portfolio review'
    ],
    color: 'purple',
    popular: false
  }
];

// @route   GET /api/subscriptions/plans
// @desc    Get all subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// @route   POST /api/subscriptions/upgrade
// @desc    Upgrade user subscription
// @access  Private
router.post('/upgrade', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    const validPlans = ['free', 'basic', 'premium', 'pro'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }
    const user = await User.findById(req.user._id);
    user.subscription = plan;
    await user.save();
    res.json({ message: `Subscription upgraded to ${plan}`, subscription: plan });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
