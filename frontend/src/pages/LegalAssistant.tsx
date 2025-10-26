import React from 'react';
import Layout from '../components/Layout';
import LegalAssistantComponent from '../components/LegalAssistant';

const LegalAssistant: React.FC = () => {
  return (
    <Layout>
      <div className="h-[calc(100vh-140px)]">
        <LegalAssistantComponent />
      </div>
    </Layout>
  );
};

export default LegalAssistant;