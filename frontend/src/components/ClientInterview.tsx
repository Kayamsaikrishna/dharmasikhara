import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import RajeshConversationEngine from '../utils/RajeshConversationEngine';
import rajeshTrainingData from '../utils/rajeshTrainingData';

const ClientInterview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightsRef = useRef<any>({});
  const lightsBaselineRef = useRef<any>({});
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraDistanceRef = useRef<number>(8);
  const cameraAngleRef = useRef<number>(0);
  const lightsOnRef = useRef<boolean>(true);
  const zoomedDocRef = useRef<any>(null);
  const [status, setStatus] = useState<string>('Ready');
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentDialogue, setCurrentDialogue] = useState<{ speaker: string; text: string }>({ speaker: '', text: '' });
  const [showDialogue, setShowDialogue] = useState<boolean>(false);
  const [zoomedDoc, setZoomedDoc] = useState<any>(null);
  const [lightsOn, setLightsOn] = useState<boolean>(true);
  const [userInput, setUserInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string>('');
  const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
  const [interviewCompleted, setInterviewCompleted] = useState<boolean>(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState<boolean>(false);
  const [interviewTimer, setInterviewTimer] = useState<number>(900); // 15 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const conversationEngineRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const lawyerRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const isTextInputFocusedRef = useRef<boolean>(false);

  // Initialize the conversation engine
  useEffect(() => {
    conversationEngineRef.current = new RajeshConversationEngine(rajeshTrainingData);
  }, []);

  // Timer effect for interview
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerActive && interviewTimer > 0 && !interviewCompleted) {
      interval = setInterval(() => {
        setInterviewTimer(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (interviewTimer === 0) {
      // Time's up, show completion option
      setShowCompletionMessage(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, interviewTimer, interviewCompleted]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Recommendation engine
  const getRecommendation = (userInput: string, trustLevel: number) => {
    const lowerInput = userInput.toLowerCase();
    
    // Check if user is going in the wrong direction
    if (trustLevel < 30 && (
      lowerInput.includes('guilty') || 
      lowerInput.includes('confess') || 
      lowerInput.includes('admit') ||
      lowerInput.includes('why did you') ||
      lowerInput.includes('you stole')
    )) {
      return "Approach with caution. The client seems uncomfortable with direct accusations. Try building more rapport first by asking about his background or family.";
    }
    
    // Suggest next steps based on conversation progress
    if (trustLevel > 70) {
      if (!lowerInput.includes('alibi') && !lowerInput.includes('where were you')) {
        return "You've built good rapport. Now would be a good time to ask about his whereabouts during the incident or if he has any witnesses who can support his story.";
      }
    }
    
    // General guidance
    if (lowerInput.includes('help') || lowerInput.includes('what should i do')) {
      return "Try asking open-ended questions about the timeline of events. Focus on understanding his perspective without making assumptions.";
    }
    
    // Encourage evidence discussion
    if (trustLevel > 50 && (
      lowerInput.includes('evidence') || 
      lowerInput.includes('proof') || 
      lowerInput.includes('security')
    )) {
      return "Good direction. Ask specifically about the CCTV footage and whether there might be other people in the area who saw what happened.";
    }
    
    return "";
  };

  // Complete interview function
  const completeInterview = () => {
    setInterviewCompleted(true);
    setIsTimerActive(false);
    setStatus('Interview Completed');
    setRecommendation('Client interview completed. Proceeding to evidence analysis phase.');
    setShowRecommendation(true);
    setTimeout(() => setShowRecommendation(false), 5000);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 15, 45);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, cameraDistanceRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    const clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0;
    let documents: any[] = [];
    let laptop: any, recorder: any;

    // Lighting
    const setupLighting = () => {
      const ambient = new THREE.AmbientLight(0x404060, 0.6);
      const hemi = new THREE.HemisphereLight(0xbfeaff, 0x080820, 0.45);
      hemi.position.set(0, 10, 0);
      scene.add(hemi);
      scene.add(ambient);

      const mainLight = new THREE.PointLight(0xfff4e6, 1.8, 30, 2);
      mainLight.position.set(0, 6, 0);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.set(4096, 4096);
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 30;
      mainLight.shadow.bias = -0.0001;
      scene.add(mainLight);

      const deskLamp = new THREE.SpotLight(0xffe4b5, 2.5, 15, Math.PI / 4, 0.4, 2);
      deskLamp.position.set(3.5, 3.5, -2);
      deskLamp.target.position.set(3.5, 1.2, -2);
      deskLamp.castShadow = true;
      deskLamp.shadow.mapSize.set(2048, 2048);
      scene.add(deskLamp);
      scene.add(deskLamp.target);

      const evidenceLight = new THREE.SpotLight(0xff9966, 1.8, 12, Math.PI / 3.5, 0.3, 2);
      evidenceLight.position.set(-4, 4.5, -3);
      evidenceLight.target.position.set(-4, 1.5, -3);
      evidenceLight.castShadow = true;
      scene.add(evidenceLight);
      scene.add(evidenceLight.target);

      const rimLight1 = new THREE.DirectionalLight(0x4488ff, 0.8);
      rimLight1.position.set(-5, 3, 5);
      scene.add(rimLight1);

      const rimLight2 = new THREE.DirectionalLight(0xff6644, 0.6);
      rimLight2.position.set(5, 3, -5);
      scene.add(rimLight2);
      
      rimLight1.intensity = 1.0;
      rimLight2.intensity = 0.85;
      
      lightsRef.current = { ambient, hemi, mainLight, deskLamp, evidenceLight, rimLight1, rimLight2 };
      lightsBaselineRef.current = {
        ambient: ambient.intensity,
        hemi: hemi.intensity,
        mainLight: mainLight.intensity,
        deskLamp: deskLamp.intensity,
        evidenceLight: evidenceLight.intensity,
        rimLight1: rimLight1.intensity,
        rimLight2: rimLight2.intensity
      };
    };

    // Room
    const createRoom = () => {
      const floorGeometry = new THREE.PlaneGeometry(25, 25, 50, 50);
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2530,
        roughness: 0.85,
        metalness: 0.15,
        envMapIntensity: 0.5
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      for (let i = 0; i < 12; i++) {
        const plank = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 25),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0x2d2838 : 0x262430,
            roughness: 0.9
          })
        );
        plank.rotation.x = -Math.PI / 2;
        plank.position.x = (i - 5.5) * 2;
        plank.position.y = 0.01;
        plank.receiveShadow = true;
        scene.add(plank);
      }

      const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(25, 25),
        new THREE.MeshStandardMaterial({ color: 0x1a1825, roughness: 0.95 })
      );
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = 7;
      scene.add(ceiling);

      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d3d,
        roughness: 0.92,
        metalness: 0.05
      });

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(25, 7, 0.3), wallMaterial);
      backWall.position.set(0, 3.5, -12.5);
      backWall.receiveShadow = true;
      scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(25, 7, 0.3), wallMaterial);
      leftWall.position.set(-12.5, 3.5, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.receiveShadow = true;
      scene.add(leftWall);

      const rightWall = leftWall.clone();
      rightWall.position.x = 12.5;
      scene.add(rightWall);

      for (let i = 0; i < 5; i++) {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(4, 6, 0.1),
          new THREE.MeshStandardMaterial({ color: 0x252535, roughness: 0.88 })
        );
        panel.position.set((i - 2) * 4.5, 3, -12.4);
        scene.add(panel);
      }
    };

    // Table
    const createTable = () => {
      const tableGroup = new THREE.Group();

      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.12, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x4a3830, roughness: 0.4, metalness: 0.3, envMapIntensity: 0.8 })
      );
      tableTop.position.y = 1.2;
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      tableGroup.add(tableTop);

      const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2820, roughness: 0.5, metalness: 0.4 });
      const edges = [
        { size: [5.1, 0.05, 0.05], pos: [0, 1.14, 1.275] },
        { size: [5.1, 0.05, 0.05], pos: [0, 1.14, -1.275] },
        { size: [0.05, 0.05, 2.6], pos: [2.525, 1.14, 0] },
        { size: [0.05, 0.05, 2.6], pos: [-2.525, 1.14, 0] }
      ];
      edges.forEach(edge => {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(...edge.size), edgeMaterial);
        trim.position.set(edge.pos[0], edge.pos[1], edge.pos[2]);
        trim.castShadow = true;
        tableGroup.add(trim);
      });

      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.8 });
      const legPositions = [[-2, 0.6, 1], [2, 0.6, 1], [-2, 0.6, -1], [2, 0.6, -1]];
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 16), legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        tableGroup.add(leg);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), legMaterial);
        base.position.set(pos[0], 0.025, pos[2]);
        base.castShadow = true;
        tableGroup.add(base);
      });

      scene.add(tableGroup);
    };

    // Chair
    const createChair = (x: number, z: number, rotation: number) => {
      const chairGroup = new THREE.Group();
      const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.7, metalness: 0.1 });
      const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.9 });

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.65), seatMaterial);
      seat.position.y = 0.65;
      seat.castShadow = true;
      chairGroup.add(seat);

      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), new THREE.MeshStandardMaterial({ color: 0x252535, roughness: 0.8 }));
      cushion.position.y = 0.7;
      chairGroup.add(cushion);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.95, 0.12), seatMaterial);
      backrest.position.set(0, 1.15, -0.265);
      backrest.rotation.x = -0.15;
      backrest.castShadow = true;
      chairGroup.add(backrest);

      const lumbar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.1), new THREE.MeshStandardMaterial({ color: 0x353545, roughness: 0.6 }));
      lumbar.position.set(0, 0.9, -0.25);
      chairGroup.add(lumbar);

      [-0.35, 0.35].forEach(xPos => {
        const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.45), frameMaterial);
        armrest.position.set(xPos, 0.75, 0);
        armrest.castShadow = true;
        chairGroup.add(armrest);

        const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.45), seatMaterial);
        armPad.position.set(xPos, 0.95, 0);
        chairGroup.add(armPad);
      });

      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8), frameMaterial);
        spoke.position.set(Math.sin(angle) * 0.2, 0.2, Math.cos(angle) * 0.2);
        spoke.rotation.set(Math.PI / 2.5, 0, -angle);
        spoke.castShadow = true;
        chairGroup.add(spoke);

        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12),
          new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6, metalness: 0.4 })
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(Math.sin(angle) * 0.35, 0.05, Math.cos(angle) * 0.35);
        chairGroup.add(wheel);
      }

      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12), frameMaterial);
      column.position.y = 0.4;
      column.castShadow = true;
      chairGroup.add(column);

      chairGroup.position.set(x, 0, z);
      chairGroup.rotation.y = rotation;
      scene.add(chairGroup);
      return chairGroup;
    };

    // Human
    const createHuman = (color: number, position: [number, number, number], isLawyer: boolean) => {
      const humanGroup = new THREE.Group();
      const skinColor = 0xfdbcb4;
      const skinMaterial = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6, metalness: 0.1 });
      const clothingMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05 });

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), skinMaterial);
      head.position.y = 1.65;
      head.castShadow = true;
      humanGroup.add(head);

      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.29, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: isLawyer ? 0x2a2a2a : 0x4a3020, roughness: 0.9 })
      );
      hair.position.y = 1.75;
      hair.castShadow = true;
      humanGroup.add(hair);

      [-0.1, 0.1].forEach(xPos => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        eye.position.set(xPos, 1.68, 0.24);
        humanGroup.add(eye);

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        pupil.position.set(xPos, 1.68, 0.26);
        humanGroup.add(pupil);
      });

      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 8), skinMaterial);
      nose.position.set(0, 1.6, 0.28);
      nose.rotation.x = Math.PI / 2;
      humanGroup.add(nose);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 16), skinMaterial);
      neck.position.y = 1.35;
      neck.castShadow = true;
      humanGroup.add(neck);

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.85, 16), clothingMaterial);
      torso.position.y = 0.85;
      torso.castShadow = true;
      humanGroup.add(torso);

      if (isLawyer) {
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
        collar.position.y = 1.25;
        humanGroup.add(collar);

        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.02), new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 }));
        tie.position.set(0, 1, 0.37);
        humanGroup.add(tie);
      }

      const armMaterial = clothingMaterial;
      [-1, 1].forEach(side => {
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 12), armMaterial);
        upperArm.position.set(side * 0.47, 0.95, 0);
        upperArm.rotation.z = side * 0.2;
        upperArm.castShadow = true;
        humanGroup.add(upperArm);

        const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.4, 12), armMaterial);
        forearm.position.set(side * 0.58, 0.55, 0.15);
        forearm.rotation.set(0.5, 0, side * 0.3);
        forearm.castShadow = true;
        humanGroup.add(forearm);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), skinMaterial);
        hand.position.set(side * 0.65, 0.32, 0.35);
        hand.castShadow = true;
        humanGroup.add(hand);
      });

      const legMaterial = new THREE.MeshStandardMaterial({ color: isLawyer ? 0x1a1a2a : 0x2a2a3a, roughness: 0.7 });
      [-0.2, 0.2].forEach(xPos => {
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.5, 12), legMaterial);
        thigh.position.set(xPos, 0.35, 0);
        thigh.rotation.x = 1.3;
        thigh.castShadow = true;
        humanGroup.add(thigh);

        const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.45, 12), legMaterial);
        lowerLeg.position.set(xPos, 0.22, 0.35);
        lowerLeg.rotation.x = 1.6;
        lowerLeg.castShadow = true;
        humanGroup.add(lowerLeg);

        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.25), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.3 }));
        shoe.position.set(xPos, 0.04, 0.65);
        shoe.castShadow = true;
        humanGroup.add(shoe);
      });

      humanGroup.position.set(...position);
      scene.add(humanGroup);
      return humanGroup;
    };

    // Laptop
    const createLaptop = (x: number, y: number, z: number) => {
      const laptopGroup = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.9), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.7 }));
      base.castShadow = true;
      laptopGroup.add(base);

      const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.85), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 }));
      keyboard.position.y = 0.03;
      laptopGroup.add(keyboard);

      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 12; j++) {
          const key = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.04), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 }));
          key.position.set((j - 5.5) * 0.05, 0.04, (i - 2.5) * 0.05);
          laptopGroup.add(key);
        }
      }

      const screenBack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.02), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.7 }));
      screenBack.position.set(0, 0.28, -0.42);
      screenBack.rotation.x = -0.2;
      screenBack.castShadow = true;
      laptopGroup.add(screenBack);

      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), new THREE.MeshStandardMaterial({ color: 0x88aaff, emissive: 0x4488ff, emissiveIntensity: 0.6, roughness: 0.2 }));
      screen.position.set(0, 0.28, -0.41);
      screen.rotation.x = -0.2;
      laptopGroup.add(screen);

      const screenText = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.35), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa, emissiveIntensity: 0.3 }));
      screenText.position.set(0, 0.28, -0.405);
      screenText.rotation.x = -0.2;
      laptopGroup.add(screenText);

      laptopGroup.position.set(x, y, z);
      scene.add(laptopGroup);
      return laptopGroup;
    };

    // Recorder
    const createRecorder = (x: number, y: number, z: number) => {
      const recorderGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.25), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.6 }));
      body.castShadow = true;
      recorderGroup.add(body);

      const recScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 }));
      recScreen.position.set(0, 0.041, 0.03);
      recScreen.rotation.x = -Math.PI / 2;
      recorderGroup.add(recScreen);

      const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.8 }));
      mic.position.set(0, 0.06, -0.08);
      recorderGroup.add(mic);

      [-0.04, 0, 0.04].forEach(xPos => {
        const button = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8),
          new THREE.MeshStandardMaterial({
            color: xPos === 0 ? 0xff0000 : 0x333333,
            emissive: xPos === 0 ? 0xff0000 : 0x000000,
            emissiveIntensity: 0.5
          })
        );
        button.position.set(xPos, 0.041, 0.1);
        button.rotation.x = Math.PI / 2;
        recorderGroup.add(button);
      });

      recorderGroup.position.set(x, y, z);
      scene.add(recorderGroup);
      return recorderGroup;
    };

    // Document
    const createDocument = (x: number, y: number, z: number, rotation: number, docType: string) => {
      const docGroup = new THREE.Group();
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.015, 0.65), new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 }));
      paper.castShadow = true;
      docGroup.add(paper);

      let contentColor: number, headerText: string;
      switch (docType) {
        case 'case_file': contentColor = 0x000000; headerText = 'CASE FILE #2024-789'; break;
        case 'evidence': contentColor = 0x8b0000; headerText = 'EVIDENCE REPORT'; break;
        case 'witness': contentColor = 0x000080; headerText = 'WITNESS STATEMENT'; break;
        case 'contract': contentColor = 0x006400; headerText = 'LEGAL CONTRACT'; break;
        default: contentColor = 0x000000; headerText = 'DOCUMENT';
      }

      const header = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.08), new THREE.MeshStandardMaterial({ color: contentColor, roughness: 0.9 }));
      header.position.set(0, 0.009, -0.25);
      header.rotation.x = -Math.PI / 2;
      docGroup.add(header);

      for (let i = 0; i < 8; i++) {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.02), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 }));
        line.position.set(0, 0.009, -0.15 + i * 0.06);
        line.rotation.x = -Math.PI / 2;
        docGroup.add(line);
      }

      const stamp = new THREE.Mesh(new THREE.CircleGeometry(0.08, 32), new THREE.MeshStandardMaterial({ color: 0x8b0000, transparent: true, opacity: 0.6, roughness: 0.95 }));
      stamp.position.set(0.15, 0.009, 0.2);
      stamp.rotation.x = -Math.PI / 2;
      docGroup.add(stamp);

      docGroup.position.set(x, y, z);
      docGroup.rotation.y = rotation;
      docGroup.userData = { type: docType, text: headerText };
      scene.add(docGroup);
      return docGroup;
    };

    // Photo
    const createEvidencePhoto = (x: number, y: number, z: number, imageType: string) => {
      const photoGroup = new THREE.Group();
      const backing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
      backing.castShadow = true;
      photoGroup.add(backing);

      let photoColor: number;
      switch (imageType) {
        case 'crime_scene': photoColor = 0x4a4a5a; break;
        case 'suspect': photoColor = 0x6a5a4a; break;
        case 'evidence_item': photoColor = 0x5a4a6a; break;
        default: photoColor = 0x5a5a5a;
      }

      const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), new THREE.MeshStandardMaterial({ color: photoColor, roughness: 0.7 }));
      photo.position.y = 0.006;
      photo.rotation.x = -Math.PI / 2;
      photoGroup.add(photo);

      for (let i = 0; i < 3; i++) {
        const detail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.001, 0.08), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5 }));
        detail.position.set((Math.random() - 0.5) * 0.2, 0.007, (Math.random() - 0.5) * 0.3);
        detail.rotation.x = -Math.PI / 2;
        photoGroup.add(detail);
      }

      photoGroup.position.set(x, y, z);
      photoGroup.userData = { type: imageType };
      scene.add(photoGroup);
      return photoGroup;
    };

    // Evidence Board
    const createEvidenceBoard = () => {
      const boardGroup = new THREE.Group();
      const board = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 0.15), new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.95 }));
      board.castShadow = true;
      boardGroup.add(board);

      const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.6, metalness: 0.3 });
      const frames = [
        new THREE.BoxGeometry(5.2, 0.1, 0.2),
        new THREE.BoxGeometry(5.2, 0.1, 0.2),
        new THREE.BoxGeometry(0.1, 3.7, 0.2),
        new THREE.BoxGeometry(0.1, 3.7, 0.2)
      ];
      const framePositions = [[0, 1.8, 0], [0, -1.8, 0], [-2.55, 0, 0], [2.55, 0, 0]];
      frames.forEach((geom, idx) => {
        const frame = new THREE.Mesh(geom, frameMaterial);
        const pos = framePositions[idx];
        frame.position.set(pos[0], pos[1], pos[2]);
        boardGroup.add(frame);
      });

      const evidenceTypes = ['crime_scene', 'suspect', 'evidence_item'];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const photo = createEvidencePhoto((col - 1.5) * 1.1, (row - 1) * 1, 0.09, evidenceTypes[row % 3]);
          photo.rotation.x = -Math.PI / 2;
          boardGroup.add(photo);

          const pin = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 8), new THREE.MeshStandardMaterial({ color: row % 2 === 0 ? 0xff0000 : 0x0000ff, metalness: 0.6 }));
          pin.position.set((col - 1.5) * 1.1, (row - 1) * 1, 0.12);
          pin.rotation.x = Math.PI;
          boardGroup.add(pin);
        }
      }

      const stringMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
      for (let i = 0; i < 6; i++) {
        const points = [
          new THREE.Vector3((Math.floor(Math.random() * 4) - 1.5) * 1.1, (Math.floor(Math.random() * 3) - 1) * 1, 0.11),
          new THREE.Vector3((Math.floor(Math.random() * 4) - 1.5) * 1.1, (Math.floor(Math.random() * 3) - 1) * 1, 0.11)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, stringMaterial);
        boardGroup.add(line);
      }

      boardGroup.position.set(-5, 3, -11);
      scene.add(boardGroup);
    };

    // Setup
    setupLighting();
    createRoom();
    createTable();

    const chair1 = createChair(0, -2.2, 0);
    const chair2 = createChair(0, 2.2, Math.PI);

    lawyerRef.current = createHuman(0x1a1a2a, [0, 0.6, -1.8], true);
    clientRef.current = createHuman(0x3a3a4a, [0, 0.6, 1.8], false);
    clientRef.current.rotation.y = Math.PI;
    
    // Expose references to window for debugging
    (window as any).clientRef = clientRef.current;
    (window as any).lawyerRef = lawyerRef.current;

    laptop = createLaptop(3.5, 1.26, -2);
    recorder = createRecorder(0, 1.27, 0);

    documents.push(
      createDocument(-1.2, 1.27, -0.3, 0.3, 'case_file'),
      createDocument(-0.5, 1.27, 0.2, -0.2, 'evidence'),
      createDocument(0.3, 1.27, -0.1, 0.5, 'witness'),
      createDocument(1.0, 1.27, 0.3, -0.4, 'contract')
    );

    createEvidencePhoto(-1.5, 1.27, 0.5, 'crime_scene');
    createEvidencePhoto(1.5, 1.27, -0.5, 'suspect');
    createEvidenceBoard();

    const onMouseMove = (event: MouseEvent) => {
      // Only allow mouse movement if text input is not focused
      if (!isTextInputFocusedRef.current) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      }
    };

    const onWheel = (event: WheelEvent) => {
      // Only allow zoom if text input is not focused
      if (!isTextInputFocusedRef.current) {
        event.preventDefault();
        cameraDistanceRef.current += event.deltaY * 0.01;
        cameraDistanceRef.current = Math.max(5, Math.min(20, cameraDistanceRef.current));
      }
    };

    const onMouseClick = (event: MouseEvent) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.type) obj = obj.parent as any;
        if (obj && obj.userData.type) {
          zoomToDocument(obj);
        }
      }
    };

    const zoomToDocument = (doc: any) => {
      setZoomedDoc(doc.userData);
      zoomedDocRef.current = doc.userData;
      setStatus(`Viewing: ${doc.userData.text || doc.userData.type}`);
      const targetPos = new THREE.Vector3(doc.position.x, doc.position.y + 1.5, doc.position.z + 1);
      const duration = 1000;
      const startPos = camera.position.clone();
      const startTime = Date.now();
      const animateZoom = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(startPos, targetPos, eased);
        camera.lookAt(doc.position);
        if (progress < 1) requestAnimationFrame(animateZoom);
      };
      animateZoom();
      setTimeout(() => { setZoomedDoc(null); zoomedDocRef.current = null; }, 5000);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('click', onMouseClick);

    const onWindowResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for specific keys
      if (['l', 'L', 'ArrowLeft', 'ArrowRight', '+', '-', '_', '='].includes(e.key)) {
        // Only prevent default if text input is not focused
        if (!isTextInputFocusedRef.current) {
          e.preventDefault();
        }
      }
      
      // Only process keyboard controls if text input is not focused
      if (!isTextInputFocusedRef.current) {
        if (e.key === 'l' || e.key === 'L') {
          setLightsOn(prev => { lightsOnRef.current = !prev; return !prev; });
        } else if (e.key === '+' || e.key === '=') {
          cameraDistanceRef.current = Math.max(4, cameraDistanceRef.current - 1);
        } else if (e.key === '-' || e.key === '_') {
          cameraDistanceRef.current = Math.min(20, cameraDistanceRef.current + 1);
        } else if (e.key === 'ArrowLeft') {
          cameraAngleRef.current -= 0.12;
        } else if (e.key === 'ArrowRight') {
          cameraAngleRef.current += 0.12;
        } else if (e.key === 'h' || e.key === 'H') {
          setShowHelp(prev => !prev);
        } else if (e.key === 'r' || e.key === 'R') {
          // Trigger recommendation
          if (conversationEngineRef.current) {
            const summary = conversationEngineRef.current.getSummary();
            const rec = getRecommendation(userInput, summary.trustLevel);
            if (rec) {
              setRecommendation(rec);
              setShowRecommendation(true);
              setTimeout(() => setShowRecommendation(false), 5000);
            }
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const speak = (text: string, voiceParams: any) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply voice parameters
        utterance.rate = voiceParams.rate || 1;
        utterance.pitch = voiceParams.pitch || 1;
        utterance.volume = voiceParams.volume || 1;
        
        window.speechSynthesis.speak(utterance);
      }
    };

    // Handle user input and get AI response
    const handleUserInput = (input: string) => {
      if (!conversationEngineRef.current) return;
      
      // Process input with the conversation engine
      const response = conversationEngineRef.current.processInput(input);
      
      // Update dialogue
      setCurrentDialogue({ speaker: 'Rajesh Kumar', text: response.text });
      setShowDialogue(true);
      
      // Speak the response
      speak(response.text, response.voiceParams);
      
      // Update status
      setStatus(`Trust Level: ${response.trustLevel}%`);
      
      // Store trust level for UI updates
      (window as any).currentTrustLevel = response.trustLevel;
      
      // Apply animation to client character based on emotion
      if (clientRef.current) {
        applyEmotionAnimation(clientRef.current, response.animation);
      }
      
      // Update lighting based on emotion
      updateLightingForEmotion(response.emotion);
      
      // Get recommendation
      const rec = getRecommendation(input, response.trustLevel);
      if (rec) {
        setRecommendation(rec);
        setShowRecommendation(true);
        setTimeout(() => setShowRecommendation(false), 5000);
      }
      
      // Hide dialogue after 8 seconds
      setTimeout(() => {
        setShowDialogue(false);
      }, 8000);
    };
    
    // Apply emotion-based animations to the client character
    const applyEmotionAnimation = (character: any, animation: string) => {
      if (!character) return;
      
      // Reset all animations
      resetCharacterAnimations(character);
      
      // Apply specific animation based on emotion
      switch (animation) {
        case 'slight_smile':
          animateSlightSmile(character);
          break;
        case 'look_down_emotional':
          animateLookDown(character);
          break;
        case 'direct_eye_contact':
          animateDirectEyeContact(character);
          break;
        case 'steady_gaze':
          animateSteadyGaze(character);
          break;
        case 'slight_smile_forward_lean':
          animateSmileAndLean(character);
          break;
        case 'nodding':
          animateNodding(character);
          break;
        case 'fidget_hands':
          animateFidgeting(character);
          break;
        case 'slight_head_tilt':
          animateHeadTilt(character);
          break;
        case 'forward_lean':
          animateForwardLean(character);
          break;
        case 'slight_shrug':
          animateShrug(character);
          break;
        case 'mixed_expression':
          animateMixedExpression(character);
          break;
        case 'explaining_gesture':
          animateExplaining(character);
          break;
        case 'look_down_briefly':
          animateBriefLookDown(character);
          break;
        default:
          // Default idle animation
          break;
      }
    };
    
    // Update lighting based on emotion
    const updateLightingForEmotion = (emotion: string) => {
      if (!lightsRef.current) return;
      
      // Define color schemes for different emotions
      const emotionColors: Record<string, { main: number, desk: number, evidence: number }> = {
        'grateful': { main: 0xfff4e6, desk: 0xffe4b5, evidence: 0xff9966 },
        'vulnerable': { main: 0xffe4e1, desk: 0xffdab9, evidence: 0xffb6c1 },
        'defensive': { main: 0xfff8dc, desk: 0xffefd5, evidence: 0xffa500 },
        'defensive_but_calm': { main: 0xf5f5dc, desk: 0xffffe0, evidence: 0xdda0dd },
        'hopeful': { main: 0xe0ffff, desk: 0xe6e6fa, evidence: 0xb0e0e6 },
        'cooperative': { main: 0xf0fff0, desk: 0xf5fffa, evidence: 0x98fb98 },
        'anxious': { main: 0xfff5ee, desk: 0xffefd5, evidence: 0xffa07a },
        'confused': { main: 0xf5f5f5, desk: 0xdcdcdc, evidence: 0xc0c0c0 },
        'neutral': { main: 0xffffff, desk: 0xf5f5f5, evidence: 0xe0e0e0 },
        'earnest': { main: 0xfffff0, desk: 0xfffacd, evidence: 0xffec8b },
        'resigned': { main: 0xf0f8ff, desk: 0xe6e6fa, evidence: 0xc6e2ff },
        'proud_but_worried': { main: 0xffefd5, desk: 0xffe4c4, evidence: 0xffa54f },
        'logical': { main: 0xf8f8ff, desk: 0xe6e6fa, evidence: 0xb0c4de },
        'apologetic': { main: 0xf5deb3, desk: 0xf4a460, evidence: 0xcd853f }
      };
      
      const colors = emotionColors[emotion] || emotionColors.neutral;
      
      // Apply colors to lights
      if (lightsRef.current.mainLight) {
        lightsRef.current.mainLight.color.set(colors.main);
      }
      if (lightsRef.current.deskLamp) {
        lightsRef.current.deskLamp.color.set(colors.desk);
      }
      if (lightsRef.current.evidenceLight) {
        lightsRef.current.evidenceLight.color.set(colors.evidence);
      }
    };
    
    // Reset character animations
    const resetCharacterAnimations = (character: any) => {
      // Reset head position
      if (character.children[0]) { // head
        character.children[0].rotation.set(0, 0, 0);
      }
      
      // Reset arms
      const torso = character.children[4]; // torso
      if (torso && torso.children[0]) { // left arm
        torso.children[0].rotation.set(0, 0, 0.2);
      }
      if (torso && torso.children[1]) { // right arm
        torso.children[1].rotation.set(0, 0, -0.2);
      }
    };
    
    // Animation functions for different emotions
    const animateSlightSmile = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Slight head tilt up
        head.rotation.x = -0.1;
      }
    };
    
    const animateLookDown = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Look down
        head.rotation.x = 0.3;
      }
    };
    
    const animateDirectEyeContact = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Direct eye contact
        head.rotation.y = 0;
        head.rotation.x = 0;
      }
    };
    
    const animateSteadyGaze = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Steady gaze
        head.rotation.x = 0;
      }
    };
    
    const animateSmileAndLean = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Slight smile and lean forward
        head.rotation.x = -0.1;
      }
      
      // Lean forward slightly
      character.position.z = 1.7;
    };
    
    const animateNodding = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Animate nodding
        head.rotation.x = Math.sin(Date.now() * 0.005) * 0.1;
      }
    };
    
    const animateFidgeting = (character: any) => {
      const torso = character.children[4];
      if (torso) {
        // Fidget hands
        torso.rotation.z = Math.sin(Date.now() * 0.01) * 0.05;
      }
    };
    
    const animateHeadTilt = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Slight head tilt
        head.rotation.y = 0.1;
        head.rotation.x = 0.05;
      }
    };
    
    const animateForwardLean = (character: any) => {
      // Lean forward
      character.position.z = 1.7;
    };
    
    const animateShrug = (character: any) => {
      const torso = character.children[4];
      if (torso) {
        // Slight shrug
        torso.position.y = 0.87;
      }
    };
    
    const animateMixedExpression = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Mixed expression - slight up and down movement
        head.rotation.x = Math.sin(Date.now() * 0.003) * 0.05;
      }
    };
    
    const animateExplaining = (character: any) => {
      const torso = character.children[4];
      if (torso && torso.children[0]) { // left arm
        // Gesture with left hand
        torso.children[0].rotation.z = Math.sin(Date.now() * 0.008) * 0.3 + 0.2;
      }
    };
    
    const animateBriefLookDown = (character: any) => {
      const head = character.children[0];
      if (head) {
        // Brief look down
        head.rotation.x = 0.2;
        
        // Reset after brief moment
        setTimeout(() => {
          if (head) head.rotation.x = 0;
        }, 1000);
      }
    };
    
    // Expose animation functions to window for testing
    (window as any).applyEmotionAnimation = applyEmotionAnimation;

    // Expose functions to window for testing
    (window as any).handleUserInput = handleUserInput;
    
    // Apply continuous emotion-based animations
    const applyContinuousEmotionAnimation = (character: any, emotion: string) => {
      if (!character) return;
      
      const head = character.children[0];
      const torso = character.children[4];
      
      switch (emotion) {
        case 'anxious':
          // Subtle fidgeting
          if (head) head.rotation.z = Math.sin(Date.now() * 0.005) * 0.02;
          break;
        case 'vulnerable':
          // Subtle head movements
          if (head) {
            head.rotation.x = 0.05 + Math.sin(Date.now() * 0.003) * 0.03;
          }
          break;
        case 'hopeful':
          // Subtle positive movements
          if (head) head.position.y = 1.65 + Math.sin(Date.now() * 0.004) * 0.01;
          break;
        case 'defensive':
          // Slight tension
          if (torso) torso.scale.y = 1 + Math.sin(Date.now() * 0.006) * 0.01;
          break;
        default:
          // Neutral breathing effect
          if (torso) torso.scale.y = 1 + Math.sin(Date.now() * 0.002) * 0.005;
          break;
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!zoomedDoc && cameraRef.current) {
        const baseAngle = cameraAngleRef.current + mouseX * 0.4;
        const angle = baseAngle;
        const targetY = 2.5 + mouseY * 2;
        const desiredX = Math.sin(angle) * cameraDistanceRef.current;
        const desiredZ = Math.cos(angle) * cameraDistanceRef.current;
        cameraRef.current.position.x += (desiredX - cameraRef.current.position.x) * 0.08;
        cameraRef.current.position.z += (desiredZ - cameraRef.current.position.z) * 0.08;
        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.08;
        cameraRef.current.lookAt(0, 1.5, 0);
      }

      if (lawyerRef.current) {
        // Animation logic for lawyer
      }

      if (clientRef.current) {
        // Apply continuous animations based on current emotion
        const summary = conversationEngineRef.current?.getSummary();
        if (summary && summary.currentEmotion) {
          // Apply subtle continuous animations
          applyContinuousEmotionAnimation(clientRef.current, summary.currentEmotion);
        }
      }

      if (recorder) {
        const btn = recorder.children.find((c: any) => c.material?.emissive);
        if (btn) btn.material.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.4;
      }

      if (laptop) {
        const scr = laptop.children.find((c: any) => c.material?.emissive?.b > 0);
        if (scr) scr.material.emissiveIntensity = 0.6 + Math.random() * 0.1;
      }

      // Update light intensities
      if (lightsRef.current && lightsBaselineRef.current) {
        const factor = lightsOnRef.current ? 1 : 0;
        try {
          Object.keys(lightsBaselineRef.current).forEach(key => {
            const lightObj = lightsRef.current[key];
            if (lightObj) {
              lightObj.intensity = lightsBaselineRef.current[key] * factor;
            }
          });
        } catch (e) { console.warn('Light update error', e); }
      }

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };

    animate();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('click', onMouseClick);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', onKeyDown);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  const handleSpeechInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      (window as any).handleUserInput(userInput);
      setUserInput('');
    }
  };
  
  // Debug function to test different emotions
  const testEmotion = (emotion: string) => {
    const animations: Record<string, string> = {
      'grateful': 'slight_smile',
      'vulnerable': 'look_down_emotional',
      'defensive': 'direct_eye_contact',
      'defensive_but_calm': 'steady_gaze',
      'hopeful': 'slight_smile_forward_lean',
      'cooperative': 'nodding',
      'anxious': 'fidget_hands',
      'confused': 'slight_head_tilt',
      'neutral': 'idle',
      'earnest': 'forward_lean',
      'resigned': 'slight_shrug',
      'proud_but_worried': 'mixed_expression',
      'logical': 'explaining_gesture',
      'apologetic': 'look_down_briefly'
    };
    
    // Access client from window object
    const clientRef = (window as any).clientRef;
    if (clientRef) {
      (window as any).applyEmotionAnimation(clientRef, animations[emotion] || 'idle');
      (window as any).updateLightingForEmotion(emotion);
      setStatus(`Testing emotion: ${emotion}`);
      (window as any).currentTrustLevel = Math.floor(Math.random() * 100);
    }
  };
  
  // Debug function to test conversation summary
  const showConversationSummary = () => {
    if (conversationEngineRef.current) {
      const summary = conversationEngineRef.current.getSummary();
      console.log('Conversation Summary:', summary);
      alert(`Trust Level: ${summary.trustLevel}%\nEmotion: ${summary.currentEmotion}\nTopics: ${summary.topicsCovered.join(', ')}`);
    }
  };
  
  // Debug function to reset conversation
  const resetConversation = () => {
    if (conversationEngineRef.current) {
      conversationEngineRef.current.reset();
      setStatus('Ready');
      (window as any).currentTrustLevel = 0;
      setUserInput('');
      setShowDialogue(false);
      // Access client from window object
      const clientRef = (window as any).clientRef;
      if (clientRef) {
        (window as any).applyEmotionAnimation(clientRef, 'idle');
        (window as any).updateLightingForEmotion('neutral');
      }
    }
  };
  
  // Character stand/sit functions
  const toggleLawyerStand = () => {
    if (lawyerRef.current) {
      // Toggle between standing (y=0.6) and sitting (y=0)
      lawyerRef.current.position.y = lawyerRef.current.position.y === 0.6 ? 0 : 0.6;
      setStatus(lawyerRef.current.position.y === 0.6 ? 'Lawyer Standing' : 'Lawyer Sitting');
    }
  };
  
  const toggleClientStand = () => {
    if (clientRef.current) {
      // Toggle between standing (y=0.6) and sitting (y=0)
      clientRef.current.position.y = clientRef.current.position.y === 0.6 ? 0 : 0.6;
      setStatus(clientRef.current.position.y === 0.6 ? 'Client Standing' : 'Client Sitting');
    }
  };
  
  // View control functions
  const showAllDocuments = () => {
    setStatus('Showing all documents');
    // This would implement document display logic
  };
  
  const resetCamera = () => {
    cameraAngleRef.current = 0;
    cameraDistanceRef.current = 8;
    setStatus('Camera reset');
  };
  
  // Expose functions to window
  useEffect(() => {
    (window as any).testEmotion = testEmotion;
    (window as any).showConversationSummary = showConversationSummary;
    (window as any).resetConversation = resetConversation;
    (window as any).lawyerStands = toggleLawyerStand;
    (window as any).clientStands = toggleClientStand;
    (window as any).showAllDocuments = showAllDocuments;
    (window as any).resetCamera = resetCamera;
  }, []);

  return (
    <div className="investigation-root h-screen w-screen relative">
      <canvas ref={canvasRef} className="investigation-canvas absolute inset-0" />
      
      {/* Welcome Message */}
      {showWelcome && (
        <div className="welcome-message absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-10 border border-indigo-500 animate-slide-up">
          <h2 className="text-3xl font-bold mb-4 text-center text-amber-300">Welcome to the Client Interview</h2>
          <p className="text-lg mb-6 text-center">You are now meeting with Rajesh Kumar in custody. Ask him questions about his case to gather information for the bail application.</p>
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-amber-400 mb-2">Tips for the Interview:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Start with open-ended questions to build rapport</li>
              <li>Ask about the timeline of events</li>
              <li>Inquire about potential witnesses</li>
              <li>Discuss family situation and sureties for bail</li>
              <li>Listen carefully for inconsistencies or important details</li>
            </ul>
          </div>
          <div className="text-center">
            <button 
              onClick={() => setShowWelcome(false)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              Begin Interview
            </button>
          </div>
        </div>
      )}
      
      {/* Help Panel */}
      {showHelp && (
        <div className="help-panel absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-20 border border-blue-500 animate-slide-up">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">Keyboard Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold text-amber-400 mb-2">Camera Controls</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Rotate Left</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">← Arrow</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Rotate Right</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">→ Arrow</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Zoom In</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">+</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Zoom Out</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">-</kbd>
                </li>
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold text-amber-400 mb-2">Lighting & Other</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Toggle Lights</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">L</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Show Help</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">H</kbd>
                </li>
                <li className="flex justify-between">
                  <span>Get Recommendation</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-900 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-blue-300 mb-2">Interview Tips</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Press 'R' at any time to get a recommendation on what to ask next</li>
              <li>Watch Rajesh's body language for emotional cues</li>
              <li>Build trust before asking sensitive questions</li>
              <li>Use the recommendation engine when you're unsure what to ask</li>
            </ul>
          </div>
          <div className="text-center">
            <button 
              onClick={() => setShowHelp(false)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Close Help
            </button>
          </div>
        </div>
      )}
      
      {/* Recommendation Panel */}
      {showRecommendation && (
        <div className="recommendation-panel absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-900 to-orange-900 text-white p-4 rounded-xl shadow-lg w-11/12 max-w-2xl z-15 animate-slide-up">
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h3 className="font-bold text-amber-300 mb-1">Recommendation Engine</h3>
              <p className="text-sm">{recommendation}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Completion Message */}
      {showCompletionMessage && !interviewCompleted && (
        <div className="completion-message absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-green-900 to-emerald-900 text-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-20 border border-green-500 animate-slide-up">
          <h2 className="text-3xl font-bold mb-4 text-center text-green-300">Interview Time Completed</h2>
          <p className="text-lg mb-6 text-center">You've completed the 15-minute client interview. Are you satisfied with the information gathered?</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                setShowCompletionMessage(false);
                setIsTimerActive(true);
                setInterviewTimer(300); // Add 5 more minutes
                setStatus('Additional Time Granted');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Need 5 More Minutes
            </button>
            <button 
              onClick={completeInterview}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Complete Interview
            </button>
          </div>
        </div>
      )}
      
      {/* Interview Completed Message */}
      {interviewCompleted && (
        <div className="interview-completed absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-20 border border-purple-500 animate-slide-up">
          <h2 className="text-3xl font-bold mb-4 text-center text-purple-300">Interview Completed</h2>
          <p className="text-lg mb-6 text-center">Client interview has been successfully completed. Proceeding to evidence analysis phase.</p>
          <div className="text-center">
            <div className="inline-block bg-gray-800 px-4 py-2 rounded-lg mb-4">
              <p className="text-sm">Evidence Analysis in Progress</p>
              <div className="flex items-center justify-center mt-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs">Analyzing collected evidence...</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <button 
              onClick={() => {
                setInterviewCompleted(false);
                resetConversation();
                setShowWelcome(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              Restart Interview
            </button>
          </div>
        </div>
      )}
      
      {/* Control Panel */}
      <div className="control-panel absolute top-4 right-4 bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-90 text-white p-5 rounded-2xl shadow-xl w-80 border border-gray-700 animate-subtle-bounce">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2">⚖️</span> Client Interview
          <span className="ml-auto text-amber-400 text-sm animate-pulse-glow px-2 py-1 rounded bg-gray-800">LIVE</span>
        </h3>
        
        {/* Timer Display */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Time Remaining:</span>
            <span className={`font-mono text-lg ${interviewTimer < 300 ? 'text-red-400' : 'text-green-400'}`}>
              {formatTime(interviewTimer)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${((900 - interviewTimer) / 900) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="control-section mb-4">
          <h4 className="font-semibold mb-2">💬 Interview Controls</h4>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onFocus={() => isTextInputFocusedRef.current = true}
              onBlur={() => isTextInputFocusedRef.current = false}
              placeholder="Ask Rajesh about the case..."
              className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Send
            </button>
          </form>
          
          {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
            <button
              onClick={handleSpeechInput}
              className={`mt-2 w-full py-2 rounded flex items-center justify-center ${
                isListening ? 'bg-red-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isListening ? '⏹️ Stop Listening' : '🎤 Speak to Rajesh'}
            </button>
          )}
        </div>
        
        <div className="control-section mb-4">
          <h4 className="font-semibold mb-2">👤 Character Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={toggleLawyerStand}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              Lawyer Stand/Sit
            </button>
            <button 
              onClick={toggleClientStand}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              Client Stand/Sit
            </button>
          </div>
        </div>
        
        <div className="control-section mb-4">
          <h4 className="font-semibold mb-2">🔍 View Controls</h4>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={showAllDocuments}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded text-sm"
            >
              Show All Docs
            </button>
            <button 
              onClick={resetCamera}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded text-sm"
            >
              Reset View
            </button>
          </div>
        </div>
        
        <div className="control-section mb-4">
          <h4 className="font-semibold mb-2">📷 Camera Controls</h4>
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={() => cameraDistanceRef.current = Math.max(4, cameraDistanceRef.current - 1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              Zoom In
            </button>
            <button 
              onClick={() => cameraDistanceRef.current = Math.min(20, cameraDistanceRef.current + 1)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              Zoom Out
            </button>
            <button 
              onClick={() => cameraAngleRef.current -= 0.12}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              ◀️
            </button>
            <button 
              onClick={() => cameraAngleRef.current += 0.12}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              ▶️
            </button>
          </div>
        </div>
        
        <div className="control-section">
          <h4 className="font-semibold mb-2">💡 Lighting</h4>
          <button 
            onClick={() => { 
              setLightsOn(prev => !prev);
              lightsOnRef.current = !lightsOnRef.current;
            }}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
          >
            {lightsOn ? 'Lights Off' : 'Lights On'}
          </button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <strong>Status:</strong>
            <span className="text-blue-400 ml-2 font-mono">{status}</span>
          </div>
          
          {/* Help Button */}
          <button 
            onClick={() => setShowHelp(prev => !prev)}
            className="w-full py-2 bg-blue-700 hover:bg-blue-600 rounded mb-3 flex items-center justify-center"
          >
            <span className="mr-2">❓</span> Help & Controls
          </button>
          
          {/* Recommendation Button */}
          <button 
            onClick={() => {
              if (conversationEngineRef.current) {
                const summary = conversationEngineRef.current.getSummary();
                const rec = getRecommendation(userInput, summary.trustLevel);
                if (rec) {
                  setRecommendation(rec);
                  setShowRecommendation(true);
                  setTimeout(() => setShowRecommendation(false), 5000);
                }
              }
            }}
            className="w-full py-2 bg-amber-700 hover:bg-amber-600 rounded mb-3 flex items-center justify-center"
          >
            <span className="mr-2">🤖</span> Get Recommendation
          </button>
          
          {/* Complete Interview Button */}
          {!interviewCompleted && (
            <button 
              onClick={completeInterview}
              className="w-full py-2 bg-green-700 hover:bg-green-600 rounded mb-3 flex items-center justify-center"
            >
              <span className="mr-2">✅</span> Complete Interview
            </button>
          )}
          
          {/* Trust Level Indicator */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Trust Level</span>
              <span>{(window as any).currentTrustLevel || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(window as any).currentTrustLevel || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-2 flex items-center text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Connected to Rajesh Kumar</span>
          </div>
        </div>
      </div>

      {/* Dialogue Box */}
      {showDialogue && (
        <div className="dialogue-box absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-95 text-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-3xl animate-slide-up border border-gray-700">
          <div className="speaker font-bold text-amber-400 text-xl mb-3 flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-3 animate-pulse"></div>
            {currentDialogue.speaker}
          </div>
          <div className="text-lg leading-relaxed mb-4">{currentDialogue.text}</div>
          <div className="recording-indicator flex items-center text-gray-300 text-sm">
            <div className="record-dot w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
            <span>Speaking...</span>
          </div>
          <div className="absolute -top-2 left-10 w-4 h-4 bg-gray-800 transform rotate-45"></div>
        </div>
      )}

      {/* Document Zoom View */}
      {zoomedDoc && (
        <div className="zoom-view absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-2xl w-11/12 max-w-2xl animate-zoom-in">
          <h2 className="text-2xl font-bold mb-4">{zoomedDoc.text || zoomedDoc.type}</h2>
          <div>
            <p className="font-semibold">Document Type: {zoomedDoc.type.replace('_', ' ').toUpperCase()}</p>
            <div className="bg-gray-100 p-4 rounded mt-3">
              <p className="text-sm">CONFIDENTIAL LEGAL DOCUMENT</p>
              <p className="text-xs mt-2">Date: October 22, 2025</p>
              <p className="text-xs">Case Reference: #2024-789-XYZ</p>
            </div>
            {zoomedDoc.type === 'case_file' && (
              <div className="mt-4 text-sm space-y-2">
                <p><strong>Defendant:</strong> John Doe</p>
                <p><strong>Charges:</strong> Pending Investigation</p>
                <p><strong>Status:</strong> Active</p>
              </div>
            )}
            {zoomedDoc.type === 'evidence' && (
              <div className="mt-4 text-sm space-y-2">
                <p><strong>Evidence ID:</strong> EV-2024-456</p>
                <p><strong>Category:</strong> Physical Evidence</p>
                <p><strong>Chain of Custody:</strong> Verified</p>
              </div>
            )}
            {zoomedDoc.type === 'witness' && (
              <div className="mt-4 text-sm space-y-2">
                <p><strong>Witness:</strong> Jane Smith</p>
                <p><strong>Statement Date:</strong> October 15, 2025</p>
                <p><strong>Reliability:</strong> High</p>
              </div>
            )}
            {zoomedDoc.type === 'contract' && (
              <div className="mt-4 text-sm space-y-2">
                <p><strong>Contract Type:</strong> Legal Agreement</p>
                <p><strong>Parties:</strong> Multiple</p>
                <p><strong>Status:</strong> Under Review</p>
              </div>
            )}
            {zoomedDoc.type === 'crime_scene' && (
              <div className="mt-4 text-sm space-y-2">
                <p><strong>Location:</strong> 123 Main Street</p>
                <p><strong>Date Captured:</strong> October 10, 2025</p>
                <p><strong>Photographer:</strong> CSI Team A</p>
              </div>
            )}
            {zoomedDoc.type === 'suspect' && (
              <div className="mt-4 text-sm space-y-2">
                <p><strong>Subject:</strong> Person of Interest</p>
                <p><strong>ID Status:</strong> Confirmed</p>
                <p><strong>Relevance:</strong> Primary</p>
              </div>
            )}
            {zoomedDoc.type === 'evidence_item' && (
              <div className="mt-4 text-sm space-y-2">
                <p><strong>Item:</strong> Physical Evidence</p>
                <p><strong>Collected:</strong> October 12, 2025</p>
                <p><strong>Analysis:</strong> Complete</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button 
              onClick={() => setZoomedDoc(null)}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
            <div>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">CLASSIFIED</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
          100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
        }
        @keyframes subtle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-zoom-in { animation: zoom-in 0.3s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }
        .animate-subtle-bounce { animation: subtle-bounce 3s infinite; }
      `}</style>
    </div>
  );
};

export default ClientInterview;