import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { saveUserProgress } from '../utils/progressApi';

// Define types for the bail hearing script
interface Speaker {
  name: string;
  role: string;
  description: string;
  color: string;
}

interface DialogueSequence {
  sequence: number;
  speaker: string;
  action: string;
  dialogue: string;
}

interface CaseDetails {
  case_number: string;
  case_title: string;
  court: string;
  date: string;
  offense: string;
  value_of_property: string;
  presiding_officer: string;
}

interface BailHearingScript {
  case_details: CaseDetails;
  court_session: DialogueSequence[];
  post_hearing_procedures: DialogueSequence[];
  case_summary: any;
}

const Courtroom: React.FC<{}> = () => {
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationFrameIdRef = useRef<number>(0);
  const clockRef = useRef<any>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const controlsPanelRef = useRef<HTMLDivElement>(null);
  const welcomePanelRef = useRef<HTMLDivElement>(null);
  const lightsIndicatorRef = useRef<HTMLDivElement>(null);
  const fansIndicatorRef = useRef<HTMLDivElement>(null);
  const witnessIndicatorRef = useRef<HTMLDivElement>(null);
  const modeIndicatorRef = useRef<HTMLDivElement>(null);
  const modeTextRef = useRef<HTMLSpanElement>(null);
  const lightsBtnRef = useRef<HTMLButtonElement>(null);
  const fansBtnRef = useRef<HTMLButtonElement>(null);
  const witnessBtnRef = useRef<HTMLButtonElement>(null);
  const nightBtnRef = useRef<HTMLButtonElement>(null);
  const doorBtnRef = useRef<HTMLButtonElement>(null);
  const lightsStatusRef = useRef<HTMLSpanElement>(null);
  const fansStatusRef = useRef<HTMLSpanElement>(null);
  const witnessStatusRef = useRef<HTMLSpanElement>(null);
  const doorStatusRef = useRef<HTMLSpanElement>(null);
  const nightStatusRef = useRef<HTMLSpanElement>(null);
  const soundBtnRef = useRef<HTMLButtonElement>(null);
  const controlsBtnRef = useRef<HTMLButtonElement>(null);
  
  // Conversation state management
  const [currentSequence, setCurrentSequence] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showUserOptions, setShowUserOptions] = useState<boolean>(false);
  const [bailHearingScript, setBailHearingScript] = useState<BailHearingScript | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  
  // Speaker information
  const speakersRef = useRef<Record<string, Speaker>>({
    "Court Clerk": {
      name: "Court Clerk",
      role: "Court Official",
      description: "Responsible for maintaining court records and assisting the presiding officer",
      color: "#6b7280"
    },
    "Magistrate": {
      name: "Hon'ble Magistrate Smt. Kavitha Narayan",
      role: "Presiding Officer",
      description: "Judicial officer conducting the bail hearing",
      color: "#f59e0b"
    },
    "Defense Attorney": {
      name: "Defense Attorney",
      role: "Legal Representative",
      description: "Representing the accused in the bail hearing",
      color: "#3b82f6"
    },
    "Public Prosecutor": {
      name: "Public Prosecutor",
      role: "State Representative",
      description: "Representing the state in the legal proceedings",
      color: "#ef4444"
    },
    "Rajesh Kumar": {
      name: "Rajesh Kumar",
      role: "Accused",
      description: "Person seeking bail in the theft case",
      color: "#10b981"
    },
    "Ramesh Kumar": {
      name: "Ramesh Kumar",
      role: "Surety/Father",
      description: "Father of the accused, willing to stand surety",
      color: "#8b5cf6"
    },
    "Arjun Rao": {
      name: "Arjun Rao",
      role: "Surety/Brother-in-law",
      description: "Brother-in-law of the accused, willing to stand surety",
      color: "#ec4899"
    }
  });

  // State variables
  const stateRef = useRef({
    lightsOn: true,
    fansOn: true,
    witnessVisible: false,
    soundOn: true,
    doorOpen: false,
    nightMode: false,
    controlsVisible: true,
    currentView: 'free'
  });

  // References for 3D objects
  const lightsRef = useRef<any[]>([]);
  const fansRef = useRef<any[]>([]);
  const gavelObjRef = useRef<any>(null);
  const gavelHandleRef = useRef<any>(null);
  const witnessObjRef = useRef<any>(null);
  const doorObjRef = useRef<any>(null);
  const audienceMembersRef = useRef<any[]>([]);

  // Load bail hearing script
  useEffect(() => {
    // Use a more robust loading approach with error handling
    const loadBailHearingScript = async () => {
      try {
        // First try to load from the public directory
        const response = await fetch('/bail_hearing_script.json');
        if (response.ok) {
          const data = await response.json();
          setBailHearingScript(data);
        } else {
          // Fallback to a minimal script if loading fails
          setBailHearingScript({
            case_details: {
              case_number: "BAIL/2025/3847",
              case_title: "Rajesh Kumar vs State of Karnataka",
              court: "Court of Additional Chief Judicial Magistrate, Bangalore",
              date: "October 17, 2025",
              offense: "IPC Section 379 - Theft",
              value_of_property: "₹45,000",
              presiding_officer: "Hon'ble Magistrate Smt. Kavitha Narayan"
            },
            court_session: [],
            post_hearing_procedures: [],
            case_summary: {}
          });
        }
      } catch (error) {
        console.error('Error loading bail hearing script:', error);
        // Fallback to a minimal script if loading fails
        setBailHearingScript({
          case_details: {
            case_number: "BAIL/2025/3847",
            case_title: "Rajesh Kumar vs State of Karnataka",
            court: "Court of Additional Chief Judicial Magistrate, Bangalore",
            date: "October 17, 2025",
            offense: "IPC Section 379 - Theft",
            value_of_property: "₹45,000",
            presiding_officer: "Hon'ble Magistrate Smt. Kavitha Narayan"
          },
          court_session: [],
          post_hearing_procedures: [],
          case_summary: {}
        });
      }
    };

    loadBailHearingScript();
  }, []);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if ((window as any).appAudioContext && (window as any).appAudioContext.state === 'suspended') {
        (window as any).appAudioContext.resume();
      }
      
      // Hide the audio prompt
      const audioPrompt = document.getElementById('audio-prompt');
      if (audioPrompt) {
        audioPrompt.style.display = 'none';
      }
      
      // Remove event listener after first interaction
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    
    // Also try to initialize on touch devices
    document.addEventListener('touchstart', initAudio, { once: true });
    
    // Check if Three.js is already loaded to prevent multiple instances
    if ((window as any).THREE) {
      initCourtroom();
      return;
    }

    // Dynamically load Three.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      initCourtroom();
    };
    script.onerror = () => {
      console.error('Failed to load Three.js');
    };
    document.head.appendChild(script);

    return () => {
      // Clean up
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      // Stop any ongoing conversation
      setIsPlaying(false);
      setIsPaused(false);
      // Cancel any pending timeouts
      // Clear a reasonable range of timeout IDs (0-1000)
      for (let i = 0; i < 1000; i++) {
        clearTimeout(i);
      }
      // Don't remove the script if THREE is being used elsewhere
      // Remove audio event listeners
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
      // Stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const onWindowResize = (THREE: any) => {
    if (cameraRef.current && rendererRef.current && containerRef.current) {
      const container = containerRef.current;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    }
  };

  // Initialize the courtroom scene
  const initCourtroom = () => {
    // Get THREE from window object
    const THREE = (window as any).THREE;
    if (!THREE) {
      console.error('Three.js not loaded');
      return;
    }
    
    // Initialize container reference
    if (!containerRef.current) {
      console.error('Container not found');
      return;
    }
    
    // Set up scene, camera, and renderer
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x1a1a1a);
    sceneRef.current.fog = new THREE.Fog(0x1a1a1a, 20, 100);
    
    const container = containerRef.current;
    cameraRef.current = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    cameraRef.current.position.set(0, 8, 25);
    cameraRef.current.lookAt(0, 3, -15);
    
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.innerHTML = '';
    container.appendChild(rendererRef.current.domElement);
    
    // Build the courtroom
    buildRealisticCourtroom(THREE);
    setupAdvancedLighting(THREE);
    setupControls(THREE);
    
    // Hide loading screen
    if (loadingRef.current) {
      loadingRef.current.style.display = 'none';
    }
    
    // Start animation loop
    clockRef.current = new THREE.Clock();
    animate(THREE);
    
    // Add resize listener
    window.addEventListener('resize', () => onWindowResize(THREE));
  };

  const buildRealisticCourtroom = (THREE: any) => {
    if (!sceneRef.current) return;
    
    // Floor - Polished marble with reflection
    const floorGeometry = new THREE.PlaneGeometry(70, 90);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.3,
      metalness: 0.4,
      envMapIntensity: 0.5
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    sceneRef.current.add(floor);
    
    // Walls with texture
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xC8B895,
      roughness: 0.85,
      metalness: 0.05
    });
    
    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(70, 18, 1),
      wallMaterial
    );
    backWall.position.set(0, 9, -45);
    backWall.receiveShadow = true;
    sceneRef.current.add(backWall);
    
    // Side walls
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 18, 90),
      wallMaterial
    );
    leftWall.position.set(-35, 9, 0);
    leftWall.receiveShadow = true;
    sceneRef.current.add(leftWall);
    
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, 18, 90),
      wallMaterial
    );
    rightWall.position.set(35, 9, 0);
    rightWall.receiveShadow = true;
    sceneRef.current.add(rightWall);
    
    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 90),
      new THREE.MeshStandardMaterial({ 
        color: 0xF5F5DC, 
        roughness: 0.9,
        side: THREE.DoubleSide 
      })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 18;
    ceiling.receiveShadow = true;
    sceneRef.current.add(ceiling);
    
    // Build courtroom elements
    createRealisticJudgeBench(THREE);
    createRealisticWitnessStand(THREE);
    createRealisticLawyerTable(THREE, -10, -10, 0x3b82f6, "Defense");
    createRealisticLawyerTable(THREE, 10, -10, 0xef4444, "Prosecution");
    createRealisticAudienceGallery(THREE);
    createRealisticCeilingFans(THREE);
    createRealisticDoor(THREE);
    createIndianEmblem(THREE);
    createLadyJusticeStatue(THREE);
    createJuryBoxes(THREE);
    createAVScreen(THREE);
    createPillars(THREE);
  };

  const createRealisticJudgeBench = (THREE: any) => {
    const group = new THREE.Group();
    
    // Main platform - elevated
    const platformGeometry = new THREE.BoxGeometry(22, 2, 10);
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x5D4037,
      roughness: 0.6,
      metalness: 0.3
    });
    const platform = new THREE.Mesh(platformGeometry, woodMaterial);
    platform.position.y = 1;
    platform.castShadow = true;
    platform.receiveShadow = true;
    group.add(platform);
    
    // Desk top
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.4, 8),
      new THREE.MeshStandardMaterial({
        color: 0x6D4C41,
        roughness: 0.4,
        metalness: 0.4
      })
    );
    deskTop.position.set(0, 2.8, 0);
    deskTop.castShadow = true;
    group.add(deskTop);
    
    // Front panel with carvings
    const frontPanel = new THREE.Mesh(
      new THREE.BoxGeometry(20, 1.6, 0.4),
      new THREE.MeshStandardMaterial({
        color: 0x5D4037,
        roughness: 0.7
      })
    );
    frontPanel.position.set(0, 2, 3.8);
    group.add(frontPanel);
    
    // Decorative carvings
    for (let i = -8; i <= 8; i += 4) {
      const carving = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1.2, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x3E2723 })
      );
      carving.position.set(i, 2, 4);
      group.add(carving);
    }
    
    // Judge's chair
    const chairBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.3, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x2C1810 })
    );
    chairBase.position.set(0, 2.5, -2.5);
    chairBase.castShadow = true;
    group.add(chairBase);
    
    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1A1A1A })
    );
    chairBack.position.set(0, 4, -3.5);
    chairBack.castShadow = true;
    group.add(chairBack);
    
    // Judge figure - body
    const judgeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.9, 2.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x1A1A1A })
    );
    judgeBody.position.set(0, 4.2, -2.5);
    judgeBody.castShadow = true;
    group.add(judgeBody);
    
    // Judge head
    const judgeHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 20, 20),
      new THREE.MeshStandardMaterial({ 
        color: 0xFFDBB4,
        roughness: 0.8 
      })
    );
    judgeHead.position.set(0, 5.8, -2.5);
    judgeHead.castShadow = true;
    group.add(judgeHead);
    
    // Gavel handle
    const gavelHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1.4, 12),
      new THREE.MeshStandardMaterial({ 
        color: 0x6D4C41,
        roughness: 0.5,
        metalness: 0.2
      })
    );
    gavelHandle.position.set(4, 3.1, 1);
    gavelHandle.rotation.z = Math.PI / 2;
    group.add(gavelHandle);
    gavelHandleRef.current = gavelHandle;
    
    // Gavel head
    const gavelObj = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.7, 12),
      new THREE.MeshStandardMaterial({ 
        color: 0x5D4037,
        roughness: 0.6,
        metalness: 0.3
      })
    );
    gavelObj.position.set(4.7, 3.1, 1);
    gavelObj.rotation.z = Math.PI / 2;
    gavelObj.castShadow = true;
    group.add(gavelObj);
    gavelObjRef.current = gavelObj;
    
    // Gavel sound block
    const soundBlock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x3E2723 })
    );
    soundBlock.position.set(4.5, 2.95, 1);
    soundBlock.rotation.x = Math.PI / 2;
    group.add(soundBlock);
    
    // Bhagavad Gita book
    const gita = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.15, 0.9),
      new THREE.MeshStandardMaterial({ 
        color: 0x8B0000,
        roughness: 0.7
      })
    );
    gita.position.set(-3, 3.15, 0.5);
    gita.rotation.y = 0.3;
    gita.castShadow = true;
    group.add(gita);
    
    // Brass lamp
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 0.3, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0xDAA520,
        roughness: 0.3,
        metalness: 0.8
      })
    );
    lampBase.position.set(-4.5, 3.1, 0.5);
    group.add(lampBase);
    
    const lampFlame = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshStandardMaterial({ 
        color: 0xFFA500,
        emissive: 0xFF6600,
        emissiveIntensity: 0.8
      })
    );
    lampFlame.position.set(-4.5, 3.4, 0.5);
    group.add(lampFlame);
    
    // Police/Bodyguards
    for (let i = 0; i < 2; i++) {
      const xPos = i === 0 ? -8 : 8;
      const guardBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.7, 2.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x1C3D5A })
      );
      guardBody.position.set(xPos, 3.2, -3.5);
      guardBody.castShadow = true;
      group.add(guardBody);
      
      const guardHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xFFDBB4 })
      );
      guardHead.position.set(xPos, 4.5, -3.5);
      guardHead.castShadow = true;
      group.add(guardHead);
    }
    
    group.position.set(0, 0, -32);
    sceneRef.current.add(group);
  };

  const createRealisticWitnessStand = (THREE: any) => {
    const group = new THREE.Group();
    
    // Platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.4, 4),
      new THREE.MeshStandardMaterial({ 
        color: 0x6D4C41,
        roughness: 0.5,
        metalness: 0.3
      })
    );
    platform.position.y = 0.2;
    platform.castShadow = true;
    group.add(platform);
    
    // Witness box walls
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x5D4037,
      roughness: 0.7
    });
    
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 0.3),
      wallMat
    );
    backWall.position.set(0, 1.5, -1.85);
    group.add(backWall);
    
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2.5, 4),
      wallMat
    );
    leftWall.position.set(-1.85, 1.5, 0);
    group.add(leftWall);
    
    const frontRail = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.2, 0.2),
      wallMat
    );
    frontRail.position.set(0, 1.5, 1.9);
    group.add(frontRail);
    
    // Witness figure (initially hidden)
    const witnessBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.65, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x2C3E50 })
    );
    witnessBody.position.set(0, 1.7, 0);
    witnessBody.castShadow = true;
    witnessBody.visible = false;
    group.add(witnessBody);
    
    const witnessHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xFFDBB4 })
    );
    witnessHead.position.set(0, 3.2, 0);
    witnessHead.castShadow = true;
    witnessHead.visible = false;
    group.add(witnessHead);
    
    witnessObjRef.current = { body: witnessBody, head: witnessHead, group: group };
    
    group.position.set(14, 0, -16);
    sceneRef.current.add(group);
  };

  const createRealisticLawyerTable = (THREE: any, x: number, z: number, color: number, label: string) => {
    const group = new THREE.Group();
    
    // Table top
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.25, 5),
      new THREE.MeshStandardMaterial({ 
        color: 0x6D4C41,
        roughness: 0.4,
        metalness: 0.4
      })
    );
    tableTop.position.y = 1.2;
    tableTop.castShadow = true;
    group.add(tableTop);
    
    // Table legs
    const legPositions = [
      [-3, 0.6, -2],
      [3, 0.6, -2],
      [-3, 0.6, 2],
      [3, 0.6, 2]
    ];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 1.2, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x5D4037 })
      );
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      group.add(leg);
    });
    
    // Laptop
    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.05, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    laptop.position.set(-1.5, 1.35, -0.5);
    laptop.castShadow = true;
    group.add(laptop);
    
    // Paper stacks
    for (let i = 0; i < 2; i++) {
      const papers = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.2, 1.1),
        new THREE.MeshStandardMaterial({ color: 0xFFFAF0 })
      );
      papers.position.set(1 + i * 1.5, 1.35, -0.3);
      papers.castShadow = true;
      group.add(papers);
    }
    
    // Chair
    const chairSeat = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.2, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x5D4037 })
    );
    chairSeat.position.set(0, 1, 3);
    chairSeat.castShadow = true;
    group.add(chairSeat);
    
    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x5D4037 })
    );
    chairBack.position.set(0, 2, 3.6);
    chairBack.castShadow = true;
    group.add(chairBack);
    
    // Lawyer figure
    const lawyerBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x1A1A1A })
    );
    lawyerBody.position.set(0, 2.5, 3);
    lawyerBody.castShadow = true;
    group.add(lawyerBody);
    
    const lawyerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xFFDBB4 })
    );
    lawyerHead.position.set(0, 3.8, 3);
    lawyerHead.castShadow = true;
    group.add(lawyerHead);
    
    // File folders
    const folder = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.15, 1.3),
      new THREE.MeshStandardMaterial({ color: color })
    );
    folder.position.set(-2, 1.4, 0.5);
    folder.castShadow = true;
    group.add(folder);
    
    group.position.set(x, 0, z);
    sceneRef.current.add(group);
  };

  const createRealisticAudienceGallery = (THREE: any) => {
    audienceMembersRef.current = [];
    for (let row = 0; row < 5; row++) {
      for (let seat = 0; seat < 10; seat++) {
        const x = (seat - 4.5) * 2;
        const z = 12 + row * 2.5;
        
        // Seat
        const seatMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.3, 1.4),
          new THREE.MeshStandardMaterial({ 
            color: 0x6D4C41,
            roughness: 0.6
          })
        );
        seatMesh.position.set(x, 0.15, z);
        seatMesh.castShadow = true;
        sceneRef.current.add(seatMesh);
        
        // Backrest
        const backrest = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 1.8, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x5D4037 })
        );
        backrest.position.set(x, 1.1, z - 0.6);
        backrest.castShadow = true;
        sceneRef.current.add(backrest);
        
        // Audience member (random occupancy)
        if (Math.random() > 0.25) {
          const colors = [0x2C3E50, 0x34495E, 0x5D6D7E, 0x1C2833];
          const bodyColor = colors[Math.floor(Math.random() * colors.length)];
          
          const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.5, 1.8, 12),
            new THREE.MeshStandardMaterial({ color: bodyColor })
          );
          body.position.set(x, 1.3, z);
          body.castShadow = true;
          sceneRef.current.add(body);
          
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFDBB4 })
          );
          head.position.set(x, 2.3, z);
          head.castShadow = true;
          sceneRef.current.add(head);
          
          audienceMembersRef.current.push({ body, head });
        }
      }
    }
  };

  const createRealisticCeilingFans = (THREE: any) => {
    fansRef.current = [];
    const positions = [
      [-12, 16.5, -22],
      [12, 16.5, -22],
      [-12, 16.5, 0],
      [12, 16.5, 0]
    ];
    
    positions.forEach(pos => {
      const group = new THREE.Group();
      
      // Motor housing
      const motor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.7, 1, 20),
        new THREE.MeshStandardMaterial({ 
          color: 0x444444,
          roughness: 0.4,
          metalness: 0.6
        })
      );
      group.add(motor);
      
      // Fan blades
      for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(3.5, 0.12, 0.7),
          new THREE.MeshStandardMaterial({ 
            color: 0x6D4C41,
            roughness: 0.5
          })
        );
        blade.rotation.y = (i * Math.PI) / 2;
        blade.position.y = -0.6;
        blade.castShadow = true;
        group.add(blade);
      }
      
      group.position.set(pos[0], pos[1], pos[2]);
      sceneRef.current.add(group);
      fansRef.current.push(group);
    });
  };

  const createRealisticDoor = (THREE: any) => {
    const group = new THREE.Group();
    
    // Door frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(4, 6, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x5D4037 })
    );
    group.add(frame);
    
    // Door panel
    const doorObj = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 5.5, 0.3),
      new THREE.MeshStandardMaterial({ 
        color: 0x6D4C41,
        roughness: 0.6
      })
    );
    doorObj.position.z = 0.2;
    doorObj.castShadow = true;
    group.add(doorObj);
    doorObjRef.current = doorObj;
    
    // Door handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, 0.3),
      new THREE.MeshStandardMaterial({ 
        color: 0xDAA520,
        roughness: 0.3,
        metalness: 0.8
      })
    );
    handle.position.set(1.2, 0, 0.4);
    doorObj.add(handle);
    
    group.position.set(-30, 3, 40);
    group.rotation.y = Math.PI / 2;
    sceneRef.current.add(group);
  };

  const createIndianEmblem = (THREE: any) => {
    const group = new THREE.Group();
    
    // Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.4, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        roughness: 0.2,
        metalness: 0.9
      })
    );
    group.add(base);
    
    // Ashoka Pillar (simplified)
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 2.5, 24),
      new THREE.MeshStandardMaterial({ 
        color: 0xDAA520,
        roughness: 0.3,
        metalness: 0.8
      })
    );
    pillar.position.y = 1.5;
    group.add(pillar);
    
    // Lions (simplified as spheres)
    for (let i = 0; i < 4; i++) {
      const lion = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xB8860B,
          roughness: 0.4,
          metalness: 0.7
        })
      );
      const angle = (i * Math.PI) / 2;
      lion.position.set(
        Math.cos(angle) * 0.6,
        2.8,
        Math.sin(angle) * 0.6
      );
      group.add(lion);
    }
    
    // Dharma Chakra on top
    const chakra = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.08, 16, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x000080,
        roughness: 0.3,
        metalness: 0.8
      })
    );
    chakra.position.y = 3.5;
    chakra.rotation.x = Math.PI / 2;
    group.add(chakra);
    
    group.position.set(0, 12, -44.5);
    sceneRef.current.add(group);
  };

  const createLadyJusticeStatue = (THREE: any) => {
    const group = new THREE.Group();
    
    // Pedestal
    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2, 1.5),
      new THREE.MeshStandardMaterial({ 
        color: 0xE0E0E0,
        roughness: 0.5,
        metalness: 0.3
      })
    );
    pedestal.position.y = 1;
    pedestal.castShadow = true;
    group.add(pedestal);
    
    // Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 2, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0xF5F5F5,
        roughness: 0.4,
        metalness: 0.4
      })
    );
    body.position.y = 3.2;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0xF5F5F5,
        roughness: 0.4
      })
    );
    head.position.y = 4.5;
    head.castShadow = true;
    group.add(head);
    
    // Blindfold
    const blindfold = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.15, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    blindfold.position.set(0, 4.5, 0.2);
    group.add(blindfold);
    
    // Scales (left arm)
    const scaleBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
      new THREE.MeshStandardMaterial({ 
        color: 0xDAA520,
        metalness: 0.9
      })
    );
    scaleBase.position.set(-0.6, 3.8, 0);
    scaleBase.rotation.z = Math.PI / 2;
    group.add(scaleBase);
    
    // Scale pans
    [-1, -0.2].forEach(xOffset => {
      const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.15, 0.1, 16),
        new THREE.MeshStandardMaterial({ 
          color: 0xDAA520,
          metalness: 0.9
        })
      );
      pan.position.set(xOffset, 3.8, 0);
      group.add(pan);
    });
    
    // Sword (right arm)
    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.2, 0.05),
      new THREE.MeshStandardMaterial({ 
        color: 0xC0C0C0,
        metalness: 0.95,
        roughness: 0.1
      })
    );
    sword.position.set(0.6, 3.2, 0);
    sword.castShadow = true;
    group.add(sword);
    
    group.position.set(-10, 0, -38);
    sceneRef.current.add(group);
  };

  const createJuryBoxes = (THREE: any) => {
    [-18, 18].forEach(xPos => {
      const group = new THREE.Group();
      
      // Box structure
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0x5D4037,
          roughness: 0.7
        })
      );
      box.position.y = 1;
      box.castShadow = true;
      group.add(box);
      
      // Front railing
      const railing = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.3, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x6D4C41 })
      );
      railing.position.set(0, 1.5, 4);
      group.add(railing);
      
      // Seats
      for (let i = 0; i < 3; i++) {
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.2, 1.5),
          new THREE.MeshStandardMaterial({ color: 0x6D4C41 })
        );
        seat.position.set(-2 + i * 2, 0.8, -2 + (i % 2) * 2);
        seat.castShadow = true;
        group.add(seat);
      }
      
      group.position.set(xPos, 0, -20);
      sceneRef.current.add(group);
    });
  };

  const createAVScreen = (THREE: any) => {
    const screenGroup = new THREE.Group();
    
    // Screen frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4.5, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x2C2C2C })
    );
    screenGroup.add(frame);
    
    // Screen display
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 4),
      new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        emissive: 0x0f3460,
        emissiveIntensity: 0.3
      })
    );
    screen.position.z = 0.15;
    screenGroup.add(screen);
    
    screenGroup.position.set(0, 8, -25);
    sceneRef.current.add(screenGroup);
  };

  const createPillars = (THREE: any) => {
    const positions = [
      [-28, 0, -35],
      [28, 0, -35],
      [-28, 0, -10],
      [28, 0, -10]
    ];
    
    positions.forEach(pos => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1, 16, 20),
        new THREE.MeshStandardMaterial({ 
          color: 0xC8B895,
          roughness: 0.7
        })
      );
      pillar.position.set(pos[0], pos[1] + 8, pos[2]);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      sceneRef.current.add(pillar);
      
      // Capital
      const capital = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.8, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xDAA520 })
      );
      capital.position.set(pos[0], 16.5, pos[2]);
      sceneRef.current.add(capital);
    });
  };

  const setupAdvancedLighting = (THREE: any) => {
    lightsRef.current = [];
    
    // Ambient light
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.5);
    sceneRef.current.add(ambient);
    lightsRef.current.push(ambient);
    
    // Main directional light (sunlight)
    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    mainLight.position.set(15, 25, 15);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    sceneRef.current.add(mainLight);
    lightsRef.current.push(mainLight);
    
    // Judge spotlight
    const judgeSpot = new THREE.SpotLight(0xFFF5E1, 1.2, 60, Math.PI / 5, 0.4);
    judgeSpot.position.set(0, 16, -25);
    judgeSpot.target.position.set(0, 3, -32);
    judgeSpot.castShadow = true;
    judgeSpot.shadow.mapSize.width = 1024;
    judgeSpot.shadow.mapSize.height = 1024;
    sceneRef.current.add(judgeSpot);
    sceneRef.current.add(judgeSpot.target);
    lightsRef.current.push(judgeSpot);
    
    // Witness spotlight
    const witnessSpot = new THREE.SpotLight(0xFFF5E1, 1.0, 50, Math.PI / 5, 0.4);
    witnessSpot.position.set(14, 16, -10);
    witnessSpot.target.position.set(14, 2, -16);
    witnessSpot.castShadow = true;
    sceneRef.current.add(witnessSpot);
    sceneRef.current.add(witnessSpot.target);
    lightsRef.current.push(witnessSpot);
    
    // Ceiling lights
    const ceilingPositions = [
      [-15, 16, -15],
      [15, 16, -15],
      [-15, 16, 10],
      [15, 16, 10]
    ];
    
    ceilingPositions.forEach(pos => {
      const pointLight = new THREE.PointLight(0xFFFAF0, 0.6, 30);
      pointLight.position.set(pos[0], pos[1], pos[2]);
      pointLight.castShadow = true;
      sceneRef.current.add(pointLight);
      lightsRef.current.push(pointLight);
    });
    
    // Fill lights for softer shadows
    const fillLight1 = new THREE.DirectionalLight(0xFFE4B5, 0.3);
    fillLight1.position.set(-20, 10, 10);
    sceneRef.current.add(fillLight1);
    lightsRef.current.push(fillLight1);
    
    const fillLight2 = new THREE.DirectionalLight(0xFFE4B5, 0.3);
    fillLight2.position.set(20, 10, 10);
    sceneRef.current.add(fillLight2);
    lightsRef.current.push(fillLight2);
  };

  const setupControls = (THREE: any) => {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Mouse drag controls
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.domElement.addEventListener('mousedown', (e: any) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });
      
      rendererRef.current.domElement.addEventListener('mousemove', (e: any) => {
        if (!isDragging || !cameraRef.current) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        // Calculate spherical coordinates
        const radius = Math.sqrt(
          Math.pow(cameraRef.current.position.x, 2) + 
          Math.pow(cameraRef.current.position.z, 2)
        );
        const angle = Math.atan2(cameraRef.current.position.z, cameraRef.current.position.x);
        
        // Update camera position
        cameraRef.current.position.x = radius * Math.cos(angle - deltaX * 0.005);
        cameraRef.current.position.z = radius * Math.sin(angle - deltaX * 0.005);
        cameraRef.current.position.y = Math.max(2, Math.min(25, cameraRef.current.position.y - deltaY * 0.05));
        
        cameraRef.current.lookAt(0, 3, -15);
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });
      
      rendererRef.current.domElement.addEventListener('mouseup', () => {
        isDragging = false;
      });
      
      rendererRef.current.domElement.addEventListener('mouseleave', () => {
        isDragging = false;
      });
      
      // Zoom with scroll
      rendererRef.current.domElement.addEventListener('wheel', (e: any) => {
        e.preventDefault();
        
        if (!cameraRef.current) return;
        
        const direction = new THREE.Vector3();
        cameraRef.current.getWorldDirection(direction);
        
        const zoomSpeed = -e.deltaY * 0.01;
        cameraRef.current.position.addScaledVector(direction, zoomSpeed);
        
        // Limit zoom
        const dist = cameraRef.current.position.length();
        if (dist < 5) {
          cameraRef.current.position.normalize().multiplyScalar(5);
        } else if (dist > 50) {
          cameraRef.current.position.normalize().multiplyScalar(50);
        }
      }, { passive: false });
    }
    
    // Keyboard event listeners
    document.addEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    switch(key) {
      case 'l':
        toggleLights();
        break;
      case 'f':
        toggleFans();
        break;
      case 'g':
        triggerGavel();
        break;
      case 'w':
        toggleWitness();
        break;
      case 'd':
        toggleDoor();
        break;
      case 'n':
        toggleNightMode();
        break;
      case 'r':
        resetCamera();
        break;
      case '1':
        setCameraView('judge');
        break;
      case '2':
        setCameraView('witness');
        break;
      case '3':
        setCameraView('audience');
        break;
      case '4':
        setCameraView('free');
        break;
      default:
        break;
    }
  };

  const toggleLights = () => {
    const state = stateRef.current;
    state.lightsOn = !state.lightsOn;
    
    lightsRef.current.forEach((light, i) => {
      if (i === 0) { // Ambient
        light.intensity = state.lightsOn ? 0.5 : 0.15;
      } else if (i === 1) { // Main directional
        light.intensity = state.lightsOn ? 1.0 : 0.3;
      } else { // Spotlights and others
        light.intensity = state.lightsOn ? (light.intensity > 0.8 ? 1.2 : 0.6) : 0.2;
      }
    });
    
    if (lightsStatusRef.current) {
      lightsStatusRef.current.textContent = state.lightsOn ? 'ON' : 'OFF';
    }
    
    if (lightsBtnRef.current) {
      if (state.lightsOn) {
        lightsBtnRef.current.classList.add('active');
        lightsBtnRef.current.classList.remove('yellow');
      } else {
        lightsBtnRef.current.classList.remove('active');
        lightsBtnRef.current.classList.add('yellow');
      }
    }
    
    if (lightsIndicatorRef.current) {
      lightsIndicatorRef.current.className = 'w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ' + 
        (state.lightsOn ? 'bg-amber-400 text-amber-400' : 'bg-gray-500 text-gray-500');
    }
  };

  const toggleFans = () => {
    const state = stateRef.current;
    state.fansOn = !state.fansOn;
    
    if (fansStatusRef.current) {
      fansStatusRef.current.textContent = state.fansOn ? 'ON' : 'OFF';
    }
    
    if (fansBtnRef.current) {
      if (state.fansOn) {
        fansBtnRef.current.classList.add('active');
        fansBtnRef.current.classList.remove('blue');
      } else {
        fansBtnRef.current.classList.remove('active');
        fansBtnRef.current.classList.add('blue');
      }
    }
    
    if (fansIndicatorRef.current) {
      fansIndicatorRef.current.className = 'w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ' + 
        (state.fansOn ? 'bg-blue-500 text-blue-500 animate-pulse' : 'bg-gray-500 text-gray-500');
    }
  };

  const toggleWitness = () => {
    const state = stateRef.current;
    state.witnessVisible = !state.witnessVisible;
    
    if (witnessObjRef.current) {
      if (state.witnessVisible) {
        // Animate witness entering
        witnessObjRef.current.body.visible = true;
        witnessObjRef.current.head.visible = true;
        
        // Start from side position
        if (witnessObjRef.current.body && witnessObjRef.current.head) {
          witnessObjRef.current.body.position.set(-5, 1.7, 0);
          witnessObjRef.current.head.position.set(-5, 3.2, 0);
          
          // Animate to center
          animateWitnessEntry();
        }
      } else {
        witnessObjRef.current.body.visible = false;
        witnessObjRef.current.head.visible = false;
      }
    }
    
    if (witnessStatusRef.current) {
      witnessStatusRef.current.textContent = state.witnessVisible ? 'PRESENT' : 'ABSENT';
    }
    
    if (witnessBtnRef.current) {
      witnessBtnRef.current.classList.remove('red', 'green');
      witnessBtnRef.current.classList.add(state.witnessVisible ? 'green' : 'red');
    }
    
    if (witnessIndicatorRef.current) {
      witnessIndicatorRef.current.className = 'w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ' + 
        (state.witnessVisible ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500');
    }
  };

  const animateWitnessEntry = () => {
    if (!witnessObjRef.current) return;
    
    const startX = -5;
    const endX = 0;
    const duration = 2500; // 2.5 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
      const currentX = startX + (endX - startX) * eased;
      
      if (witnessObjRef.current && witnessObjRef.current.body.visible) {
        if (witnessObjRef.current.body) witnessObjRef.current.body.position.x = currentX;
        if (witnessObjRef.current.head) witnessObjRef.current.head.position.x = currentX;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const toggleDoor = () => {
    const state = stateRef.current;
    state.doorOpen = !state.doorOpen;
    
    if (doorObjRef.current) {
      doorObjRef.current.rotation.y = state.doorOpen ? Math.PI / 2 : 0;
    }
    
    if (doorStatusRef.current) {
      doorStatusRef.current.textContent = state.doorOpen ? 'OPEN' : 'CLOSED';
    }
    
    if (doorBtnRef.current) {
      if (state.doorOpen) {
        doorBtnRef.current.classList.add('active');
        doorBtnRef.current.classList.remove('gray');
      } else {
        doorBtnRef.current.classList.remove('active');
        doorBtnRef.current.classList.add('gray');
      }
    }
  };

  const toggleNightMode = () => {
    const state = stateRef.current;
    state.nightMode = !state.nightMode;
    
    if (sceneRef.current) {
      sceneRef.current.background = new (window as any).THREE.Color(state.nightMode ? 0x0a0a0a : 0x1a1a1a);
    }
    
    lightsRef.current.forEach((light, i) => {
      if (i === 0) { // Ambient
        light.intensity = state.nightMode ? 0.15 : 0.5;
      } else if (i === 1) { // Main directional
        light.intensity = state.nightMode ? 0.3 : 1.0;
        if (state.nightMode) {
          light.color.setHex(0x4169E1);
        } else {
          light.color.setHex(0xFFFFFF);
        }
      } else if (light.type === 'SpotLight') {
        light.intensity = state.nightMode ? 0.8 : 1.2;
        if (state.nightMode) {
          light.color.setHex(0xFFE4B5);
        } else {
          light.color.setHex(0xFFF5E1);
        }
      }
    });
    
    if (sceneRef.current) {
      sceneRef.current.fog.color.setHex(state.nightMode ? 0x0a0a0a : 0x1a1a1a);
    }
    
    if (nightStatusRef.current) {
      nightStatusRef.current.textContent = state.nightMode ? 'ON' : 'OFF';
    }
    
    if (nightBtnRef.current) {
      if (state.nightMode) {
        nightBtnRef.current.classList.add('active');
        nightBtnRef.current.classList.remove('indigo');
      } else {
        nightBtnRef.current.classList.remove('active');
        nightBtnRef.current.classList.add('indigo');
      }
    }
    
    if (modeIndicatorRef.current) {
      modeIndicatorRef.current.className = 'w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ' + 
        (state.nightMode ? 'bg-indigo-500 text-indigo-500' : 'bg-amber-500 text-amber-500');
    }
    
    if (modeTextRef.current) {
      modeTextRef.current.textContent = state.nightMode ? 'Night' : 'Day';
    }
  };

  const toggleSound = () => {
    const state = stateRef.current;
    state.soundOn = !state.soundOn;
    
    if (soundBtnRef.current) {
      soundBtnRef.current.innerHTML = state.soundOn ? '🔊 Sound ON' : '🔇 Sound OFF';
    }
  };

  const toggleControls = () => {
    const state = stateRef.current;
    state.controlsVisible = !state.controlsVisible;
    
    if (controlsPanelRef.current) {
      if (state.controlsVisible) {
        controlsPanelRef.current.classList.remove('hidden');
      } else {
        controlsPanelRef.current.classList.add('hidden');
      }
    }
    
    if (welcomePanelRef.current) {
      (welcomePanelRef.current as HTMLElement).style.display = state.controlsVisible ? 'block' : 'none';
    }
    
    if (controlsBtnRef.current) {
      controlsBtnRef.current.textContent = state.controlsVisible ? 'Hide Controls' : 'Show Controls';
    }
  };

  const setCameraView = (view: string) => {
    if (!cameraRef.current) return;
    
    const views: any = {
      judge: { pos: [0, 6, -20], target: [0, 4, -30] },
      witness: { pos: [8, 5, -10], target: [12, 2, -15] },
      audience: { pos: [0, 8, 20], target: [0, 3, -10] },
      free: { pos: [0, 8, 25], target: [0, 3, -15] }
    };
    
    const config = views[view];
    if (config) {
      animateCameraTransition(
        cameraRef.current.position.toArray(),
        config.pos,
        config.target
      );
    }
    
    // Update current view in state
    stateRef.current.currentView = view;
  };

  const animateCameraTransition = (startPos: number[], endPos: number[], targetPos: number[]) => {
    if (!cameraRef.current) return;
    
    const duration = 1500;
    const startTime = Date.now();
    const startTarget = new (window as any).THREE.Vector3(0, 3, -15);
    const endTarget = new (window as any).THREE.Vector3(...targetPos);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      
      if (cameraRef.current) {
        cameraRef.current.position.set(
          startPos[0] + (endPos[0] - startPos[0]) * eased,
          startPos[1] + (endPos[1] - startPos[1]) * eased,
          startPos[2] + (endPos[2] - startPos[2]) * eased
        );
        
        const currentTarget = new (window as any).THREE.Vector3().lerpVectors(startTarget, endTarget, eased);
        cameraRef.current.lookAt(currentTarget);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const playGavelSound = () => {
    try {
      // Create a single audio context for the app if it doesn't exist
      if (!(window as any).appAudioContext) {
        (window as any).appAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        // Resume audio context on first user interaction
        if ((window as any).appAudioContext.state === 'suspended') {
          (window as any).appAudioContext.resume();
        }
      }
      
      const audioContext = (window as any).appAudioContext;
      
      // Ensure audio context is running
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create realistic gavel bang sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      // Connect nodes
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(120, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      // Add echo effect
      const delay = audioContext.createDelay();
      const delayGain = audioContext.createGain();
      
      delay.delayTime.setValueAtTime(0.2, audioContext.currentTime);
      delayGain.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      gainNode.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(audioContext.destination);
      
      // Play
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Ensure the audio context is unlocked by playing a short silent sound
      const unlockAudio = () => {
        const silentOsc = audioContext.createOscillator();
        const silentGain = audioContext.createGain();
        silentGain.gain.setValueAtTime(0, audioContext.currentTime);
        silentOsc.connect(silentGain);
        silentGain.connect(audioContext.destination);
        silentOsc.start(audioContext.currentTime);
        silentOsc.stop(audioContext.currentTime + 0.1);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
      
      document.addEventListener('click', unlockAudio);
      document.addEventListener('keydown', unlockAudio);
    } catch (e) {
      console.log('Audio playback not supported');
      // Fallback: Try to play a simple gavel sound
      try {
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (fallbackError) {
        console.log('Fallback gavel sound also failed');
      }
    }
  };

  // Function to play speaker voice with gender-based pitch
  const playSpeakerVoice = (speaker: string, text: string = '') => {
    // Only play sound if sound is enabled
    if (!stateRef.current.soundOn) return;
    
    try {
      // Try to use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text || `${speaker} is speaking`);
        
        // Set voice properties based on speaker
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Map speakers to voice characteristics
        switch(speaker) {
          case 'Magistrate':
          case 'Hon\'ble Magistrate Smt. Kavitha Narayan':
          case 'Court Clerk':
          case 'Public Prosecutor':
          case 'Rajesh Kumar':
          case 'Ramesh Kumar':
          case 'Arjun Rao':
          case 'Prakash Mehta':
            utterance.pitch = 0.4; // Lower pitch for male voices
            break;
          case 'Defense Attorney':
            utterance.pitch = 0.6; // Slightly higher pitch
            break;
          default:
            utterance.pitch = 0.5; // Default pitch
        }
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
        console.log(`Speaking for: ${speaker}: ${text}`);
        return;
      }
      
      // Fallback to audio context if speech synthesis is not available
      // Create a single audio context for the app if it doesn't exist
      if (!(window as any).appAudioContext) {
        (window as any).appAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        // Resume audio context on first user interaction
        if ((window as any).appAudioContext.state === 'suspended') {
          (window as any).appAudioContext.resume();
        }
      }
      
      const audioContext = (window as any).appAudioContext;
      
      // Ensure audio context is running
      if (audioContext.state === 'suspended') {
        // Try to resume on user interaction
        const resumeAudio = () => {
          audioContext.resume();
          document.removeEventListener('click', resumeAudio);
          document.removeEventListener('keydown', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
      }
      
      // Create a more distinctive sound for each speaker using multiple harmonics
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const oscillator3 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Set pitch based on speaker gender
      let frequency1 = 200; // Base frequency
      let frequency2 = 300; // Harmonic frequency
      let frequency3 = 400; // Second harmonic
      
      // Map speakers to gender-based frequencies
      switch(speaker) {
        case 'Magistrate':
        case 'Hon\'ble Magistrate Smt. Kavitha Narayan':
        case 'Court Clerk':
        case 'Public Prosecutor':
        case 'Rajesh Kumar':
        case 'Ramesh Kumar':
        case 'Arjun Rao':
        case 'Prakash Mehta':
          frequency1 = 180; // Lower pitch for male voices
          frequency2 = 280;
          frequency3 = 380;
          break;
        case 'Defense Attorney':
          frequency1 = 220; // Higher pitch for this male voice
          frequency2 = 320;
          frequency3 = 420;
          break;
        default:
          frequency1 = 200; // Default pitch
          frequency2 = 300;
          frequency3 = 400;
      }
      
      // Configure sounds with different wave types for richer sound
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(frequency1, audioContext.currentTime);
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(frequency2, audioContext.currentTime);
      
      oscillator3.type = 'sine';
      oscillator3.frequency.setValueAtTime(frequency3, audioContext.currentTime);
      
      // Configure volume envelope with a more pronounced attack
      gainNode.gain.setValueAtTime(0.0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + 0.05); // Very quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.5); // Longer decay
      
      // Add slight reverb for realism
      const delay = audioContext.createDelay(0.5);
      const delayGain = audioContext.createGain();
      
      delay.delayTime.setValueAtTime(0.2, audioContext.currentTime);
      delayGain.gain.setValueAtTime(0.5, audioContext.currentTime);
      
      // Connect nodes properly
      const merger = audioContext.createGain();
      oscillator1.connect(merger);
      oscillator2.connect(merger);
      oscillator3.connect(merger);
      merger.connect(gainNode);
      gainNode.connect(audioContext.destination);
      // Add reverb effect
      gainNode.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(audioContext.destination);
      
      // Play briefly to indicate speaker
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator3.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 2.5); // Longer duration
      oscillator2.stop(audioContext.currentTime + 2.5); // Longer duration
      oscillator3.stop(audioContext.currentTime + 2.5); // Longer duration
      
      // Add visual feedback
      console.log(`Playing voice for: ${speaker}`);
      
      // Ensure the audio context is unlocked by playing a short silent sound
      const unlockAudio = () => {
        const silentOsc = audioContext.createOscillator();
        const silentGain = audioContext.createGain();
        silentGain.gain.setValueAtTime(0, audioContext.currentTime);
        silentOsc.connect(silentGain);
        silentGain.connect(audioContext.destination);
        silentOsc.start(audioContext.currentTime);
        silentOsc.stop(audioContext.currentTime + 0.1);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };
      
      document.addEventListener('click', unlockAudio);
      document.addEventListener('keydown', unlockAudio);
    } catch (e) {
      console.log('Voice playback not supported');
      // Fallback: Try to play a simple beep sound
      try {
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (fallbackError) {
        console.log('Fallback voice playback also failed');
      }
    }
  };

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const resetCamera = () => {
    setCameraView('free');
  };

  const triggerGavel = () => {
    if (!gavelObjRef.current || !gavelHandleRef.current) return;
    
    // Store original positions
    const origGavelY = gavelObjRef.current.position.y;
    const origHandleY = gavelHandleRef.current.position.y;
    
    // Animate gavel strike
    const startTime = Date.now();
    const duration = 400; // 0.4 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Strike down and up
      let offset;
      if (progress < 0.5) {
        offset = easeInOutCubic(progress * 2) * 0.4;
      } else {
        offset = easeInOutCubic(2 - progress * 2) * 0.4;
      }
      
      if (gavelObjRef.current) gavelObjRef.current.position.y = origGavelY + offset;
      if (gavelHandleRef.current) gavelHandleRef.current.position.y = origHandleY + offset;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    // Play sound
    if (stateRef.current.soundOn) {
      playGavelSound();
    }
  };

  // Function to automatically trigger gavel when needed
  const autoTriggerGavel = (sequence: DialogueSequence) => {
    // Check if the sequence contains words that would trigger the gavel
    if ((sequence.dialogue.toLowerCase().includes('order') && Math.random() > 0.95) || 
        (sequence.dialogue.toLowerCase().includes('silence') && Math.random() > 0.95) ||
        (sequence.speaker === 'Magistrate' && sequence.action.includes('BANG'))) {
      // Add a small delay to make it more realistic
      setTimeout(() => {
        triggerGavel();
      }, 500);
    }
  };

  // Function to handle user response
  const handleUserResponse = (response: string) => {
    setShowUserOptions(false);
    
    // Add user response to conversation flow
    switch(response) {
      case "agree":
        console.log("User agreed and confirmed understanding");
        break;
      case "ask":
        console.log("User asked for clarification");
        break;
      case "object":
        console.log("User objected to conditions");
        break;
      case "silent":
        console.log("User remained silent");
        break;
      default:
        console.log("User responded with: " + response);
    }
    
    // Continue the conversation
    setTimeout(() => {
      setCurrentSequence(prev => prev + 1);
      setIsPlaying(true);
      processNextSequence();
    }, 1000);
  };
  
  // Function to start voice recognition
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      console.log('Voice recognition started');
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);
      console.log('Recognized text:', transcript);
      
      // Process the recognized text
      // For now, we'll just close the options panel and continue
      setShowUserOptions(false);
      
      // Continue the conversation
      setTimeout(() => {
        setCurrentSequence(prev => prev + 1);
        setIsPlaying(true);
        processNextSequence();
      }, 1000);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      alert('Speech recognition error: ' + event.error);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended');
    };
    
    recognition.start();
  };

  // Function to start the conversation
  const startConversation = () => {
    if (bailHearingScript && bailHearingScript.court_session.length > 0) {
      setIsPlaying(true);
      setCurrentSequence(0);
      processNextSequence();
    }
  };

  // Function to process the next sequence in the conversation
  const processNextSequence = () => {
    if (!bailHearingScript) return;
    
    const sequences = [...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures];
    
    if (currentSequence < sequences.length) {
      const sequence = sequences[currentSequence];
      
      // Focus on the speaker
      focusOnSpeaker(sequence.speaker);
      
      // Check if it's user's turn to speak (Defense Attorney)
      // Looking for key moments where the Defense Attorney presents arguments
      if (sequence.speaker === "Defense Attorney" && 
          (sequence.dialogue.includes("Please proceed") || 
           sequence.dialogue.includes("I now submit") ||
           sequence.dialogue.includes("I respectfully propose") ||
           sequence.dialogue.includes("Your Honour, I wish to cite"))) {
        setShowUserOptions(true);
        setIsPlaying(false);
      } else {
        // Continue automatically after a delay based on text length
        // Estimate 100ms per word + 2 seconds padding
        const wordCount = sequence.dialogue.split(' ').length;
        const delay = Math.max(8000, Math.min(20000, wordCount * 100 + 2000));
        
        setTimeout(() => {
          setCurrentSequence(prev => prev + 1);
          if (isPlaying && !isPaused) {
            processNextSequence();
          }
        }, delay);
      }
    } else {
      // Conversation ended - save user progress
      setIsPlaying(false);
      
      // Save progress when hearing ends
      if (user) {
        const progressData = {
          completedStages: ['bail-hearing'],
          currentStage: 'completed',
          lastUpdated: new Date().toISOString(),
          totalTimeSpent: 0, // Would need to track actual time in a real implementation
          assessmentScore: null
        };
        
        saveUserProgress('the-inventory-that-changed-everything', progressData)
          .then(() => {
            console.log('Progress saved successfully');
          })
          .catch((error) => {
            console.error('Failed to save progress:', error);
          });
      }
    }
  };

  // Function to focus camera on speaker
  const focusOnSpeaker = (speaker: string) => {
    let view = 'free';
    
    // Play speaker voice with text
    const currentDialogue = bailHearingScript ? [...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures][currentSequence] : null;
    playSpeakerVoice(speaker, currentDialogue?.dialogue || '');
    
    // Automatically show witness when witness characters speak
    if (['Ramesh Kumar', 'Arjun Rao', 'Witness', 'Prakash Mehta'].includes(speaker)) {
      // Show witness if not already visible
      if (!stateRef.current.witnessVisible) {
        toggleWitness();
      }
      view = 'witness';
    }
    
    // Map speakers to camera views
    switch(speaker) {
      case 'Magistrate':
      case 'Hon\'ble Magistrate Smt. Kavitha Narayan':
        view = 'judge';
        break;
      case 'Defense Attorney':
      case 'Public Prosecutor':
        view = 'witness'; // Using witness view for lawyers
        break;
      case 'Rajesh Kumar':
      case 'Accused':
        view = 'witness';
        break;
      case 'Ramesh Kumar':
      case 'Arjun Rao':
      case 'Witness':
      case 'Prakash Mehta':
      case 'Court Clerk':
        view = 'audience';
        break;
      default:
        view = 'free';
    }
    
    setCameraView(view);
  };

  // Add useEffect to handle conversation flow
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isPlaying && bailHearingScript && !isPaused) {
      timer = setTimeout(() => {
        processNextSequence();
      }, 100); // Start processing immediately, timing is handled in processNextSequence
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentSequence, isPlaying, bailHearingScript, isPaused, processNextSequence]);

  // Add useEffect to handle automatic gavel sounds
  useEffect(() => {
    if (bailHearingScript && currentSequence < [...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures].length) {
      const currentDialogue = [...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures][currentSequence];
      if (currentDialogue) {
        autoTriggerGavel(currentDialogue);
      }
    }
  }, [currentSequence, bailHearingScript, autoTriggerGavel]);

  const animate = (THREE: any) => {
    animationFrameIdRef.current = requestAnimationFrame(() => animate(THREE));
    
    if (clockRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
      clockRef.current.getDelta();
      
      // Animate fans
      if (stateRef.current.fansOn) {
        fansRef.current.forEach(fan => {
          if (fan) fan.rotation.y += 0.08;
        });
      }
      
      // Animate audience idle movements
      audienceMembersRef.current.forEach((member, i) => {
        if (member.head) {
          const time = clockRef.current.getElapsedTime();
          member.head.rotation.y = Math.sin(time * 0.5 + i * 0.3) * 0.1;
          member.head.rotation.x = Math.sin(time * 0.3 + i * 0.5) * 0.05;
        }
      });
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Loading Screen */}
      <div 
        ref={loadingRef}
        className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_rgba(217,119,6,0.5)]"></div>
          <h2 className="text-3xl font-bold text-white mb-2">Loading Realistic Courtroom...</h2>
          <p className="text-amber-400">Preparing 3D Environment & Assets</p>
        </div>
      </div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-800 to-amber-900 backdrop-blur-lg border-b-2 border-amber-600 shadow-2xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center text-2xl shadow-lg">
            ⚖️
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Realistic 3D Virtual Courtroom</h1>
            <p className="text-amber-200 text-sm">Cinematic Indian Court Simulation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            ref={soundBtnRef}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold rounded-lg shadow-md hover:from-amber-700 hover:to-amber-900 transition-all"
            onClick={toggleSound}
          >
            🔊 Sound ON
          </button>
          <button 
            ref={controlsBtnRef}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold rounded-lg shadow-md hover:from-amber-700 hover:to-amber-900 transition-all"
            onClick={toggleControls}
          >
            Hide Controls
          </button>
        </div>
      </div>
      
      {/* Control Panel */}
      <div 
        ref={controlsPanelRef}
        className="absolute right-6 top-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-amber-600 shadow-2xl p-7 w-80 max-h-[calc(100vh-160px)] overflow-y-auto z-30"
      >
        <div className="mb-7">
          <div className="text-amber-400 font-bold text-lg mb-5 flex items-center gap-2">
            <span>🌍</span> Environment Controls
          </div>
          <button 
            ref={lightsBtnRef}
            className="w-full p-3.5 border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]"
            onClick={toggleLights}
          >
            <span>☀️ Lights</span>
            <span ref={lightsStatusRef}>ON</span>
          </button>
          <button 
            ref={fansBtnRef}
            className="w-full p-3.5 border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]"
            onClick={toggleFans}
          >
            <span>🌀 Ceiling Fans</span>
            <span ref={fansStatusRef}>ON</span>
          </button>
          <button 
            ref={nightBtnRef}
            className="w-full p-3.5 border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg bg-gradient-to-r from-indigo-800 to-indigo-900 text-indigo-200"
            onClick={toggleNightMode}
          >
            <span>🌙 Night Mode</span>
            <span ref={nightStatusRef}>OFF</span>
          </button>
          <button 
            ref={doorBtnRef}
            className="w-full p-3.5 border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200"
            onClick={toggleDoor}
          >
            <span>🚪 Door</span>
            <span ref={doorStatusRef}>CLOSED</span>
          </button>
        </div>
        
        <div className="mb-7">
          <div className="text-amber-400 font-bold text-lg mb-5 flex items-center gap-2">
            <span>⚖️</span> Courtroom Actions
          </div>
          <button 
            className="w-full p-3.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg hover:transform hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
            onClick={triggerGavel}
          >
            <span>🔨 Bang Gavel</span>
          </button>
          <button 
            ref={witnessBtnRef}
            className="w-full p-3.5 border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg bg-gradient-to-r from-red-600 to-red-800 text-white"
            onClick={toggleWitness}
          >
            <span>👥 Witness Entry</span>
            <span ref={witnessStatusRef}>ABSENT</span>
          </button>
          
          {/* Conversation Controls */}
          <div className="mt-6">
            <div className="text-amber-400 font-bold text-lg mb-3 flex items-center gap-2">
              <span>🗣️</span> Bail Hearing
            </div>
            {bailHearingScript ? (
              <>
                <button 
                  className="w-full p-3.5 bg-gradient-to-r from-green-600 to-green-800 text-white border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg hover:transform hover:translate-y-[-2px]"
                  onClick={startConversation}
                  disabled={isPlaying || isPaused}
                >
                  <span>▶️ Start Hearing</span>
                </button>
                <button 
                  className="w-full p-3.5 bg-gradient-to-r from-amber-600 to-amber-800 text-white border-none rounded-xl font-semibold cursor-pointer transition-all mb-3 flex justify-between items-center text-sm shadow-lg hover:transform hover:translate-y-[-2px]"
                  onClick={() => {
                    if (isPlaying) {
                      // Pause the hearing
                      setIsPlaying(false);
                      setIsPaused(true);
                    } else if (isPaused) {
                      // Resume the hearing
                      setIsPlaying(true);
                      setIsPaused(false);
                    } else {
                      // Stop the hearing
                      setIsPlaying(false);
                      setIsPaused(false);
                      setShowUserOptions(false);
                      // Reset to initial state
                      setCurrentSequence(0);
                      setCameraView('free');
                      // Stop any ongoing speech
                      if (window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                      }
                    }
                  }}
                >
                  {isPlaying ? (
                    <span>⏸️ Pause Hearing</span>
                  ) : isPaused ? (
                    <span>▶️ Resume Hearing</span>
                  ) : (
                    <span>⏹️ Stop Hearing</span>
                  )}
                </button>
              </>
            ) : (
              <p className="text-slate-400 text-sm">Loading script...</p>
            )}
          </div>
        </div>
        
        <div className="mb-7">
          <div className="text-amber-400 font-bold text-lg mb-5 flex items-center gap-2">
            <span>📹</span> Camera Views
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button 
              className="p-2.5 border-none rounded-lg font-semibold cursor-pointer transition-all text-xs bg-[rgba(217,119,6,0.2)] text-amber-400 border border-amber-600 hover:bg-[rgba(217,119,6,0.4)] hover:transform hover:scale-[1.05]"
              onClick={() => setCameraView('judge')}
            >
              ⚖️ Judge
            </button>
            <button 
              className="p-2.5 border-none rounded-lg font-semibold cursor-pointer transition-all text-xs bg-[rgba(217,119,6,0.2)] text-amber-400 border border-amber-600 hover:bg-[rgba(217,119,6,0.4)] hover:transform hover:scale-[1.05]"
              onClick={() => setCameraView('witness')}
            >
              🎤 Witness
            </button>
            <button 
              className="p-2.5 border-none rounded-lg font-semibold cursor-pointer transition-all text-xs bg-[rgba(217,119,6,0.2)] text-amber-400 border border-amber-600 hover:bg-[rgba(217,119,6,0.4)] hover:transform hover:scale-[1.05]"
              onClick={() => setCameraView('audience')}
            >
              👥 Audience
            </button>
            <button 
              className="p-2.5 border-none rounded-lg font-semibold cursor-pointer transition-all text-xs bg-[rgba(217,119,6,0.2)] text-amber-400 border border-amber-600 hover:bg-[rgba(217,119,6,0.4)] hover:transform hover:scale-[1.05]"
              onClick={() => setCameraView('free')}
            >
              🎮 Free
            </button>
          </div>
          <button 
            className="w-full p-3.5 bg-gradient-to-r from-amber-600 to-amber-800 text-white border-none rounded-xl font-semibold cursor-pointer transition-all text-sm shadow-lg hover:transform hover:translate-y-[-2px] mt-3"
            onClick={resetCamera}
          >
            <span>🏠 Reset View</span>
          </button>
        </div>
        
        <div className="bg-[rgba(30,41,59,0.8)] p-4.5 rounded-xl border border-slate-600">
          <h4 className="text-amber-400 text-sm mb-3.5 font-bold">⌨️ Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300">
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">L</kbd> Lights</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">F</kbd> Fans</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">G</kbd> Gavel</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">W</kbd> Witness</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">D</kbd> Door</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">N</kbd> Night</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">R</kbd> Reset</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">M</kbd> Mute</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">1</kbd> Judge View</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">2</kbd> Witness View</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">3</kbd> Audience View</div>
            <div><kbd className="bg-gradient-to-br from-slate-600 to-slate-700 p-1 rounded text-xs shadow-[0_2px_6px_rgba(0,0,0,0.3)]">4</kbd> Free View</div>
          </div>
        </div>
      </div>
      
      {/* Audio Initialization Prompt */}
      <div id="audio-prompt" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[rgba(15,23,42,0.98)] backdrop-blur-xl p-6 rounded-xl border-2 border-amber-600 shadow-2xl z-50 text-center animate-pulse">
        <h3 className="text-amber-400 text-xl mb-3 font-bold">🔊 Enable Audio</h3>
        <p className="text-white text-sm mb-4">Click anywhere on the screen to enable voice playback</p>
        <div className="text-amber-400 text-3xl mb-2">👇</div>
        <p className="text-slate-300 text-xs mb-2">(Required by browser security policies)</p>
        <button 
          onClick={() => {
            // Try to initialize audio context
            if ((window as any).appAudioContext) {
              (window as any).appAudioContext.resume();
            } else {
              (window as any).appAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            // Hide the prompt
            const audioPrompt = document.getElementById('audio-prompt');
            if (audioPrompt) {
              audioPrompt.style.display = 'none';
            }
          }}
          className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Enable Audio Now
        </button>
      </div>
      
      {/* Status Bar */}
      <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 bg-[rgba(15,23,42,0.98)] backdrop-blur-xl p-3.5 rounded-full border-2 border-amber-600 shadow-2xl flex items-center gap-7 text-sm z-30">
        <div className="flex items-center gap-2.5 text-slate-300 font-medium">
          <div 
            ref={lightsIndicatorRef}
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] bg-amber-400 text-amber-400"
          ></div>
          <span>Lights</span>
        </div>
        <div className="text-slate-600">|</div>
        <div className="flex items-center gap-2.5 text-slate-300 font-medium">
          <div 
            ref={fansIndicatorRef}
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] bg-blue-500 text-blue-500 animate-pulse"
          ></div>
          <span>Fans</span>
        </div>
        <div className="text-slate-600">|</div>
        <div className="flex items-center gap-2.5 text-slate-300 font-medium">
          <div 
            ref={witnessIndicatorRef}
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] bg-red-500 text-red-500"
          ></div>
          <span>Witness</span>
        </div>
        <div className="text-slate-600">|</div>
        <div className="flex items-center gap-2.5 text-slate-300 font-medium">
          <div 
            ref={modeIndicatorRef}
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] bg-amber-500 text-amber-500"
          ></div>
          <span ref={modeTextRef}>Day</span>
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="absolute bottom-7 left-7 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl p-5 rounded-xl border border-amber-600 shadow-2xl z-30">
        <div className="flex items-center gap-2.5 mb-2.5 text-sm text-slate-300 font-medium">
          <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_#d97706] bg-amber-600 text-amber-600"></div>
          <span>Judge's Bench</span>
        </div>
        <div className="flex items-center gap-2.5 mb-2.5 text-sm text-slate-300 font-medium">
          <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_#3b82f6] bg-blue-500 text-blue-500"></div>
          <span>Defense Table</span>
        </div>
        <div className="flex items-center gap-2.5 mb-2.5 text-sm text-slate-300 font-medium">
          <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_#ef4444] bg-red-500 text-red-500"></div>
          <span>Prosecution Table</span>
        </div>
        <div className="flex items-center gap-2.5 mb-2.5 text-sm text-slate-300 font-medium">
          <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_#22c55e] bg-green-500 text-green-500"></div>
          <span>Witness Stand</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
          <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_#6b7280] bg-gray-500 text-gray-500"></div>
          <span>Public Gallery</span>
        </div>
      </div>
      
      {/* Welcome Panel */}
      <div 
        ref={welcomePanelRef}
        className="absolute top-24 left-7 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl p-6 rounded-xl border-2 border-amber-400 shadow-2xl max-w-xs z-30"
      >
        <h3 className="text-amber-400 text-lg mb-2.5 font-bold">👁️ Welcome to Realistic Virtual Courtroom</h3>
        <p className="text-white text-sm mb-3.5 leading-normal">
          Experience a cinematic, photorealistic 3D Indian courtroom environment with advanced lighting, animations, and interactive controls.
        </p>
        <div className="text-slate-300 text-xs leading-relaxed">
          <p className="mb-1.5">✓ Drag to rotate camera (360°)</p>
          <p className="mb-1.5">✓ Scroll to zoom in/out</p>
          <p className="mb-1.5">✓ Press 'G' for realistic gavel sound</p>
          <p className="mb-1.5">✓ Use number keys (1-4) for camera presets</p>
          <p className="mb-1.5">✓ Toggle lights, fans, and witness entry</p>
          <p className="mb-1.5">✓ Click anywhere to enable audio</p>
          <p>✓ Switch between day and night modes</p>
        </div>
      </div>
      
      {/* Speaker Display Card */}
      {bailHearingScript && currentSequence < [...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures].length && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl p-5 rounded-xl border-2 border-amber-400 shadow-2xl z-30 w-96">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl flex-shrink-0">
              {speakersRef.current[[...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures][currentSequence]?.speaker]?.name.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <h3 className="text-amber-400 font-bold text-lg">
                {[...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures][currentSequence]?.speaker}
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                {speakersRef.current[[...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures][currentSequence]?.speaker]?.role}
              </p>
              <p className="text-white text-sm italic">
                "{[...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures][currentSequence]?.dialogue}"
              </p>
              {/* User turn indicator */}
              {showUserOptions && (
                <div className="mt-3 p-3 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg text-white text-sm animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗣️</span>
                    <strong>Your turn to speak!</strong>
                  </div>
                  <p className="mt-1">Select an appropriate response from the options below.</p>
                  {isListening && (
                    <div className="mt-2 flex items-center gap-2 text-blue-200">
                      <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                      <span>Listening... Speak now</span>
                    </div>
                  )}
                  {recognizedText && (
                    <div className="mt-2 text-sm text-blue-200">
                      <strong>Recognized:</strong> {recognizedText}
                    </div>
                  )}
                </div>
              )}
              {/* Voice playing indicator */}
              <div className="mt-2 p-3 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg text-white text-sm flex items-center gap-2 animate-pulse">
                <span className="text-xl">🔊</span>
                <div>
                  <div className="font-bold">Voice playing for {[...bailHearingScript.court_session, ...bailHearingScript.post_hearing_procedures][currentSequence]?.speaker}</div>
                  <div className="text-xs opacity-75">Click anywhere if you can't hear audio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* User Options Panel */}
      {showUserOptions && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[rgba(15,23,42,0.98)] backdrop-blur-xl p-6 rounded-xl border-2 border-amber-400 shadow-2xl z-50 w-96">
          <h3 className="text-amber-400 font-bold text-lg mb-4">Your Turn to Respond</h3>
          <p className="text-white text-sm mb-4">How would you like to respond?</p>
          <div className="flex flex-col gap-3">
            <button 
              className="w-full p-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-900 transition-all"
              onClick={() => handleUserResponse("agree")}
            >
              Agree and Confirm Understanding
            </button>
            <button 
              className="w-full p-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-900 transition-all"
              onClick={() => handleUserResponse("ask")}
            >
              Ask for Clarification
            </button>
            <button 
              className="w-full p-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all"
              onClick={() => handleUserResponse("object")}
            >
              Object to Conditions
            </button>
            <button 
              className="w-full p-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-lg font-semibold hover:from-slate-700 hover:to-slate-900 transition-all"
              onClick={() => handleUserResponse("silent")}
            >
              Remain Silent
            </button>
            <div className="mt-4 pt-4 border-t border-slate-600">
              <button 
                className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all flex items-center justify-center gap-2"
                onClick={startVoiceRecognition}
              >
                <span className="text-lg">🎤</span>
                Speak Your Response
              </button>
              <p className="text-slate-400 text-xs mt-2 text-center">Click to speak your response using voice recognition</p>
            </div>
          </div>
        </div>
      )}
      
      {/* End Hearing Button */}
      <div className="absolute bottom-7 right-7 z-30">
        <button 
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-xl shadow-2xl hover:from-purple-700 hover:to-purple-900 transition-all flex items-center gap-2"
          onClick={() => {
            // Save progress before navigating to assessment
            if (user) {
              const progressData = {
                completedStages: ['bail-hearing', 'court-hearing'],
                currentStage: 'legal-assessment',
                lastUpdated: new Date().toISOString(),
                totalTimeSpent: 0,
                assessmentScore: null
              };
              
              saveUserProgress('the-inventory-that-changed-everything', progressData)
                .then(() => {
                  console.log('Progress saved successfully');
                  // Navigate to legal assessment page
                  window.location.hash = '/legal-assessment';
                })
                .catch((error) => {
                  console.error('Failed to save progress:', error);
                  // Still navigate even if save fails
                  window.location.hash = '/legal-assessment';
                });
            } else {
              // For non-authenticated users, still navigate
              window.location.hash = '/legal-assessment';
            }
          }}
        >
          <span>🏁</span> End Hearing
        </button>
      </div>
      
      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full pt-20"
      />
    </div>
  );
};

export default Courtroom;