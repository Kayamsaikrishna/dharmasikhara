import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col h-full">
      <Navbar />
      <main className="flex-grow h-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;