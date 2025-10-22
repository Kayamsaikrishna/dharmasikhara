import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ArrowLeft, X, ShoppingCart as CartIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface CartItem {
  id: string;
  title: string;
  creator: string;
  points: number;
  price: number;
  difficulty: string;
  image: string;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, token } = useUser();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    }
  }, [user, token, navigate]);

  // Fetch cart items from backend
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        
        // Fetch real cart items from backend API
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Transform cart items to the expected format
          const items = data.data.items?.map((item: any) => ({
            id: item._id || item.id,
            title: item.name || item.title,
            creator: item.creator?.username || item.creator || 'Unknown Creator',
            points: item.points || 0,
            price: item.price || 0,
            difficulty: item.difficulty || 'Intermediate',
            image: item.image || ''
          })) || [];
          
          setCartItems(items);
        } else {
          setError(data.message || 'Failed to fetch cart items');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching cart items: ' + (err as Error).message);
        console.error('Error fetching cart items:', err);
        setLoading(false);
      }
    };

    if (user && token) {
      fetchCartItems();
    }
  }, [user, token]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discount = 65;
  const tax = Math.round(subtotal * 0.18); // 18% tax
  const total = subtotal - discount + tax;

  const removeItem = async (id: string) => {
    try {
      // Remove item from backend
      const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setCartItems(cartItems.filter(item => item.id !== id));
      } else {
        setError(data.message || 'Failed to remove item from cart');
      }
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Error removing item:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Cart</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link to="/marketplace" className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cart ({cartItems.length})</h2>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CartIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">Add some scenarios to your cart to get started</p>
                  <Link to="/marketplace">
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium">
                      Browse Scenarios
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20" />
                      <div className="ml-4 flex-1">
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.creator} • {item.difficulty}</p>
                        <div className="flex items-center mt-2">
                          <span className="font-bold text-indigo-600">{item.points} points</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="font-bold">₹{item.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition duration-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-₹{discount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{tax}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              
              <Link to="/payment">
                <button 
                  disabled={cartItems.length === 0}
                  className={`w-full py-3 rounded-lg font-medium text-white transition duration-300 ${
                    cartItems.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  Proceed to Payment
                </button>
              </Link>
              
              <div className="mt-4 text-center">
                <Link to="/marketplace" className="text-indigo-600 hover:text-indigo-800 transition duration-300 font-medium">
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Points Reward</h3>
              <p className="text-gray-600 text-sm mb-4">
                You'll receive {cartItems.reduce((sum, item) => sum + item.points, 0)} points after purchase
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">75% of the way to your next reward tier</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;