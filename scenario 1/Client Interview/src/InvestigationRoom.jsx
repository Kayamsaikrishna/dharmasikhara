import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './InvestigationRoom.css';

const InvestigationRoom = () => {
  const canvasRef = useRef(null);
  const lightsRef = useRef({});
  const lightsBaselineRef = useRef({});
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraDistanceRef = useRef(8);
  const cameraAngleRef = useRef(0);
  const lightsOnRef = useRef(true);
  const zoomedDocRef = useRef(null);
  const [status, setStatus] = useState('Ready');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState({ speaker: '', text: '' });
  const [showDialogue, setShowDialogue] = useState(false);
  const [zoomedDoc, setZoomedDoc] = useState(null);
  const [lightsOn, setLightsOn] = useState(true);

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
    let lawyer, client, documents = [];
    let laptop, recorder;
    let audioContext;

    // Lighting
    const setupLighting = () => {
      const ambient = new THREE.AmbientLight(0x404060, 0.6);
      // hemisphere light provides subtle sky/ground ambient which improves "3D" feel
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
      // Slightly stronger rim lights to help silhouettes
      rimLight1.intensity = 1.0;
      rimLight2.intensity = 0.85;
      // store references for later toggling
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
        trim.position.set(...edge.pos);
        trim.castShadow = true;
        tableGroup.add(trim);
      });

      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.8 });
      const legPositions = [[-2, 0.6, 1], [2, 0.6, 1], [-2, 0.6, -1], [2, 0.6, -1]];
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 16), legMaterial);
        leg.position.set(...pos);
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
    const createChair = (x, z, rotation) => {
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
    const createHuman = (color, position, isLawyer) => {
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
    const createLaptop = (x, y, z) => {
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
    const createRecorder = (x, y, z) => {
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
    const createDocument = (x, y, z, rotation, docType) => {
      const docGroup = new THREE.Group();
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.015, 0.65), new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 }));
      paper.castShadow = true;
      docGroup.add(paper);

      let contentColor, headerText;
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
    const createEvidencePhoto = (x, y, z, imageType) => {
      const photoGroup = new THREE.Group();
      const backing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
      backing.castShadow = true;
      photoGroup.add(backing);

      let photoColor;
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
        frame.position.set(...framePositions[idx]);
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

  createChair(0, -2.2, 0);
  createChair(0, 2.2, Math.PI);

    lawyer = createHuman(0x1a1a2a, [0, 0.6, -1.8], true);
    client = createHuman(0x3a3a4a, [0, 0.6, 1.8], false);
    client.rotation.y = Math.PI;

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

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }

    const dialogues = [
      { speaker: 'Lawyer', text: 'Good morning. Please have a seat. Let me review your case file.', duration: 4000, voice: 'male' },
      { speaker: 'Client', text: 'Thank you for taking my case. I am very worried about the charges against me.', duration: 5000, voice: 'female' },
      { speaker: 'Lawyer', text: 'I understand your concern. Looking at the evidence here, we have several strong points for your defense.', duration: 6000, voice: 'male' },
      { speaker: 'Client', text: 'What are our chances? The prosecutor seems very confident.', duration: 4000, voice: 'female' },
      { speaker: 'Lawyer', text: 'Based on these witness statements and the forensic evidence, I believe we can establish reasonable doubt. The timeline doesn\'t match the prosecution\'s theory.', duration: 7000, voice: 'male' },
      { speaker: 'Client', text: 'That\'s reassuring. What are our next steps?', duration: 3500, voice: 'female' },
      { speaker: 'Lawyer', text: 'We need to interview these witnesses listed here, gather additional surveillance footage, and prepare your testimony. I am recording this consultation for our records.', duration: 8000, voice: 'male' }
    ];

    let animationState = {
      lawyer: { talking: false, standing: false, animTime: 0, targetY: 0.6 },
      client: { talking: false, standing: false, animTime: 0, targetY: 0.6 },
      currentDialogueIndex: 0,
      meetingActive: false
    };

    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onWheel = (event) => {
      event.preventDefault();
      cameraDistanceRef.current += event.deltaY * 0.01;
      cameraDistanceRef.current = Math.max(5, Math.min(20, cameraDistanceRef.current));
    };

    const onMouseClick = (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.type) obj = obj.parent;
        if (obj && obj.userData.type) {
          zoomToDocument(obj);
        }
      }
    };

    const zoomToDocument = (doc) => {
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

    const onKeyDown = (e) => {
      if (e.key === 'l' || e.key === 'L') {
        // toggle lights (keep ref in sync)
        setLightsOn(prev => { lightsOnRef.current = !prev; return !prev; });
      } else if (e.key === '+' || e.key === '=') {
        cameraDistanceRef.current = Math.max(4, cameraDistanceRef.current - 1);
      } else if (e.key === '-' || e.key === '_') {
        cameraDistanceRef.current = Math.min(20, cameraDistanceRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        cameraAngleRef.current -= 0.12;
      } else if (e.key === 'ArrowRight') {
        cameraAngleRef.current += 0.12;
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const speak = (text, voice) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        if (voice === 'male') {
          const maleVoice = voices.find(v => /male|david/i.test(v.name));
          if (maleVoice) utterance.voice = maleVoice;
        } else {
          const femaleVoice = voices.find(v => /female|samantha/i.test(v.name));
          if (femaleVoice) utterance.voice = femaleVoice;
        }
        utterance.rate = 0.9;
        utterance.pitch = voice === 'male' ? 0.8 : 1.1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
      }
    };

    window.startMeeting = () => {
      if (animationState.meetingActive) return;
      animationState.meetingActive = true;
      animationState.currentDialogueIndex = 0;
      setIsAnimating(true);
      setStatus('Meeting in progress...');

      const playNext = () => {
        if (animationState.currentDialogueIndex >= dialogues.length) {
          animationState.meetingActive = false;
          setIsAnimating(false);
          setShowDialogue(false);
          setStatus('Meeting completed');
          return;
        }
        const d = dialogues[animationState.currentDialogueIndex];
        setCurrentDialogue({ speaker: d.speaker, text: d.text });
        setShowDialogue(true);
        speak(d.text, d.voice);

        if (d.speaker === 'Lawyer') {
          animationState.lawyer.talking = true;
          animationState.client.talking = false;
        } else {
          animationState.client.talking = true;
          animationState.lawyer.talking = false;
        }

        setTimeout(() => {
          animationState.lawyer.talking = false;
          animationState.client.talking = false;
          animationState.currentDialogueIndex++;
          if (animationState.currentDialogueIndex < dialogues.length) {
            setTimeout(playNext, 1000);
          } else {
            playNext();
          }
        }, d.duration);
      };
      playNext();
    };

    window.lawyerStands = () => {
      animationState.lawyer.standing = !animationState.lawyer.standing;
      animationState.lawyer.targetY = animationState.lawyer.standing ? 0 : 0.6;
      setStatus(animationState.lawyer.standing ? 'Lawyer standing' : 'Lawyer sitting');
    };

    window.clientStands = () => {
      animationState.client.standing = !animationState.client.standing;
      animationState.client.targetY = animationState.client.standing ? 0 : 0.6;
      setStatus(animationState.client.standing ? 'Client standing' : 'Client sitting');
    };

    window.showAllDocuments = () => {
      setStatus('Displaying all evidence documents');
      documents.forEach((doc, idx) => setTimeout(() => zoomToDocument(doc), idx * 2000));
    };

    window.resetCamera = () => {
      cameraDistanceRef.current = 8;
      cameraAngleRef.current = 0;
      setStatus('Camera reset');
      setZoomedDoc(null);
    };

    // expose small helpers for buttons
    window._investigationRoom = {
      zoomIn: () => { cameraDistanceRef.current = Math.max(5, cameraDistanceRef.current - 1); setStatus('Zoomed In'); },
      zoomOut: () => { cameraDistanceRef.current = Math.min(20, cameraDistanceRef.current + 1); setStatus('Zoomed Out'); },
      rotateLeft: () => { cameraAngleRef.current -= 0.15; setStatus('Rotated Left'); },
      rotateRight: () => { cameraAngleRef.current += 0.15; setStatus('Rotated Right'); },
      toggleLights: () => {
        setLightsOn(prev => { lightsOnRef.current = !prev; return !prev; });
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!zoomedDoc) {
        // use cameraAngleRef + mouse influence for smooth orbit
        const baseAngle = cameraAngleRef.current + mouseX * 0.4;
        const angle = baseAngle;
        const targetY = 2.5 + mouseY * 2;
        const desiredX = Math.sin(angle) * cameraDistanceRef.current;
        const desiredZ = Math.cos(angle) * cameraDistanceRef.current;
        camera.position.x += (desiredX - camera.position.x) * 0.08;
        camera.position.z += (desiredZ - camera.position.z) * 0.08;
        camera.position.y += (targetY - camera.position.y) * 0.08;
        camera.lookAt(0, 1.5, 0);
      }

      if (lawyer) {
        lawyer.position.y += (animationState.lawyer.targetY - lawyer.position.y) * 0.05;
        if (animationState.lawyer.talking) {
          animationState.lawyer.animTime += delta * 10;
          const headBob = Math.sin(animationState.lawyer.animTime) * 0.03;
          const headNod = Math.sin(animationState.lawyer.animTime * 0.5) * 0.05;
          lawyer.children[0].position.y = 1.65 + headBob;
          lawyer.children[0].rotation.x = headNod;
          if (lawyer.children[4]) {
            lawyer.children[4].rotation.z = -0.2 + Math.sin(time * 3) * 0.15;
            lawyer.children[6].rotation.z = 0.2 - Math.sin(time * 3) * 0.15;
          }
        } else {
          lawyer.children[0].position.y = 1.65;
          lawyer.children[0].rotation.x = 0;
          if (lawyer.children[4]) {
            lawyer.children[4].rotation.z = -0.2 + Math.sin(time * 0.8) * 0.05;
            lawyer.children[6].rotation.z = 0.2 - Math.sin(time * 0.8) * 0.05;
          }
        }
      }

      if (client) {
        client.position.y += (animationState.client.targetY - client.position.y) * 0.05;
        if (animationState.client.talking) {
          animationState.client.animTime += delta * 10;
          const headBob = Math.sin(animationState.client.animTime) * 0.03;
          const headNod = Math.sin(animationState.client.animTime * 0.5) * 0.05;
          client.children[0].position.y = 1.65 + headBob;
          client.children[0].rotation.x = headNod;
          if (client.children[4]) {
            client.children[4].rotation.z = -0.2 + Math.sin(time * 3 + Math.PI) * 0.15;
            client.children[6].rotation.z = 0.2 - Math.sin(time * 3 + Math.PI) * 0.15;
          }
        } else {
          client.children[0].position.y = 1.65;
          client.children[0].rotation.x = 0;
          if (client.children[4]) {
            client.children[4].rotation.z = -0.2 + Math.sin(time * 0.8 + Math.PI) * 0.05;
            client.children[6].rotation.z = 0.2 - Math.sin(time * 0.8 + Math.PI) * 0.05;
          }
        }
      }

      if (recorder && animationState.meetingActive) {
        const btn = recorder.children.find(c => c.material?.emissive);
        if (btn) btn.material.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.4;
      }

      if (laptop) {
        const scr = laptop.children.find(c => c.material?.emissive?.b > 0);
        if (scr) scr.material.emissiveIntensity = 0.6 + Math.random() * 0.1;
      }

      // update light intensities based on lightsOnRef (keeps animation loop reactive without re-registering)
      if (lightsRef.current && lightsBaselineRef.current) {
        const factor = lightsOnRef.current ? 1 : 0;
        try {
          Object.keys(lightsBaselineRef.current).forEach(key => {
            const lightObj = lightsRef.current[key];
            if (lightObj) {
              // add a slight animated flicker to desk lamp during meetings for realism
              if (key === 'deskLamp' && animationState.meetingActive) {
                lightObj.intensity = (lightsBaselineRef.current[key] * factor) * (0.95 + Math.sin(time * 6) * 0.05);
              } else {
                lightObj.intensity = lightsBaselineRef.current[key] * factor;
              }
            }
          });
        } catch (e) { console.warn('Light update error', e); }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('wheel', onWheel);
  document.removeEventListener('click', onMouseClick);
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('keydown', onKeyDown);
  renderer.dispose();
  if (audioContext) audioContext.close();
    };
  }, []);

  return (
    <div className="investigation-root">
      <canvas ref={canvasRef} className="investigation-canvas" />
      {/* Control Panel */}
      <div className="control-panel">
        <h3>⚖️ Investigation Room Control</h3>
        <div className="control-section">
          <h4>🎬 Meeting Controls</h4>
          <button onClick={() => window.startMeeting()} disabled={isAnimating} className="btn" style={{width:'100%'}}>
            {isAnimating ? 'Meeting in Progress...' : 'Start Full Meeting'}
          </button>
        </div>
        <div className="control-section">
          <h4>👤 Character Actions</h4>
          <div className="grid-2">
            <button onClick={() => window.lawyerStands()} className="btn">Lawyer Stand/Sit</button>
            <button onClick={() => window.clientStands()} className="btn">Client Stand/Sit</button>
          </div>
        </div>
        <div className="control-section">
          <h4>📄 Evidence & View</h4>
          <div className="grid-2">
            <button onClick={() => window.showAllDocuments()} className="btn">Show All Docs</button>
            <button onClick={() => window.resetCamera()} className="btn ghost">Reset View</button>
          </div>
        </div>
        <div className="control-section">
          <h4>🔍 Camera Controls</h4>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => window._investigationRoom.zoomIn()} className="btn">Zoom In</button>
            <button onClick={() => window._investigationRoom.zoomOut()} className="btn">Zoom Out</button>
            <button onClick={() => window._investigationRoom.rotateLeft()} className="btn">◀️</button>
            <button onClick={() => window._investigationRoom.rotateRight()} className="btn">▶️</button>
          </div>
        </div>
        <div className="control-section">
          <h4>💡 Lighting</h4>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => { window._investigationRoom.toggleLights(); }} className="btn">{lightsOn ? 'Lights Off' : 'Lights On'}</button>
          </div>
        </div>
        <div className="status-bar">
          <strong>Status:</strong> <span style={{color:'#93c5fd',marginLeft:6}}>{status}</span>
        </div>
        <div className="shortcuts">
          <div><strong>Mouse:</strong> Rotate  •  <strong>Scroll:</strong> Zoom</div>
          <div><strong>Click:</strong> Document to zoom  •  <strong>Keys:</strong> +/- zoom • ←/→ rotate • L toggle lights</div>
        </div>
      </div>

      {/* Dialogue Box */}
      {showDialogue && (
        <div className="dialogue-box animate-slide-up">
          <div className="speaker">{currentDialogue.speaker}:</div>
          <div className="text">{currentDialogue.text}</div>
          <div className="recording-indicator">
            <div className="record-dot"></div>
            <span style={{color:'#9ca3af'}}>Recording in progress</span>
          </div>
        </div>
      )}

      {/* Document Zoom View */}
      {zoomedDoc && (
        <div className="zoom-view animate-zoom-in">
          <h2>{zoomedDoc.text || zoomedDoc.type}</h2>
          <div>
            <p className="font-semibold">Document Type: {zoomedDoc.type.replace('_', ' ').toUpperCase()}</p>
            <div style={{background:'#f3f4f6',padding:12,borderRadius:8}}>
              <p style={{fontSize:14}}>CONFIDENTIAL LEGAL DOCUMENT</p>
              <p style={{fontSize:12,marginTop:6}}>Date: October 22, 2025</p>
              <p style={{fontSize:12}}>Case Reference: #2024-789-XYZ</p>
            </div>
            {zoomedDoc.type === 'case_file' && (
              <div className="space-y-2 text-sm">
                <p><strong>Defendant:</strong> John Doe</p>
                <p><strong>Charges:</strong> Pending Investigation</p>
                <p><strong>Status:</strong> Active</p>
              </div>
            )}
            {zoomedDoc.type === 'evidence' && (
              <div className="space-y-2 text-sm">
                <p><strong>Evidence ID:</strong> EV-2024-456</p>
                <p><strong>Category:</strong> Physical Evidence</p>
                <p><strong>Chain of Custody:</strong> Verified</p>
              </div>
            )}
            {zoomedDoc.type === 'witness' && (
              <div className="space-y-2 text-sm">
                <p><strong>Witness:</strong> Jane Smith</p>
                <p><strong>Statement Date:</strong> October 15, 2025</p>
                <p><strong>Reliability:</strong> High</p>
              </div>
            )}
            {zoomedDoc.type === 'contract' && (
              <div className="space-y-2 text-sm">
                <p><strong>Contract Type:</strong> Legal Agreement</p>
                <p><strong>Parties:</strong> Multiple</p>
                <p><strong>Status:</strong> Under Review</p>
              </div>
            )}
            {zoomedDoc.type === 'crime_scene' && (
              <div className="space-y-2 text-sm">
                <p><strong>Location:</strong> 123 Main Street</p>
                <p><strong>Date Captured:</strong> October 10, 2025</p>
                <p><strong>Photographer:</strong> CSI Team A</p>
              </div>
            )}
            {zoomedDoc.type === 'suspect' && (
              <div className="space-y-2 text-sm">
                <p><strong>Subject:</strong> Person of Interest</p>
                <p><strong>ID Status:</strong> Confirmed</p>
                <p><strong>Relevance:</strong> Primary</p>
              </div>
            )}
            {zoomedDoc.type === 'evidence_item' && (
              <div className="space-y-2 text-sm">
                <p><strong>Item:</strong> Physical Evidence</p>
                <p><strong>Collected:</strong> October 12, 2025</p>
                <p><strong>Analysis:</strong> Complete</p>
              </div>
            )}
          </div>
          <div className="zoom-actions" style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button onClick={() => setZoomedDoc(null)} className="btn">Close</button>
            <div>
              <span className="small-tag">CLASSIFIED</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        .animate-zoom-in { animation: zoom-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default InvestigationRoom;