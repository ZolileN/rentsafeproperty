import { Home, Search, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { navigateTo } from '../Router';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => navigateTo('/')} className="flex items-center space-x-2 hover:opacity-80 transition">
            <img src="/logo.png" alt="RentSafe Logo" className="h-12 w-auto" />
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigateTo('/')} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button onClick={() => navigateTo('/search')} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
            {user && (
              <>
                <button onClick={() => navigateTo('/messages')} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </button>
                <button onClick={() => navigateTo('/dashboard')} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{user.full_name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded hidden md:block">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigateTo('/signup')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
