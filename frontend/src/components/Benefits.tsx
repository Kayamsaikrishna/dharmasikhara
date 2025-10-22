import React from 'react';

const Benefits: React.FC = () => {
  const benefits = [
    {
      title: "Law Students",
      description: "Gain practical courtroom experience before entering the real legal world. Build confidence and competence through immersive simulations."
    },
    {
      title: "Junior Lawyers",
      description: "Sharpen your advocacy skills and prepare for complex cases with realistic scenarios designed by legal experts."
    },
    {
      title: "Legal Educators",
      description: "Enhance your curriculum with cutting-edge technology that engages students and provides measurable learning outcomes."
    },
    {
      title: "Law Firms",
      description: "Train your associates more effectively with cost-efficient, scalable simulations that develop real-world skills."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Who Benefits From DHARMASIKHARA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            DHARMASIKHARA serves the entire legal ecosystem, from students taking their first steps in law to established professionals seeking continuous improvement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100 hover:shadow-xl transition duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;