import { Home, Search, MessageSquare, User, LogOut, Menu, X, LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const NavItem = ({ icon: Icon, text, onClick }: { icon: LucideIcon, text: string, onClick: () => void }) => (
    <button
      onClick={() => {
        onClick();
        setMobileMenuOpen(false);
      }}
      className="flex items-center space-x-2 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md transition"
    >
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </button>
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button 
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }} 
              className="flex items-center space-x-2 hover:opacity-80 transition"
            >
              <img src="/logo.png" alt="RentSafe Logo" className="h-12 w-auto" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavItem icon={Home} text="Home" onClick={() => navigate('/')} />
            <NavItem icon={Search} text="Search" onClick={() => navigate('/search')} />
            {user ? (
              <>
                <NavItem icon={MessageSquare} text="Messages" onClick={() => navigate('/messages')} />
                <NavItem icon={User} text="Dashboard" onClick={() => navigate('/dashboard')} />
                <div className="flex items-center space-x-4 ml-2">
                  <span className="text-sm font-medium text-gray-700">
                    {user.full_name || user.email?.split('@')[0]}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSignOut();
                    }}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-deep-blue-700 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-deep-blue-700 rounded-md hover:bg-deep-blue-800 transition"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {!user && (
              <div className="flex space-x-2 mr-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-deep-blue-700 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-deep-blue-700 rounded hover:bg-deep-blue-800 transition"
                >
                  Get Started
                </button>
              </div>
            )}
            {user && (
              <span className="text-sm font-medium text-gray-700 mr-3">
                {user.full_name || user.email?.split('@')[0]}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.full_name || user.email}</p>
                {user.full_name && <p className="text-xs text-gray-500">{user.email}</p>}
              </div>
            )}
            <NavItem icon={Home} text="Home" onClick={() => navigate('/')} />
            <NavItem icon={Search} text="Search" onClick={() => navigate('/search')} />
            {user && (
              <>
                <NavItem icon={MessageSquare} text="Messages" onClick={() => navigate('/messages')} />
                <NavItem icon={User} text="Dashboard" onClick={() => navigate('/dashboard')} />
                <div className="px-2 py-1">
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}