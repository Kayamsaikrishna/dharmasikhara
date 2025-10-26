const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dharmasikhara', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample scenarios data
const sampleScenarios = [
  {
    title: "Cross-Examination of a Hostile Witness",
    description: "Practice techniques for handling uncooperative witnesses in a criminal trial setting.",
    practiceArea: "Criminal Law",
    difficulty: "Intermediate",
    estimatedTime: 45,
    learningObjectives: [
      "Develop strategies for questioning hostile witnesses",
      "Learn to maintain composure under pressure",
      "Master techniques for impeaching witness credibility"
    ],
    content: {
      introduction: "You are representing the prosecution in a criminal case where the defendant is accused of assault. The key witness for the defense is known to be hostile and may not be truthful. Your task is to effectively cross-examine this witness to challenge their testimony."
    },
    price: 0,
    tags: ["cross-examination", "criminal", "witness", "hostile"],
    status: "published"
  },
  {
    title: "Drafting a Commercial Contract",
    description: "Create a comprehensive contract for a software licensing agreement with multiple clauses.",
    practiceArea: "Corporate Law",
    difficulty: "Advanced",
    estimatedTime: 90,
    learningObjectives: [
      "Understand key contract terms and conditions",
      "Draft clear and enforceable clauses",
      "Identify potential legal risks and mitigation strategies"
    ],
    content: {
      introduction: "You are representing a software company that has developed a new project management tool. The company wants to license this software to a large corporation. Your task is to draft a comprehensive licensing agreement that protects your client's interests while meeting the corporation's needs."
    },
    price: 1500,
    tags: ["contract", "corporate", "licensing", "software"],
    status: "published"
  },
  {
    title: "Family Mediation Session",
    description: "Facilitate a divorce mediation between parties with conflicting interests and emotional tensions.",
    practiceArea: "Family Law",
    difficulty: "Intermediate",
    estimatedTime: 60,
    learningObjectives: [
      "Develop mediation skills for emotional situations",
      "Learn to manage conflicting interests",
      "Practice effective communication techniques"
    ],
    content: {
      introduction: "You are a family law attorney acting as a mediator in a divorce case. The couple has two children and significant assets. Emotions are running high, and both parties have strong positions. Your task is to facilitate a productive discussion that leads to an agreement."
    },
    price: 1200,
    tags: ["mediation", "family", "divorce", "children"],
    status: "published"
  },
  {
    title: "Constitutional Writ Petition",
    description: "Prepare and argue a writ petition challenging a government policy on constitutional grounds.",
    practiceArea: "Constitutional Law",
    difficulty: "Expert",
    estimatedTime: 120,
    learningObjectives: [
      "Understand constitutional principles and judicial review",
      "Develop arguments for fundamental rights violations",
      "Master legal research and precedent analysis"
    ],
    content: {
      introduction: "You are representing a civil liberties organization challenging a new government surveillance policy that they claim violates citizens' right to privacy under the constitution. Your task is to prepare and argue a writ petition before the High Court."
    },
    price: 2500,
    tags: ["constitutional", "writ", "petition", "privacy"],
    status: "published"
  },
  {
    title: "Client Consultation for Personal Injury",
    description: "Conduct an initial consultation with a client who has suffered workplace injuries.",
    practiceArea: "Civil Law",
    difficulty: "Beginner",
    estimatedTime: 30,
    learningObjectives: [
      "Learn client interviewing techniques",
      "Identify key facts and legal issues",
      "Explain legal process and client expectations"
    ],
    content: {
      introduction: "You are a junior associate at a personal injury law firm. A potential client has scheduled an initial consultation after suffering injuries in a workplace accident. Your task is to conduct the consultation, gather relevant information, and assess the viability of the case."
    },
    price: 0,
    tags: ["consultation", "personal injury", "workplace", "client"],
    status: "published"
  },
  {
    title: "Bail Application Hearing",
    description: "Represent a defendant seeking anticipatory bail in a complex criminal matter.",
    practiceArea: "Criminal Law",
    difficulty: "Intermediate",
    estimatedTime: 45,
    learningObjectives: [
      "Understand bail laws and legal principles",
      "Develop arguments for bail applications",
      "Practice courtroom advocacy skills"
    ],
    content: {
      introduction: "You are representing a defendant accused of financial fraud who is seeking anticipatory bail before arrest. The prosecution opposes the application, arguing that the defendant may flee or tamper with evidence. Your task is to present arguments supporting the grant of bail."
    },
    price: 1000,
    tags: ["bail", "criminal", "hearing", "application"],
    status: "published"
  }
];

async function seedScenarios() {
  try {
    // Clear existing scenarios
    await Scenario.deleteMany({});
    
    // Create a sample user if none exists
    let user = await User.findOne({ email: 'sample@dharmasikhara.com' });
    if (!user) {
      user = new User({
        username: 'sample_user',
        email: 'sample@dharmasikhara.com',
        password: 'samplepassword',
        role: 'contractor'
      });
      await user.save();
    }
    
    // Add creator to each scenario
    const scenariosWithCreator = sampleScenarios.map(scenario => ({
      ...scenario,
      creator: user._id,
      rating: Math.random() * 2 + 3, // Random rating between 3-5
      reviewCount: Math.floor(Math.random() * 100) + 10 // Random reviews between 10-110
    }));
    
    // Insert scenarios
    await Scenario.insertMany(scenariosWithCreator);
    
    console.log('Sample scenarios seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding scenarios:', error);
    process.exit(1);
  }
}

seedScenarios();