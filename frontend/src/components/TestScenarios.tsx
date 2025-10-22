import React, { useState, useEffect } from 'react';

const TestScenarios: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Disabled scenario fetching as per requirements
    setLoading(false);
    setScenarios([]);
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Test Scenarios</h1>
      <p className="mb-4">Number of scenarios: {scenarios.length}</p>
      
      <div className="text-center py-8">
        <p className="text-gray-600">Scenarios are temporarily unavailable. Please check back later.</p>
      </div>
    </div>
  );
};

export default TestScenarios;