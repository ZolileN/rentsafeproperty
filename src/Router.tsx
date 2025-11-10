import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import NewPropertyPage from './pages/NewPropertyPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { VerificationPage } from './pages/verification/VerificationPage';
import { EditPropertyPage } from './pages/EditPropertyPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PropertiesList } from './components/dashboard/PropertiesList';
import { ApplicationsList } from './components/dashboard/ApplicationsList';
import { TenantDashboard } from './components/dashboard/TenantDashboard';

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
      <Route path="/property/:id" element={<PropertyDetailsPage />} />
      <Route path="/dashboard/properties" element={<PropertiesList />} />
      <Route path="/dashboard/applications" element={<ApplicationsList />} />
      
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
      <Route
        path="/verify-identity"
        element={
          <ProtectedRoute>
            <VerificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property/:id/edit"
        element={
          <ProtectedRoute>
            <EditPropertyPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/auth-callback" 
        element={   
          <AuthCallbackPage /> 
        } 
      />
      <Route
        path="/tenant/dashboard"
          element={
            <ProtectedRoute>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/applications"
          element={
            <ProtectedRoute>
              <ApplicationsList />
            </ProtectedRoute>
          }
        />
    </Routes>
  );
}