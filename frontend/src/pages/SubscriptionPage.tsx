import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';

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

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  features: {
    documentAnalysis: boolean;
    scenariosAccess: number;
    multiplayerAccess: boolean;
    customScenarios: number;
    prioritySupport: boolean;
    storage: string;
    documentAnalysisLimit: string;
  };
}

const SubscriptionPage: React.FC = () => {
  const { user, token } = useUser();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch subscription plans and user's current subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription plans
        const plansResponse = await fetch('/api/payments/plans');
        
        // Check if response is OK
        if (!plansResponse.ok) {
          throw new Error(`HTTP error! status: ${plansResponse.status}`);
        }
        
        const plansData = await plansResponse.json();
        
        if (plansData.success) {
          setPlans(plansData.data);
        }
        
        // Fetch user subscription
        const subscriptionResponse = await fetch('/api/account/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Check if response is OK
        if (!subscriptionResponse.ok) {
          throw new Error(`HTTP error! status: ${subscriptionResponse.status}`);
        }
        
        const subscriptionData = await subscriptionResponse.json();
        
        if (subscriptionData.success) {
          setSubscription(subscriptionData.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching data: ' + (err as Error).message);
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    if (user && token) {
      fetchData();
    }
  }, [user, token]);

  const handleUpgrade = async (planId: string) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/account/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Subscription updated successfully!');
        // Refresh subscription data
        const subscriptionResponse = await fetch('/api/account/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const subscriptionData = await subscriptionResponse.json();
        
        if (subscriptionData.success) {
          setSubscription(subscriptionData.data);
        }
        
        // Reload the page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.message || 'Failed to update subscription');
      }
    } catch (err) {
      setError('Failed to update subscription: ' + (err as Error).message);
      console.error('Upgrade error:', err);
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'border-gray-200';
      case 'pro': return 'border-blue-200 bg-blue-50';
      case 'advanced': return 'border-purple-200 bg-purple-50';
      case 'premium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200';
    }
  };

  const getPlanButtonColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'bg-gray-600 hover:bg-gray-700';
      case 'pro': return 'bg-blue-600 hover:bg-blue-700';
      case 'advanced': return 'bg-purple-600 hover:bg-purple-700';
      case 'premium': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan === planId;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading subscription plans...</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Plans</h3>
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/account/profile" className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600">Choose the plan that best fits your needs</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`rounded-xl shadow-lg p-6 border-2 ${getPlanColor(plan.id)} ${
                isCurrentPlan(plan.id) ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {isCurrentPlan(plan.id) && (
                <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                  CURRENT PLAN
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{plan.price}
                </span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${plan.features.documentAnalysis ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Document Analysis</span>
                </li>
                <li className="flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${plan.features.scenariosAccess > 0 ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{plan.features.scenariosAccess} Scenarios/Month</span>
                </li>
                <li className="flex items-center">
                  <svg className={`w-5 h-5 mr-2 ${plan.features.documentAnalysisLimit ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              
              {!isCurrentPlan(plan.id) ? (
                <button
                  onClick={() => navigate(`/account/payment?plan=${plan.id}`)}
                  className={`w-full py-3 rounded-lg font-medium text-white transition duration-300 ${getPlanButtonColor(plan.id)}`}
                >
                  {plan.id === 'free' ? 'Select Plan' : 'Upgrade'}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-medium text-white bg-gray-400 cursor-not-allowed"
                >
                  Current Plan
                </button>
              )}
            </div>
          ))}
        </div>

        {subscription && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Current Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">Plan</h3>
                <p className="text-gray-600 capitalize">{subscription.plan}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">Status</h3>
                <p className="text-gray-600 capitalize">{subscription.status}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">Renewal Date</h3>
                <p className="text-gray-600">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubscriptionPage;