import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw, Clock, User, Gavel } from 'lucide-react';

interface CourtSequence {
  seq: number;
  speaker: string;
  text: string;
  requiresUserInput: boolean;
  expectedResponse?: string;
}

interface ConversationEntry {
  speaker: string;
  text: string;
  timestamp: string;
  isUser?: boolean;
}

interface PerformanceMetrics {
  clarity: number;
  relevance: number;
  confidence: number;
}

const CourtroomAISimulation = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentSequence, setCurrentSequence] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversationLog, setConversationLog] = useState<ConversationEntry[]>([]);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    clarity: 0,
    relevance: 0,
    confidence: 0
  });

  const logRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Court session sequences - Defense Attorney responses are user-driven
  const courtSequences: CourtSequence[] = [
    { seq: 1, speaker: "Court Clerk", text: "All rise! The Honourable Court is now in session. The Honourable Additional Chief Judicial Magistrate Smt. Kavitha Narayan presiding. Case number BAIL/2025/3847. Rajesh Kumar versus State of Karnataka. Application for bail under Section 437 of the Code of Criminal Procedure.", requiresUserInput: false },
    { seq: 2, speaker: "Magistrate", text: "Please be seated. Court clerk, confirm the presence of all parties.", requiresUserInput: false },
    { seq: 3, speaker: "Court Clerk", text: "Yes, Your Honour. Defense counsel present. Public Prosecutor present. Accused Rajesh Kumar present in custody. Two proposed sureties present in court.", requiresUserInput: false },
    { seq: 4, speaker: "Magistrate", text: "Counsel for the accused, please state your appearance and proceed with your bail application.", requiresUserInput: true, expectedResponse: "introduction" },
    { seq: 5, speaker: "Magistrate", text: "Please proceed. Give me a brief summary of the facts first, then your submissions.", requiresUserInput: true, expectedResponse: "facts" },
    { seq: 6, speaker: "Magistrate", text: "What does your client say happened in that footage?", requiresUserInput: true, expectedResponse: "explanation" },
    { seq: 7, speaker: "Magistrate", text: "Has the laptop been recovered from the accused?", requiresUserInput: true, expectedResponse: "recovery" },
    { seq: 8, speaker: "Public Prosecutor", text: "Your Honour, the investigation is still ongoing. The laptop has not been recovered yet, which we submit indicates that the accused may have disposed of it or hidden it elsewhere. The CCTV evidence clearly shows the accused placing something into his bag.", requiresUserInput: false },
    { seq: 9, speaker: "Magistrate", text: "Counsel, please continue with your bail submissions. We will evaluate the evidence at trial. For now, I need to know why bail should be granted.", requiresUserInput: true, expectedResponse: "bail_grounds" },
    { seq: 10, speaker: "Magistrate", text: "Does the accused have a passport?", requiresUserInput: true, expectedResponse: "passport" },
    { seq: 11, speaker: "Magistrate", text: "Are the proposed sureties present in court?", requiresUserInput: true, expectedResponse: "sureties_present" },
    { seq: 12, speaker: "Magistrate", text: "Ramesh Kumar and Arjun Rao, please stand. Are you both willing to stand surety for the accused?", requiresUserInput: false },
    { seq: 13, speaker: "Ramesh Kumar", text: "Yes, Your Honour. I am Rajesh's father. I have complete faith in my son's innocence. I am willing to provide any guarantee required by the court.", requiresUserInput: false },
    { seq: 14, speaker: "Arjun Rao", text: "Yes, Your Honour. I am Rajesh's brother-in-law. He is a responsible family man. I am willing to execute any bond required.", requiresUserInput: false },
    { seq: 15, speaker: "Magistrate", text: "Thank you. You may be seated. Counsel, continue with your submissions on evidence and why bail should be granted.", requiresUserInput: true, expectedResponse: "evidence_gaps" },
    { seq: 16, speaker: "Public Prosecutor", text: "Your Honour, the state vehemently opposes bail. This is a non-bailable offense involving property worth forty-five thousand rupees. The CCTV evidence is clear. If released, the accused may destroy evidence or influence witnesses.", requiresUserInput: false },
    { seq: 17, speaker: "Magistrate", text: "Defense counsel, would you like to respond to the prosecution's objections?", requiresUserInput: true, expectedResponse: "rebuttal" },
    { seq: 18, speaker: "Magistrate", text: "I have heard both sides. Let me ask you, counsel - what specific bail conditions are you proposing?", requiresUserInput: true, expectedResponse: "bail_conditions" },
    { seq: 19, speaker: "Magistrate", text: "After careful consideration, I am inclined to grant bail subject to stringent conditions. The accused will execute a personal bond of seventy-five thousand rupees and provide two sureties of thirty-five thousand each. He must surrender his passport within 24 hours and report to the police station twice weekly.", requiresUserInput: false },
    { seq: 20, speaker: "Magistrate", text: "The next hearing is scheduled for November 10, 2025. Defense counsel, ensure your client's attendance. This hearing is concluded.", requiresUserInput: false }
  ];

  // Speech synthesis for AI characters
  const speakText = (text: string, speaker: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Character-specific voice settings
      switch(speaker) {
        case "Magistrate":
          utterance.pitch = 1.0;
          utterance.rate = 0.9;
          utterance.volume = 1.0;
          break;
        case "Public Prosecutor":
          utterance.pitch = 0.9;
          utterance.rate = 1.0;
          utterance.volume = 0.95;
          break;
        case "Court Clerk":
          utterance.pitch = 1.1;
          utterance.rate = 1.1;
          utterance.volume = 0.9;
          break;
        default:
          utterance.pitch = 1.0;
          utterance.rate = 0.95;
          utterance.volume = 0.9;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Auto-scroll conversation log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [conversationLog]);

  const startSimulation = () => {
    setIsActive(true);
    setCurrentSequence(0);
    setConversationLog([]);
    setElapsedTime(0);
    processNextSequence(0);
  };

  const processNextSequence = (seqIndex: number) => {
    if (seqIndex >= courtSequences.length) {
      setIsActive(false);
      addToLog("System", "Simulation completed. Great work!");
      return;
    }

    const sequence = courtSequences[seqIndex];
    setCurrentSpeaker(sequence.speaker);
    
    if (!sequence.requiresUserInput) {
      addToLog(sequence.speaker, sequence.text);
      speakText(sequence.text, sequence.speaker);
      
      setTimeout(() => {
        setCurrentSequence(seqIndex + 1);
        processNextSequence(seqIndex + 1);
      }, 3000 + (sequence.text.length * 30));
    } else {
      addToLog(sequence.speaker, sequence.text);
      speakText(sequence.text, sequence.speaker);
      setWaitingForUser(true);
    }
  };

  const addToLog = (speaker: string, text: string, isUser: boolean = false) => {
    setConversationLog(prev => [...prev, { 
      speaker, 
      text, 
      timestamp: new Date().toLocaleTimeString(),
      isUser 
    }]);
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const submitUserResponse = () => {
    if (!userInput.trim()) return;
    
    addToLog("Defense Attorney (You)", userInput, true);
    analyzeResponse(userInput);
    setUserInput('');
    setWaitingForUser(false);
    
    setTimeout(() => {
      setCurrentSequence(prev => prev + 1);
      processNextSequence(currentSequence + 1);
    }, 1500);
  };

  const analyzeResponse = (response: string) => {
    const words = response.toLowerCase();
    let clarity = 50, relevance = 50, confidence = 50;
    
    // Basic analysis
    if (words.includes("your honour") || words.includes("may it please")) clarity += 20;
    if (words.length > 50) clarity += 15;
    if (words.includes("bail") || words.includes("evidence") || words.includes("innocent")) relevance += 25;
    if (words.includes("submit") || words.includes("respectfully") || words.includes("section")) confidence += 20;
    if (!words.includes("um") && !words.includes("uh")) confidence += 15;
    
    setPerformanceMetrics({
      clarity: Math.min(100, clarity),
      relevance: Math.min(100, relevance),
      confidence: Math.min(100, confidence)
    });
  };

  const resetSimulation = () => {
    setIsActive(false);
    setCurrentSequence(0);
    setElapsedTime(0);
    setConversationLog([]);
    setWaitingForUser(false);
    setUserInput('');
    setPerformanceMetrics({ clarity: 0, relevance: 0, confidence: 0 });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getContextualGuidance = () => {
    if (!waitingForUser) return null;
    
    const sequence = courtSequences[currentSequence];
    const guidance: Record<string, string> = {
      introduction: "Introduce yourself formally: 'May it please Your Honour, I appear on behalf of the accused, Rajesh Kumar. I am here to move an application for bail under Section 437 of the Code of Criminal Procedure.'",
      facts: "Present the facts: Mention Rajesh is 28, employed 4 years at Vijay Electronics, laptop worth ₹45,000 went missing on Oct 15, arrested Oct 16 based on grainy CCTV footage.",
      explanation: "Explain client's version: He was retrieving his mobile charger in a hard black case, which resembled a laptop on poor quality footage. It's a case of mistaken identity.",
      recovery: "Emphasize NO recovery: 'Your Honour, that is crucial. Despite thorough searches of residence, bag, and vehicle, the laptop was NOT recovered. This strongly supports innocence.'",
      bail_grounds: "Present bail grounds: 1) Bail is rule, jail is exception 2) First-time accused, no criminal record 3) Deep community roots 4) Stable employment 5) Family with 2-year-old daughter 6) No flight risk.",
      passport: "Confirm passport surrender: 'Yes, Your Honour, he possesses a passport but voluntarily offers to surrender it immediately, demonstrating commitment to remain available.'",
      sureties_present: "Confirm sureties: 'Yes, Your Honour. Both Ramesh Kumar (father, grocer) and Arjun Rao (brother-in-law, teacher) are present and ready to be examined.'",
      evidence_gaps: "Highlight gaps: No laptop recovery, ambiguous CCTV, witness Prakash Mehta corroborates, anomaly in digital inventory log showing laptop 'dispatched to service center.'",
      rebuttal: "Rebut prosecution: Section 379 nature doesn't determine bail. CCTV is grainy, not clear. No evidence left to tamper. Not true breach of trust. Value is modest. Presumption of innocence must prevail.",
      bail_conditions: "Propose conditions: Personal bond ₹50,000, two sureties ₹25,000 each, surrender passport within 48 hours, weekly police reporting every Monday, no contact with complainant/workplace, no travel outside Bangalore."
    };
    
    return guidance[sequence.expectedResponse || ''] || "Respond appropriately to the court's question.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 rounded-lg p-6 mb-6 shadow-2xl border border-amber-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Gavel className="w-10 h-10 text-amber-200" />
              <div>
                <h1 className="text-3xl font-bold text-amber-50">Interactive Courtroom Simulation</h1>
                <p className="text-amber-200 text-sm mt-1">Case: BAIL/2025/3847 - Rajesh Kumar vs State of Karnataka</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-200" />
              <span className="text-2xl font-mono text-amber-100">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Conversation Panel */}
          <div className="col-span-2 space-y-4">
            {/* Conversation Log */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 h-96 overflow-hidden flex flex-col">
              <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                  Court Proceedings
                </h2>
              </div>
              <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversationLog.map((entry, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${
                    entry.isUser 
                      ? 'bg-blue-900 border-l-4 border-blue-400 ml-8' 
                      : entry.speaker === "Magistrate"
                      ? 'bg-amber-900 border-l-4 border-amber-500'
                      : entry.speaker === "Public Prosecutor"
                      ? 'bg-red-900 border-l-4 border-red-500 mr-8'
                      : 'bg-slate-700 border-l-4 border-slate-500'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm flex items-center gap-2">
                        {entry.speaker === "Defense Attorney (You)" && <User className="w-4 h-4" />}
                        {entry.speaker}
                      </span>
                      <span className="text-xs opacity-70">{entry.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.text}</p>
                  </div>
                ))}
                {waitingForUser && (
                  <div className="bg-blue-900 bg-opacity-30 border-2 border-blue-500 border-dashed rounded-lg p-4 text-center">
                    <p className="text-blue-300 font-semibold animate-pulse">Your turn to speak, Counsel...</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Input Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">Your Response (Defense Attorney)</h3>
              </div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={waitingForUser ? "Type or speak your response to the court..." : "Wait for your turn to speak..."}
                disabled={!waitingForUser}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                rows={4}
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleVoiceInput}
                  disabled={!waitingForUser || isListening}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening ? "Listening..." : "Voice Input"}
                </button>
                <button
                  onClick={submitUserResponse}
                  disabled={!waitingForUser || !userInput.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Control Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
              <h3 className="font-semibold mb-4 text-lg">Simulation Control</h3>
              <div className="space-y-3">
                {!isActive ? (
                  <button
                    onClick={startSimulation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Hearing
                  </button>
                ) : (
                  <button
                    onClick={() => setIsActive(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                )}
                <button
                  onClick={resetSimulation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">Sequence: {currentSequence + 1} / {courtSequences.length}</p>
                <div className="mt-2 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSequence + 1) / courtSequences.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
              <h3 className="font-semibold mb-4 text-lg">Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clarity</span>
                    <span className="font-semibold">{performanceMetrics.clarity}%</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${performanceMetrics.clarity}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Relevance</span>
                    <span className="font-semibold">{performanceMetrics.relevance}%</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${performanceMetrics.relevance}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confidence</span>
                    <span className="font-semibold">{performanceMetrics.confidence}%</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${performanceMetrics.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual Guidance */}
            {waitingForUser && (
              <div className="bg-slate-800 rounded-lg shadow-xl border border-blue-600 p-4">
                <h3 className="font-semibold mb-2 text-blue-400 text-sm">💡 Guidance</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{getContextualGuidance()}</p>
              </div>
            )}

            {/* Current Speaker */}
            {currentSpeaker && (
              <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
                <h3 className="font-semibold mb-2 text-sm">Currently Speaking</h3>
                <p className="text-lg font-bold text-amber-400">{currentSpeaker}</p>
              </div>
            )}
          </div>
        </div>

        {/* Case Information Footer */}
        <div className="mt-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Accused</p>
              <p className="font-semibold">Rajesh Kumar</p>
            </div>
            <div>
              <p className="text-slate-400">Offense</p>
              <p className="font-semibold">IPC Section 379 - Theft</p>
            </div>
            <div>
              <p className="text-slate-400">Property Value</p>
              <p className="font-semibold">₹45,000</p>
            </div>
            <div>
              <p className="text-slate-400">Court</p>
              <p className="font-semibold">ACJM, Bangalore</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtroomAISimulation;