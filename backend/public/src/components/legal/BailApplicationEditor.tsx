import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, FileText, Clock, Eye, EyeOff, Check, AlertCircle, Mic, MicOff, MessageSquare, X, Palette, Stamp, FileSignature, Image, Bold, Italic, Underline, Highlighter, Send } from 'lucide-react';

const BailApplicationEditor = () => {
  const [showTemplateSelection, setShowTemplateSelection] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [content, setContent] = useState('');
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showSeals, setShowSeals] = useState(false);
  const [showSignatures, setShowSignatures] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [selectedSeal, setSelectedSeal] = useState<any>(null);
  const [selectedSignature, setSelectedSignature] = useState<any>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const templates = [
    {
      id: 'blank',
      name: 'Blank Document',
      description: 'Start with a blank document',
      content: ''
    },
    {
      id: 'regular_bail',
      name: 'Regular Bail Application',
      description: 'Template for regular bail under Section 437 CrPC',
      content: `IN THE COURT OF [COURT NAME]
AT [PLACE]

CRIMINAL MISC. APPLICATION NO. _____ OF 20___

IN THE MATTER OF:
[Applicant Name]
...Applicant

VERSUS

[State/Complainant Name]
...Respondent

APPLICATION FOR REGULAR BAIL UNDER SECTION 437 Cr.P.C.

MOST RESPECTFULLY SHEWETH:

1. That the applicant has been arrested and is currently in judicial custody in connection with FIR No. _____ dated _____ registered at Police Station _____ under Sections _____ of the Indian Penal Code.

2. That the applicant is innocent and has been falsely implicated in the present case.

3. That the applicant has deep roots in the society and has no criminal antecedents.

4. That the investigation in the matter is complete and there is no apprehension of the applicant tampering with evidence or influencing witnesses.

5. That the applicant undertakes to appear before the court as and when required and will abide by all conditions imposed by this Hon'ble Court.

6. That the continued detention of the applicant is not required for the purpose of investigation.

PRAYER

In view of the facts and circumstances stated above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

a) Grant regular bail to the applicant in the aforesaid case;
b) Pass any other order as this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE APPLICANT SHALL DUTY BOUND FOREVER PRAY.

APPLICANT
Through Counsel

Place: _____
Date: _____`
    },
    {
      id: 'anticipatory_bail',
      name: 'Anticipatory Bail Application',
      description: 'Template for anticipatory bail under Section 438 CrPC',
      content: `IN THE COURT OF [COURT NAME]
AT [PLACE]

CRIMINAL MISC. APPLICATION NO. _____ OF 20___

IN THE MATTER OF:
[Applicant Name]
...Applicant

VERSUS

[State Name]
...Respondent

APPLICATION FOR ANTICIPATORY BAIL UNDER SECTION 438 Cr.P.C.

MOST RESPECTFULLY SHEWETH:

1. That the applicant has reason to believe that he/she may be arrested on accusation of having committed an offence under Sections _____ of the Indian Penal Code.

2. That the applicant is innocent and has not committed any offence as alleged.

3. That the applicant apprehends arrest in the matter and seeks protection from this Hon'ble Court.

4. That the applicant has not been previously convicted of any offence and is a law-abiding citizen with deep roots in the society.

5. That the applicant is ready and willing to cooperate with the investigation and join the investigation as and when required.

6. That the applicant undertakes to make himself/herself available for interrogation by the police as and when required.

PRAYER

In view of the facts and circumstances stated above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

a) Grant anticipatory bail to the applicant and direct that in the event of arrest, the applicant be released on bail on such terms and conditions as this Hon'ble Court may deem fit;
b) Pass any other order as this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE APPLICANT SHALL DUTY BOUND FOREVER PRAY.

APPLICANT
Through Counsel

Place: _____
Date: _____`
    },
    {
      id: 'bail_cancellation',
      name: 'Bail Cancellation Opposition',
      description: 'Template for opposing bail cancellation',
      content: `IN THE COURT OF [COURT NAME]
AT [PLACE]

CRIMINAL MISC. APPLICATION NO. _____ OF 20___

IN THE MATTER OF:
[Applicant/Accused Name]
...Applicant

VERSUS

[State/Complainant Name]
...Respondent

REPLY TO APPLICATION FOR CANCELLATION OF BAIL

MOST RESPECTFULLY SHEWETH:

1. That the applicant submits this reply to the application filed for cancellation of bail granted to the applicant vide order dated _____.

2. That the applicant has been regularly appearing before the trial court and has not violated any conditions imposed while granting bail.

3. That the allegations made in the bail cancellation application are false, baseless and without any merit.

4. That the applicant has been cooperating with the investigation and has not tampered with any evidence or influenced any witnesses.

5. That there is no change in circumstances that would warrant cancellation of bail granted to the applicant.

PRAYER

In view of the facts and circumstances stated above, it is most respectfully prayed that this Hon'ble Court may be pleased to:

a) Dismiss the application for cancellation of bail;
b) Pass any other order as this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE APPLICANT SHALL DUTY BOUND FOREVER PRAY.

APPLICANT
Through Counsel

Place: _____
Date: _____`
    }
  ];

  const seals = [
    { id: 'supreme_court', name: 'Supreme Court of India', emoji: '⚖️' },
    { id: 'high_court', name: 'High Court', emoji: '🏛️' },
    { id: 'district_court', name: 'District Court', emoji: '🏢' },
    { id: 'govt_india', name: 'Government of India', emoji: '🇮🇳' },
    { id: 'advocate_seal', name: 'Advocate Seal', emoji: '📜' },
    { id: 'notary', name: 'Notary Public', emoji: '✒️' }
  ];

  const signatures = [
    { id: 'sig1', name: 'Signature Style 1', style: 'cursive' },
    { id: 'sig2', name: 'Signature Style 2', style: 'italic' },
    { id: 'sig3', name: 'Digital Signature', style: 'normal' }
  ];

  const caseDetails = {
    caseNumber: 'FIR No. 123/2024',
    policeStation: 'Central Police Station',
    sections: 'IPC Sections 379, 411',
    dateOfFiling: '15th January 2024',
    accusedName: 'John Doe',
    complainant: 'State',
    status: 'Under Trial',
    nextHearing: '30th October 2025',
    notes: 'Investigation completed. Chargesheet filed.'
  };

  const chatbotResponses = {
    'bail grounds': 'Common grounds for bail include: 1) No previous criminal record, 2) Deep roots in society, 3) Not a flight risk, 4) Investigation complete, 5) No tampering with evidence possible, 6) Medical grounds, 7) Prolonged incarceration.',
    'sections': 'Section 437 CrPC - Regular bail for bailable offences. Section 438 CrPC - Anticipatory bail. Section 439 CrPC - Special powers of High Court or Court of Session.',
    'precedents': 'Key precedents: 1) Gudikanti Narasimhulu vs Public Prosecutor - Three factors for bail. 2) Sanjay Chandra vs CBI - Bail is the rule, jail is exception. 3) Arnesh Kumar vs State of Bihar - Arrest guidelines.',
    'format': 'A bail application should include: 1) Court details, 2) Case number, 3) Parties, 4) Facts of case, 5) Grounds for bail, 6) Precedents cited, 7) Prayer, 8) Verification, 9) Signatures.',
    'highlight': 'Important points to highlight: Medical conditions (yellow), No criminal record (green), Investigation complete (blue), Flight risk addressed (orange).'
  };

  // Auto-save functionality
  useEffect(() => {
    if (content && !showTemplateSelection) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      setAutoSaveStatus('Saving...');
      autoSaveTimerRef.current = setTimeout(() => {
        setLastSaved(new Date());
        setAutoSaveStatus('Saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, showTemplateSelection]);

  // Voice to text setup
  useEffect(() => {
    // @ts-ignore
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-IN';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setContent(prev => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  const checkContent = (text: string) => {
    const issues: { line: number; type: string; message: string }[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line: string, index: number) => {
      if (line.toLowerCase().includes('he/she')) {
        issues.push({
          line: index + 1,
          type: 'style',
          message: 'Consider using gender-neutral language'
        });
      }
      
      if (line.match(/\b(very|really|quite)\b/i)) {
        issues.push({
          line: index + 1,
          type: 'style',
          message: 'Avoid using weak intensifiers in legal writing'
        });
      }
      
      if (line.includes('  ')) {
        issues.push({
          line: index + 1,
          type: 'formatting',
          message: 'Multiple spaces detected'
        });
      }
    });
    
    setSuggestions(issues.slice(0, 5));
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setContent(template.content);
    setShowTemplateSelection(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    checkContent(newContent);
  };

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bail_application_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);

    // Simple chatbot logic
    let botResponse = "I can help you with bail application queries. Try asking about 'bail grounds', 'sections', 'precedents', 'format', or 'highlight'.";
    
    const lowerInput = chatInput.toLowerCase();
    for (const [key, value] of Object.entries(chatbotResponses)) {
      if (lowerInput.includes(key)) {
        botResponse = value;
        break;
      }
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    }, 500);

    setChatInput('');
  };

  const insertSeal = (seal: any) => {
    const sealText = `

[${seal.emoji} ${seal.name}]

`;
    setContent(prev => prev + sealText);
    setShowSeals(false);
  };

  const insertSignature = (signature: any) => {
    const sigText = `

______________________
(${signature.name})
Advocate

`;
    setContent(prev => prev + sigText);
    setShowSignatures(false);
  };

  const applyHighlight = (color: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText) {
      const highlightMarkers: Record<string, string> = {
        yellow: '🟡',
        green: '🟢',
        blue: '🔵',
        orange: '🟠',
        red: '🔴'
      };
      
      const marker = highlightMarkers[color] || '🟡';
      const newText = `${marker}${selectedText}${marker}`;
      const newContent = content.substring(0, start) + newText + content.substring(end);
      setContent(newContent);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastSaved.toLocaleTimeString();
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (showTemplateSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bail Application Draft
              </h1>
              <p className="text-gray-600">
                Choose a template to get started or create from scratch
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedTemplate?.name || 'Bail Application'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {autoSaveStatus && (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  {autoSaveStatus}
                </span>
              )}
              {lastSaved && !autoSaveStatus && (
                <span>Last saved {formatLastSaved()}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleVoiceInput}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Stop' : 'Voice Input'}
          </button>
          
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            AI Assistant
          </button>
          
          <button
            onClick={() => setShowCaseDetails(!showCaseDetails)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showCaseDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Case Details
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Text Highlighting"
          >
            <Highlighter className="w-5 h-5" />
          </button>
          
          {showFormatting && (
            <div className="flex gap-2 ml-2">
              <button onClick={() => applyHighlight('yellow')} className="w-6 h-6 bg-yellow-300 rounded border hover:scale-110" title="Yellow - Medical/Important"></button>
              <button onClick={() => applyHighlight('green')} className="w-6 h-6 bg-green-300 rounded border hover:scale-110" title="Green - Positive Facts"></button>
              <button onClick={() => applyHighlight('blue')} className="w-6 h-6 bg-blue-300 rounded border hover:scale-110" title="Blue - Legal Sections"></button>
              <button onClick={() => applyHighlight('orange')} className="w-6 h-6 bg-orange-300 rounded border hover:scale-110" title="Orange - Key Arguments"></button>
              <button onClick={() => applyHighlight('red')} className="w-6 h-6 bg-red-300 rounded border hover:scale-110" title="Red - Critical Points"></button>
            </div>
          )}
        </div>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        <button
          onClick={() => setShowSeals(!showSeals)}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded"
        >
          <Stamp className="w-5 h-5" />
          Insert Seal
        </button>
        
        <button
          onClick={() => setShowSignatures(!showSignatures)}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded"
        >
          <FileSignature className="w-5 h-5" />
          Insert Signature
        </button>
      </div>

      {/* Seals Panel */}
      {showSeals && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Select Official Seal</h3>
            <button onClick={() => setShowSeals(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {seals.map(seal => (
              <button
                key={seal.id}
                onClick={() => insertSeal(seal)}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <span className="text-3xl">{seal.emoji}</span>
                <span className="text-xs text-center">{seal.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Signatures Panel */}
      {showSignatures && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Select Signature Style</h3>
            <button onClick={() => setShowSignatures(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {signatures.map(sig => (
              <button
                key={sig.id}
                onClick={() => insertSignature(sig)}
                className="p-4 bg-white rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                <div className={`text-lg font-${sig.style} mb-1`}>John Advocate</div>
                <div className="text-xs text-gray-600">{sig.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden border-2 border-gray-200">
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start typing your bail application or use voice input..."
              className="flex-1 p-6 resize-none outline-none font-mono text-sm leading-relaxed overflow-y-auto"
              style={{ minHeight: '100%' }}
            />
          </div>
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Writing Suggestions</h3>
              </div>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-amber-800">
                    Line {suggestion.line}: {suggestion.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Case Details Sidebar */}
        {showCaseDetails && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Case Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Case Number
                </label>
                <p className="mt-1 text-sm text-gray-900">{caseDetails.caseNumber}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Police Station
                </label>
                <p className="mt-1 text-sm text-gray-900">{caseDetails.policeStation}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Sections
                </label>
                <p className="mt-1 text-sm text-gray-900">{caseDetails.sections}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date of Filing
                </label>
                <p className="mt-1 text-sm text-gray-900">{caseDetails.dateOfFiling}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Accused Name
                </label>
                <p className="mt-1 text-sm text-gray-900">{caseDetails.accusedName}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p className="mt-1 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {caseDetails.status}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Next Hearing
                </label>
                <p className="mt-1 text-sm text-gray-900">{caseDetails.nextHearing}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Notes
                </label>
                <p className="mt-1 text-sm text-gray-900">{caseDetails.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot */}
        {showChatbot && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-indigo-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">AI Legal Assistant</h3>
              </div>
              <button onClick={() => setShowChatbot(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Ask me about bail grounds, sections, precedents, or format!</p>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setChatInput('What are common bail grounds?')}
                      className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                    >
                      What are common bail grounds?
                    </button>
                    <button
                      onClick={() => setChatInput('Tell me about relevant sections')}
                      className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                    >
                      Tell me about relevant sections
                    </button>
                    <button
                      onClick={() => setChatInput('Key precedents for bail')}
                      className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                    >
                      Key precedents for bail
                    </button>
                  </div>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.type === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  onClick={handleChatSend}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BailApplicationEditor;