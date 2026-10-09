import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import {
  Play,
  Pause,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Camera,
  Lightbulb,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
} from 'lucide-react';

export const RunwaySection: React.FC = () => {
  const { setSelectedProduct, customerPhoto, personalizedTryOnUrl, tryOnProduct } = useApp();

  const [isPlaying, setIsPlaying] = useState(true);
  const [activeAngle, setActiveAngle] = useState<'Front' | 'Left' | 'Right' | 'Back'>('Front');
  const [lightingMode, setLightingMode] = useState<'spotlight' | 'golden' | 'moonlight' | 'glow'>('spotlight');
  const [outfitIndex, setOutfitIndex] = useState(0);
  const [walkSpeed, setWalkSpeed] = useState<number>(1.0);
  const [showTechInfo, setShowTechInfo] = useState(false);

  // If a dress was selected in try-on, match it as initial outfit
  useEffect(() => {
    if (tryOnProduct) {
      const idx = PRODUCTS_DATA.findIndex((p) => p.id === tryOnProduct.id);
      if (idx !== -1) setOutfitIndex(idx);
    }
  }, [tryOnProduct]);

  const currentOutfit = PRODUCTS_DATA[outfitIndex] || PRODUCTS_DATA[0];

  const nextOutfit = () => {
    setOutfitIndex((prev) => (prev + 1) % PRODUCTS_DATA.length);
  };

  const prevOutfit = () => {
    setOutfitIndex((prev) => (prev - 1 + PRODUCTS_DATA.length) % PRODUCTS_DATA.length);
  };

  // Three.js Canvas Reference & Internal State
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mesh & Rig references for animation
  const rigRef = useRef<{
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    skirt: THREE.Mesh;
    dupatta: THREE.Mesh;
    skirtMaterial: THREE.MeshPhysicalMaterial;
    bodiceMaterial: THREE.MeshPhysicalMaterial;
    dupattaMaterial: THREE.MeshPhysicalMaterial;
    faceMaterial: THREE.MeshStandardMaterial;
  } | null>(null);

  // Lights references for dynamic lighting modes
  const lightsRef = useRef<{
    mainSpot: THREE.SpotLight;
    rimLight1: THREE.PointLight;
    rimLight2: THREE.PointLight;
    ambient: THREE.AmbientLight;
    floorReflector: THREE.Mesh;
  } | null>(null);

  // Initialize Three.js 3D Runway Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0712);
    scene.fog = new THREE.FogExp2(0x0c0712, 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 4.8);
    cameraRef.current = camera;

    // 3. Renderer with high dynamic range tone mapping & soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Clean any prior canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls for smooth continuous 360° interactive rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't clip below floor
    controls.minDistance = 2.0;
    controls.maxDistance = 8.0;
    controls.target.set(0, 1.25, 0);
    controlsRef.current = controls;

    // 5. Build Luxury Runway Catwalk Environment
    // Mirror glossy catwalk floor
    const runwayWidth = 2.6;
    const runwayLength = 16.0;
    const floorGeo = new THREE.PlaneGeometry(runwayWidth, runwayLength);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x11091a,
      roughness: 0.18,
      metalness: 0.85,
    });
    const runwayFloor = new THREE.Mesh(floorGeo, floorMat);
    runwayFloor.rotation.x = -Math.PI / 2;
    runwayFloor.receiveShadow = true;
    scene.add(runwayFloor);

    // Golden runway border rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9 });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, runwayLength), railMat);
    leftRail.position.set(-runwayWidth / 2, 0.02, 0);
    scene.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, runwayLength), railMat);
    rightRail.position.set(runwayWidth / 2, 0.02, 0);
    scene.add(rightRail);

    // Illuminated runway edge lights (LED track)
    for (let z = -runwayLength / 2; z <= runwayLength / 2; z += 1.2) {
      const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xffdf88 });
      const ledL = new THREE.Mesh(ledGeo, ledMat);
      ledL.position.set(-runwayWidth / 2 + 0.05, 0.03, z);
      scene.add(ledL);
      const ledR = new THREE.Mesh(ledGeo, ledMat);
      ledR.position.set(runwayWidth / 2 - 0.05, 0.03, z);
      scene.add(ledR);
    }

    // Runway backdrop arch (Paris-Lahore Haute Couture Week wall)
    const backdropGeo = new THREE.PlaneGeometry(8, 5);
    const backdropMat = new THREE.MeshStandardMaterial({
      color: 0x1e0d29,
      roughness: 0.7,
      metalness: 0.2,
    });
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    backdrop.position.set(0, 2.5, -runwayLength / 2);
    scene.add(backdrop);

    // 6. Lighting Rig
    const ambient = new THREE.AmbientLight(0xfff3e0, 0.6);
    scene.add(ambient);

    const mainSpot = new THREE.SpotLight(0xfffaed, 3.8);
    mainSpot.position.set(0, 5.5, 3.2);
    mainSpot.angle = Math.PI / 4.5;
    mainSpot.penumbra = 0.5;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    mainSpot.shadow.bias = -0.0005;
    scene.add(mainSpot);

    const rimLight1 = new THREE.PointLight(0xd4af37, 1.8, 8);
    rimLight1.position.set(-2.2, 2.8, -1.0);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0xa53860, 1.6, 8);
    rimLight2.position.set(2.2, 2.8, -1.0);
    scene.add(rimLight2);

    lightsRef.current = {
      mainSpot,
      rimLight1,
      rimLight2,
      ambient,
      floorReflector: runwayFloor,
    };

    // 7. Build Articulated 3D Female Fashion Avatar & Pakistani Couture Ensemble
    const avatarGroup = new THREE.Group();
    avatarGroupRef.current = avatarGroup;
    scene.add(avatarGroup);

    // PBR Materials for Couture Garment
    const initialHex = currentOutfit.colorHex || '#631626';
    const baseColor = new THREE.Color(initialHex);

    const skirtMaterial = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: 0.45,
      metalness: 0.15,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
      sheen: 0.8,
      sheenColor: new THREE.Color(0xd4af37),
    });

    const bodiceMaterial = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: 0.35,
      metalness: 0.25,
      clearcoat: 0.45,
      sheen: 0.9,
      sheenColor: new THREE.Color(0xffd700),
    });

    const dupattaMaterial = new THREE.MeshPhysicalMaterial({
      color: baseColor.clone().offsetHSL(0.02, 0.05, 0.05),
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
      transmission: 0.25,
      sheen: 0.95,
      sheenColor: new THREE.Color(0xd4af37),
    });

    const skinToneColor = new THREE.Color(0xe0b493);
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinToneColor,
      roughness: 0.55,
      metalness: 0.05,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f140e,
      roughness: 0.7,
      metalness: 0.1,
    });

    const goldZariMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.92,
    });

    // Rig Hierarchy
    // Root Torso
    const torso = new THREE.Group();
    torso.position.y = 1.05;
    avatarGroup.add(torso);

    // Bodice / Choli mesh
    const bodiceGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.42, 24);
    const bodice = new THREE.Mesh(bodiceGeo, bodiceMaterial);
    bodice.castShadow = true;
    torso.add(bodice);

    // Gold zari neckline embroidery border
    const neckTrimGeo = new THREE.TorusGeometry(0.14, 0.016, 12, 24);
    const neckTrim = new THREE.Mesh(neckTrimGeo, goldZariMaterial);
    neckTrim.rotation.x = Math.PI / 2;
    neckTrim.position.y = 0.2;
    torso.add(neckTrim);

    // Head & Neck
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 16);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.y = 0.26;
    torso.add(neck);

    const head = new THREE.Group();
    head.position.y = 0.42;
    torso.add(head);

    const faceGeo = new THREE.SphereGeometry(0.11, 24, 24);
    faceGeo.scale(1.0, 1.25, 1.05);
    const faceMaterial = skinMaterial.clone();
    const faceMesh = new THREE.Mesh(faceGeo, faceMaterial);
    faceMesh.castShadow = true;
    head.add(faceMesh);

    // Hair Updo (Mughal-style elegant chignon)
    const hairGeo = new THREE.SphereGeometry(0.12, 18, 18);
    hairGeo.scale(1.05, 1.1, 1.15);
    const hairMesh = new THREE.Mesh(hairGeo, hairMaterial);
    hairMesh.position.set(0, 0.04, -0.04);
    head.add(hairMesh);

    const bunGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const bun = new THREE.Mesh(bunGeo, hairMaterial);
    bun.position.set(0, 0.02, -0.14);
    head.add(bun);

    // Gold Maang Tikka (Traditional headpiece)
    const tikkaGeo = new THREE.ConeGeometry(0.018, 0.035, 8);
    const tikka = new THREE.Mesh(tikkaGeo, goldZariMaterial);
    tikka.position.set(0, 0.08, 0.11);
    tikka.rotation.x = -Math.PI / 3;
    head.add(tikka);

    // Flared Pleated Lehenga / Peshwas Skirt
    const skirtGeo = new THREE.ConeGeometry(0.68, 0.95, 32, 8, true);
    const skirt = new THREE.Mesh(skirtGeo, skirtMaterial);
    skirt.position.y = -0.42;
    skirt.castShadow = true;
    skirt.receiveShadow = true;
    torso.add(skirt);

    // Gold Zari Hemline Border (Gota Kinari)
    const hemBorderGeo = new THREE.TorusGeometry(0.67, 0.025, 12, 36);
    const hemBorder = new THREE.Mesh(hemBorderGeo, goldZariMaterial);
    hemBorder.rotation.x = Math.PI / 2;
    hemBorder.position.y = -0.88;
    torso.add(hemBorder);

    // Flowing Dupatta (Draped sash across shoulder & trailing down the side)
    const dupattaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.22, 0.05),
      new THREE.Vector3(-0.35, -0.1, 0.15),
      new THREE.Vector3(-0.42, -0.5, 0.25),
      new THREE.Vector3(-0.38, -0.9, 0.35),
    ]);
    const dupattaGeo = new THREE.TubeGeometry(dupattaCurve, 24, 0.07, 12, false);
    const dupatta = new THREE.Mesh(dupattaGeo, dupattaMaterial);
    dupatta.castShadow = true;
    torso.add(dupatta);

    // Arms & Hands (Articulated shoulder joints)
    const armGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.48, 14);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.25, 0.18, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMaterial);
    leftArmMesh.position.y = -0.24;
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);
    torso.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.25, 0.18, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMaterial);
    rightArmMesh.position.y = -0.24;
    rightArmMesh.castShadow = true;
    rightArm.add(rightArmMesh);
    torso.add(rightArm);

    // Legs & High-fashion Footwear
    const legGeo = new THREE.CylinderGeometry(0.055, 0.04, 0.85, 14);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.11, -0.18, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, skinMaterial);
    leftLegMesh.position.y = -0.42;
    leftLegMesh.castShadow = true;
    leftLeg.add(leftLegMesh);
    torso.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.11, -0.18, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, skinMaterial);
    rightLegMesh.position.y = -0.42;
    rightLegMesh.castShadow = true;
    rightLeg.add(rightLegMesh);
    torso.add(rightLeg);

    rigRef.current = {
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      torso,
      head,
      skirt,
      dupatta,
      skirtMaterial,
      bodiceMaterial,
      dupattaMaterial,
      faceMaterial,
    };

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let walkPhase = 0;
    let runwayProgress = 0; // Model walk translation along z-axis

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      controls.update();

      if (isPlaying && rigRef.current && avatarGroupRef.current) {
        walkPhase += delta * 4.2 * walkSpeed;

        // Oscillating natural runway gait
        const hipSway = Math.sin(walkPhase) * 0.08;
        const legAngleL = Math.sin(walkPhase) * 0.42;
        const legAngleR = -Math.sin(walkPhase) * 0.42;
        const armAngleL = -Math.sin(walkPhase) * 0.32;
        const armAngleR = Math.sin(walkPhase) * 0.32;

        // Apply limb rotations
        rigRef.current.leftLeg.rotation.x = legAngleL;
        rigRef.current.rightLeg.rotation.x = legAngleR;
        rigRef.current.leftArm.rotation.x = armAngleL;
        rigRef.current.rightArm.rotation.x = armAngleR;

        // Torso oscillation & vertical bob
        rigRef.current.torso.rotation.z = hipSway * 0.6;
        rigRef.current.torso.rotation.y = Math.cos(walkPhase) * 0.05;
        avatarGroupRef.current.position.y = Math.abs(Math.sin(walkPhase * 2)) * 0.035;

        // Dynamic fabric movement (Lehenga hem & dupatta sway)
        rigRef.current.skirt.rotation.z = -hipSway * 0.8;
        rigRef.current.dupatta.rotation.z = Math.sin(walkPhase * 1.5) * 0.08;
        rigRef.current.dupatta.rotation.x = Math.cos(walkPhase) * 0.12;

        // Runway stride progression along catwalk
        runwayProgress += delta * 0.55 * walkSpeed;
        const strideZ = (Math.sin(runwayProgress) * 0.5 + 0.5) * (runwayLength * 0.35) - runwayLength * 0.15;
        avatarGroupRef.current.position.z = strideZ;

        // Follow spotlight tracks avatar
        if (lightsRef.current) {
          lightsRef.current.mainSpot.target = avatarGroupRef.current;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Avatar Outfit Texture & PBR Colors when selected outfit changes
  useEffect(() => {
    if (!rigRef.current) return;
    const { skirtMaterial, bodiceMaterial, dupattaMaterial, faceMaterial } = rigRef.current;

    const dressHex = currentOutfit.colorHex || '#631626';
    const newColor = new THREE.Color(dressHex);

    skirtMaterial.color = newColor;
    bodiceMaterial.color = newColor;
    dupattaMaterial.color = newColor.clone().offsetHSL(0.02, 0.05, 0.05);

    // Fabric-specific material adjustments
    const fabricLower = (currentOutfit.fabric || '').toLowerCase();
    if (fabricLower.includes('velvet')) {
      skirtMaterial.roughness = 0.65;
      skirtMaterial.sheen = 1.0;
      skirtMaterial.metalness = 0.1;
    } else if (fabricLower.includes('silk') || fabricLower.includes('tissue')) {
      skirtMaterial.roughness = 0.25;
      skirtMaterial.clearcoat = 0.7;
      skirtMaterial.metalness = 0.3;
    } else if (fabricLower.includes('banarsi') || fabricLower.includes('brocade')) {
      skirtMaterial.roughness = 0.4;
      skirtMaterial.metalness = 0.55;
    }

    // Try to load real garment texture onto the 3D dress mesh
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    const dressImgSrc = currentOutfit.images.front;

    textureLoader.load(
      dressImgSrc,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1.5, 1.5);
        skirtMaterial.map = tex;
        bodiceMaterial.map = tex;
        skirtMaterial.needsUpdate = true;
        bodiceMaterial.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('[3D Runway Texture Warning]: Using procedural PBR color.', err);
      }
    );

    // If customer has a portrait or personalized try-on, transfer skin tone / face
    const userPhoto = personalizedTryOnUrl || customerPhoto;
    if (userPhoto) {
      textureLoader.load(
        userPhoto,
        (faceTex) => {
          faceMaterial.map = faceTex;
          faceMaterial.needsUpdate = true;
        },
        undefined,
        () => {}
      );
    }
  }, [currentOutfit, customerPhoto, personalizedTryOnUrl]);

  // Handle Dynamic Runway Lighting Modes
  useEffect(() => {
    if (!lightsRef.current || !sceneRef.current) return;
    const { mainSpot, rimLight1, rimLight2, ambient } = lightsRef.current;

    switch (lightingMode) {
      case 'golden':
        mainSpot.color.setHex(0xffdfa0);
        mainSpot.intensity = 4.2;
        rimLight1.color.setHex(0xffaa44);
        rimLight2.color.setHex(0xdd8833);
        ambient.color.setHex(0x5a3618);
        sceneRef.current.background = new THREE.Color(0x180b06);
        sceneRef.current.fog = new THREE.FogExp2(0x180b06, 0.035);
        break;

      case 'moonlight':
        mainSpot.color.setHex(0xc8e0ff);
        mainSpot.intensity = 3.2;
        rimLight1.color.setHex(0x4080ff);
        rimLight2.color.setHex(0x80c0ff);
        ambient.color.setHex(0x102040);
        sceneRef.current.background = new THREE.Color(0x060c18);
        sceneRef.current.fog = new THREE.FogExp2(0x060c18, 0.035);
        break;

      case 'glow':
        mainSpot.color.setHex(0xffe6f0);
        mainSpot.intensity = 3.6;
        rimLight1.color.setHex(0xd4af37);
        rimLight2.color.setHex(0x9a2a5a);
        ambient.color.setHex(0x381028);
        sceneRef.current.background = new THREE.Color(0x12040d);
        sceneRef.current.fog = new THREE.FogExp2(0x12040d, 0.035);
        break;

      case 'spotlight':
      default:
        mainSpot.color.setHex(0xfffaed);
        mainSpot.intensity = 3.8;
        rimLight1.color.setHex(0xd4af37);
        rimLight2.color.setHex(0xa53860);
        ambient.color.setHex(0x2b1b36);
        sceneRef.current.background = new THREE.Color(0x0c0712);
        sceneRef.current.fog = new THREE.FogExp2(0x0c0712, 0.035);
        break;
    }
  }, [lightingMode]);

  // Camera Perspective Presets (Front, Left, Right, Back in true 3D space)
  const setCameraAngle = (angle: 'Front' | 'Left' | 'Right' | 'Back') => {
    setActiveAngle(angle);
    if (!cameraRef.current || !controlsRef.current) return;
    const dist = 4.8;
    const y = 1.6;

    switch (angle) {
      case 'Front':
        cameraRef.current.position.set(0, y, dist);
        break;
      case 'Left':
        cameraRef.current.position.set(-dist, y, 0);
        break;
      case 'Right':
        cameraRef.current.position.set(dist, y, 0);
        break;
      case 'Back':
        cameraRef.current.position.set(0, y, -dist);
        break;
    }
    controlsRef.current.target.set(0, 1.25, 0);
    controlsRef.current.update();
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const factor = direction === 'in' ? 0.82 : 1.22;
    cameraRef.current.position.multiplyScalar(factor);
    controlsRef.current.update();
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 1.6, 4.8);
    controlsRef.current.target.set(0, 1.25, 0);
    controlsRef.current.update();
    setActiveAngle('Front');
  };

  return (
    <section className="py-24 bg-charcoal text-ivory relative overflow-hidden" id="runway">
      {/* Stage Fog / Ambient glow */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-charcoal-dark via-plum-dark/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum/80 text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-[0.25em] mb-4 shadow-gold-subtle">
            <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
            <span>Digital Haute Couture Fashion Week</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase mb-4">
            3D REAL-TIME FASHION RUNWAY
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-6" />
          <p className="text-sm sm:text-base text-ivory/70 max-w-2xl mx-auto leading-relaxed font-light">
            Experience our flagship real-time 3D fashion runway. Watch your selected Pakistani bridal and festive couture drape, sway, and walk with genuine cloth movement, lighting physics, and continuous 360° rotation.
          </p>
        </div>

        {/* 3D Runway Stage Arena */}
        <div className="bg-charcoal-dark rounded-3xl overflow-hidden border border-champagne/30 shadow-2xl relative">
          {/* Main Three.js 3D Canvas Stage Container */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden bg-black flex items-center justify-center">
            {/* Real-time WebGL Three.js Canvas */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Stage Header Overlay */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-auto">
              <div className="bg-plum-dark/90 backdrop-blur-md border border-champagne/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-luxury">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-brand tracking-[0.2em] uppercase text-champagne font-bold">
                  LIVE 3D RUNWAY • WEBGL PBR
                </span>
              </div>

              <div className="bg-plum-dark/90 backdrop-blur-md border border-champagne/30 px-4 py-2 rounded-xl flex items-center gap-3 shadow-luxury">
                <span className="text-xs font-editorial text-ivory font-bold uppercase truncate max-w-[200px] sm:max-w-none">
                  {currentOutfit.name}
                </span>
                <span className="text-champagne text-xs font-bold font-mono">
                  PKR {currentOutfit.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 3D Orbit Drag Hint Overlay */}
            <div className="absolute bottom-6 right-6 bg-plum-dark/85 backdrop-blur-md border border-champagne/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-brand uppercase tracking-wider text-ivory/80 shadow-luxury pointer-events-none">
              <RotateCw className="w-3.5 h-3.5 text-champagne animate-spin" />
              <span>Drag to orbit 360° in 3D</span>
            </div>

            {/* Camera Perspective Indicator Badge */}
            <div className="absolute bottom-6 left-6 bg-burgundy/85 backdrop-blur-md border border-champagne/30 px-3 py-1.5 rounded-xl text-[10px] font-brand tracking-widest uppercase text-champagne shadow-luxury">
              Camera: {activeAngle} View ({lightingMode.toUpperCase()} Lighting)
            </div>

            {/* Outfit Switch Arrows */}
            <button
              onClick={prevOutfit}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-plum-dark/80 hover:bg-burgundy border border-champagne/30 text-champagne flex items-center justify-center transition-all hover:scale-110 shadow-luxury z-10"
              aria-label="Previous Outfit"
              title="Previous Outfit"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextOutfit}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-plum-dark/80 hover:bg-burgundy text-champagne flex items-center justify-center border border-champagne/30 transition-all hover:scale-110 shadow-luxury z-10"
              aria-label="Next Outfit"
              title="Next Outfit"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Runway Control Console Bar */}
          <div className="p-6 bg-plum-dark border-t border-champagne/20 flex flex-wrap items-center justify-between gap-4">
            {/* Primary Action: Start / Pause Runway */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-gold-subtle hover:scale-105 transition-all flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-plum" />
                    <span>Pause Walk</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-plum" />
                    <span>Resume Walk</span>
                  </>
                )}
              </button>

              <button
                onClick={nextOutfit}
                className="bg-burgundy/80 hover:bg-burgundy text-ivory border border-champagne/30 text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
              >
                Change Outfit
              </button>

              <button
                onClick={() => setWalkSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 0.7 : 1.0))}
                className="bg-plum/80 hover:bg-plum text-champagne border border-champagne/30 text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-colors font-mono"
                title="Toggle Walk Cadence"
              >
                Speed: {walkSpeed}x
              </button>
            </div>

            {/* 3D Camera Controls: Front, Left, Right, Back & Zoom */}
            <div className="flex flex-wrap items-center gap-2 bg-charcoal/80 p-1.5 rounded-xl border border-champagne/20">
              <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/50 px-2">
                Angle:
              </span>
              {(['Front', 'Left', 'Right', 'Back'] as const).map((angle) => (
                <button
                  key={angle}
                  onClick={() => setCameraAngle(angle)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-brand uppercase tracking-wider transition-all ${
                    activeAngle === angle
                      ? 'bg-champagne text-plum font-bold shadow-sm'
                      : 'text-ivory/70 hover:text-champagne'
                  }`}
                >
                  {angle}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-champagne/20 mx-1" />

              <button
                onClick={() => handleZoom('in')}
                className="p-1.5 rounded-lg text-ivory/70 hover:text-champagne hover:bg-plum/60 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="p-1.5 rounded-lg text-ivory/70 hover:text-champagne hover:bg-plum/60 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetCamera}
                className="p-1.5 rounded-lg text-ivory/70 hover:text-champagne hover:bg-plum/60 transition-colors"
                title="Reset Camera"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Lighting Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-charcoal/80 p-1.5 rounded-xl border border-champagne/20">
              <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/50 px-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-champagne" />
                <span>Lighting:</span>
              </span>
              {(
                [
                  { id: 'spotlight', label: 'Spotlight' },
                  { id: 'golden', label: 'Golden Hour' },
                  { id: 'moonlight', label: 'Moonlight' },
                  { id: 'glow', label: 'Runway Glow' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setLightingMode(mode.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-brand uppercase tracking-wider transition-all ${
                    lightingMode === mode.id
                      ? 'bg-burgundy text-champagne font-bold border border-champagne/40'
                      : 'text-ivory/60 hover:text-champagne'
                  }`}
                >
                  {mode.label}
                </button>
              ))}

              <button
                onClick={() => setShowTechInfo(!showTechInfo)}
                className="p-1.5 text-champagne/70 hover:text-champagne rounded-lg"
                title="3D Runway Technology Specs"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Technical Transparency Info Accordion */}
          {showTechInfo && (
            <div className="p-4 bg-plum border-t border-champagne/20 text-xs text-ivory/80 space-y-2 font-light">
              <div className="flex items-center justify-between">
                <span className="font-brand uppercase tracking-wider text-champagne font-bold text-[11px]">
                  3D Runway Real-Time Engineering Architecture
                </span>
                <button onClick={() => setShowTechInfo(false)} className="text-ivory/50 hover:text-champagne">
                  ✕
                </button>
              </div>
              <p className="leading-relaxed">
                • <strong>Real-Time 3D Mesh & Rig:</strong> Constructed in Three.js with WebGL antialiased rendering, ACESFilmic tone mapping, and PCF soft shadow maps.
              </p>
              <p className="leading-relaxed">
                • <strong>Pakistani Garment Silhouettes:</strong> Procedurally modeled flared lehenga skirts, zardozi bodices, and draped dupatta cloth with gold gota-kinari border trims.
              </p>
              <p className="leading-relaxed">
                • <strong>PBR Texture & Shading:</strong> MeshPhysicalMaterials with anisotropic sheen, micro-specularity, and clearcoat calibrated for authentic Pakistani velvets, banarsi silks, and katan textiles.
              </p>
              <p className="leading-relaxed">
                • <strong>Identity & Outfit Continuity:</strong> When a user generates an AI try-on, facial tones and garment diffuse textures are transferred directly to the 3D runway avatar.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
