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
      className="flex items-center space-x-2 w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-800 hover:ring-2 hover:ring-emerald-500/50 hover:ring-offset-2 hover:ring-offset-gray-900 rounded-md transition-all duration-200"
    >
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </button>
  );

  return (
    <nav className="bg-gray-900 shadow-sm border-b border-gray-800">
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
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-emerald-500 transition"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition"
                >
                  Register
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
                  className="px-3 py-1.5 text-xs font-medium text-gray-200 hover:text-emerald-500 transition"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition"
                >
                  Register
                </button>
              </div>
            )}
            {user && (
              <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-md">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">
                  {user.full_name || user.email?.split('@')[0]}
                </span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-emerald-500 hover:bg-gray-800 focus:outline-none"
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
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-medium text-white">{user.full_name || user.email}</p>
                {user.full_name && <p className="text-xs text-gray-400">{user.email}</p>}
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
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Logout</span>
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