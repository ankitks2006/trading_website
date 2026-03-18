import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const TABS = ['Analytics', 'Courses', 'Users', 'Webinars'];

// ── Reusable file upload component ─────────────────────────────────────────
function FileUploader({ label, accept, endpoint, onUploaded, currentUrl, resourceType = 'image' }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview for images
    if (resourceType === 'image') {
      setPreview(URL.createObjectURL(file));
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(`/upload/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      onUploaded(data.url, data.public_id);
      if (resourceType === 'video') setPreview(data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check Cloudinary credentials.');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>

      {/* Preview area */}
      {preview && (
        <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
          {resourceType === 'image' ? (
            <img src={preview} alt="preview" className="w-full h-36 object-cover" />
          ) : (
            <video src={preview} controls className="w-full max-h-36" />
          )}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${uploading ? 'border-accent/50 bg-accent/5 cursor-not-allowed' : 'border-white/15 hover:border-accent/50 hover:bg-white/5'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <span className="text-2xl">{resourceType === 'video' ? '🎬' : '🖼️'}</span>
        {uploading ? (
          <div className="w-full max-w-xs">
            <p className="text-accent text-sm text-center mb-1">Uploading to Cloudinary... {progress}%</p>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-accent h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 text-sm font-medium">
              {preview ? 'Click to replace' : `Click to upload ${resourceType}`}
            </p>
            <p className="text-gray-500 text-xs">
              {resourceType === 'image' ? 'JPG, PNG, WebP · max 5 MB' : 'MP4, MOV, WebM · max 500 MB'}
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}

// ── Video lesson row ────────────────────────────────────────────────────────
function VideoRow({ video, index, onChange, onRemove }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400 font-medium">Lesson {index + 1}</span>
        <button onClick={onRemove} className="text-red-400 hover:text-red-300 text-xs">✕ Remove</button>
      </div>
      <input
        type="text"
        placeholder="Lesson title"
        className="input-field text-sm py-2"
        value={video.title}
        onChange={e => onChange({ ...video, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Duration (e.g. 12:35)"
        className="input-field text-sm py-2"
        value={video.duration}
        onChange={e => onChange({ ...video, duration: e.target.value })}
      />
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`free-${index}`}
          checked={video.isFree}
          onChange={e => onChange({ ...video, isFree: e.target.checked })}
          className="accent-green-500"
        />
        <label htmlFor={`free-${index}`} className="text-xs text-gray-300">Free preview</label>
      </div>

      {video.url ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/20">
          <span className="text-accent">✓</span>
          <span className="text-green-300 text-xs truncate flex-grow">{video.url}</span>
          <button
            onClick={() => onChange({ ...video, url: '', public_id: '' })}
            className="text-gray-400 hover:text-red-400 text-xs shrink-0"
          >
            Remove
          </button>
        </div>
      ) : (
        <FileUploader
          label="Video file"
          accept="video/*"
          endpoint="video"
          resourceType="video"
          onUploaded={(url, public_id) => onChange({ ...video, url, public_id })}
        />
      )}
    </div>
  );
}

// ── Module builder ──────────────────────────────────────────────────────────
function ModuleBuilder({ modules, setModules }) {
  const addModule = () =>
    setModules(prev => [...prev, { title: '', videos: [] }]);

  const removeModule = (mi) =>
    setModules(prev => prev.filter((_, i) => i !== mi));

  const updateModule = (mi, field, value) =>
    setModules(prev => prev.map((m, i) => i === mi ? { ...m, [field]: value } : m));

  const addVideo = (mi) =>
    setModules(prev => prev.map((m, i) =>
      i === mi ? { ...m, videos: [...m.videos, { title: '', url: '', public_id: '', duration: '', isFree: false }] } : m
    ));

  const updateVideo = (mi, vi, data) =>
    setModules(prev => prev.map((m, i) =>
      i === mi ? { ...m, videos: m.videos.map((v, j) => j === vi ? data : v) } : m
    ));

  const removeVideo = (mi, vi) =>
    setModules(prev => prev.map((m, i) =>
      i === mi ? { ...m, videos: m.videos.filter((_, j) => j !== vi) } : m
    ));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-300 font-medium">Course Modules &amp; Lessons</span>
        <button
          type="button"
          onClick={addModule}
          className="text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
        >
          + Add Module
        </button>
      </div>

      {modules.length === 0 && (
        <p className="text-gray-500 text-xs text-center py-4">
          No modules yet — click "Add Module" to start building your course curriculum.
        </p>
      )}

      {modules.map((mod, mi) => (
        <div key={mi} className="glass rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-accent font-bold text-sm shrink-0">Module {mi + 1}</span>
            <input
              type="text"
              placeholder="Module title (e.g. Introduction to Forex)"
              className="input-field text-sm py-2 flex-grow"
              value={mod.title}
              onChange={e => updateModule(mi, 'title', e.target.value)}
            />
            <button onClick={() => removeModule(mi)} className="text-red-400 hover:text-red-300 shrink-0 text-sm">✕</button>
          </div>

          {/* Lessons */}
          <div className="flex flex-col gap-3 ml-4 border-l border-white/10 pl-4">
            {mod.videos.map((video, vi) => (
              <VideoRow
                key={vi}
                video={video}
                index={vi}
                onChange={(data) => updateVideo(mi, vi, data)}
                onRemove={() => removeVideo(mi, vi)}
              />
            ))}
            <button
              type="button"
              onClick={() => addVideo(mi)}
              className="text-xs px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
            >
              + Add Lesson
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Admin Dashboard ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Analytics');
  const [stats, setStats] = useState({ users: 0, courses: 0, webinars: 0 });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showWebinarModal, setShowWebinarModal] = useState(false);

  const [courseForm, setCourseForm] = useState({
    title: '', description: '', price: '', instructor: '', level: 'beginner',
    thumbnail: '', thumbnail_public_id: ''
  });
  const [modules, setModules] = useState([]);
  const [webinarForm, setWebinarForm] = useState({ title: '', description: '', date: '', link: '', instructor: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, cRes, wRes] = await Promise.all([
        api.get('/users'),
        api.get('/courses'),
        api.get('/webinars'),
      ]);
      setUsers(uRes.data);
      setCourses(cRes.data);
      setWebinars(wRes.data);
      setStats({ users: uRes.data.length, courses: cRes.data.length, webinars: wRes.data.length });
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetCourseForm = () => {
    setCourseForm({ title: '', description: '', price: '', instructor: '', level: 'beginner', thumbnail: '', thumbnail_public_id: '' });
    setModules([]);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title:       courseForm.title,
        description: courseForm.description,
        price:       Number(courseForm.price),
        instructor:  courseForm.instructor,
        level:       courseForm.level,
        thumbnail:   courseForm.thumbnail,
        modules:     modules.map(m => ({
          title:  m.title,
          videos: m.videos.map(v => ({
            title:    v.title,
            url:      v.url,
            duration: v.duration,
            isFree:   v.isFree,
          })),
        })),
      };
      const { data } = await api.post('/courses', payload);
      setCourses(prev => [...prev, data]);
      setStats(prev => ({ ...prev, courses: prev.courses + 1 }));
      setShowCourseModal(false);
      resetCourseForm();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
      setStats(prev => ({ ...prev, courses: prev.courses - 1 }));
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateWebinar = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/webinars', webinarForm);
      setWebinars(prev => [...prev, data]);
      setStats(prev => ({ ...prev, webinars: prev.webinars + 1 }));
      setShowWebinarModal(false);
      setWebinarForm({ title: '', description: '', date: '', link: '', instructor: '' });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWebinar = async (id) => {
    if (!confirm('Delete this webinar?')) return;
    try {
      await api.delete(`/webinars/${id}`);
      setWebinars(prev => prev.filter(w => w._id !== id));
      setStats(prev => ({ ...prev, webinars: prev.webinars - 1 }));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleUserBlock = async (userId, currentRole) => {
    const newRole = currentRole === 'suspended' ? 'user' : 'suspended';
    try {
      const { data } = await api.put(`/users/${userId}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: data.role } : u));
    } catch {
      alert('Could not toggle user status.');
    }
  };

  const StatCard = ({ label, value, color, border }) => (
    <div className={`glass p-4 rounded-2xl border-l-4 ${border}`}>
      <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-medium">{label}</p>
      <h4 className={`text-2xl font-display font-bold ${color}`}>{loading ? '...' : value}</h4>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass w-full md:w-64 rounded-2xl p-6 self-start"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xl">A</div>
          <div>
            <h3 className="text-white font-medium">Admin Panel</h3>
            <p className="text-xs text-red-400">Super Admin</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`admin-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                activeTab === tab
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'Analytics' && '📊 '}
              {tab === 'Courses'   && '📚 '}
              {tab === 'Users'     && '👥 '}
              {tab === 'Webinars'  && '🎥 '}
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

          {/* ── Analytics ── */}
          {activeTab === 'Analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-display font-bold text-white mb-6">Analytics Dashboard</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Users"    value={stats.users}    color="text-blue-400"   border="border-blue-500" />
                <StatCard label="Total Courses"  value={stats.courses}  color="text-purple-400" border="border-purple-500" />
                <StatCard label="Total Webinars" value={stats.webinars} color="text-accent"     border="border-accent" />
                <StatCard label="Est. Revenue"   value={`$${(stats.users * 49).toLocaleString()}`} color="text-green-400" border="border-green-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-display font-semibold text-white mb-4">Recent Registrations</h3>
                  {loading ? (
                    <div className="text-gray-400 text-sm">Loading...</div>
                  ) : users.length === 0 ? (
                    <p className="text-gray-500 text-sm">No users yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {users.slice(0, 5).map(u => (
                        <div key={u._id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm">{u.name}</p>
                              <p className="text-gray-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400 capitalize">{u.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-display font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Add Course',     emoji: '📚', action: () => setShowCourseModal(true),  id: 'qa-course' },
                      { label: 'Add Webinar',    emoji: '📅', action: () => setShowWebinarModal(true), id: 'qa-webinar' },
                      { label: 'View Users',     emoji: '👥', action: () => setActiveTab('Users'),    id: 'qa-users' },
                      { label: 'Manage Courses', emoji: '🎓', action: () => setActiveTab('Courses'),  id: 'qa-courses' },
                    ].map(({ label, emoji, action, id }) => (
                      <button key={id} id={id} onClick={action}
                        className="p-4 rounded-xl glass-hover flex flex-col items-center justify-center gap-2 text-white transition-colors">
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Courses ── */}
          {activeTab === 'Courses' && (
            <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-bold text-white">Manage Courses</h2>
                <button id="add-course-btn" onClick={() => setShowCourseModal(true)} className="btn-primary text-white text-sm py-2 px-5">
                  + Add Course
                </button>
              </div>
              {loading ? (
                <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}</div>
              ) : courses.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center text-gray-400">No courses yet.</div>
              ) : (
                <div className="glass rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase">Course</th>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase hidden md:table-cell">Instructor</th>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase hidden sm:table-cell">Level</th>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase">Price</th>
                        <th className="py-3 px-5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              {c.thumbnail && (
                                <img src={c.thumbnail} alt="" className="w-10 h-7 object-cover rounded bg-white/5 shrink-0" />
                              )}
                              <span className="text-white text-sm font-medium truncate max-w-[130px]">{c.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-gray-400 text-sm hidden md:table-cell">{c.instructor || '—'}</td>
                          <td className="py-3 px-5 hidden sm:table-cell">
                            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400 capitalize">{c.level}</span>
                          </td>
                          <td className="py-3 px-5 text-accent font-semibold text-sm">${c.price}</td>
                          <td className="py-3 px-5">
                            <button onClick={() => handleDeleteCourse(c._id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Users ── */}
          {activeTab === 'Users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-display font-bold text-white mb-6">User Management</h2>
              {loading ? (
                <div className="flex flex-col gap-3">{[1,2,3,4].map(i => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}</div>
              ) : users.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center text-gray-400">No users registered yet.</div>
              ) : (
                <div className="glass rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase">User</th>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase hidden md:table-cell">Email</th>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase">Role</th>
                        <th className="text-left py-3 px-5 text-xs text-gray-400 uppercase hidden sm:table-cell">Plan</th>
                        <th className="py-3 px-5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-300">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white text-sm truncate max-w-[100px]">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-gray-400 text-sm hidden md:table-cell">{u.email}</td>
                          <td className="py-3 px-5">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : u.role === 'suspended' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/5 text-gray-400'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-accent text-sm capitalize hidden sm:table-cell">{u.subscription || 'free'}</td>
                          <td className="py-3 px-5">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserBlock(u._id, u.role)}
                                className={`text-xs px-3 py-1 rounded-lg transition-colors ${u.role === 'suspended' ? 'text-green-400 hover:bg-green-500/10' : 'text-yellow-400 hover:bg-yellow-500/10'}`}
                              >
                                {u.role === 'suspended' ? 'Unblock' : 'Block'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Webinars ── */}
          {activeTab === 'Webinars' && (
            <motion.div key="webinars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-bold text-white">Manage Webinars</h2>
                <button id="add-webinar-btn" onClick={() => setShowWebinarModal(true)} className="btn-primary text-white text-sm py-2 px-5">
                  + Schedule Webinar
                </button>
              </div>
              {loading ? (
                <div className="flex flex-col gap-3">{[1,2].map(i => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)}</div>
              ) : webinars.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center text-gray-400">No webinars scheduled.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {webinars.map(w => (
                    <div key={w._id} className="glass rounded-2xl p-5 flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-medium">{w.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{new Date(w.date).toLocaleString()} · {w.instructor || '—'}</p>
                        {w.link && <a href={w.link} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline">{w.link}</a>}
                      </div>
                      <button onClick={() => handleDeleteWebinar(w._id)} className="text-red-400 text-xs hover:bg-red-500/10 px-3 py-1 rounded-lg transition-colors">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Create Course Modal ── */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto py-8 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-2xl w-full max-w-2xl relative my-auto"
            >
              <button onClick={() => { setShowCourseModal(false); resetCourseForm(); }} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
              <h3 className="text-2xl font-display font-bold text-white mb-6">📚 Create New Course</h3>

              <form onSubmit={handleCreateCourse} className="flex flex-col gap-5">
                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Course Title *</label>
                    <input type="text" placeholder="e.g. Price Action Masterclass" required className="input-field"
                      value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                    <textarea placeholder="What will students learn?" required className="input-field h-24 resize-none"
                      value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Price ($) *</label>
                      <input type="number" min="0" placeholder="49" required className="input-field"
                        value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Level *</label>
                      <select className="input-field" value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="all">All Levels</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Instructor *</label>
                      <input type="text" placeholder="Instructor name" required className="input-field"
                        value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Cloudinary Thumbnail Upload */}
                <FileUploader
                  label="Course Thumbnail *"
                  accept="image/*"
                  endpoint="image"
                  resourceType="image"
                  currentUrl={courseForm.thumbnail}
                  onUploaded={(url, public_id) => setCourseForm({ ...courseForm, thumbnail: url, thumbnail_public_id: public_id })}
                />

                <hr className="border-white/10" />

                {/* Modules / Lessons with Video Upload */}
                <ModuleBuilder modules={modules} setModules={setModules} />

                <button
                  type="submit"
                  id="confirm-create-course"
                  disabled={submitting || !courseForm.thumbnail}
                  className="btn-primary text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? 'Creating Course...' : 'Create Course'}
                </button>
                {!courseForm.thumbnail && (
                  <p className="text-yellow-400 text-xs text-center">Please upload a thumbnail to continue</p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Schedule Webinar Modal ── */}
      <AnimatePresence>
        {showWebinarModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-2xl w-full max-w-lg relative"
            >
              <button onClick={() => setShowWebinarModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
              <h3 className="text-2xl font-display font-bold text-white mb-6">📅 Schedule Webinar</h3>
              <form onSubmit={handleCreateWebinar} className="flex flex-col gap-4">
                <input type="text" placeholder="Webinar Title" required className="input-field"
                  value={webinarForm.title} onChange={e => setWebinarForm({ ...webinarForm, title: e.target.value })} />
                <textarea placeholder="Description" required className="input-field h-20 resize-none"
                  value={webinarForm.description} onChange={e => setWebinarForm({ ...webinarForm, description: e.target.value })} />
                <div className="flex gap-3">
                  <input type="datetime-local" required className="input-field w-1/2"
                    value={webinarForm.date} onChange={e => setWebinarForm({ ...webinarForm, date: e.target.value })} />
                  <input type="text" placeholder="Instructor" required className="input-field w-1/2"
                    value={webinarForm.instructor} onChange={e => setWebinarForm({ ...webinarForm, instructor: e.target.value })} />
                </div>
                <input type="url" placeholder="Meeting Link (Zoom/Meet)" className="input-field"
                  value={webinarForm.link} onChange={e => setWebinarForm({ ...webinarForm, link: e.target.value })} />
                <button type="submit" id="confirm-schedule-webinar" disabled={submitting} className="btn-primary text-white py-3 disabled:opacity-50 mt-2">
                  {submitting ? 'Scheduling...' : 'Schedule Webinar'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
