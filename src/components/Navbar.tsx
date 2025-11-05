// In Navbar.tsx
import { Home, Search, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Replace the import

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate(); // Add this line

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-2 hover:opacity-80 transition"
          >
            <img src="/logo.png" alt="RentSafe Logo" className="h-12 w-auto" />
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => navigate('/search')} 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
            {user && (
              <>
                <button 
                  onClick={() => navigate('/messages')} 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </button>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await signOut();
                      navigate('/login');
                    } catch (error) {
                      console.error('Failed to sign out', error);
                    }
                  }} 
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}