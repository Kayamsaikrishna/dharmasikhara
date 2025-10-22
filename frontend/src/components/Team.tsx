import React from 'react';
import { Link } from 'react-router-dom';

const Team: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Team Behind DHARMASIKHARA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            DHARMASIKHARA is built by a diverse team of legal experts, educators, and technologists.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 mb-8 md:mb-0 flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center">
                  <img 
                    src="/logo.jpg" 
                    alt="DHARMASIKHARA Logo" 
                    className="w-36 h-36 object-contain rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="md:w-2/3 md:pl-12 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Be the First to Experience DHARMASIKHARA</h3>
              <p className="text-gray-600 mb-6">
                Join our exclusive beta program and help shape the future of legal education. Get early access to new features and scenarios while contributing to the development of this revolutionary platform.
              </p>
              <Link to="/contact">
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-bold">
                  Join Beta Program
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;