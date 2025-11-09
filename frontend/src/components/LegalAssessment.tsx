import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserProgress } from '../utils/progressApi';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Award, Trophy, RotateCw } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'single-select' | 'multi-select' | 'text';
  options?: string[];
  correctAnswers?: string[] | number[];
  score: number;
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
  weight: number; // percentage of total score
}

const LegalAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, (string | number)[]>>({});

  // Assessment data
  const sections: Section[] = [
    {
      id: 'legal-knowledge',
      title: 'Legal Knowledge & Procedure',
      description: 'Test your understanding of criminal law procedures and bail applications',
      timeLimit: 15,
      weight: 20,
      questions: [
        {
          id: 'q1',
          text: 'According to Section 480 of BNSS, which of the following is NOT a valid ground for granting bail in a theft case?',
          type: 'single-select',
          options: [
            'The accused is unlikely to commit another offense while on bail',
            'The accused has a permanent residence and strong community ties',
            'The accused has no prior criminal record',
            'The complainant has agreed to withdraw the case'
          ],
          correctAnswers: [3], // Option D
          score: 5
        },
        {
          id: 'q2',
          text: 'In the scenario, the prosecution relied heavily on CCTV footage. Which evidentiary principle should you invoke to challenge video evidence?',
          type: 'single-select',
          options: [
            'Best Evidence Rule',
            'Chain of Custody Requirements',
            'Hearsay Exclusion',
            'Both A and B'
          ],
          correctAnswers: [3], // Option D
          score: 5
        },
        {
          id: 'q3',
          text: 'Which of the following is a mandatory consideration for a magistrate when deciding a bail application under Section 480 BNSS?',
          type: 'single-select',
          options: [
            'The accused\'s financial status',
            'The nature and gravity of the accusation',
            'The accused\'s political connections',
            'The complainant\'s social standing'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q24',
          text: 'Under the new BNS, which section deals with causing death by negligence?',
          type: 'single-select',
          options: [
            'Section 106',
            'Section 107',
            'Section 108',
            'Section 109'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q25',
          text: 'Which of the following is a key feature of the Bharatiya Sakshya Adhiniyam regarding electronic evidence?',
          type: 'single-select',
          options: [
            'Electronic evidence is inadmissible in court',
            'Special provisions for digital and electronic evidence',
            'Electronic evidence requires special verification',
            'All electronic evidence is automatically admissible'
          ],
          correctAnswers: [1], // Option B
          score: 5
        }
      ]
    },
    {
      id: 'case-analysis',
      title: 'Case Analysis & Reasoning',
      description: 'Evaluate your ability to analyze evidence and identify inconsistencies',
      timeLimit: 20,
      weight: 30,
      questions: [
        {
          id: 'q4',
          text: 'Review this excerpt from your witness interview with the security guard: "I saw someone matching the accused\'s height leaving the office around 7 PM. The lights were dim, and I was about 30 feet away. I\'m 70% sure it was him." Which THREE factors undermine the reliability of this identification?',
          type: 'multi-select',
          options: [
            'Distance from the subject',
            'Poor lighting conditions',
            'Witness\'s expressed uncertainty (70% confidence)',
            'The witness was off-duty at the time',
            'Time of day (evening)',
            'Witness has a financial interest in the case'
          ],
          correctAnswers: [0, 1, 2], // Options A, B, C
          score: 10
        },
        {
          id: 'q5',
          text: 'Which of the following pieces of evidence would be MOST damaging to the prosecution\'s case if successfully challenged?',
          type: 'single-select',
          options: [
            'The complainant\'s testimony',
            'The CCTV footage showing someone resembling the accused',
            'The security guard\'s identification',
            'The recovered laptop with the accused\'s fingerprints'
          ],
          correctAnswers: [3], // Option D
          score: 10
        },
        {
          id: 'q26',
          text: 'In the context of the new BNSS, what is the maximum period for filing a chargesheet for summons cases?',
          type: 'single-select',
          options: [
            '30 days',
            '60 days',
            '90 days',
            '120 days'
          ],
          correctAnswers: [1], // Option B
          score: 10
        },
        {
          id: 'q27',
          text: 'Which of the following offenses was newly added in the Bharatiya Nyaya Sanhita (BNS) compared to IPC?',
          type: 'single-select',
          options: [
            'Murder',
            'Theft',
            'Organized crime',
            'Robbery'
          ],
          correctAnswers: [2], // Option C
          score: 10
        }
      ]
    },
    {
      id: 'ethical-judgment',
      title: 'Ethical Judgment',
      description: 'Assess your ethical decision-making in challenging legal situations',
      timeLimit: 15,
      weight: 25,
      questions: [
        {
          id: 'q6',
          text: 'During case preparation, your client mentions: "I know who actually took the laptop, but revealing it would get my colleague fired. Can we just blame the poor CCTV quality?" Rank these responses from MOST to LEAST appropriate:',
          type: 'text',
          score: 10
        },
        {
          id: 'q7',
          text: 'You discover that the complainant has a history of making false accusations. What is the most appropriate course of action?',
          type: 'single-select',
          options: [
            'Immediately inform the court about the complainant\'s history',
            'Use this information to discredit the complainant during cross-examination',
            'Ignore this information as it is not directly relevant to the current case',
            'Confront the complainant privately to encourage withdrawal of the case'
          ],
          correctAnswers: [1], // Option B
          score: 10
        },
        {
          id: 'q28',
          text: 'Under the new BNS, what is the punishment for organized crime?',
          type: 'single-select',
          options: [
            'Maximum 5 years imprisonment',
            'Maximum 10 years imprisonment',
            'Maximum 14 years imprisonment',
            'Maximum 20 years imprisonment'
          ],
          correctAnswers: [2], // Option C
          score: 10
        },
        {
          id: 'q29',
          text: 'Which of the following is a key principle of the new criminal laws (BNS, BNSS, BSA) regarding gender neutrality?',
          type: 'single-select',
          options: [
            'Only men can be accused of sexual offenses',
            'Laws now apply equally to all genders',
            'Only women are protected under new laws',
            'Gender-specific provisions have been removed'
          ],
          correctAnswers: [1], // Option B
          score: 10
        }
      ]
    },
    {
      id: 'argument-quality',
      title: 'Argument Quality Review',
      description: 'Evaluate your ability to construct and critique legal arguments',
      timeLimit: 15,
      weight: 25,
      questions: [
        {
          id: 'q8',
          text: 'Read this bail argument excerpt: "Your Honor, my client is innocent. The CCTV footage is unclear, and the police investigation was rushed. Many people have access to that room. Bail should be granted because the evidence is weak." Identify THREE specific weaknesses and rewrite the argument to address them.',
          type: 'text',
          score: 10
        },
        {
          id: 'q9',
          text: 'Which of the following is the strongest argument for granting bail in this case?',
          type: 'single-select',
          options: [
            'The accused has a stable job and family ties in the community',
            'The accused has never been convicted of a crime before',
            'The accused has a permanent address and is unlikely to flee',
            'All of the above are strong arguments'
          ],
          correctAnswers: [3], // Option D
          score: 10
        },
        {
          id: 'q10',
          text: 'What is the primary purpose of a bail hearing?',
          type: 'single-select',
          options: [
            'To determine the guilt or innocence of the accused',
            'To ensure the accused appears for trial and does not pose a threat to society',
            'To punish the accused for the alleged crime',
            'To provide an opportunity for the complainant to present evidence'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q11',
          text: 'Which of the following laws replaced the Indian Penal Code (IPC) in 2024?',
          type: 'single-select',
          options: [
            'Bharatiya Sakshya Adhiniyam (BSA)',
            'Bharatiya Nagarik Suraksha Sanhita (BNSS)',
            'Bharatiya Nyaya Sanhita (BNS)',
            'Bharatiya Adalat Adhiniyam (BAA)'
          ],
          correctAnswers: [2], // Option C
          score: 5
        },
        {
          id: 'q12',
          text: 'Under the new BNS, theft by snatching is classified as:',
          type: 'single-select',
          options: [
            'A separate offense from regular theft',
            'The same as regular theft',
            'A bailable offense regardless of value',
            'Not an offense under BNS'
          ],
          correctAnswers: [0], // Option A
          score: 5
        },
        {
          id: 'q13',
          text: 'Which section of BNSS replaced Section 437 of CrPC for bail provisions?',
          type: 'single-select',
          options: [
            'Section 475',
            'Section 480',
            'Section 485',
            'Section 490'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q14',
          text: 'Under BNS, which of the following offenses was removed compared to IPC?',
          type: 'single-select',
          options: [
            'Theft',
            'Adultery',
            'Murder',
            'Robbery'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q15',
          text: 'Which law replaced the Indian Evidence Act in 2024?',
          type: 'single-select',
          options: [
            'Bharatiya Nyaya Sanhita',
            'Bharatiya Nagarik Suraksha Sanhita',
            'Bharatiya Sakshya Adhiniyam',
            'Bharatiya Adalat Adhiniyam'
          ],
          correctAnswers: [2], // Option C
          score: 5
        },
        {
          id: 'q16',
          text: 'Under BNSS, what special consideration is given for bail applications?',
          type: 'single-select',
          options: [
            'Special consideration for government employees',
            'Special consideration for women, children, and disabled persons',
            'Special consideration for first-time offenders only',
            'No special considerations'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q17',
          text: 'In the new BNS, theft is covered under which section?',
          type: 'single-select',
          options: [
            'Section 303(1)',
            'Section 379',
            'Section 380',
            'Section 305'
          ],
          correctAnswers: [0], // Option A
          score: 5
        },
        {
          id: 'q18',
          text: 'What is a key difference between CrPC and BNSS regarding bail for first-time offenders?',
          type: 'single-select',
          options: [
            'BNSS allows release after one-third of maximum period',
            'BNSS requires stricter conditions',
            'BNSS eliminates bail for first-time offenders',
            'No difference in provisions'
          ],
          correctAnswers: [0], // Option A
          score: 5
        },
        {
          id: 'q19',
          text: 'Which of the following is NOT a principle underlying the new criminal laws (BNS, BNSS, BSA)?',
          type: 'single-select',
          options: [
            'Decolonization of legal framework',
            'Citizen-centric approach',
            'Retention of colonial terminology',
            'Modernization of legal procedures'
          ],
          correctAnswers: [2], // Option C
          score: 5
        },
        {
          id: 'q20',
          text: 'Under the new BNSS, when did the bail provisions come into effect?',
          type: 'single-select',
          options: [
            'January 1, 2024',
            'July 1, 2024',
            'October 2, 2024',
            'January 26, 2024'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q21',
          text: 'Which of the following is a key feature of the Bharatiya Sakshya Adhiniyam (BSA) regarding digital evidence?',
          type: 'single-select',
          options: [
            'Excludes digital evidence from court proceedings',
            'Provides specific provisions for electronic evidence',
            'Treats digital evidence the same as physical evidence without distinction',
            'Requires all digital evidence to be verified by government agencies'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q22',
          text: 'In the Rajesh Kumar case, what would be the appropriate charge under the new BNS?',
          type: 'single-select',
          options: [
            'Section 303(1) - Theft',
            'Section 379 - Theft (same as IPC)',
            'Section 380 - Theft in dwelling house',
            'Section 420 - Cheating'
          ],
          correctAnswers: [0], // Option A
          score: 5
        },
        {
          id: 'q23',
          text: 'Under BNSS, what is the maximum period for which an undertrial can be detained without trial before being eligible for default bail?',
          type: 'single-select',
          options: [
            '60 days for summary trials, 90 days for sessions trials',
            'One-half of the maximum period of imprisonment for the offense',
            'Two-thirds of the maximum period of imprisonment for the offense',
            'There is no provision for default bail in BNSS'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q30',
          text: 'Which of the following is a key change in the definition of theft under BNS compared to IPC?',
          type: 'single-select',
          options: [
            'The value threshold for theft has been increased',
            'The definition now includes theft by snatching as a separate offense',
            'The punishment for theft has been reduced',
            'The definition of theft has been removed'
          ],
          correctAnswers: [1], // Option B
          score: 5
        },
        {
          id: 'q31',
          text: 'Under the new BNSS, what is the time limit for completing investigation in warrant cases?',
          type: 'single-select',
          options: [
            '30 days',
            '60 days',
            '90 days',
            '120 days'
          ],
          correctAnswers: [2], // Option C
          score: 5
        },
        {
          id: 'q32',
          text: 'Which of the following is a key feature of the new criminal laws regarding decolonization?',
          type: 'single-select',
          options: [
            'Retention of British legal terminology',
            'Use of Indian languages in legal proceedings',
            'Removal of colonial nomenclature and terminology',
            'Mandatory use of English in all proceedings'
          ],
          correctAnswers: [2], // Option C
          score: 5
        },
        {
          id: 'q33',
          text: 'What is the maximum punishment for the offense of organized crime under BNS?',
          type: 'single-select',
          options: [
            '5 years',
            '10 years',
            '14 years',
            'Life imprisonment'
          ],
          correctAnswers: [2], // Option C
          score: 5
        }
      ]
    }
  ];

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isCompleted) {
      // Time's up, move to next question or section
      handleNext();
    }
  }, [timeRemaining, isCompleted]);

  // Initialize timer when section changes
  useEffect(() => {
    if (!isCompleted) {
      setTimeRemaining(sections[currentSection].timeLimit * 60);
    }
  }, [currentSection, isCompleted]);

  const handleOptionSelect = (questionId: string, option: string | number) => {
    const question = sections[currentSection].questions.find(q => q.id === questionId);
    if (!question) return;

    if (question.type === 'single-select') {
      setSelectedOptions({
        ...selectedOptions,
        [questionId]: [option]
      });
    } else if (question.type === 'multi-select') {
      const currentSelections = selectedOptions[questionId] || [];
      if (currentSelections.includes(option)) {
        // Remove option
        setSelectedOptions({
          ...selectedOptions,
          [questionId]: currentSelections.filter(o => o !== option)
        });
      } else {
        // Add option
        setSelectedOptions({
          ...selectedOptions,
          [questionId]: [...currentSelections, option]
        });
      }
    }
  };

  const handleTextAnswer = (questionId: string, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    const currentSectionData = sections[currentSection];
    const totalQuestions = currentSectionData.questions.length;

    if (currentQuestion < totalQuestions - 1) {
      // Move to next question in same section
      setCurrentQuestion(currentQuestion + 1);
      // Reset timer for new question
      setTimeRemaining(currentSectionData.timeLimit * 60);
    } else if (currentSection < sections.length - 1) {
      // Move to next section
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
      // Timer will be reset by useEffect
    } else {
      // Assessment completed
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    let maxScore = 0;
    const sectionScores: Record<string, { score: number; max: number }> = {};

    sections.forEach(section => {
      let sectionScore = 0;
      let sectionMax = 0;

      section.questions.forEach(question => {
        sectionMax += question.score;
        maxScore += question.score;

        const userAnswer = userAnswers[question.id] || selectedOptions[question.id] || [];
        let isCorrect = false;

        if (question.type === 'single-select' && question.correctAnswers) {
          isCorrect = question.correctAnswers.includes(userAnswer[0] as never);
        } else if (question.type === 'multi-select' && question.correctAnswers) {
          isCorrect = JSON.stringify([...userAnswer].sort()) === JSON.stringify([...question.correctAnswers].sort());
        } else if (question.type === 'text') {
          // For text answers, we'll give partial credit (50% for now)
          isCorrect = userAnswer.length > 0;
        }

        if (isCorrect) {
          sectionScore += question.score;
          totalScore += question.score;
        }
      });

      sectionScores[section.id] = {
        score: sectionScore,
        max: sectionMax
      };
    });

    const percentage = Math.round((totalScore / maxScore) * 100);
    let performanceTier = '';
    let tierColor = '';

    if (percentage >= 90) {
      performanceTier = 'Exemplary Advocate';
      tierColor = 'text-yellow-400';
    } else if (percentage >= 80) {
      performanceTier = 'Proficient Advocate';
      tierColor = 'text-green-400';
    } else if (percentage >= 70) {
      performanceTier = 'Competent Advocate';
      tierColor = 'text-blue-400';
    } else if (percentage >= 60) {
      performanceTier = 'Developing Advocate';
      tierColor = 'text-amber-400';
    } else {
      performanceTier = 'Needs Improvement';
      tierColor = 'text-red-400';
    }

    const resultsData = {
      totalScore,
      maxScore,
      percentage,
      performanceTier,
      tierColor,
      sectionScores
    };

    setResults(resultsData);
    setIsCompleted(true);

    // Save to localStorage for immediate access
    localStorage.setItem('assessment_total_score', `${percentage}%`);
    localStorage.setItem('assessment_performance_tier', performanceTier);

    // Save progress with assessment results
    const progressData = {
      completedStages: ['bail-hearing', 'court-hearing', 'legal-assessment'],
      currentStage: 'completed',
      lastUpdated: new Date().toISOString(),
      totalTimeSpent: 0,
      assessmentScore: percentage
    };

    saveUserProgress('the-inventory-that-changed-everything', progressData)
      .then(() => {
        console.log('Assessment progress saved successfully');
      })
      .catch((error) => {
        console.error('Failed to save assessment progress:', error);
      });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAssessment = () => {
    setCurrentSection(0);
    setCurrentQuestion(0);
    setUserAnswers({});
    setSelectedOptions({});
    setIsCompleted(false);
    setResults(null);
    setTimeRemaining(sections[0].timeLimit * 60);
  };

  if (isCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Assessment Complete!</h1>
            <p className="text-xl text-indigo-200">Legal Competency Evaluation Results</p>
          </motion.div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20 mb-8">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-6">
                <Award className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-2">{results.percentage}%</h2>
              <p className={`text-2xl font-semibold ${results.tierColor} mb-2`}>{results.performanceTier}</p>
              <p className="text-indigo-200">
                You scored {results.totalScore} out of {results.maxScore} points
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {sections.map((section, idx) => {
                const sectionResult = results.sectionScores[section.id];
                const percentage = Math.round((sectionResult.score / sectionResult.max) * 100);
                let statusColor = '';
                let statusIcon = null;

                if (percentage >= 80) {
                  statusColor = 'text-green-400';
                  statusIcon = <CheckCircle className="w-5 h-5 text-green-400" />;
                } else if (percentage >= 70) {
                  statusColor = 'text-blue-400';
                  statusIcon = <CheckCircle className="w-5 h-5 text-blue-400" />;
                } else {
                  statusColor = 'text-red-400';
                  statusIcon = <XCircle className="w-5 h-5 text-red-400" />;
                }

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white bg-opacity-5 rounded-2xl p-6 border border-white border-opacity-10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white">{section.title}</h3>
                      {statusIcon}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{percentage}%</span>
                      <span className={`font-semibold ${statusColor}`}>
                        {sectionResult.score}/{sectionResult.max}
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Performance Dashboard
              </button>
              
              <button
                onClick={resetAssessment}
                className="px-8 py-4 bg-white bg-opacity-20 text-white font-bold rounded-full shadow-lg hover:bg-opacity-30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <RotateCw className="w-5 h-5 mr-2" />
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white border-opacity-20">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Legal Competency Assessment</h1>
              <p className="text-indigo-200">{currentSectionData.title}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{currentSection + 1}/{sections.length}</div>
                <div className="text-sm text-indigo-200">Section</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{currentQuestion + 1}/{currentSectionData.questions.length}</div>
                <div className="text-sm text-indigo-200">Question</div>
              </div>
              <div className="text-center bg-amber-500 bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="text-2xl font-bold text-amber-300">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-amber-200">Time Remaining</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-indigo-200 mb-2">
              <span>{currentSectionData.title}</span>
              <span>{currentSectionData.weight}% of total</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                style={{ width: `${((currentQuestion + 1) / currentSectionData.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentQuestionData.text}
            </h2>

            {currentQuestionData.type === 'single-select' && currentQuestionData.options && (
              <div className="space-y-3">
                {currentQuestionData.options.map((option, idx) => {
                  const isSelected = selectedOptions[currentQuestionData.id]?.includes(idx) || false;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(currentQuestionData.id, idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                          : 'border-white border-opacity-20 hover:border-blue-400 hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-white border-opacity-50'
                        }`}>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-white">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestionData.type === 'multi-select' && currentQuestionData.options && (
              <div className="space-y-3">
                {currentQuestionData.options.map((option, idx) => {
                  const isSelected = selectedOptions[currentQuestionData.id]?.includes(idx) || false;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(currentQuestionData.id, idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                          : 'border-white border-opacity-20 hover:border-purple-400 hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center ${
                          isSelected ? 'border-purple-500 bg-purple-500' : 'border-white border-opacity-50'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-white">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestionData.type === 'text' && (
              <div>
                <textarea
                  value={userAnswers[currentQuestionData.id] || ''}
                  onChange={(e) => handleTextAnswer(currentQuestionData.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-4 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                />
                <p className="text-sm text-indigo-200 mt-2">
                  Your answer will be evaluated by our AI system for quality and relevance.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0 && currentQuestion === 0}
              className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center"
            >
              {currentSection === sections.length - 1 && currentQuestion === currentSectionData.questions.length - 1
                ? 'Complete Assessment'
                : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAssessment;