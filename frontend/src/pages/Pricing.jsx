import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 29,
    yearlyPrice: 290,
    color: 'secondary',
    highlight: false,
    features: [
      { icon: '✓', text: 'Access to 5 beginner courses', included: true },
      { icon: '✓', text: 'Community forum access', included: true },
      { icon: '✓', text: 'Monthly market updates', included: true },
      { icon: '✓', text: 'Email support', included: true },
      { icon: '✗', text: 'Live webinars', included: false },
      { icon: '✗', text: 'Certificates', included: false },
      { icon: '✗', text: 'Trading signals', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 79,
    yearlyPrice: 790,
    color: 'accent',
    highlight: true,
    features: [
      { icon: '✓', text: 'All 25+ courses', included: true },
      { icon: '✓', text: 'Live webinar access', included: true },
      { icon: '✓', text: 'Weekly market analysis', included: true },
      { icon: '✓', text: 'Priority support', included: true },
      { icon: '✓', text: 'Course certificates', included: true },
      { icon: '✓', text: 'Trading signals', included: true },
      { icon: '✗', text: 'Mentorship sessions', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    color: 'purple',
    highlight: false,
    features: [
      { icon: '✓', text: 'Everything in Premium', included: true },
      { icon: '✓', text: '1-on-1 mentorship sessions', included: true },
      { icon: '✓', text: 'Daily market analysis', included: true },
      { icon: '✓', text: 'WhatsApp support group', included: true },
      { icon: '✓', text: 'Early webinar access', included: true },
      { icon: '✓', text: 'Exclusive trading kits', included: true },
      { icon: '✓', text: 'Portfolio review sessions', included: true },
    ],
  },
];

const COLOR_MAP = {
  secondary: { border: 'border-secondary', btn: 'bg-secondary hover:bg-blue-600', badge: 'bg-secondary/10 text-secondary' },
  accent:    { border: 'border-accent',    btn: 'bg-accent hover:bg-green-600',    badge: 'bg-accent/10 text-accent' },
  purple:    { border: 'border-purple-500', btn: 'bg-purple-600 hover:bg-purple-500', badge: 'bg-purple-500/10 text-purple-400' },
};

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [upgrading, setUpgrading] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async (planId) => {
    if (!user) { navigate('/register'); return; }
    setUpgrading(planId);
    try {
      await api.post('/subscriptions/upgrade', { plan: planId });
      alert(`Successfully upgraded to ${planId} plan! Redirecting to dashboard...`);
      navigate('/dashboard');
    } catch (err) {
      alert('Upgrade failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Simple, <span className="gradient-text">Transparent</span> Pricing
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-8">
          Choose a plan that works for you. Upgrade or cancel anytime. 7-day money-back guarantee.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="inline-flex items-center gap-3 glass rounded-full p-1">
          <button
            id="toggle-monthly"
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!yearly ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            id="toggle-yearly"
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${yearly ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Yearly
            <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">Save 17%</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan, i) => {
          const colors = COLOR_MAP[plan.color];
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrentPlan = user?.subscription === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`glass rounded-3xl p-7 relative border ${plan.highlight ? colors.border : 'border-white/10'} ${plan.highlight ? 'shadow-[0_0_40px_rgba(34,197,94,0.15)]' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4 ${colors.badge}`}>
                {plan.name}
              </div>

              <div className="mb-6">
                <motion.div
                  key={`${plan.id}-${yearly}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-1"
                >
                  <span className="text-4xl font-display font-bold text-white">${price}</span>
                  <span className="text-gray-400 mb-1">/{yearly ? 'yr' : 'mo'}</span>
                </motion.div>
                {yearly && (
                  <p className="text-gray-500 text-xs mt-1">
                    Equivalent to ${Math.round(price / 12)}/month
                  </p>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className={`flex items-center gap-2 text-sm ${f.included ? 'text-gray-300' : 'text-gray-600 line-through'}`}>
                    <span className={`text-xs font-bold ${f.included ? 'text-accent' : 'text-gray-600'}`}>{f.icon}</span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="w-full py-3 rounded-xl text-center text-sm font-medium bg-white/5 text-gray-400">
                  ✓ Current Plan
                </div>
              ) : (
                <button
                  id={`upgrade-${plan.id}`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id}
                  className={`w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 ${colors.btn}`}
                >
                  {upgrading === plan.id ? 'Processing...' : user ? `Get ${plan.name}` : 'Get Started'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 text-gray-400 text-sm"
      >
        <p>All plans include a <span className="text-white">7-day money-back guarantee</span>.</p>
        <p className="mt-1">Need a team plan? <a href="mailto:contact@volpebyfx.org" className="text-accent hover:underline">Contact us</a>.</p>
      </motion.div>
    </div>
  );
}
