import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Benefits from '../components/Benefits';
import Team from '../components/Team';

const Home: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <Benefits />
      <Team />
    </Layout>
  );
};

export default Home;