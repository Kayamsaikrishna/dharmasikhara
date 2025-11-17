import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import RajeshConversationEngine from '../utils/RajeshConversationEngine';
import rajeshTrainingData from '../utils/rajesh_kumar_processed.json';
import { saveUserProgress } from '../utils/progressApi';

const OptimizedClientInterview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clientRef = useRef<THREE.Group | null>(null);
  const lawyerRef = useRef<THREE.Group | null>(null);
  const documentsRef = useRef<THREE.Group[]>([]);
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>('Ready');
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [currentDialogue, setCurrentDialogue] = useState<{ speaker: string; text: string }>({ speaker: '', text: '' });
  const [showDialogue, setShowDialogue] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string>('');
  const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
  const [interviewCompleted, setInterviewCompleted] = useState<boolean>(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState<boolean>(false);
  const [interviewTimer, setInterviewTimer] = useState<number>(900);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  
  const conversationEngineRef = useRef<RajeshConversationEngine | null>(null);
  const recognitionRef = useRef<any>(null);
  const isTextInputFocusedRef = useRef<boolean>(false);
  const cameraAngleRef = useRef<number>(0);
  const cameraDistanceRef = useRef<number>(8);

  // Initialize conversation engine
  useEffect(() => {
    conversationEngineRef.current = new RajeshConversationEngine(rajeshTrainingData);
  }, []);

  // Timer effect
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
      setShowCompletionMessage(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, interviewTimer, interviewCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Speech recognition
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

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Main Three.js initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.fog = new THREE.Fog(0xf0f0f0, 30, 70);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 8);
    cameraRef.current = camera;

    // Renderer setup - optimized for performance
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    rendererRef.current = renderer;

    // Reduced lighting - comfortable brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(512, 512);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d4,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.9
    });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 0.2), wallMaterial);
    backWall.position.set(0, 4, -15);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 0.2), wallMaterial);
    leftWall.position.set(-15, 4, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.x = 15;
    scene.add(rightWall);

    // Detailed table like original
    const tableGroup = new THREE.Group();
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.12, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x4a3830, roughness: 0.4, metalness: 0.3 })
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

    // Detailed chairs like original
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

    createChair(0, -2.2, 0);
    createChair(0, 2.2, Math.PI);

    // Detailed humans like original
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
        lowerLeg.rotation.x = -0.2;
        lowerLeg.castShadow = true;
        humanGroup.add(lowerLeg);

        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.3), legMaterial);
        foot.position.set(xPos, 0.05, 0.25);
        foot.castShadow = true;
        humanGroup.add(foot);
      });

      humanGroup.position.set(...position);
      scene.add(humanGroup);
      return humanGroup;
    };

    lawyerRef.current = createHuman(0x1a1a2a, [0, 0.6, -1.8], true);
    clientRef.current = createHuman(0x3a3a4a, [0, 0.6, 1.8], false);
    if (clientRef.current) clientRef.current.rotation.y = Math.PI;

    // Detailed Documents/Files
    const createDocument = (x: number, y: number, z: number, rotation: number, headerText: string, color: number) => {
      const docGroup = new THREE.Group();
      
      // Paper stack base
      const backing = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.015, 0.4), 
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
      );
      backing.castShadow = true;
      backing.receiveShadow = true;
      docGroup.add(backing);

      // Top page with content
      const content = new THREE.Mesh(
        new THREE.PlaneGeometry(0.28, 0.38), 
        new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.8 })
      );
      content.position.y = 0.009;
      content.rotation.x = -Math.PI / 2;
      docGroup.add(content);

      // Text lines on document
      for (let i = 0; i < 10; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.001, 0.008), 
          new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })
        );
        line.position.set(0, 0.01, (i - 4.5) * 0.03);
        line.rotation.x = -Math.PI / 2;
        docGroup.add(line);
      }

      // Colored header/tab
      const header = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.001, 0.04), 
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.2 })
      );
      header.position.set(0, 0.011, -0.18);
      header.rotation.x = -Math.PI / 2;
      docGroup.add(header);

      // Paper clip
      const clip = new THREE.Mesh(
        new THREE.TorusGeometry(0.02, 0.004, 8, 16, Math.PI), 
        new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.9 })
      );
      clip.position.set(0.1, 0.012, -0.15);
      clip.rotation.x = -Math.PI / 2;
      docGroup.add(clip);

      docGroup.position.set(x, y, z);
      docGroup.rotation.y = rotation;
      docGroup.userData = { type: 'case_file', text: headerText };
      scene.add(docGroup);
      documentsRef.current.push(docGroup);
      return docGroup;
    };

    // Create detailed laptop in front of lawyer
    const createLaptop = (x: number, y: number, z: number) => {
      const laptopGroup = new THREE.Group();
      
      // Laptop base/keyboard section
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.025, 0.35), 
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.8 })
      );
      body.position.y = 0.0125;
      body.castShadow = true;
      body.receiveShadow = true;
      laptopGroup.add(body);

      // Keyboard keys
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 12; col++) {
          const key = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.008, 0.025), 
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
          );
          key.position.set((col - 5.5) * 0.035, 0.029, (row - 2) * 0.05 - 0.05);
          laptopGroup.add(key);
        }
      }

      // Touchpad
      const touchpad = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.003, 0.1), 
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2, metalness: 0.5 })
      );
      touchpad.position.set(0, 0.028, 0.08);
      laptopGroup.add(touchpad);

      // Screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.43, 0.28, 0.015), 
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.1, metalness: 0.9 })
      );
      screen.position.set(0, 0.16, -0.155);
      screen.rotation.x = -0.3;
      screen.castShadow = true;
      laptopGroup.add(screen);

      // Screen display (blue glow)
      const display = new THREE.Mesh(
        new THREE.PlaneGeometry(0.39, 0.24), 
        new THREE.MeshStandardMaterial({ 
          color: 0x1a3a5a, 
          emissive: 0x004080, 
          emissiveIntensity: 0.4,
          roughness: 0.1 
        })
      );
      display.position.set(0, 0.16, -0.147);
      display.rotation.x = -0.3;
      laptopGroup.add(display);

      // Laptop logo
      const logo = new THREE.Mesh(
        new THREE.CircleGeometry(0.015, 16), 
        new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 })
      );
      logo.position.set(0, 0.28, -0.163);
      logo.rotation.x = -0.3;
      laptopGroup.add(logo);

      // Hinge
      const hinge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.43, 16), 
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.9 })
      );
      hinge.position.set(0, 0.025, -0.175);
      hinge.rotation.z = Math.PI / 2;
      laptopGroup.add(hinge);

      laptopGroup.position.set(x, y, z);
      scene.add(laptopGroup);
      return laptopGroup;
    };

    // Place laptop in front of lawyer (much closer to lawyer, rotated towards lawyer)
    const laptop = createLaptop(0, 1.26, -1.1);
    laptop.rotation.y = Math.PI; // Rotate 180 degrees so screen faces lawyer

    // Create multiple files on lawyer's side of table (moved closer to lawyer)
    createDocument(-1.2, 1.27, -0.9, 0.2, 'Case File #1', 0x3498db); // Blue
    createDocument(-0.8, 1.27, -0.8, -0.15, 'Evidence Report', 0xe74c3c); // Red
    createDocument(-0.4, 1.27, -0.9, 0.3, 'Witness Statements', 0x2ecc71); // Green
    createDocument(-0.0, 1.27, -0.7, -0.2, 'Legal Documents', 0xf39c12); // Orange
    createDocument(-1.5, 1.27, -0.7, 0.4, 'Court Records', 0x9b59b6); // Purple
    
    // Add a pen on the table (closer to lawyer)
    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8), 
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.8 })
    );
    pen.position.set(0.5, 1.27, -0.8);
    pen.rotation.z = Math.PI / 2;
    pen.castShadow = true;
    scene.add(pen);

    // Add a notepad (closer to lawyer)
    const notepad = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.02, 0.35), 
      new THREE.MeshStandardMaterial({ color: 0xfffacd, roughness: 0.9 })
    );
    notepad.position.set(0.8, 1.27, -0.9);
    notepad.rotation.y = 0.1;
    notepad.castShadow = true;
    scene.add(notepad);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Update camera
      const angle = cameraAngleRef.current;
      const distance = cameraDistanceRef.current;
      camera.position.x = distance * Math.sin(angle);
      camera.position.z = distance * Math.cos(angle);
      camera.lookAt(0, 1.5, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    // Window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTextInputFocusedRef.current) return;
      
      if (e.key === 'h' || e.key === 'H') setShowHelp(prev => !prev);
      else if (e.key === '+' || e.key === '=') cameraDistanceRef.current = Math.max(4, cameraDistanceRef.current - 1);
      else if (e.key === '-' || e.key === '_') cameraDistanceRef.current = Math.min(20, cameraDistanceRef.current + 1);
      else if (e.key === 'ArrowLeft') cameraAngleRef.current -= 0.1;
      else if (e.key === 'ArrowRight') cameraAngleRef.current += 0.1;
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
    };
  }, []);

  const handleUserInput = (input: string) => {
    if (!conversationEngineRef.current) return;
    
    const response = conversationEngineRef.current.processInput(input);
    setCurrentDialogue({ speaker: 'Rajesh Kumar', text: response.text });
    setShowDialogue(true);
    setStatus(`Trust Level: ${response.trustLevel}%`);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(response.text);
      window.speechSynthesis.speak(utterance);
    }
    
    setTimeout(() => setShowDialogue(false), 8000);
  };

  const handleSpeechInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleUserInput(userInput);
      setUserInput('');
    }
  };

  const completeInterview = () => {
    setInterviewCompleted(true);
    setIsTimerActive(false);
    setStatus('Interview Completed');
    setRecommendation('Client interview completed. Proceeding to digital evidence review phase.');
    setShowRecommendation(true);
    
    // Save progress using the unified progress API
    const progressData = {
      completedStages: ['client-interview'],
      currentStage: 'digital-evidence',
      lastUpdated: new Date().toISOString(),
      totalTimeSpent: 900 - interviewTimer,
      assessmentScore: null
    };
    
    saveUserProgress('the-inventory-that-changed-everything', progressData)
      .then(() => {
        console.log('Progress saved successfully');
      })
      .catch((error) => {
        console.error('Failed to save progress:', error);
      });
    
    setTimeout(() => {
      setShowRecommendation(false);
      // Navigate to digital evidence page instead of evidence analysis
      navigate('/digital-evidence');
    }, 3000);
  };

  const toggleLawyerStand = () => {
    if (lawyerRef.current) {
      lawyerRef.current.position.y = lawyerRef.current.position.y === 0.6 ? 0 : 0.6;
    }
  };

  const toggleClientStand = () => {
    if (clientRef.current) {
      clientRef.current.position.y = clientRef.current.position.y === 0.6 ? 0 : 0.6;
    }
  };

  const showAllDocuments = () => {
    setRecommendation('All documents are now highlighted in the scene.');
    setShowRecommendation(true);
    setTimeout(() => setShowRecommendation(false), 3000);
  };

  const resetCamera = () => {
    cameraAngleRef.current = 0;
    cameraDistanceRef.current = 8;
  };

  return (
    <div className="h-screen w-screen relative bg-gray-900">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {showWelcome && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-10 border border-indigo-500">
          <h2 className="text-3xl font-bold mb-4 text-center text-amber-300">Welcome to the Client Counseling</h2>
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

      {showHelp && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-20 border border-blue-500">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">Keyboard Controls</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold text-amber-400 mb-2">Camera Controls</h3>
              <ul className="space-y-2 text-sm">
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
              <h3 className="font-bold text-amber-400 mb-2">Other Controls</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Show Help</span>
                  <kbd className="bg-gray-700 px-2 py-1 rounded">H</kbd>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center">
            <button 
              onClick={() => setShowHelp(false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {showDialogue && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-3xl z-15 border border-amber-500">
          <div className="flex items-start">
            <div className="text-4xl mr-4">👤</div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-400 text-lg mb-2">{currentDialogue.speaker}</h3>
              <p className="text-lg">{currentDialogue.text}</p>
            </div>
          </div>
        </div>
      )}

      {showRecommendation && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-900 to-orange-900 text-white p-4 rounded-xl shadow-lg w-11/12 max-w-2xl z-15">
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h3 className="font-bold text-amber-300 mb-1">Recommendation</h3>
              <p className="text-sm">{recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {showCompletionMessage && !interviewCompleted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-green-900 to-emerald-900 text-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-20 border border-green-500">
          <h2 className="text-3xl font-bold mb-4 text-center text-green-300">Interview Time Completed</h2>
          <p className="text-lg mb-6 text-center">You've completed the 15-minute client interview. Are you satisfied with the information gathered?</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                setShowCompletionMessage(false);
                setIsTimerActive(true);
                setInterviewTimer(300);
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

      {interviewCompleted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl z-20 border border-purple-500">
          <h2 className="text-3xl font-bold mb-4 text-center text-purple-300">Interview Completed</h2>
          <p className="text-lg mb-6 text-center">Client interview has been successfully completed.</p>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-95 text-white p-5 rounded-2xl shadow-xl w-80 border border-gray-700">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2">⚖️</span> Client Counseling
        </h3>
        
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Time:</span>
            <span className="font-mono text-lg text-green-400">{formatTime(interviewTimer)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all" 
              style={{ width: `${((900 - interviewTimer) / 900) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">💬 Interview Controls</h4>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onFocus={() => isTextInputFocusedRef.current = true}
              onBlur={() => isTextInputFocusedRef.current = false}
              placeholder="Ask Rajesh..."
              className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Send
            </button>
          </form>
          
          {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
            <button
              onClick={handleSpeechInput}
              className={`mt-2 w-full py-2 rounded ${isListening ? 'bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isListening ? '⏹️ Stop' : '🎤 Speak'}
            </button>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">👤 Characters</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={toggleLawyerStand} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm">
              Lawyer Stand/Sit
            </button>
            <button onClick={toggleClientStand} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm">
              Client Stand/Sit
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">🔍 View</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={showAllDocuments} className="px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded text-sm">
              Show Docs
            </button>
            <button onClick={resetCamera} className="px-3 py-2 bg-teal-600 hover:bg-teal-700 rounded text-sm">
              Reset View
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">📷 Camera</h4>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => cameraDistanceRef.current = Math.max(4, cameraDistanceRef.current - 1)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
              Zoom In
            </button>
            <button onClick={() => cameraDistanceRef.current = Math.min(20, cameraDistanceRef.current + 1)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
              Zoom Out
            </button>
            <button onClick={() => cameraAngleRef.current -= 0.12} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
              ◀️
            </button>
            <button onClick={() => cameraAngleRef.current += 0.12} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
              ▶️
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <button 
            onClick={() => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            ⏸️ Pause Speech
          </button>
        </div>
        
        <div className="mb-4 pt-4 border-t border-gray-700">
          <button 
            onClick={completeInterview}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all"
          >
            ✅ End Meeting & Complete
          </button>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={() => setShowHelp(true)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            ❓ Help
          </button>
          <button 
            onClick={() => {
              setRecommendation('Try asking about his background, family, or the incident timeline.');
              setShowRecommendation(true);
              setTimeout(() => setShowRecommendation(false), 5000);
            }}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
          >
            🤖 AI Rec
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded-full text-sm">
        {status}
      </div>
    </div>
  );
};

export default OptimizedClientInterview;