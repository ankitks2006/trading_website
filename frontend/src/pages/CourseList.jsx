import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LEVEL_COLORS = {
  beginner: 'text-green-400 bg-green-400/10',
  intermediate: 'text-yellow-400 bg-yellow-400/10',
  advanced: 'text-red-400 bg-red-400/10',
  all: 'text-blue-400 bg-blue-400/10',
};

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses')
      .then(res => { setCourses(res.data); setFiltered(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = courses;
    if (level !== 'all') result = result.filter(c => c.level === level);
    if (search.trim()) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, level, courses]);

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          Explore Premium <span className="gradient-text">Courses</span>
        </h1>
        <p className="text-gray-400 mb-8">Master forex, stocks, and crypto with expert-led courses</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <input
          id="course-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="input-field max-w-sm"
        />
        <select
          id="level-filter"
          value={level}
          onChange={e => setLevel(e.target.value)}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {(search || level !== 'all') && (
          <button
            onClick={() => { setSearch(''); setLevel('all'); }}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white glass rounded-xl transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-white font-display font-semibold text-xl mb-2">No courses found</p>
          <p className="text-gray-400">
            {courses.length === 0
              ? 'Courses are being added soon. Check back later!'
              : 'Try adjusting your search or filters.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course, i) => (
            <motion.div
              key={course._id}
              id={`course-card-${course._id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6, borderColor: 'rgba(34,197,94,0.4)' }}
              onClick={() => navigate(`/courses/${course._id}`)}
              className="glass rounded-2xl overflow-hidden border border-white/10 cursor-pointer group transition-all"
            >
              <div className="h-48 bg-gradient-to-br from-accent/20 to-secondary/20 relative overflow-hidden flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <span className="text-5xl">📈</span>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 capitalize ${LEVEL_COLORS[course.level] || LEVEL_COLORS.all}`}>
                    {course.level || 'All Levels'}
                  </span>
                </div>
                {course.isFree && (
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/80 text-white">FREE</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold text-white mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-3">
                  by <span className="text-gray-300">{course.instructor || 'VolpebyFX Expert'}</span>
                </p>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div>
                    <span className="text-2xl font-bold text-accent">${course.price}</span>
                    {course.studentsCount > 0 && (
                      <span className="text-xs text-gray-500 ml-2">{course.studentsCount} students</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    ⭐ <span className="text-gray-300">{course.rating || 4.5}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
