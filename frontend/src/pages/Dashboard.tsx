import React from 'react';
import Layout from '../components/Layout';
import PerformanceDashboard from '../components/PerformanceDashboard';
// ContractorDashboard removed as per requirements
import { useUser } from '../contexts/UserContext';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  
  return (
    <Layout>
      <PerformanceDashboard />
    </Layout>
  );
};

export default Dashboard;