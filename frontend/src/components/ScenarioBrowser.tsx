import * as React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, BookOpen, Star, Plus, Eye, Lock } from 'lucide-react';

interface Scenario {
  _id: string;
  title: string;
  description: string;
  practiceArea: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedTime: number;
  rating: number;
  reviewCount: number;
  price: number;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    username: string;
  };
}

const ScenarioBrowser: React.FC = () => {
  const [scenarios, setScenarios] = React.useState<Scenario[]>([
    // Actual scenario data based on the user's provided narrative
    {
      _id: '1',
      title: 'The Inventory That Changed Everything',
      description: 'A sales executive is accused of theft after a valuable laptop goes missing during an inventory check. As his defense attorney, you must investigate the case, interview the client, research relevant laws, and argue for bail. The truth is hidden in the details - can you uncover what really happened?',
      practiceArea: 'Criminal Law',
      difficulty: 'Intermediate',
      estimatedTime: 30,
      rating: 4.7,
      reviewCount: 32,
      price: 0,
      tags: ['bail application', 'client interviewing', 'legal research', 'oral advocacy', 'investigation', 'evidence analysis'],
      status: 'published',
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-20T14:45:00Z',
      creator: {
        username: 'LegalExpert2025'
      }
    }
  ]);
  const [filteredScenarios, setFilteredScenarios] = React.useState<Scenario[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState('All');

  const categories = ['All', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law', 'Constitutional Law', 'Tax Law', 'Intellectual Property'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Simulate loading
  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setFilteredScenarios(scenarios);
    }, 500);
  }, [scenarios]);

  // Filter scenarios based on search and filters
  React.useEffect(() => {
    let result = [...scenarios];
    
    if (searchTerm) {
      result = result.filter(scenario => 
        scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        scenario.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      result = result.filter(scenario => scenario.practiceArea === selectedCategory);
    }
    
    if (selectedDifficulty !== 'All') {
      result = result.filter(scenario => scenario.difficulty === selectedDifficulty);
    }
    
    setFilteredScenarios(result);
  }, [searchTerm, selectedCategory, selectedDifficulty, scenarios]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-yellow-100 text-yellow-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Scenarios</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Legal <span className="text-indigo-600">Scenario</span> Library
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Practice with realistic legal scenarios designed to challenge your investigative and advocacy skills
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/create-scenario">
            <button 
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => {
                alert('Create your own custom legal scenario! Design unique cases and challenges for yourself and others. This premium feature allows you to build personalized learning experiences.');
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Custom Scenario
            </button>
          </Link>
          <button 
            className="inline-flex items-center bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-xl hover:bg-indigo-50 transition duration-300 font-medium shadow-sm"
            onClick={() => {
              alert('Track your progress through various legal scenarios. See your completion rates, scores, and skill development over time.');
            }}
          >
            <Eye className="w-5 h-5 mr-2" />
            View Progress
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Premium feature: 1000 points for 5 custom scenarios per month
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search scenarios by title, description, or tags..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 transition duration-300 font-medium flex items-center shadow-lg hover:shadow-xl"
            onClick={() => {
              alert('Advanced filters will help you find the perfect legal scenario for your practice needs. This feature is coming soon!');
            }}
          >
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filters
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              onChange={(e) => {
                alert(`Filtering by ${e.target.value} access type. Premium scenarios offer advanced features and detailed feedback.`);
              }}
            >
              <option>All Types</option>
              <option>Free Only</option>
              <option>Premium Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Scenario Banner */}
      {filteredScenarios.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-12 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <div className="inline-flex items-center bg-white bg-opacity-20 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
                <Eye className="w-4 h-4 mr-2" />
                Featured Mystery
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{filteredScenarios[0].title}</h2>
              <p className="text-indigo-100 mb-6">{filteredScenarios[0].description.substring(0, 150)}...</p>
              <Link to={`/scenarios/${filteredScenarios[0]._id}`}>
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition duration-300 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Unlock the Mystery
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </button>
              </Link>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-white bg-opacity-20 rounded-full w-48 h-48 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-16 h-16 text-white mx-auto mb-4" />
                  <div className="font-bold text-lg">Solve the Case</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredScenarios.map(scenario => (
            <Link to={`/scenarios/${scenario._id}`} key={scenario._id} className="block group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{scenario.title}</h3>
                    {scenario.price === 0 ? (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">FREE</span>
                    ) : (
                      <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">{scenario.price} pts</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{scenario.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {scenario.practiceArea}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(scenario.estimatedTime)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {scenario.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 pt-0">
                  <div className="flex flex-wrap items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                    
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600 font-medium">{scenario.rating} ({scenario.reviewCount})</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">By {scenario.creator.username}</span>
                      <button 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center group-hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Prepare to dive into this legal mystery! You will interview the client, analyze evidence, and build your case. The truth is hidden in the details - can you uncover what really happened?');
                        }}
                      >
                        Investigate Case
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200 p-12 text-center">
        <div className="bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Eye className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold text-amber-900 mb-4">More Legal Mysteries Coming Soon</h3>
        <p className="text-amber-800 text-lg max-w-2xl mx-auto mb-8">
          We're working on creating new challenging legal scenarios for you. Each case will present unique mysteries for you to solve and skills to develop.
        </p>
        <button 
          className="inline-flex items-center bg-amber-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition duration-300"
          onClick={() => {
            alert('Thank you for your interest! We will notify you when new legal scenarios are available. In the meantime, enjoy solving "The Inventory That Changed Everything" mystery.');
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          Notify Me When Available
        </button>
      </div>

      {/* Detailed Case File Simulation */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 p-12 text-center mt-8">
        <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-purple-900 mb-4">Detailed Case File Simulation</h3>
        <p className="text-purple-800 text-lg max-w-2xl mx-auto mb-8">
          Explore our enhanced legal scenario with detailed case files, evidence analysis, and interactive documents.
        </p>
        <Link to="/scenario-simulation">
          <button className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition duration-300">
            <BookOpen className="w-5 h-5 mr-2" />
            Access Detailed Case Files
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ScenarioBrowser;