import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Test: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Test Page</h1>
          <p className="text-xl text-gray-600 mb-8">
            If you can see this page, the routing is working correctly!
          </p>
          <div className="bg-indigo-100 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">CourtCraft Application</h2>
            <p className="text-indigo-700">
              This is a test page to verify that the application routing is working properly.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Scenario Simulation Test</h2>
            <p className="text-purple-700 mb-6">
              Test the new legal scenario simulation with detailed case files.
            </p>
            <Link to="/scenario-simulation">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-pink-600 hover:to-purple-700 transition duration-300">
                Launch Scenario Simulation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Test;