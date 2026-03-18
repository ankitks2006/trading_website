import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay }
});

const TESTIMONIALS = [
  { name: 'Arjun Sharma', plan: 'Premium Member', text: 'VolpebyFX completely changed how I approach the markets. The Price Action course alone was worth 10x what I paid.', avatar: 'AS' },
  { name: 'Priya Kulkarni', plan: 'Pro Member', text: 'The webinars are incredibly practical. I came in as a complete beginner and now I trade forex consistently.', avatar: 'PK' },
  { name: 'Rohan Mehta', plan: 'Premium Member', text: 'Best trading education platform I\'ve come across. The community and daily signals are a game changer.', avatar: 'RM' },
];

const FAQS = [
  { q: 'Do I need experience to start?', a: 'No! We have beginner-friendly courses designed to take you from zero to confident trader.' },
  { q: 'Are the courses live or pre-recorded?', a: 'All courses are pre-recorded so you can learn at your own pace, while live webinars are held weekly.' },
  { q: 'What markets do you cover?', a: 'We cover forex, equities (Indian & US), futures, and crypto markets with dedicated course tracks.' },
  { q: 'Can I get a refund?', a: 'Yes – we offer a 7-day money-back guarantee on all subscription plans, no questions asked.' },
  { q: 'Will I receive a certificate?', a: 'Yes, Premium and Pro members receive verified completion certificates for all courses.' },
];

const FEATURES = [
  { icon: '📊', title: 'Live Market Analysis', desc: 'Daily breakdowns of forex pairs, indices, and stocks by seasoned traders.' },
  { icon: '🎥', title: 'HD Video Courses', desc: 'Crystal clear, structured video lessons you can watch anytime, anywhere.' },
  { icon: '🏆', title: 'Verified Certificates', desc: 'Earn industry-recognised certificates to showcase your expertise.' },
  { icon: '💬', title: 'Expert Community', desc: 'Connect with thousands of traders, share ideas, and grow together.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Learn on the go — our platform works beautifully on any device.' },
  { icon: '⚡', title: 'Trading Signals', desc: 'Premium & Pro members get real-time trade signals directly from our analysts.' },
];

export default function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data.slice(0, 3))).catch(() => {});
    const interval = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute top-[15%] left-[5%]   w-[500px] h-[500px] bg-accent/15   rounded-full blur-[130px] -z-10 animate-pulse-glow" />
        <div className="absolute bottom-[10%] right-[5%]  w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[130px] -z-10 animate-pulse-glow" />

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-accent mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Premium Financial Education Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"
            >
              Master the Markets with{' '}
              <span className="gradient-text">VolpebyFX</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              Premium stock market &amp; forex courses, interactive webinars, and actionable trading setups — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/courses" className="btn-primary text-white">
                Start Learning Trading
              </Link>
              <Link to="/pricing" className="btn-ghost">
                View Pricing
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-16 flex justify-center gap-8 text-sm text-gray-500"
            >
              {['No credit card required', '7-day money-back', 'Cancel anytime'].map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-accent">✓</span> {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Students', value: '10K+' },
            { label: 'Success Rate',    value: '94%'  },
            { label: 'Premium Courses', value: '25+'  },
            { label: 'Live Webinars',   value: '100+' },
          ].map((stat, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)}>
              <h3 className="text-4xl font-display font-bold gradient-text mb-2">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 container mx-auto px-6">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <h2 className="section-title mb-4">Everything You Need to <span className="gradient-text">Trade Better</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto">A complete ecosystem for traders — from first candle to consistent profitability.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -6, borderColor: 'rgba(34,197,94,0.4)' }}
              className="glass rounded-2xl p-6 cursor-default transition-all border border-white/10"
            >
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="text-lg font-display font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Course Previews ── */}
      {courses.length > 0 && (
        <section className="py-16 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto px-6">
            <motion.div {...fadeUp()} className="flex justify-between items-end mb-10">
              <div>
                <h2 className="section-title mb-2">Popular <span className="gradient-text">Courses</span></h2>
                <p className="text-gray-400">Start with our most loved programs</p>
              </div>
              <Link to="/courses" className="text-sm text-accent hover:underline font-medium">View all →</Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((c, i) => (
                <motion.div
                  key={c._id}
                  {...fadeUp(i * 0.1)}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl overflow-hidden group cursor-pointer"
                  onClick={() => window.location.href = `/courses/${c._id}`}
                >
                  <div className="h-40 bg-gradient-to-br from-accent/20 to-secondary/20 relative flex items-center justify-center">
                    {c.thumbnail
                      ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                      : <span className="text-4xl">📈</span>
                    }
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white capitalize">{c.level || 'All Levels'}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-white mb-1">{c.title}</h3>
                    <p className="text-gray-400 text-xs mb-3">by {c.instructor || 'VolpebyFX Expert'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-accent font-bold text-xl">${c.price}</span>
                      <span className="text-xs text-gray-400">⭐ {c.rating || 4.5}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="py-24 container mx-auto px-6">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <h2 className="section-title mb-4">Loved by <span className="gradient-text">Traders</span></h2>
          <p className="text-gray-400">Join thousands of students who have transformed their trading</p>
        </motion.div>
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={testimonialIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <p className="text-gray-300 text-lg leading-relaxed mb-6">"{TESTIMONIALS[testimonialIdx].text}"</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                {TESTIMONIALS[testimonialIdx].avatar}
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">{TESTIMONIALS[testimonialIdx].name}</p>
                <p className="text-gray-500 text-xs">{TESTIMONIALS[testimonialIdx].plan}</p>
              </div>
            </div>
          </motion.div>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-accent w-6' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="section-title mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
          </motion.div>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...fadeUp(i * 0.05)} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <span className="text-white font-medium">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    className="text-accent text-xl font-light ml-4 shrink-0"
                  >+</motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 container mx-auto px-6 text-center">
        <motion.div {...fadeUp()}>
          <h2 className="section-title mb-4">Ready to <span className="gradient-text">Start Trading?</span></h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join 10,000+ students who have already transformed their financial future with VolpebyFX.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary text-white">Get Started Free</Link>
            <Link to="/courses" className="btn-ghost">Browse Courses</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
