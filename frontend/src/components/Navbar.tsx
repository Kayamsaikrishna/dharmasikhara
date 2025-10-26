import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, ShoppingCart, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]); // Real cart items
  const [cartItemsCount, setCartItemsCount] = useState(0); // Cart items count
  const { user, logout, token } = useUser();
  const navigate = useNavigate();

  // Fetch cart items from backend
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!user || !token) {
          setCartItems([]);
          setCartItemsCount(0);
          return;
        }
        
        // Fetch real cart items from backend API
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setCartItems(data.data.items || []);
          setCartItemsCount(data.data.items?.length || 0);
        } else {
          // Even if there's an error, we'll just show an empty cart
          setCartItems([]);
          setCartItemsCount(0);
        }
      } catch (err) {
        console.error('Error fetching cart items:', err);
        // Even if there's an error, we'll just show an empty cart
        setCartItems([]);
        setCartItemsCount(0);
      }
    };

    if (isCartOpen) {
      fetchCartItems();
    }
  }, [isCartOpen, user, token]);

  // Close user menu when clicking outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close user menu when cart or main menu opens
  useEffect(() => {
    if (isCartOpen || isMenuOpen) {
      setIsUserMenuOpen(false);
    }
  }, [isCartOpen, isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = false; // Disabled for now

  const removeFromCart = async (itemId: string) => {
    try {
      if (!user || !token) return;
      
      // Remove item from backend
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setCartItems(cartItems.filter(item => item.id !== itemId));
        setCartItemsCount(cartItemsCount - 1);
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
      // Still update local state even if backend fails
      setCartItems(cartItems.filter(item => item.id !== itemId));
      setCartItemsCount(cartItemsCount - 1);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.points, 0);
  };

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
              <Link to="/legal-analysis" className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition duration-300">Legal Analysis</Link>
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
              {/* Cart Icon */}
              <div className="relative">
                <button 
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition duration-300 relative"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
                
                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Your Cart</h3>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {cartItems.length > 0 ? (
                          cartItems.map(item => (
                            <div key={item.id} className="flex items-center border-b pb-4">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                              <div className="ml-4 flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-gray-600 text-sm">{item.points} points</p>
                              </div>
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            Your cart is empty
                          </div>
                        )}
                      </div>
                      
                      {cartItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{calculateSubtotal()} points</span>
                          </div>
                          <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium">
                              Proceed to Payment
                            </button>
                          </Link>
                          <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                            <button className="w-full mt-2 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition duration-300 font-medium">
                              View Cart
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile */}
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <div 
                    className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-lg cursor-pointer"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <User className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link 
                        to="/account/profile" 
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/account/subscription" 
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Subscription
                      </Link>
                      <Link 
                        to="/account/upload" 
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Upload Document
                      </Link>
                      <div className="border-t my-2"></div>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition duration-300">Sign In</Link>
                  <Link to="/login">
                    <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300 font-bold shadow-md transform hover:scale-105 transition-transform whitespace-nowrap">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            <button 
              className="text-white relative"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            
            <button 
              className="text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/scenarios" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Scenarios</Link>
              {/* <Link to="/marketplace" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Marketplace</Link> */}
              <Link to="/dashboard" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/multiplayer" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Multiplayer</Link>
              <Link to="/legal-analysis" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Legal Analysis</Link>
              <Link to="/legal-assistant" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Legal Assistant</Link>
              <Link to="/legal-research" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Legal Research</Link>
              <Link to="/legal-news" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Legal News</Link>
              {/* Assessment link removed */}
              {/* Live Sessions link removed */}
              {/* Contractor functionality disabled */}
              <Link to="/about" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="/contact" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </nav>
            <div className="mt-6 flex flex-col space-y-3">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between bg-white/20 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 pl-4">
                    <Link to="/account/profile" className="text-white hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    <Link to="/account/subscription" className="text-white hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>Subscription</Link>
                    <Link to="/account/upload" className="text-white hover:text-gray-200" onClick={() => setIsMenuOpen(false)}>Upload Document</Link>
                    <button 
                      onClick={handleLogout}
                      className="text-white hover:text-gray-200 flex items-center"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:bg-white/20 px-4 py-3 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full bg-white text-indigo-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition duration-300 font-bold">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Mobile Cart Dropdown */}
        {isCartOpen && !isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/20">
            <div className="bg-white rounded-lg shadow-xl z-50 border border-gray-200">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">Your Cart</h3>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {cartItems.length > 0 ? (
                    cartItems.map(item => (
                      <div key={item.id} className="flex items-center border-b pb-4">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-gray-600 text-sm">{item.points} points</p>
                        </div>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Your cart is empty
                    </div>
                  )}
                </div>
                
                {cartItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{calculateSubtotal()} points</span>
                    </div>
                    <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                      <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium">
                        Proceed to Payment
                      </button>
                    </Link>
                    <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                      <button className="w-full mt-2 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition duration-300 font-medium">
                        View Cart
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;