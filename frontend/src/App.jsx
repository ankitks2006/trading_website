import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Webinars from './pages/Webinars';
import Pricing from './pages/Pricing';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <Navbar />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/register" element={<Auth type="register" />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="glass py-8 mt-12 text-center text-sm text-gray-400">
        <p className="font-display font-semibold text-white mb-1">VolpebyFX</p>
        <p>&copy; {new Date().getFullYear()} VolpebyFX. All rights reserved.</p>
        <p className="mt-1 text-accent hover:underline cursor-pointer">contact@volpebyfx.org</p>
      </footer>
    </div>
  );
}

export default App;
