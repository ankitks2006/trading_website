import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function CountdownBlock({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-display font-bold text-white"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-gray-500 text-xs mt-1">{label}</span>
    </div>
  );
}

function WebinarCard({ webinar }) {
  const countdown = useCountdown(webinar.date);
  const isUpcoming = !countdown.expired;
  const isLive = webinar.status === 'live';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 border border-white/10 hover:border-accent/30 transition-all"
    >
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-display font-semibold text-white">{webinar.title}</h3>
          <p className="text-gray-400 text-sm mt-1">by {webinar.instructor || 'VolpebyFX Expert'}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          isLive ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
          : isUpcoming ? 'bg-accent/10 text-accent border border-accent/20'
          : 'bg-white/5 text-gray-400'
        }`}>
          {isLive ? '🔴 Live Now' : isUpcoming ? '⏰ Upcoming' : '✓ Completed'}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{webinar.description}</p>
      <p className="text-sm text-gray-300 mb-4">
        📅 {new Date(webinar.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>

      {isUpcoming && !countdown.expired && (
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 mb-3 text-center">Starts in</p>
          <div className="flex justify-center gap-6">
            {countdown.days > 0 && <CountdownBlock label="Days"    value={countdown.days} />}
            <CountdownBlock label="Hours"   value={countdown.hours} />
            <CountdownBlock label="Minutes" value={countdown.minutes} />
            <CountdownBlock label="Seconds" value={countdown.seconds} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {isLive && webinar.link ? (
          <a href={webinar.link} target="_blank" rel="noreferrer" className="btn-primary flex-1 text-center text-white text-sm py-2">
            Join Live Session
          </a>
        ) : isUpcoming ? (
          <button className="flex-1 text-center py-2 rounded-xl glass hover:bg-white/10 transition-colors text-sm text-white">
            Register →
          </button>
        ) : (
          <span className="text-gray-500 text-sm py-2">Session ended</span>
        )}
      </div>
    </motion.div>
  );
}

export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    api.get('/webinars')
      .then(res => setWebinars(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = webinars.filter(w => {
    if (filter === 'upcoming') return new Date(w.date) > now;
    if (filter === 'past')     return new Date(w.date) <= now;
    return true;
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          Live <span className="gradient-text">Webinars</span>
        </h1>
        <p className="text-gray-400 mb-8">Join expert-led live sessions on trading, forex, and market analysis</p>
      </motion.div>

      <div className="flex gap-3 mb-8">
        {['all', 'upcoming', 'past'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-accent text-white' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="glass rounded-2xl h-60 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">📅</p>
          <h3 className="text-white font-display font-semibold text-xl mb-2">
            {webinars.length === 0 ? 'No webinars scheduled yet' : 'No webinars in this category'}
          </h3>
          <p className="text-gray-400 mb-6">
            {webinars.length === 0 ? 'Check back soon for upcoming live sessions!' : 'Try a different filter.'}
          </p>
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn-primary inline-block text-white text-sm">
              Schedule a Webinar
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(w => <WebinarCard key={w._id} webinar={w} />)}
        </div>
      )}
    </div>
  );
}
