import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  storage: string;
  documentAnalysisLimit: string;
  features: {
    documentAnalysis: boolean;
    scenariosAccess: number;
    multiplayerAccess: boolean;
    customScenarios: number;
    prioritySupport: boolean;
    storage: string;
    documentAnalysisLimit: string;
  };
  description: string;
}

const PaymentPage: React.FC = () => {
  const { user, token } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get plan ID from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planId = params.get('plan');
    
    if (!planId) {
      setError('No plan selected');
      setLoading(false);
      return;
    }
    
    // Fetch plan details
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/payments/plans');
        const data = await response.json();
        
        if (data.success) {
          const selectedPlan = data.data.find((p: Plan) => p.id === planId);
          if (selectedPlan) {
            setPlan(selectedPlan);
          } else {
            setError('Selected plan not found');
          }
        } else {
          setError('Failed to fetch plans');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching plan: ' + (err as Error).message);
        console.error('Error fetching plan:', err);
        setLoading(false);
      }
    };
    
    fetchPlan();
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    
    try {
      // Validate form based on payment method
      if (paymentMethod === 'card') {
        if (!cardNumber || !expiry || !cvv || !name) {
          setError('Please fill in all card details');
          setIsProcessing(false);
          return;
        }
      } else if (paymentMethod === 'upi' && !upiId) {
        setError('Please enter your UPI ID');
        setIsProcessing(false);
        return;
      }
      
      // Process payment
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod,
          cardNumber,
          expiry,
          cvv,
          name,
          upiId,
          plan: plan?.id,
          amount: plan?.price
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate('/account/profile');
        }, 3000);
      } else {
        setError(data.message || 'Payment failed');
      }
    } catch (err) {
      setError('Payment failed: ' + (err as Error).message);
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !plan) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Payment</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/account/subscription">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium">
                Back to Plans
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/account/subscription" className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Plans
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600">Securely process your payment for the {plan?.name}</p>
        </div>

        {success ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h3>
              <p className="text-green-700 mb-6">
                Your payment of ₹{plan?.price} for the {plan?.name} has been processed successfully.
              </p>
              <p className="text-green-700">
                Redirecting to your profile...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`py-3 px-4 rounded-lg border ${
                        paymentMethod === 'card'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center mr-3">
                          {paymentMethod === 'card' && (
                            <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                          )}
                        </div>
                        <span className="font-medium">Credit/Debit Card</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`py-3 px-4 rounded-lg border ${
                        paymentMethod === 'upi'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center mr-3">
                          {paymentMethod === 'upi' && (
                            <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                          )}
                        </div>
                        <span className="font-medium">UPI</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Full name as on card"
                      />
                    </div>
                  </div>
                )}
                
                {/* UPI Payment Form */}
                {paymentMethod === 'upi' && (
                  <div>
                    <div>
                      <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        id="upiId"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="yourname@upi"
                      />
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">UPI Payment Instructions</h4>
                      <p className="text-blue-700 text-sm">
                        After submitting, you'll receive a payment request on your UPI app. 
                        Complete the payment there to finalize your subscription.
                      </p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-300 ${
                      isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay ₹${plan?.price}`
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {plan && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{plan.price}</p>
                      <p className="text-gray-600 text-sm">per {plan.period}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{plan.price}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax (+GST)</span>
                      <span className="font-medium">N/A</span>
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">₹{plan.price}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Document Analysis</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{plan.features.documentAnalysisLimit} Document Analysis</span>
                      </li>
                      <li className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${plan.features.storage !== '0 GB' ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{plan.features.storage} Storage</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{plan.features.scenariosAccess} Scenarios/Month</span>
                      </li>
                      <li className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${plan.features.multiplayerAccess ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Multiplayer Access</span>
                      </li>
                      <li className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${plan.features.customScenarios > 0 ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>{plan.features.customScenarios} Custom Scenarios/Month</span>
                      </li>
                      <li className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${plan.features.prioritySupport ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Priority Support</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentPage;