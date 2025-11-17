import React from 'react';
import { BookOpen, Users, Zap, Award, Plus, FileText, Newspaper } from 'lucide-react'; // Added Newspaper icon
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
      title: "Realistic Legal Scenarios",
      description: "DHARMASIKHARA provides immersive, real-world legal scenarios that mirror actual courtroom experiences, helping you develop practical skills."
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Multiplayer Simulations",
      description: "Practice with peers from around the world in collaborative legal simulations that enhance your teamwork and advocacy skills."
    },
    {
      icon: <Zap className="w-8 h-8 text-indigo-600" />,
      title: "Instant AI Feedback",
      description: "Receive immediate, detailed feedback from our advanced AI legal experts to accelerate your learning and improvement."
    },
    {
      icon: <Award className="w-8 h-8 text-indigo-600" />,
      title: "Performance Analytics",
      description: "Track your progress with comprehensive analytics and personalized insights to identify strengths and areas for improvement."
    },
    {
      icon: <FileText className="w-8 h-8 text-indigo-600" />,
      title: "Legal Document Analysis",
      description: "AI-powered analysis of legal documents to identify key terms, summarize content, and classify document types.",
      link: "/legal-analysis" // Added link
    },

  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why DHARMASIKHARA Stands Apart
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            DHARMASIKHARA bridges the gap between legal theory and practice by offering an immersive simulation environment where learners can experience realistic courtroom scenarios without real-world consequences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-white p-8 rounded-xl shadow-lg border border-indigo-100 hover:shadow-xl transition duration-300 transform hover:-translate-y-2 ${
                feature.link ? 'cursor-pointer' : ''
              }`}
              onClick={() => feature.link && (window.location.href = feature.link)}
            >
              <div className="mb-4 w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              {feature.link && (
                <div className="mt-4">
                  <Link to={feature.link} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                    Try now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;