import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Overview', 'My Courses', 'Subscription', 'Settings'];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.get('/users/me')
      .then(res => { setProfile(res.data); setEditName(res.data.name); })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveName = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { name: editName });
      updateUser({ name: data.name });
      setProfile(prev => ({ ...prev, name: data.name }));
      setSaveMsg('Profile updated!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || user?.name || 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const subscription = profile?.subscription || user?.subscription || 'free';
  const enrolledCourses = profile?.enrolledCourses || [];

  const SUB_COLORS = { free: 'text-gray-400', basic: 'text-blue-400', premium: 'text-accent', pro: 'text-purple-400' };

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass w-full md:w-64 rounded-2xl p-6 self-start"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-lg">
            {initials}
          </div>
          <div>
            <h3 className="text-white font-medium truncate">{displayName}</h3>
            <p className={`text-xs font-medium capitalize ${SUB_COLORS[subscription]}`}>
              {subscription} Plan
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase().replace(' ', '-')}`}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                activeTab === tab
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'Overview' && '📊 '}
              {tab === 'My Courses' && '📚 '}
              {tab === 'Subscription' && '💳 '}
              {tab === 'Settings' && '⚙️ '}
              {tab}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-grow min-w-0"
      >
        <AnimatePresence mode="wait">
          {/* ── Overview ── */}
          {activeTab === 'Overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-display font-bold text-white mb-2">
                Welcome back, {displayName.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-400 mb-8">Here's a summary of your learning progress.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Courses Enrolled', value: enrolledCourses.length, border: 'border-accent' },
                  { label: 'Current Plan', value: subscription.charAt(0).toUpperCase() + subscription.slice(1), border: 'border-blue-500' },
                  { label: 'Certificates Earned', value: '0', border: 'border-purple-500' },
                ].map((s, i) => (
                  <div key={i} className={`glass p-6 rounded-2xl border-l-4 ${s.border}`}>
                    <p className="text-gray-400 text-sm mb-1">{s.label}</p>
                    <h4 className="text-3xl font-display font-bold text-white capitalize">{s.value}</h4>
                  </div>
                ))}
              </div>

              {enrolledCourses.length > 0 ? (
                <div>
                  <h3 className="text-xl font-display font-semibold text-white mb-4">Continue Learning</h3>
                  <div className="flex flex-col gap-4">
                    {enrolledCourses.slice(0, 3).map(course => (
                      <Link to={`/courses/${course._id}`} key={course._id} className="glass rounded-2xl p-5 flex gap-5 items-center hover:bg-white/10 transition-colors">
                        <div className="w-20 h-16 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-xl shrink-0 flex items-center justify-center">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                          ) : <span className="text-2xl">📈</span>}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-white font-medium truncate">{course.title}</h4>
                          <p className="text-gray-400 text-xs mt-1">by {course.instructor || 'VolpebyFX Expert'}</p>
                          <div className="w-full bg-white/10 rounded-full h-1.5 mt-3">
                            <div className="bg-accent h-1.5 rounded-full" style={{ width: '0%' }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">0% complete</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-4">📚</p>
                  <h3 className="text-white font-display font-semibold text-xl mb-2">No courses yet</h3>
                  <p className="text-gray-400 mb-6">Explore our course library and start your trading journey</p>
                  <Link to="/courses" className="btn-primary inline-block text-white">Browse Courses</Link>
                </div>
              )}
            </motion.div>
          )}

          {/* ── My Courses ── */}
          {activeTab === 'My Courses' && (
            <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-display font-bold text-white mb-6">My Courses</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => <div key={i} className="glass rounded-2xl h-32 animate-pulse" />)}
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center">
                  <p className="text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
                  <Link to="/courses" className="btn-primary inline-block text-white">Browse Courses</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map(course => (
                    <Link to={`/courses/${course._id}`} key={course._id} className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-colors border border-white/10">
                      <div className="h-32 bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center relative">
                        {course.thumbnail
                          ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          : <span className="text-4xl">📈</span>}
                      </div>
                      <div className="p-4">
                        <h4 className="text-white font-medium">{course.title}</h4>
                        <p className="text-gray-500 text-xs mt-1">{course.instructor || 'VolpebyFX Expert'}</p>
                        <div className="w-full bg-white/10 rounded-full h-1 mt-3">
                          <div className="bg-accent h-1 rounded-full" style={{ width: '0%' }} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Subscription ── */}
          {activeTab === 'Subscription' && (
            <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-display font-bold text-white mb-6">Subscription</h2>
              <div className="glass rounded-2xl p-6 mb-6">
                <p className="text-gray-400 text-sm mb-1">Current Plan</p>
                <h3 className={`text-2xl font-display font-bold capitalize ${SUB_COLORS[subscription]}`}>
                  {subscription} Plan
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  {subscription === 'free'
                    ? 'Upgrade to access premium courses and live webinars.'
                    : `You are enjoying all the benefits of the ${subscription} plan.`}
                </p>
              </div>
              <Link to="/pricing" className="btn-primary inline-block text-white">
                {subscription === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
              </Link>
            </motion.div>
          )}

          {/* ── Settings ── */}
          {activeTab === 'Settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-display font-bold text-white mb-6">Profile Settings</h2>
              <div className="glass rounded-2xl p-6 max-w-lg">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="input-field opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    id="save-profile-btn"
                    onClick={handleSaveName}
                    disabled={saving || editName === profile?.name}
                    className="btn-primary disabled:opacity-50 text-white py-2 px-6"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saveMsg && <span className="text-accent text-sm">{saveMsg}</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
