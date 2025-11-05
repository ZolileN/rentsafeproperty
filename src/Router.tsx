import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { NewPropertyPage } from './pages/NewPropertyPage';
import { useAuth } from './contexts/AuthContext';

// Custom navigation function for React SPA routing
export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    navigateTo('/login');
    return null;
  }

  return children;
}

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const routes: Record<string, JSX.Element> = {
    '/': <HomePage />,
    '/signup': <SignUpPage />,
    '/login': <LoginPage />,
    '/dashboard': <ProtectedRoute><DashboardPage /></ProtectedRoute>,
    '/search': <SearchPage />,
    '/property/new': <ProtectedRoute><NewPropertyPage /></ProtectedRoute>,
  };

  return routes[currentPath] || <HomePage />;
}
