import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Menu, X, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close user menu when main menu opens
  useEffect(() => {
    if (isMenuOpen) {
      setIsProfileOpen(false);
    }
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = false; // Disabled for now

  return (
    <header className="bg-gradient-to-r from-indigo-700 to-purple-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <img 
                src="/logo.jpg" 
                alt="DHARMASIKHARA Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg animate-pulse">
                DHARMASIKHARA
              </h1>
              <p className="text-xs text-indigo-200 italic">Master the Law, Embrace Justice</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <nav className="flex space-x-1 mr-4">
              <Link to="/" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Home</Link>
              <Link to="/scenarios" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Scenarios</Link>
              {/* <Link to="/marketplace" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Marketplace</Link> */}
              <Link to="/dashboard" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Dashboard</Link>
              <Link to="/multiplayer" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Multiplayer</Link>
              <Link to="/legal-assistant" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Legal Assistant</Link>
              <Link to="/legal-research" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Legal Research</Link>
              <Link to="/legal-news" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Legal News</Link>
              {/* Assessment link removed */}
              {/* Legal Updates link removed */}
              {/* Live Sessions link removed */}
              {/* Contractor functionality disabled */}
              <Link to="/about" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">About</Link>
              <Link to="/contact" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Contact</Link>
            </nav>

            <div className="flex items-center space-x-3">
              {/* User Profile Icon */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  className="flex items-center space-x-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg transition duration-300"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">Profile</span>
                </button>
                
                {/* User Menu Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link 
                      to="/account/profile" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/account/subscription" 
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Subscription
                    </Link>
                    <div className="border-t my-2"></div>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-white hover:bg-white/20 p-2 rounded-lg transition duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white hover:bg-white/20 p-2 rounded-lg transition duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-800 py-4 px-4">
          <nav className="space-y-2">
            <Link to="/" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/scenarios" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Scenarios</Link>
            {/* <Link to="/marketplace" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Marketplace</Link> */}
            <Link to="/dashboard" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            <Link to="/multiplayer" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Multiplayer</Link>
            <Link to="/legal-assistant" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Legal Assistant</Link>
            <Link to="/legal-research" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Legal Research</Link>
            <Link to="/legal-news" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Legal News</Link>
            {/* Assessment link removed */}
            {/* Legal Updates link removed */}
            {/* Live Sessions link removed */}
            {/* Contractor functionality disabled */}
            <Link to="/about" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            
            <div className="border-t border-indigo-700 my-2"></div>
            
            {user ? (
              <>
                <Link 
                  to="/account/profile" 
                  className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/account/subscription" 
                  className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Subscription
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="block text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;