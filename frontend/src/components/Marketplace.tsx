import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Download, ShoppingCart, Upload, TrendingUp, Award, User, Crown, Zap, Gift, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    _id: string;
  };
  isFree?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  points: number;
  duration: string;
  benefits: string[];
  popular?: boolean;
}

const Marketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'subscription'>('scenarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedAccessType, setSelectedAccessType] = useState('All Types');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law', 'Constitutional Law', 'Tax Law', 'Intellectual Property'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Fetch scenarios from backend
  useEffect(() => {
    // Disabled scenario fetching as per requirements
    setLoading(false);
    setScenarios([]);
  }, []);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 499,
      points: 5000,
      duration: "1 month",
      benefits: [
        "Access to 20+ scenarios",
        "Weekly new releases",
        "10% discount on individual purchases",
        "Basic performance analytics"
      ]
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 899,
      points: 10000,
      duration: "1 month",
      benefits: [
        "Access to all scenarios",
        "Weekly new releases",
        "20% discount on individual purchases",
        "Advanced performance analytics",
        "Priority customer support"
      ],
      popular: true
    },
    {
      id: "elite",
      name: "Elite Plan",
      price: 1499,
      points: 18000,
      duration: "1 month",
      benefits: [
        "Access to all scenarios",
        "Weekly new releases",
        "30% discount on individual purchases",
        "Advanced performance analytics",
        "Priority customer support",
        "Exclusive early access to new features",
        "Personalized scenario recommendations"
      ]
    }
  ];

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scenario.creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scenario.practiceArea === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || scenario.difficulty === selectedDifficulty;
    
    // Apply access type filter
    let matchesAccessType = true;
    if (selectedAccessType === 'Free Only') {
      matchesAccessType = scenario.isFree === true;
    } else if (selectedAccessType === 'Premium Only') {
      matchesAccessType = scenario.isFree !== true;
    }
    
    // Apply price range filter
    let matchesPriceRange = true;
    if (selectedPriceRange !== 'All Prices') {
      if (selectedPriceRange === 'Under ₹100') {
        matchesPriceRange = scenario.price < 100;
      } else if (selectedPriceRange === '₹100 - ₹200') {
        matchesPriceRange = scenario.price >= 100 && scenario.price <= 200;
      } else if (selectedPriceRange === '₹200 - ₹300') {
        matchesPriceRange = scenario.price >= 200 && scenario.price <= 300;
      } else if (selectedPriceRange === 'Above ₹300') {
        matchesPriceRange = scenario.price > 300;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesAccessType && matchesPriceRange;
  });

  const sortedScenarios = [...filteredScenarios].sort((a, b) => {
    if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  const freeScenarios = scenarios.filter(s => s.isFree);
  const paidScenarios = scenarios.filter(s => !s.isFree);

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
          <p className="text-gray-600">Loading marketplace...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Marketplace</h3>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Marketplace</h1>
        <p className="text-gray-600">Discover and unlock premium legal scenarios with bonus points</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`pb-3 px-6 font-medium ${activeTab === 'scenarios' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('scenarios')}
        >
          <ShoppingCart className="w-5 h-5 inline mr-2" />
          Scenarios
        </button>
        <button
          className={`pb-3 px-6 font-medium ${activeTab === 'subscription' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('subscription')}
        >
          <Crown className="w-5 h-5 inline mr-2" />
          Subscription Plans
        </button>
      </div>

      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div>
          {/* Free Scenarios Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Free Scenarios</h2>
              <span className="ml-3 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {freeScenarios.length} scenarios
              </span>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-600">New legal scenarios coming soon! Check back for updates.</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search scenarios or creators..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Points: Low to High</option>
                  <option value="price-high">Points: High to Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                  value={selectedAccessType}
                  onChange={(e) => setSelectedAccessType(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  <option value="Free Only">Free Only</option>
                  <option value="Premium Only">Premium Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                >
                  <option value="All Prices">All Prices</option>
                  <option value="Under ₹100">Under ₹100</option>
                  <option value="₹100 - ₹200">₹100 - ₹200</option>
                  <option value="₹200 - ₹300">₹200 - ₹300</option>
                  <option value="Above ₹300">Above ₹300</option>
                </select>
              </div>
            </div>
          </div>

          {/* Premium Scenario Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Scenarios</h2>
            <div className="text-center py-8">
              <p className="text-gray-600">Premium legal scenarios coming soon! Check back for updates.</p>
            </div>
          </div>

          {sortedScenarios.filter(s => !s.isFree).length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">New Premium Scenarios Coming Soon</h3>
              <p className="text-gray-600">We're working on creating new premium legal scenarios for you. Check back soon for updates!</p>
            </div>
          )}
        </div>
      )}

      {/* Subscription Plans Tab */}
      {activeTab === 'subscription' && (
        <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Plans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose a subscription plan to unlock unlimited access to premium scenarios, exclusive benefits, and bonus points for multiplayer wins.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map(plan => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold px-4 py-2 text-center">
                    MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-500">/{plan.duration}</span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="bg-indigo-50 rounded-lg p-4 text-center mb-4">
                      <div className="text-2xl font-bold text-indigo-600">{plan.points.toLocaleString()} <span className="text-sm">bonus points</span></div>
                      <p className="text-sm text-gray-600">Included with subscription</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className={`w-full py-3 rounded-lg font-medium transition duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Own Scenarios</h3>
              <p className="text-gray-600 mb-6">
                Design custom legal scenarios tailored to your specific practice areas or learning objectives
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Customize Content</h4>
                  <p className="text-gray-600 text-sm">Create scenarios for specific legal issues or practice areas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Add Sections</h4>
                  <p className="text-gray-600 text-sm">Structure your scenario with multiple phases and time limits</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Premium Feature</h4>
                  <p className="text-gray-600 text-sm">1000 points for 5 custom scenarios per month</p>
                </div>
              </div>
              <Link to="/create-scenario">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-medium">
                  Create Custom Scenario
                </button>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Design Your Scenario</h4>
                  <p className="text-gray-600 text-sm">Use our intuitive editor to create custom legal scenarios with multiple sections.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Set Parameters</h4>
                  <p className="text-gray-600 text-sm">Define difficulty, duration, participants, and learning objectives.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Practice & Improve</h4>
                  <p className="text-gray-600 text-sm">Use your custom scenarios to practice and track your progress.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/cart" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition duration-300 font-medium">
              <ShoppingCart className="w-5 h-5 mr-2" />
              View Cart (3 items)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;