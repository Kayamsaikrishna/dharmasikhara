import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Benefits from '../components/Benefits';
import Team from '../components/Team';
import LegalNewsFeed from '../components/LegalNewsFeed';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="absolute top-4 right-4 z-10">
        <Link to="/test-animation" className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
          Test Animation
        </Link>
      </div>
      <div className="overflow-y-auto">
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Features />
            </div>
            <div>
              <LegalNewsFeed />
            </div>
          </div>
        </div>
        <Benefits />
        <Team />
      </div>
    </Layout>
  );
};

export default Home;