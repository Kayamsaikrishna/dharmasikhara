import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Mic, MicOff, Send, Volume2, VolumeX, User, Bot, MessageSquare, 
  FileText, BookOpen, Bookmark, Search, ZoomIn, ZoomOut, RotateCw, 
  Download, Upload, Speaker, PlayCircle, Square, X, ChevronLeft, 
  ChevronRight, Plus, Filter, Eye, Edit, Trash2, Award, Shield, 
  Scale, Gavel, Book, Radio, Users, UserCheck, UserX, Clock, 
  AlertTriangle, CheckCircle, Pause, Play, SkipForward, SkipBack,
  Crown, Hammer, Landmark, ScrollText, Presentation, Hand, 
  Handshake, EyeOff, Eye as EyeIcon
} from 'lucide-react';


interface Message {
  id: number;
  sender: 'user' | 'judge' | 'prosecutor' | 'witness' | 'defendant' | 'court_clerk' | 'system';
  content: string;
  timestamp: Date;
  voiceUrl?: string;
  isPlaying?: boolean;
  emotion?: string;
}

interface Document {
  _id: string;
  name: string;
  type: 'contract' | 'evidence' | 'pleading' | 'correspondence' | 'case_file' | 'witness_statement' | 'expert_report';
  pages: number;
  bookmarks?: BookmarkItem[];
  currentPage?: number;
  exhibitNumber?: string;
  relevance?: string;
}

interface BookmarkItem {
  id: string;
  page: number;
  label: string;
  note?: string;
}

interface VirtualBook {
  id: string;
  title: string;
  pages: number;
  currentPage: number;
  bookmarks: BookmarkItem[];
  content: string[];
}

interface EvidenceItem {
  id: string;
  name: string;
  type: 'digital' | 'physical' | 'document' | 'testimonial' | 'expert';
  description: string;
  dateAdded: string;
  fileSize: string;
  tags: string[];
  caseId: string;
  exhibitNumber: string;
  analysis?: {
    keyFindings: string[];
    relevance: string;
    reliability: string;
    notes: string;
  };
}

interface PaperworkTemplate {
  id: string;
  name: string;
  type: 'form' | 'document' | 'log';
  description: string;
  fields: string[];
}

interface Character {
  id: string;
  name: string;
  role: 'judge' | 'prosecutor' | 'defendant' | 'witness' | 'lawyer' | 'court_clerk' | 'jury_foreman';
  avatar: string;
  bio: string;
  traits: string[];
  visualCues: {
    color: string;
    icon: string;
  };
  currentEmotion: string;
  speaking: boolean;
}

interface CourtProceeding {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  order: number;
}

