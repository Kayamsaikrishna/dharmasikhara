import React from 'react';
import Layout from '../components/Layout';

const About: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About DHARMASIKHARA</h1>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <p className="text-gray-600 text-lg mb-6">
                DHARMASIKHARA is on a mission to transform legal education by providing law students and junior lawyers 
                with unlimited access to realistic legal practice scenarios. Our platform bridges the critical gap between 
                theoretical knowledge and practical skills that exists in traditional legal education.
              </p>
              
              <p className="text-gray-600 text-lg mb-6">
                Founded by legal experts and technologists, we believe that mastering the law requires more than just 
                memorizing statutes and case precedents. It requires hands-on experience, critical thinking, and the 
                ability to apply legal principles in real-world situations.
              </p>
              
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-lg">
                  To create a world where every legal professional has access to high-quality, practical training that 
                  prepares them for the challenges of real-world legal practice.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Approach</h3>
                <p className="text-gray-600">
                  We combine cutting-edge simulation technology with deep legal expertise to create immersive learning 
                  experiences that mirror real courtroom scenarios. Our AI-powered feedback system provides personalized 
                  guidance to accelerate your learning journey.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Impact</h3>
                <p className="text-gray-600">
                  Since our inception, we've helped thousands of law students and junior lawyers develop critical 
                  practical skills that have enhanced their confidence and competence in real legal practice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;