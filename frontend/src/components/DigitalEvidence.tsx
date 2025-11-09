import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserProgress } from '../utils/progressApi';

const DigitalEvidence: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'gallery' | 'summary' | 'analysis'>('gallery');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'cctv' | 'documents' | 'personal' | 'financial' | 'evidence' | 'analysis'>('all');

  // Update progress when component mounts
  useEffect(() => {
    // Save progress using the unified progress API
    const progressData = {
      completedStages: ['client-interview', 'digital-evidence'],
      currentStage: 'bail-draft',
      lastUpdated: new Date().toISOString(),
      totalTimeSpent: 0,
      assessmentScore: null
    };
    
    saveUserProgress('the-inventory-that-changed-everything', progressData)
      .then(() => {
        console.log('Progress saved successfully');
      })
      .catch((error) => {
        console.error('Failed to save progress:', error);
      });
  }, []);

  // Evidence data with proper paths
  const evidenceItems = [
    { id: 1, name: 'BBMP Property Tax', description: 'Property tax document showing ownership details', fileName: 'BBMP Property tax.png', category: 'documents', type: 'image' },
    { id: 2, name: 'CCTV Footage 3', description: 'Security camera footage from warehouse entrance', fileName: 'CCTV Photage 3.png', category: 'cctv', type: 'image' },
    { id: 3, name: 'CCTV Footage', description: 'Primary security camera recording', fileName: 'CCTV Photage.png', category: 'cctv', type: 'image' },
    { id: 4, name: 'Character Certificate', description: 'Character reference for suspect', fileName: 'Character Certificate.png', category: 'personal', type: 'image' },
    { id: 5, name: 'Rajesh Employee ID', description: 'Official employee identification card', fileName: 'Rajesh employee id.png', category: 'personal', type: 'image' },
    { id: 6, name: 'Witness Statement', description: 'Police recorded witness testimony', fileName: 'Witness Statement at police station.png', category: 'personal', type: 'image' },
    { id: 7, name: 'Arun Surity', description: 'Surety bond document', fileName: 'arun surity.png', category: 'personal', type: 'image' },
    { id: 8, name: 'Bank Account Holder Certificate', description: 'Certificate of bank account ownership', fileName: 'bank account holder certificate.png', category: 'financial', type: 'image' },
    { id: 9, name: 'Bank Account Statement', description: 'Monthly bank transaction records', fileName: 'bank account statement.png', category: 'financial', type: 'image' },
    { id: 10, name: 'Birth Certificate', description: 'Official birth documentation', fileName: 'birth certificate.png', category: 'personal', type: 'image' },
    { id: 11, name: 'CCTV Footage 2', description: 'Secondary security camera recording', fileName: 'cctv photage 2.png', category: 'cctv', type: 'image' },
    { id: 12, name: 'CCTV Footage 4', description: 'Additional security camera footage', fileName: 'cctv photage 4.png', category: 'cctv', type: 'image' },
    { id: 13, name: 'Charger and Adapter', description: 'Image of electronic accessories', fileName: 'charger and adapter.png', category: 'evidence', type: 'image' },
    { id: 14, name: 'Dell Bill', description: 'Purchase receipt for laptop', fileName: 'dell bill.png', category: 'financial', type: 'image' },
    { id: 15, name: 'Dell Service', description: 'Service records for laptop', fileName: 'dell service.png', category: 'financial', type: 'image' },
    { id: 16, name: 'Electric Bill', description: 'Utility bill for residence', fileName: 'electric bill.png', category: 'financial', type: 'image' },
    { id: 17, name: 'Family Picture', description: 'Family photograph for reference', fileName: 'family pic.png', category: 'personal', type: 'image' },
    { id: 18, name: 'Family Picture 2', description: 'Additional family photograph', fileName: 'familypic 2.png', category: 'personal', type: 'image' },
    { id: 19, name: 'First Information Report', description: 'Official police complaint document', fileName: 'first information report.png', category: 'documents', type: 'image' },
    { id: 20, name: 'Forensic Comparison Test', description: 'Laboratory analysis results', fileName: 'forensic comparision test.png', category: 'analysis', type: 'image' },
    { id: 21, name: 'Judicial Magistrate', description: 'Court filing documents', fileName: 'judicial madigrate.png', category: 'documents', type: 'image' },
    { id: 22, name: 'Laptop Model Name', description: 'Identification of laptop model', fileName: 'laptop model name.png', category: 'evidence', type: 'image' },
    { id: 23, name: 'Laptop Picture', description: 'Visual documentation of laptop', fileName: 'laptop pic.png', category: 'evidence', type: 'image' },
    { id: 24, name: 'Laptop Size', description: 'Physical dimensions of laptop', fileName: 'laptop size.png', category: 'evidence', type: 'image' },
    { id: 25, name: 'Monthly Inventory Audit', description: 'Vijay Electronics inventory records', fileName: 'monthly inventory audit of vijay electroics.png', category: 'financial', type: 'image' },
    { id: 26, name: 'Passport', description: 'Travel document for identification', fileName: 'passport.png', category: 'personal', type: 'image' },
    { id: 27, name: 'Pay Slip', description: 'Employee salary documentation', fileName: 'pay slip.png', category: 'financial', type: 'image' },
    { id: 28, name: 'Position Offer', description: 'Job offer letter for Rajesh', fileName: 'position offer for rajesh.png', category: 'personal', type: 'image' },
    { id: 29, name: 'Property Tax', description: 'Tax documentation for property', fileName: 'property tax.png', category: 'financial', type: 'image' },
    { id: 30, name: 'Rajesh Aadhar', description: 'Indian national identification', fileName: 'rajesh aadhar.png', category: 'personal', type: 'image' },
    { id: 31, name: 'Rajesh PAN Card', description: 'Tax identification document', fileName: 'rajesh pan card.png', category: 'financial', type: 'image' },
    { id: 32, name: 'Rajesh Wife Aadhar', description: 'Spouse identification document', fileName: 'rajesh wife aadhar card.png', category: 'personal', type: 'image' },
    { id: 33, name: 'Salesman Letter', description: 'Letter from sales personnel', fileName: 'sales man letter.png', category: 'documents', type: 'image' },
    { id: 34, name: 'Seizure Memo', description: 'Official property seizure documentation', fileName: 'seizure memo.png', category: 'documents', type: 'image' },
    { id: 35, name: 'System Data', description: 'Computer system information', fileName: 'system data.png', category: 'evidence', type: 'image' },
    { id: 36, name: 'Timeline of Events', description: 'Chronological sequence of incident', fileName: 'timeline of events.png', category: 'analysis', type: 'image' },
    { id: 37, name: 'Vijay Electronics', description: 'Business identification document', fileName: 'vijay electronics.png', category: 'financial', type: 'image' },
  ];

  // Filter evidence based on search term and category
  const filteredEvidence = evidenceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  // Summary data
  const summaryData = {
    totalItems: evidenceItems.length,
    byCategory: {
      cctv: evidenceItems.filter(e => e.category === 'cctv').length,
      documents: evidenceItems.filter(e => e.category === 'documents').length,
      personal: evidenceItems.filter(e => e.category === 'personal').length,
      financial: evidenceItems.filter(e => e.category === 'financial').length,
      evidence: evidenceItems.filter(e => e.category === 'evidence').length,
      analysis: evidenceItems.filter(e => e.category === 'analysis').length
    },
    keyFindings: [
      "Multiple CCTV recordings available for timeline reconstruction",
      "Financial documents suggest possible motive",
      "Personal identification documents verify suspect identity",
      "Physical evidence supports digital timeline"
    ]
  };

  const getCategoryName = (category: string) => {
    switch(category) {
      case 'cctv': return 'CCTV Footage';
      case 'documents': return 'Legal Documents';
      case 'personal': return 'Personal ID';
      case 'financial': return 'Financial Records';
      case 'evidence': return 'Physical Evidence';
      case 'analysis': return 'Analysis Results';
      default: return 'Uncategorized';
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'cctv': return 'bg-blue-500';
      case 'documents': return 'bg-indigo-500';
      case 'personal': return 'bg-pink-500';
      case 'financial': return 'bg-yellow-500';
      case 'evidence': return 'bg-amber-500';
      case 'analysis': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const closePhotoViewer = () => {
    setSelectedPhoto(null);
  };

  // Function to get image path - using the correct API endpoint with full backend URL
  const getImagePath = (fileName: string) => {
    // Use the evidence controller endpoint which properly handles filenames
    // Use full backend URL instead of relative path
    const backendUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return `${backendUrl}/api/evidence/images/${encodeURIComponent(fileName)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white">
      {/* Header with Navigation */}
      <header className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/client-interview')}
                className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Interview
              </button>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-amber-400">Digital Evidence Analysis</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                </svg>
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Digital Evidence Review</h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Examine and analyze all digital evidence collected during the investigation. 
            Use filters and search to find specific items.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-indigo-700 mb-8">
          <div className="border-b border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'gallery'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <svg className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 0h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Evidence Gallery
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <svg className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Summary
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'analysis'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <svg className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                AI Analysis
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <div>
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div className="w-full md:w-auto">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search evidence..."
                        className="w-full md:w-80 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <svg className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <select 
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                    >
                      <option value="all">All Categories</option>
                      <option value="cctv">CCTV Footage</option>
                      <option value="documents">Legal Documents</option>
                      <option value="personal">Personal ID</option>
                      <option value="financial">Financial Records</option>
                      <option value="evidence">Physical Evidence</option>
                      <option value="analysis">Analysis Results</option>
                    </select>
                    
                    <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                      <button 
                        className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-amber-600' : 'bg-gray-700'}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button 
                        className={`px-3 py-2 ${viewMode === 'list' ? 'bg-amber-600' : 'bg-gray-700'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Evidence Items */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvidence.map(item => (
                      <div 
                        key={item.id} 
                        className="bg-gray-700 bg-opacity-50 rounded-xl border border-gray-600 hover:border-amber-500 transition-all cursor-pointer overflow-hidden"
                        onClick={() => setSelectedPhoto(item)}
                      >
                        <div className="aspect-video bg-gray-600 flex items-center justify-center">
                          <img 
                            src={getImagePath(item.fileName)} 
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.parentElement!.innerHTML = `
                                <div class="text-center">
                                  <svg class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 0h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p class="text-gray-400 text-sm mt-2">${item.fileName}</p>
                                </div>
                              `;
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-white truncate">{item.name}</h3>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)} text-white`}>
                              {getCategoryName(item.category)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-400">ID: EV-{item.id.toString().padStart(3, '0')}</span>
                            <button className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded transition-colors">
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvidence.map(item => (
                      <div 
                        key={item.id} 
                        className="bg-gray-700 bg-opacity-50 rounded-xl border border-gray-600 hover:border-amber-500 transition-all cursor-pointer p-4 flex"
                        onClick={() => setSelectedPhoto(item)}
                      >
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                          <img 
                            src={getImagePath(item.fileName)} 
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.parentElement!.innerHTML = `
                                <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 0h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              `;
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-white">{item.name}</h3>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)} text-white`}>
                              {getCategoryName(item.category)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">ID: EV-{item.id.toString().padStart(3, '0')}</span>
                            <button className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Photo Viewer Modal */}
                {selectedPhoto && (
                  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-6xl max-h-full w-full">
                      <button 
                        className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-gray-700 z-10"
                        onClick={closePhotoViewer}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      <div className="bg-gray-800 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-center bg-gray-900 p-8 min-h-[50vh]">
                          <img 
                            src={getImagePath(selectedPhoto.fileName)} 
                            alt={selectedPhoto.name}
                            className="max-h-[70vh] max-w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.parentElement!.innerHTML = `
                                <div class="text-center">
                                  <svg class="h-24 w-24 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 0h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p class="mt-4 text-xl text-gray-300">${selectedPhoto.name}</p>
                                  <p class="text-gray-500 mt-2">${selectedPhoto.fileName}</p>
                                  <p class="text-gray-400 mt-4 max-w-2xl mx-auto">${selectedPhoto.description}</p>
                                </div>
                              `;
                            }}
                          />
                        </div>
                        
                        <div className="p-6">
                          <div className="flex flex-wrap items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-amber-400">{selectedPhoto.name}</h2>
                            <span className={`px-3 py-1 rounded-full ${getCategoryColor(selectedPhoto.category)} text-white`}>
                              {getCategoryName(selectedPhoto.category)}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-6">{selectedPhoto.description}</p>
                          
                          <div className="flex flex-wrap gap-3">
                            <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium transition-colors flex items-center">
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Add to Report
                            </button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center">
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              Analyze with AI
                            </button>
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center">
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">{summaryData.totalItems}</div>
                    <div className="text-blue-200">Total Evidence Items</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">{summaryData.byCategory.documents}</div>
                    <div className="text-indigo-200">Legal Documents</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">{summaryData.byCategory.evidence}</div>
                    <div className="text-amber-200">Physical Evidence</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">{summaryData.byCategory.analysis}</div>
                    <div className="text-purple-200">Analysis Reports</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-amber-400">Key Findings</h3>
                    <ul className="space-y-3">
                      {summaryData.keyFindings.map((finding, index) => (
                        <li key={index} className="flex items-start">
                          <div className="text-amber-400 mr-3 mt-1">•</div>
                          <span className="text-gray-200">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-blue-400">Evidence Distribution</h3>
                    <div className="space-y-4">
                      {Object.entries(summaryData.byCategory).map(([category, count]) => (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-200">{getCategoryName(category)}</span>
                            <span className="text-gray-400">{count} items</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getCategoryColor(category)}`} 
                              style={{ width: `${(count / summaryData.totalItems) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div>
                <div className="bg-gray-700 bg-opacity-50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4 text-amber-400">AI-Powered Evidence Analysis</h3>
                  <p className="text-gray-300 mb-4">
                    Our AI has analyzed all evidence and identified key patterns, inconsistencies, and potential leads.
                  </p>
                  <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium transition-colors">
                    Run Full Analysis
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-700 bg-opacity-50 rounded-xl p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-white">Timeline Inconsistencies</h4>
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">High Priority</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Discrepancies found between security logs and witness statements indicating possible evidence tampering.
                    </p>
                    <div className="flex gap-3">
                      <button className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors">
                        View Details
                      </button>
                      <button className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors">
                        Add to Report
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 bg-opacity-50 rounded-xl p-6 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-white">Access Control Issues</h4>
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">Medium Priority</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Multiple unauthorized access attempts detected outside normal working hours.
                    </p>
                    <div className="flex gap-3">
                      <button className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors">
                        View Details
                      </button>
                      <button className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors">
                        Add to Report
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 bg-opacity-50 rounded-xl p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-white">Digital Footprint Analysis</h4>
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Low Priority</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Computer activity logs show normal usage patterns with no suspicious activity.
                    </p>
                    <div className="flex gap-3">
                      <button className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors">
                        View Details
                      </button>
                      <button className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors">
                        Add to Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate('/client-interview')}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Interview
          </button>
          <button
            onClick={() => navigate('/bail-draft')}
            className="ml-4 px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Proceed to Bail Draft
          </button>

        </div>
      </main>
    </div>
  );
};

export default DigitalEvidence;