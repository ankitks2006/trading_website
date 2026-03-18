import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(res => {
        setCourse(res.data);
        // Check if already enrolled
        if (user && user.enrolledCourses?.includes(id)) setEnrolled(true);
      })
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/courses/${id}` } } }); return; }
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
    } catch (err) {
      if (err.response?.data?.message === 'Already enrolled in this course') setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!course) return null;

  const totalLessons = course.modules?.reduce((a, m) => a + (m.videos?.length || 0), 0) || 0;

  return (
    <div className="container mx-auto px-6 py-12">
      <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm transition-colors">
        ← Back to Courses
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Course Info */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20 capitalize">{course.level || 'All Levels'}</span>
              {course.isFree && <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/20">FREE</span>}
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{course.title}</h1>
            <p className="text-gray-400 text-base leading-relaxed mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-accent">👨‍🏫</span>
                <span className="text-white">{course.instructor || 'VolpebyFX Expert'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white">{course.rating || 4.5}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📚</span>
                {course.modules?.length || 0} modules · {totalLessons} lessons
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                {course.studentsCount || 0} students enrolled
              </div>
            </div>

            {/* Modules */}
            <h2 className="text-xl font-display font-semibold text-white mb-4">Course Curriculum</h2>
            {course.modules && course.modules.length > 0 ? (
              <div className="flex flex-col gap-3">
                {course.modules.map((mod, mi) => (
                  <div key={mi} className="glass rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenModule(openModule === mi ? -1 : mi)}
                      className="w-full flex justify-between items-center p-5 text-left"
                    >
                      <span className="text-white font-medium">
                        Module {mi + 1}: {mod.title}
                      </span>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-gray-500 text-xs">{mod.videos?.length || 0} lessons</span>
                        <motion.span animate={{ rotate: openModule === mi ? 45 : 0 }} className="text-accent text-xl">+</motion.span>
                      </div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: openModule === mi ? 'auto' : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 flex flex-col gap-2">
                        {mod.videos && mod.videos.length > 0 ? (
                          mod.videos.map((video, vi) => (
                            <div key={vi} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                              <span className="text-accent">{(mi === 0 && vi === 0) || video.isFree ? '▶' : '🔒'}</span>
                              <span className="text-gray-300 text-sm flex-grow">{video.title}</span>
                              {video.duration && <span className="text-gray-500 text-xs">{video.duration}</span>}
                              {(mi === 0 && vi === 0) || video.isFree
                                ? <span className="text-xs text-accent">Free Preview</span>
                                : null}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm py-2">Lessons coming soon...</p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center text-gray-400">
                <p>Course curriculum is being prepared. Enroll now to get notified when it's ready!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Purchase Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 sticky top-28"
          >
            <div className="h-48 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
              {course.thumbnail
                ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                : <span className="text-6xl">📈</span>
              }
            </div>

            <div className="text-3xl font-display font-bold text-white mb-2">
              {course.isFree ? <span className="text-accent">Free</span> : `$${course.price}`}
            </div>
            <p className="text-gray-400 text-sm mb-6">One-time course fee · Lifetime access</p>

            {enrolled ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-4 rounded-xl bg-secondary hover:bg-blue-600 text-white font-semibold transition-all text-lg"
              >
                Go to Dashboard →
              </button>
            ) : (
              <button
                id="enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-4 rounded-xl bg-accent hover:bg-green-600 disabled:opacity-50 text-white font-semibold transition-all text-lg shadow-lg shadow-accent/20"
              >
                {enrolling ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enrolling...
                  </span>
                ) : course.isFree ? 'Enroll Free' : 'Enroll Now'}
              </button>
            )}

            {!user && (
              <p className="text-center text-xs text-gray-500 mt-3">
                You'll need to <span className="text-accent">sign in</span> first
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 text-sm">
              {['Full lifetime access', 'Certificate on completion', 'Mobile & desktop access', '7-day money-back guarantee'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <span className="text-accent text-xs">✓</span> {f}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
