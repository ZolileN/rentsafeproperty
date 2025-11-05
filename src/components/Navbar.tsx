import { Home, Search, MessageSquare, User, LogOut, Menu, X } from 'lucide-react';
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

  const NavItem = ({ icon: Icon, text, onClick }: { icon: any, text: string, onClick: () => void }) => (
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
          <button 
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }} 
            className="flex items-center space-x-2 hover:opacity-80 transition"
          >
            <img src="/logo.png" alt="RentSafe Logo" className="h-12 w-auto" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItem icon={Home} text="Home" onClick={() => navigate('/')} />
            <NavItem icon={Search} text="Search" onClick={() => navigate('/search')} />
            {user && (
              <>
                <NavItem icon={MessageSquare} text="Messages" onClick={() => navigate('/messages')} />
                <NavItem icon={User} text="Dashboard" onClick={() => navigate('/dashboard')} />
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
            <NavItem icon={Home} text="Home" onClick={() => navigate('/')} />
            <NavItem icon={Search} text="Search" onClick={() => navigate('/search')} />
            {user && (
              <>
                <NavItem icon={MessageSquare} text="Messages" onClick={() => navigate('/messages')} />
                <NavItem icon={User} text="Dashboard" onClick={() => navigate('/dashboard')} />
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}