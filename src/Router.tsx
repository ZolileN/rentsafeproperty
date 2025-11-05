import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { NewPropertyPage } from './pages/NewPropertyPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

export function Router() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle protected routes
  useEffect(() => {
    const publicPaths = ['/login', '/signup', '/'];
    const isPublicPath = publicPaths.includes(location.pathname);
    
    if (!loading && !user && !isPublicPath) {
      navigate('/login');
    }
  }, [user, loading, location, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Or your loading spinner
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/search" element={<SearchPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property/new"
        element={
          <ProtectedRoute>
            <NewPropertyPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}