import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Master Legal Skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">DHARMASIKHARA</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              DHARMASIKHARA revolutionizes how law students and junior lawyers master courtroom skills with our cutting-edge virtual legal practice platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/scenarios">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 font-bold text-lg shadow-lg transform hover:scale-105 transition-transform">
                  Explore Scenarios
                </button>
              </Link>
              <Link to="/about">
                <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition duration-300 font-bold text-lg shadow-md">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-72 h-72 md:w-88 md:h-88 bg-white rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <img 
                      src="/logo.jpg" 
                      alt="DHARMASIKHARA Logo" 
                      className="w-48 h-48 md:w-60 md:h-60 object-contain rounded-full"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-lg shadow-lg transform rotate-3 animate-bounce">
                <p className="text-indigo-600 font-bold">Immersive Learning</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-lg shadow-lg transform -rotate-3 animate-bounce delay-100">
                <p className="text-purple-600 font-bold">Real Cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;