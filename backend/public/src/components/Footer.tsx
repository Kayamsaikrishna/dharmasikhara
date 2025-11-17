import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img 
                  src="/logo.jpg" 
                  alt="DHARMASIKHARA Logo" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  DHARMASIKHARA
                </h2>
                <p className="text-xs text-gray-400 italic">Master the Law, Embrace Justice</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Immersive Legal Practice Simulator transforming legal education through cutting-edge technology.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Use Cases</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Tutorials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Partners</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            &copy; 2025 DHARMASIKHARA. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition duration-300 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300 text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;