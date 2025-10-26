import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';

interface Document {
  _id: string;
  title: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  analysisResults?: any;
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

const Profile: React.FC = () => {
  const { user, token } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user documents
        const documentsResponse = await fetch('/api/account/documents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const documentsData = await documentsResponse.json();
        
        if (documentsData.success) {
          setDocuments(documentsData.data);
        }
        
        // Fetch user subscription
        const subscriptionResponse = await fetch('/api/account/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const subscriptionData = await subscriptionResponse.json();
        
        if (subscriptionData.success) {
          setSubscription(subscriptionData.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching profile data: ' + (err as Error).message);
        console.error('Error fetching profile data:', err);
        setLoading(false);
      }
    };

    if (user && token) {
      fetchProfileData();
    }
  }, [user, token]);

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Basic Free Plan';
      case 'pro': return 'Pro Plan';
      case 'advanced': return 'Advanced Plan';
      case 'premium': return 'Premium Plan';
      default: return 'Unknown Plan';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600">Manage your account information and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-gray-900">{user?.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <p className="text-gray-900">{user?.institution || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                  <p className="text-gray-900">{user?.year || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <p className="text-gray-900">{user?.specialization || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <p className="text-gray-900">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString() 
                      : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
                  onClick={() => navigate('/account/edit-profile')}
                >
                  Edit Profile
                </button>
              </div>
            </div>
            
            {/* Subscription Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Status</h2>
              
              {subscription ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(subscription.plan)}`}>
                      {getPlanName(subscription.plan)}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date</span>
                      <span className="font-medium">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date</span>
                      <span className="font-medium">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-2">Plan Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${subscription.features.documentAnalysis ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Document Analysis</span>
                        </li>
                        <li className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${subscription.features.documentAnalysisLimit ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{subscription.features.documentAnalysisLimit} Document Analysis</span>
                        </li>
                        <li className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${subscription.features.storage !== '0 GB' ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{subscription.features.storage} Storage</span>
                        </li>
                        <li className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${subscription.features.scenariosAccess > 0 ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{subscription.features.scenariosAccess} Scenarios/Month</span>
                        </li>
                        <li className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${subscription.features.multiplayerAccess ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Multiplayer Access</span>
                        </li>
                        <li className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${subscription.features.customScenarios > 0 ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{subscription.features.customScenarios} Custom Scenarios/Month</span>
                        </li>
                        <li className="flex items-center">
                          <svg className={`w-5 h-5 mr-2 ${subscription.features.prioritySupport ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Priority Support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link to="/account/subscription">
                      <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium">
                        Manage Subscription
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No subscription found</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Document History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Document History</h2>
                <Link to="/account/upload">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium text-sm">
                    Upload Document
                  </button>
                </Link>
              </div>
              
              {documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {doc.fileType.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/account/documents/${doc._id}`} className="text-indigo-600 hover:text-indigo-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No documents uploaded</h3>
                  <p className="text-gray-500 mb-4">Get started by uploading your first legal document</p>
                  <Link to="/account/upload">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium">
                      Upload Document
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;