const AdvancedCourtroomSimulation: React.FC = () => {
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'system',
      content: 'Court is now in session. All rise for the Honorable Justice R.K. Sharma.',
      timestamp: new Date(),
      emotion: 'formal'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'judge',
      name: 'Hon. Justice R.K. Sharma',
      role: 'judge',
      avatar: '👨‍⚖️',
      bio: 'Experienced judge with 20 years on the bench. Known for thorough examination of evidence.',
      traits: ['strict', 'fair', 'detail-oriented'],
      visualCues: { color: '#4F46E5', icon: '⚖️' },
      currentEmotion: 'neutral',
      speaking: false
    },
    {
      id: 'prosecutor',
      name: 'Ms. Priya Menon',
      role: 'prosecutor',
      avatar: '👩‍💼',
      bio: 'Senior prosecutor with expertise in circumstantial evidence cases.',
      traits: ['aggressive', 'prepared', 'persuasive'],
      visualCues: { color: '#DC2626', icon: '💼' },
      currentEmotion: 'neutral',
      speaking: false
    },
    {
      id: 'defendant',
      name: 'Rajesh Kumar',
      role: 'defendant',
      avatar: '👤',
      bio: 'Sales executive accused of theft. Claims innocence and proper procedure.',
      traits: ['anxious', 'cooperative', 'truthful'],
      visualCues: { color: '#059669', icon: '👤' },
      currentEmotion: 'anxious',
      speaking: false
    },
    {
      id: 'court_clerk',
      name: 'Mr. Suresh',
      role: 'court_clerk',
      avatar: '👨‍💼',
      bio: 'Court clerk responsible for managing proceedings and evidence.',
      traits: ['efficient', 'organized', 'neutral'],
      visualCues: { color: '#7C3AED', icon: '📋' },
      currentEmotion: 'neutral',
      speaking: false
    }
  ]);
  const [currentProceeding, setCurrentProceeding] = useState(0);
  const [proceedings] = useState<CourtProceeding[]>([
    { id: 'opening', name: 'Opening Statements', description: 'Initial arguments from both sides', completed: false, order: 1 },
    { id: 'evidence', name: 'Presentation of Evidence', description: 'Exhibits and witness testimonies', completed: false, order: 2 },
    { id: 'cross', name: 'Cross-Examination', description: 'Questioning of witnesses', completed: false, order: 3 },
    { id: 'closing', name: 'Closing Arguments', description: 'Final arguments before deliberation', completed: false, order: 4 },
    { id: 'deliberation', name: 'Jury Deliberation', description: 'Jury considers evidence and testimony', completed: false, order: 5 },
    { id: 'verdict', name: 'Verdict', description: 'Court announces decision', completed: false, order: 6 }
  ]);
  const [juryMembers] = useState([
    { id: 1, name: 'Mr. Arvind Desai', role: 'jury_member', present: true },
    { id: 2, name: 'Mrs. Sunita Rao', role: 'jury_member', present: true },
    { id: 3, name: 'Mr. Vikram Patel', role: 'jury_member', present: true },
    { id: 4, name: 'Mrs. Kamala Nair', role: 'jury_member', present: true },
    { id: 5, name: 'Mr. Ramesh Iyer', role: 'jury_member', present: true },
    { id: 6, name: 'Mrs. Deepa Mehta', role: 'jury_member', present: true },
    { id: 7, name: 'Mr. Anil Kumar', role: 'jury_member', present: true },
    { id: 8, name: 'Mrs. Shalini Verma', role: 'jury_member', present: true },
    { id: 9, name: 'Mr. Prakash Jain', role: 'jury_member', present: true },
    { id: 10, name: 'Mrs. Nalini Reddy', role: 'jury_member', present: true },
    { id: 11, name: 'Mr. Sunil Gupta', role: 'jury_member', present: true },
    { id: 12, name: 'Mrs. Pooja Singh', role: 'jury_member', present: true }
  ]);
  const [witnesses] = useState([
    { id: 'prakash', name: 'Prakash Mehta', role: 'key_witness', present: true, testimonyGiven: false },
    { id: 'desai', name: 'Mr. Desai', role: 'complainant', present: false, testimonyGiven: false }
  ]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [isCourtInSession, setIsCourtInSession] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [isPaused, setIsPaused] = useState(false);


  // Three.js refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const characterRefs = useRef<Record<string, THREE.Group>>({});
  const courtroomObjectsRef = useRef<Record<string, THREE.Mesh | THREE.Group>>({});

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.fog = new THREE.Fog(0xf0f0f0, 20, 50);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create courtroom environment
    createCourtroom(scene);

    // Create characters
    createCharacters(scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update character animations
      Object.values(characterRefs.current).forEach((character, index) => {
        if (character) {
          // Simple breathing animation
          character.position.y = Math.sin(Date.now() * 0.002 + index) * 0.02;
        }
      });
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && mountRef.current) {
        cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Create courtroom environment
  const createCourtroom = (scene: THREE.Scene) => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    courtroomObjectsRef.current['floor'] = floor;

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C });
    
    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(40, 15, 1),
      wallMaterial
    );
    backWall.position.set(0, 7.5, -20);
    backWall.receiveShadow = true;
    scene.add(backWall);
    courtroomObjectsRef.current['backWall'] = backWall;

    // Side walls
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 15, 40),
      wallMaterial
    );
    leftWall.position.set(-20, 7.5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    courtroomObjectsRef.current['leftWall'] = leftWall;

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 15, 40),
      wallMaterial
    );
    rightWall.position.set(20, 7.5, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    courtroomObjectsRef.current['rightWall'] = rightWall;

    // Judge's bench
    const judgesBench = new THREE.Mesh(
      new THREE.BoxGeometry(8, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0x2C3E50 })
    );
    judgesBench.position.set(0, 1, 15);
    judgesBench.castShadow = true;
    judgesBench.receiveShadow = true;
    scene.add(judgesBench);
    courtroomObjectsRef.current['judgesBench'] = judgesBench;

    // Judge's chair
    const judgeChair = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 2),
      new THREE.MeshStandardMaterial({ color: 0x34495E })
    );
    judgeChair.position.set(0, 2.5, 15);
    judgeChair.castShadow = true;
    judgeChair.receiveShadow = true;
    scene.add(judgeChair);
    courtroomObjectsRef.current['judgeChair'] = judgeChair;

    // Plaintiff table
    const plaintiffTable = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.5, 3),
      new THREE.MeshStandardMaterial({ color: 0x1E3A8A })
    );
    plaintiffTable.position.set(-8, 0.75, -5);
    plaintiffTable.castShadow = true;
    plaintiffTable.receiveShadow = true;
    scene.add(plaintiffTable);
    courtroomObjectsRef.current['plaintiffTable'] = plaintiffTable;

    // Defendant table
    const defendantTable = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.5, 3),
      new THREE.MeshStandardMaterial({ color: 0x7E22CE })
    );
    defendantTable.position.set(8, 0.75, -5);
    defendantTable.castShadow = true;
    defendantTable.receiveShadow = true;
    scene.add(defendantTable);
    courtroomObjectsRef.current['defendantTable'] = defendantTable;

    // Jury box
    const juryBox = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2, 4),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    );
    juryBox.position.set(-12, 1, 5);
    juryBox.castShadow = true;
    juryBox.receiveShadow = true;
    scene.add(juryBox);
    courtroomObjectsRef.current['juryBox'] = juryBox;

    // Gallery seating
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.5, 1.5),
          new THREE.MeshStandardMaterial({ color: 0x6B7280 })
        );
        seat.position.set(-15 + j * 2, 0.25, -10 - i * 2);
        seat.castShadow = true;
        seat.receiveShadow = true;
        scene.add(seat);
      }
    }

    // Evidence table
    const evidenceTable = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1, 2),
      new THREE.MeshStandardMaterial({ color: 0x92400E })
    );
    evidenceTable.position.set(0, 0.5, -2);
    evidenceTable.castShadow = true;
    evidenceTable.receiveShadow = true;
    scene.add(evidenceTable);
    courtroomObjectsRef.current['evidenceTable'] = evidenceTable;

    // Flag/crest
    const crest = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xDC2626 })
    );
    crest.position.set(0, 8, -19.5);
    scene.add(crest);
    courtroomObjectsRef.current['crest'] = crest;
  };

  // Create character models
  const createCharacters = (scene: THREE.Scene) => {
    // Judge
    const judgeGroup = new THREE.Group();
    
    // Body
    const judgeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.6, 2, 16),
      new THREE.MeshStandardMaterial({ color: 0x1E40AF })
    );
    judgeBody.position.y = 1;
    judgeBody.castShadow = true;
    judgeBody.receiveShadow = true;
    judgeGroup.add(judgeBody);
    
    // Head
    const judgeHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xFDE68A })
    );
    judgeHead.position.y = 2.6;
    judgeHead.castShadow = true;
    judgeHead.receiveShadow = true;
    judgeGroup.add(judgeHead);
    
    // Position
    judgeGroup.position.set(0, 0, 15);
    scene.add(judgeGroup);
    characterRefs.current['judge'] = judgeGroup;

    // Prosecutor
    const prosecutorGroup = new THREE.Group();
    
    // Body
    const prosecutorBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0xBE123C })
    );
    prosecutorBody.position.y = 0.9;
    prosecutorBody.castShadow = true;
    prosecutorBody.receiveShadow = true;
    prosecutorGroup.add(prosecutorBody);
    
    // Head
    const prosecutorHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xFDE68A })
    );
    prosecutorHead.position.y = 2.2;
    prosecutorHead.castShadow = true;
    prosecutorHead.receiveShadow = true;
    prosecutorGroup.add(prosecutorHead);
    
    // Position
    prosecutorGroup.position.set(-8, 0, -5);
    scene.add(prosecutorGroup);
    characterRefs.current['prosecutor'] = prosecutorGroup;

    // Defendant
    const defendantGroup = new THREE.Group();
    
    // Body
    const defendantBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x059669 })
    );
    defendantBody.position.y = 0.9;
    defendantBody.castShadow = true;
    defendantBody.receiveShadow = true;
    defendantGroup.add(defendantBody);
    
    // Head
    const defendantHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xFDE68A })
    );
    defendantHead.position.y = 2.2;
    defendantHead.castShadow = true;
    defendantHead.receiveShadow = true;
    defendantGroup.add(defendantHead);
    
    // Position
    defendantGroup.position.set(8, 0, -5);
    scene.add(defendantGroup);
    characterRefs.current['defendant'] = defendantGroup;

    // Court Clerk
    const clerkGroup = new THREE.Group();
    
    // Body
    const clerkBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x7C3AED })
    );
    clerkBody.position.y = 0.9;
    clerkBody.castShadow = true;
    clerkBody.receiveShadow = true;
    clerkGroup.add(clerkBody);
    
    // Head
    const clerkHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xFDE68A })
    );
    clerkHead.position.y = 2.2;
    clerkHead.castShadow = true;
    clerkHead.receiveShadow = true;
    clerkGroup.add(clerkHead);
    
    // Position
    clerkGroup.position.set(3, 0, -2);
    scene.add(clerkGroup);
    characterRefs.current['court_clerk'] = clerkGroup;
  };

  // Handle text input submission
  const handleSubmit = () => {
    if (inputText.trim() === '') return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: inputText,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Simulate AI response after a delay
    setTimeout(() => {
      simulateAIResponse(inputText);
    }, 1000);
  };

  // Simulate AI response
  const simulateAIResponse = (userInput: string) => {
    let responseText = "";
    let sender: Message['sender'] = 'judge';
    
    // Simple response logic based on input
    if (userInput.toLowerCase().includes('objection')) {
      responseText = "Overruled. Proceed with your questioning, Counsel.";
      sender = 'judge';
    } else if (userInput.toLowerCase().includes('bail')) {
      responseText = "We will consider the bail application after all evidence has been presented.";
      sender = 'judge';
    } else if (userInput.toLowerCase().includes('evidence')) {
      responseText = "Please approach the bench with the exhibit for marking.";
      sender = 'judge';
    } else if (userInput.toLowerCase().includes('witness')) {
      responseText = "The witness may take the stand. Do you solemnly swear to tell the truth, the whole truth, and nothing but the truth?";
      sender = 'court_clerk';
    } else {
      // Default responses based on current proceeding
      const proceeding = proceedings[currentProceeding];
      switch (proceeding.id) {
        case 'opening':
          responseText = "Thank you, Counsel. The court will now hear from the prosecution.";
          sender = 'judge';
          break;
        case 'evidence':
          responseText = "The exhibit is admitted into evidence as Exhibit A.";
          sender = 'judge';
          break;
        case 'cross':
          responseText = "Answer the question directly, please.";
          sender = 'judge';
          break;
        case 'closing':
          responseText = "The court will now recess for deliberation.";
          sender = 'judge';
          break;
        default:
          responseText = "Proceed, Counsel.";
          sender = 'judge';
      }
    }
    
    const aiMessage: Message = {
      id: messages.length + 2,
      sender: sender,
      content: responseText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  // Handle voice recording toggle
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording simulation
      addSystemMessage("Voice recording started...");
    } else {
      // Stop recording simulation
      addSystemMessage("Voice recording stopped.");
    }
  };

  // Add system message
  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: messages.length + 1,
      sender: 'system',
      content: content,
      timestamp: new Date()
    };
    setMessages([...messages, systemMessage]);
  };

  // Handle document selection
  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
    setActiveTab('documents');
  };

  // Handle evidence selection
  const handleEvidenceSelect = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setActiveTab('evidence');
  };

  // Advance to next proceeding
  const advanceProceeding = () => {
    if (currentProceeding < proceedings.length - 1) {
      const updatedProceedings = [...proceedings];
      updatedProceedings[currentProceeding].completed = true;
      setCurrentProceeding(currentProceeding + 1);
      
      // Add system message about proceeding change
      addSystemMessage(`Proceeding: ${updatedProceedings[currentProceeding + 1].name}`);
    }
  };

  // Render character avatar with status
  const renderCharacterAvatar = (character: Character) => {
    return (
      <div 
        className={`flex items-center p-3 rounded-lg mb-2 transition-all ${
          currentSpeaker === character.id 
            ? 'bg-blue-100 border-l-4 border-blue-500' 
            : 'bg-white border border-gray-200'
        }`}
      >
        <div className="relative">
          <div className="text-2xl">{character.avatar}</div>
          {character.speaking && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="ml-3">
          <div className="font-semibold text-gray-900">{character.name}</div>
          <div className="text-xs text-gray-500 capitalize">{character.role.replace('_', ' ')}</div>
        </div>
      </div>
    );
  };

  // Render jury panel
  const renderJuryPanel = () => {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Jury Panel
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {juryMembers.map((member) => (
            <div 
              key={member.id} 
              className={`flex items-center p-2 rounded ${
                member.present 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <UserCheck className={`w-4 h-4 mr-2 ${member.present ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm truncate">{member.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render witness panel
  const renderWitnessPanel = () => {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Witnesses
        </h3>
        <div className="space-y-2">
          {witnesses.map((witness) => (
            <div 
              key={witness.id} 
              className={`flex items-center justify-between p-2 rounded ${
                witness.present 
                  ? witness.testimonyGiven 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-blue-50 text-blue-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <div className="flex items-center">
                {witness.testimonyGiven ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                ) : witness.present ? (
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                ) : (
                  <UserX className="w-4 h-4 mr-2 text-gray-400" />
                )}
                <span className="text-sm">{witness.name}</span>
              </div>
              {witness.present && !witness.testimonyGiven && (
                <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  Call to Stand
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Landmark className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Courtroom Simulation</h1>
                <p className="text-sm text-gray-500">Case: The Inventory That Changed Everything</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">10:45 AM</span>
              </div>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* 3D Courtroom Visualization */}
            <div className="w-2/3 flex flex-col">
              <div 
                ref={mountRef} 
                className="flex-1 bg-gray-100 relative"
              >
                {/* Overlay controls */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-white bg-opacity-80 p-2 rounded-lg shadow-md hover:bg-opacity-100 transition">
                    <EyeIcon className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="bg-white bg-opacity-80 p-2 rounded-lg shadow-md hover:bg-opacity-100 transition">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="bg-white bg-opacity-80 p-2 rounded-lg shadow-md hover:bg-opacity-100 transition">
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                
                {/* Proceeding indicator */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                  <div className="text-sm font-medium">
                    {proceedings[currentProceeding].name}
                  </div>
                  <div className="text-xs opacity-75">
                    {proceedings[currentProceeding].description}
                  </div>
                </div>
              </div>
              
              {/* Court Controls */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button 
                      onClick={advanceProceeding}
                      disabled={currentProceeding >= proceedings.length - 1}
                      className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Next Proceeding
                    </button>
                    <button className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                      <Gavel className="w-4 h-4 mr-2" />
                      Call Witness
                    </button>
                    <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Objection
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Volume2 className="w-5 h-5 text-gray-600 mr-2" />
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={voiceVolume}
                        onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
                        className="w-24"
                      />
                    </div>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-1/3 flex flex-col border-l border-gray-200 bg-white">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
                    activeTab === 'chat'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Court Chat
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm ${
                    activeTab === 'evidence'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Presentation className="w-4 h-4 inline mr-2" />
                  Evidence
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'chat' && (
                  <div className="h-full flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`mb-4 ${
                            message.sender === 'user' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div className="flex items-start">
                            {message.sender !== 'user' && (
                              <div className="mr-3 mt-1">
                                {message.sender === 'judge' && <Gavel className="w-5 h-5 text-indigo-600" />}
                                {message.sender === 'prosecutor' && <Hammer className="w-5 h-5 text-red-600" />}
                                {message.sender === 'defendant' && <User className="w-5 h-5 text-green-600" />}
                                {message.sender === 'court_clerk' && <ScrollText className="w-5 h-5 text-purple-600" />}
                                {message.sender === 'system' && <Crown className="w-5 h-5 text-amber-600" />}
                              </div>
                            )}
                            <div
                              className={`inline-block max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                                message.sender === 'user'
                                  ? 'bg-indigo-600 text-white'
                                  : message.sender === 'system'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="font-medium text-xs mb-1">
                                {message.sender === 'user' 
                                  ? 'Defense Attorney' 
                                  : message.sender === 'judge' 
                                    ? 'Hon. Justice R.K. Sharma' 
                                    : message.sender === 'prosecutor' 
                                      ? 'Ms. Priya Menon' 
                                      : message.sender === 'defendant' 
                                        ? 'Rajesh Kumar' 
                                        : message.sender === 'court_clerk' 
                                          ? 'Court Clerk' 
                                          : 'System'}
                              </div>
                              <div>{message.content}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {message.sender === 'user' && (
                              <div className="ml-3 mt-1">
                                <User className="w-5 h-5 text-indigo-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4">
                      <div className="flex items-center">
                        <button
                          onClick={toggleRecording}
                          className={`p-3 rounded-full mr-2 ${
                            isRecording
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {isRecording ? (
                            <MicOff className="w-5 h-5" />
                          ) : (
                            <Mic className="w-5 h-5" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                          placeholder="Type your legal argument..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={handleSubmit}
                          disabled={inputText.trim() === ''}
                          className="ml-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Press and hold the microphone to speak, or type your message
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'documents' && (
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 mb-2">Case Documents</h3>
                      <div className="space-y-2">
                        {[
                          { _id: '1', name: 'Case File #2024-789', type: 'case_file' as const, pages: 24 },
                          { _id: '2', name: 'Digital Inventory Logs', type: 'evidence' as const, pages: 12 },
                          { _id: '3', name: 'CCTV Analysis Report', type: 'evidence' as const, pages: 8 },
                          { _id: '4', name: 'Witness Statement - Prakash Mehta', type: 'witness_statement' as const, pages: 6 },
                          { _id: '5', name: 'Bail Application Template', type: 'pleading' as const, pages: 4 }
                        ].map((doc) => (
                          <div 
                            key={doc._id}
                            onClick={() => handleDocumentSelect(doc)}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                              selectedDocument?._id === doc._id 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">{doc.name}</div>
                                <div className="text-sm text-gray-500 capitalize">
                                  {doc.type.replace('_', ' ')} • {doc.pages} pages
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedDocument && (
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-bold text-gray-900 mb-2">Document Viewer</h3>
                        <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <div className="font-medium text-gray-900">{selectedDocument.name}</div>
                            <div className="text-sm text-gray-500">
                              {selectedDocument.pages} pages
                            </div>
                            <button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                              View Document
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'evidence' && (
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 mb-2">Evidence Items</h3>
                      <div className="space-y-3">
                        {[
                          { 
                            id: '1', 
                            name: 'Digital Inventory Logs', 
                            type: 'digital' as const, 
                            description: 'Shows timestamp discrepancy in laptop dispatch', 
                            dateAdded: '2024-05-15', 
                            fileSize: '2.4 MB', 
                            tags: ['timestamp', 'discrepancy'], 
                            caseId: 'INV-2024-789', 
                            exhibitNumber: 'A',
                            analysis: {
                              keyFindings: ['9:47 a.m. dispatch timestamp', 'No service record exists'],
                              relevance: 'High',
                              reliability: 'Verified',
                              notes: 'Suggests internal fraud, not theft'
                            }
                          },
                          { 
                            id: '2', 
                            name: 'CCTV Footage Analysis', 
                            type: 'digital' as const, 
                            description: 'Visual evidence showing object misinterpretation', 
                            dateAdded: '2024-05-16', 
                            fileSize: '15.7 MB', 
                            tags: ['visual', 'misinterpretation'], 
                            caseId: 'INV-2024-789', 
                            exhibitNumber: 'B',
                            analysis: {
                              keyFindings: ['Charger mistaken for laptop', 'Low resolution camera'],
                              relevance: 'High',
                              reliability: 'Verified',
                              notes: 'Angle and resolution explain confusion'
                            }
                          },
                          { 
                            id: '3', 
                            name: 'Charger in Protective Case', 
                            type: 'physical' as const, 
                            description: 'Black charger in hard plastic rectangular case', 
                            dateAdded: '2024-05-17', 
                            fileSize: 'N/A', 
                            tags: ['physical', 'exhibit'], 
                            caseId: 'INV-2024-789', 
                            exhibitNumber: 'C',
                            analysis: {
                              keyFindings: ['Matches CCTV object dimensions', 'Owned by defendant for 2 years'],
                              relevance: 'Medium',
                              reliability: 'Verified',
                              notes: 'Explains object size in footage'
                            }
                          }
                        ].map((evidence) => (
                          <div 
                            key={evidence.id}
                            onClick={() => handleEvidenceSelect(evidence)}
                            className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                              selectedEvidence?.id === evidence.id 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-gray-900">{evidence.name}</div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                evidence.analysis?.relevance === 'High' 
                                  ? 'bg-red-100 text-red-800' 
                                  : evidence.analysis?.relevance === 'Medium' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {evidence.analysis?.relevance} Relevance
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{evidence.description}</div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {evidence.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Exhibit {evidence.exhibitNumber}</span>
                              <span>{evidence.dateAdded}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedEvidence && (
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-bold text-gray-900 mb-2">Evidence Analysis</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-900 mb-1">Key Findings</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {selectedEvidence.analysis?.keyFindings.map((finding, index) => (
                                <li key={index}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm mb-1">Reliability</h4>
                              <div className="text-sm text-gray-700">{selectedEvidence.analysis?.reliability}</div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm mb-1">Relevance</h4>
                              <div className="text-sm text-gray-700">{selectedEvidence.analysis?.relevance}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">Notes</h4>
                            <div className="text-sm text-gray-700">{selectedEvidence.analysis?.notes}</div>
                          </div>
                          <button className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                            Present Evidence in Court
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Character Panel */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-3">Court Participants</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {characters.slice(0, 2).map(renderCharacterAvatar)}
                    {renderJuryPanel()}
                  </div>
                  <div>
                    {characters.slice(2).map(renderCharacterAvatar)}
                    {renderWitnessPanel()}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
  );
};

export default AdvancedCourtroomSimulation;