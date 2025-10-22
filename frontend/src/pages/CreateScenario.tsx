import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';

const CreateScenario: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('civil');
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [learningObjectives, setLearningObjectives] = useState('');
  const [courtType, setCourtType] = useState('district');
  const [parties, setParties] = useState([{ role: 'plaintiff', name: '' }, { role: 'defendant', name: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, token } = useUser();

  // Redirect if user is not a contractor
  React.useEffect(() => {
    // Contractor role removed - redirect all users
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAddParty = () => {
    setParties([...parties, { role: 'witness', name: '' }]);
  };

  const handleRemoveParty = (index: number) => {
    if (parties.length > 2) {
      const newParties = [...parties];
      newParties.splice(index, 1);
      setParties(newParties);
    }
  };

  const handlePartyChange = (index: number, field: string, value: string) => {
    const newParties = [...parties];
    newParties[index] = { ...newParties[index], [field]: value };
    setParties(newParties);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Send data to backend API
      const response = await fetch('http://localhost:5000/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          practiceArea: category, // Map category to practiceArea
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), // Capitalize first letter
          estimatedTime,
          learningObjectives: learningObjectives.split('\n').filter(obj => obj.trim() !== ''),
          content: {
            initialState: {
              characters: parties,
              documents: []
            }
          },
          price: 0, // Default to free
          tags: [category, difficulty, courtType],
          status: 'draft' // Start as draft
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to scenarios page after successful creation
        navigate('/scenarios');
      } else {
        setError(data.message || 'Failed to create scenario. Please try again.');
      }
    } catch (err) {
      setError('Failed to create scenario. Please try again.');
      console.error('Creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Contractor functionality disabled
  if (true) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You must be a contractor to create scenarios. Please contact an administrator if you believe this is an error.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Legal Scenario</h1>
            <p className="text-gray-600 mt-2">
              Design an immersive legal scenario for users to practice their skills
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter scenario title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  >
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Constitutional Law">Constitutional Law</option>
                    <option value="Tax Law">Tax Law</option>
                    <option value="Intellectual Property">Intellectual Property</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="estimatedTime"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(Number(e.target.value))}
                    min="10"
                    max="300"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Describe the scenario in detail..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="learningObjectives" className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <textarea
                    id="learningObjectives"
                    rows={3}
                    value={learningObjectives}
                    onChange={(e) => setLearningObjectives(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="What skills will users develop through this scenario? (Enter one objective per line)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="courtType" className="block text-sm font-medium text-gray-700 mb-2">
                    Court Type
                  </label>
                  <select
                    id="courtType"
                    value={courtType}
                    onChange={(e) => setCourtType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                  >
                    <option value="district">District Court</option>
                    <option value="high">High Court</option>
                    <option value="supreme">Supreme Court</option>
                    <option value="magistrate">Magistrate Court</option>
                    <option value="family">Family Court</option>
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Parties Involved</h3>
                  <button
                    type="button"
                    onClick={handleAddParty}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    + Add Party
                  </button>
                </div>
                
                <div className="space-y-4">
                  {parties.map((party, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          <select
                            value={party.role}
                            onChange={(e) => handlePartyChange(index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          >
                            <option value="plaintiff">Plaintiff</option>
                            <option value="defendant">Defendant</option>
                            <option value="witness">Witness</option>
                            <option value="expert">Expert Witness</option>
                            <option value="judge">Judge</option>
                            <option value="lawyer">Lawyer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={party.name}
                            onChange={(e) => handlePartyChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Enter party name"
                          />
                        </div>
                      </div>
                      {parties.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParty(index)}
                          className="text-red-500 hover:text-red-700 mt-6"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/scenarios')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg transition duration-300 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Scenario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateScenario;