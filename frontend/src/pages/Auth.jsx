import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Auth({ type }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const isLogin = type === 'login';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const { data } = await api.post(endpoint, payload);

      login(data.token, data.user);

      const from = location.state?.from?.pathname;
      if (data.user.role === 'admin') {
        navigate(from || '/admin');
      } else {
        navigate(from || '/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-[80vh]">
      {/* Background glows */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-accent/10 rounded-full blur-[100px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-secondary/10 rounded-full blur-[100px] -z-10 animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md p-8 rounded-3xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4 text-xl font-display font-bold">
            <span className="text-accent">Volpe</span>byFX
          </Link>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to access your courses' : 'Join VolpebyFX today — it\'s free'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            id={isLogin ? 'login-btn' : 'register-btn'}
            disabled={loading}
            className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-center"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? (
            <p>Don't have an account? <Link to="/register" className="text-accent hover:underline font-medium">Sign up free</Link></p>
          ) : (
            <p>Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Log in</Link></p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
