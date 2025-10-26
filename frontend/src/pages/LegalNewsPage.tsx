import React from 'react';
import LegalNews from '../components/LegalNews';
import Layout from '../components/Layout';

const LegalNewsPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <LegalNews />
      </div>
    </Layout>
  );
};

export default LegalNewsPage;