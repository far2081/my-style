import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useApp } from '../../context/AppContext';
import { PRODUCTS_DATA } from '../../data/products';
import { Product } from '../../types';
import {
  Play,
  Pause,
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
  X,
  Image as ImageIcon,
  Check,
  Layers,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export type PakistaniSilhouetteType = 'lehenga' | 'peshwas' | 'gharara' | 'kurta' | 'kaftan';

export interface SilhouetteDetails {
  type: PakistaniSilhouetteType;
  label: string;
  badge: string;
  description: string;
}

export function getDressSilhouetteType(product?: Product | null): SilhouetteDetails {
  if (!product) {
    return {
      type: 'lehenga',
      label: 'Bridal Lehenga Flared Silhouette',
      badge: 'Lehenga (Flared)',
      description: 'Voluminous flared gathered skirt with fitted choli bodice and gota-kinari border.',
    };
  }

  const combined = [
    product.name || '',
    product.dressType || '',
    product.subcategory || '',
    product.category || '',
    product.style || '',
    product.description || '',
    ...(product.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  if (combined.includes('gharara') || combined.includes('sharara')) {
    return {
      type: 'gharara',
      label: 'Festive Gharara Ruched Silhouette',
      badge: 'Gharara / Sharara',
      description: 'Fitted thigh with Mughal knee-gote ruche and flared gathered leg ruffles.',
    };
  }

  if (
    combined.includes('peshwas') ||
    combined.includes('anarkali') ||
    combined.includes('maxi') ||
    combined.includes('farshi') ||
    combined.includes('gown')
  ) {
    return {
      type: 'peshwas',
      label: 'Royal Peshwas / Anarkali Silhouette',
      badge: 'Peshwas / Anarkali',
      description: 'Full-length kalidar flowing gown with empire bodice and sweeping floor hem.',
    };
  }

  if (combined.includes('kaftan') || combined.includes('cape') || combined.includes('kimono')) {
    return {
      type: 'kaftan',
      label: 'Luxury Kaftan Batwing Silhouette',
      badge: 'Kaftan (Batwing)',
      description: 'Dramatic butterfly batwing sleeves with relaxed draped silhouette.',
    };
  }

  if (
    combined.includes('kurta') ||
    combined.includes('suit') ||
    combined.includes('lawn') ||
    combined.includes('pret') ||
    combined.includes('shalwar') ||
    combined.includes('straight')
  ) {
    return {
      type: 'kurta',
      label: 'Classic Straight Kurta & Trouser Silhouette',
      badge: 'Straight Kurta',
      description: 'Columnar tunic with structured side chaak slits and tailored trousers.',
    };
  }

  // Default to lehenga (Signature Pakistani Bridal silhouette)
  return {
    type: 'lehenga',
    label: 'Heirloom Lehenga Flared Silhouette',
    badge: 'Flared Lehenga',
    description: 'Voluminous flared skirt with fitted bodice and gold gota-kinari border trim.',
  };
}

export const RunwaySection: React.FC = () => {
  const {
    products,
    setSelectedProduct,
    tryOnProduct,
    setTryOnProduct,
    addToCart,
    customerPhoto,
    customerBodyPhoto,
    customerBodyStructure,
    setCustomerBodyStructure,
    personalizedTryOnUrl,
    personalizedTryOnProductId,
    setActiveView: setPageActiveView,
  } = useApp();

  const [isPlaying, setIsPlaying] = useState(true);
  const [activeAngle, setActiveAngle] = useState<'Front' | 'Left' | 'Right' | 'Back'>('Front');
  const [lightingMode, setLightingMode] = useState<'spotlight' | 'golden' | 'moonlight' | 'glow'>('spotlight');
  const [outfitIndex, setOutfitIndex] = useState(0);
  const [walkSpeed, setWalkSpeed] = useState<number>(1.0);
  const [showTechInfo, setShowTechInfo] = useState(false);
  const [showTryOnPreview, setShowTryOnPreview] = useState(true);
  const [showCatalogRefCard, setShowCatalogRefCard] = useState(true);
  const [previewImgLoaded, setPreviewImgLoaded] = useState(false);
  const [previewImgError, setPreviewImgError] = useState(false);
  const [showMiniCatalog, setShowMiniCatalog] = useState(false);

  const isPlayingRef = useRef(isPlaying);
  const walkSpeedRef = useRef(walkSpeed);
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    walkSpeedRef.current = walkSpeed;
  }, [walkSpeed]);

  // Sync initial outfit with tryOnProduct from AppContext
  useEffect(() => {
    if (tryOnProduct) {
      const idx = products.findIndex((p) => p.id === tryOnProduct.id);
      if (idx !== -1 && idx !== outfitIndex) {
        setOutfitIndex(idx);
      }
    }
  }, [tryOnProduct, products]);

  // Reset 2D preview card state when a new personalized try-on URL arrives
  useEffect(() => {
    if (personalizedTryOnUrl) {
      setPreviewImgLoaded(false);
      setPreviewImgError(false);
      setShowTryOnPreview(true);
    }
  }, [personalizedTryOnUrl]);

  const allOutfits = products && products.length > 0 ? products : PRODUCTS_DATA;
  const currentOutfit = allOutfits[outfitIndex] || allOutfits[0];
  const silhouetteInfo = useMemo(() => getDressSilhouetteType(currentOutfit), [currentOutfit]);

  // Switch outfit and keep entire application in sync
  const selectOutfitByIndex = (newIdx: number) => {
    const validIdx = (newIdx + allOutfits.length) % allOutfits.length;
    setOutfitIndex(validIdx);
    const chosen = allOutfits[validIdx];
    if (chosen) {
      setTryOnProduct(chosen);
      setSelectedProduct(chosen);
    }
  };

  const nextOutfit = () => selectOutfitByIndex(outfitIndex + 1);
  const prevOutfit = () => selectOutfitByIndex(outfitIndex - 1);

  // Reference photo for the currently active viewing angle
  const catalogRefPhotoUrl = useMemo(() => {
    const imgs = currentOutfit.images;
    switch (activeAngle) {
      case 'Left':
        return imgs.left || imgs.front;
      case 'Right':
        return imgs.right || imgs.front;
      case 'Back':
        return imgs.back || imgs.front;
      case 'Front':
      default:
        return imgs.front;
    }
  }, [currentOutfit, activeAngle]);

  // Three.js Canvas Reference & Internal State
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetCameraOffsetRef = useRef<THREE.Vector3 | null>(new THREE.Vector3(0, 1.6, 4.8));

  // Mesh & Rig references for animation & procedural silhouette
  const rigRef = useRef<{
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftKnee?: THREE.Group;
    rightKnee?: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftElbow?: THREE.Group;
    rightElbow?: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    faceMaterial: THREE.MeshStandardMaterial;
    garmentGroup: THREE.Group;
    leftGhararaBell?: THREE.Mesh;
    rightGhararaBell?: THREE.Mesh;
    skirtMesh?: THREE.Mesh;
    dupattaMesh?: THREE.Mesh;
    kaftanLeftWing?: THREE.Mesh;
    kaftanRightWing?: THREE.Mesh;
    currentSilhouette?: PakistaniSilhouetteType;
  } | null>(null);

  // Lights references for dynamic lighting modes
  const lightsRef = useRef<{
    mainSpot: THREE.SpotLight;
    rimLight1: THREE.PointLight;
    rimLight2: THREE.PointLight;
    ambient: THREE.AmbientLight;
    floorReflector: THREE.Mesh;
  } | null>(null);

  // Cleanly dispose Three.js geometry & materials
  const disposeObject = (obj: THREE.Object3D) => {
    while (obj.children.length > 0) {
      const child = obj.children[0];
      disposeObject(child);
      obj.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
  };

  // Build Procedural Pakistani Garment Silhouettes (Lehenga, Peshwas, Gharara, Straight Kurta, Kaftan)
  const buildProceduralSilhouette = (
    silhouette: PakistaniSilhouetteType,
    garmentGroup: THREE.Group,
    baseColor: THREE.Color,
    fabric: string,
    torso: THREE.Group,
    leftLeg: THREE.Group,
    rightLeg: THREE.Group,
    leftArm: THREE.Group,
    rightArm: THREE.Group
  ) => {
    // 1. Dispose previous garment meshes
    disposeObject(garmentGroup);
    if (rigRef.current) {
      if (rigRef.current.leftGhararaBell) {
        leftLeg.remove(rigRef.current.leftGhararaBell);
        rigRef.current.leftGhararaBell.geometry.dispose();
        delete rigRef.current.leftGhararaBell;
      }
      if (rigRef.current.rightGhararaBell) {
        rightLeg.remove(rigRef.current.rightGhararaBell);
        rigRef.current.rightGhararaBell.geometry.dispose();
        delete rigRef.current.rightGhararaBell;
      }
      if (rigRef.current.kaftanLeftWing) {
        leftArm.remove(rigRef.current.kaftanLeftWing);
        rigRef.current.kaftanLeftWing.geometry.dispose();
        delete rigRef.current.kaftanLeftWing;
      }
      if (rigRef.current.kaftanRightWing) {
        rightArm.remove(rigRef.current.kaftanRightWing);
        rigRef.current.kaftanRightWing.geometry.dispose();
        delete rigRef.current.kaftanRightWing;
      }
    }

    // 2. Fabric Physical Materials
    const fabricLower = (fabric || '').toLowerCase();
    let roughness = 0.45;
    let metalness = 0.15;
    let clearcoat = 0.35;
    let sheen = 0.8;

    if (fabricLower.includes('velvet')) {
      roughness = 0.65;
      sheen = 1.0;
      metalness = 0.08;
    } else if (fabricLower.includes('silk') || fabricLower.includes('tissue')) {
      roughness = 0.22;
      clearcoat = 0.75;
      metalness = 0.28;
    } else if (fabricLower.includes('banarsi') || fabricLower.includes('brocade')) {
      roughness = 0.38;
      metalness = 0.52;
    } else if (fabricLower.includes('organza') || fabricLower.includes('chiffon')) {
      roughness = 0.3;
      clearcoat = 0.5;
      sheen = 0.9;
    }

    const mainGarmentMaterial = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness,
      metalness,
      clearcoat,
      sheen,
      sheenColor: new THREE.Color(0xd4af37),
    });

    const goldZariMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.92,
    });

    const sheerDupattaMaterial = new THREE.MeshPhysicalMaterial({
      color: baseColor.clone().offsetHSL(0.02, 0.05, 0.05),
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
      transmission: 0.25,
      sheen: 0.95,
      sheenColor: new THREE.Color(0xd4af37),
    });

    // 3. Construct specific Pakistani Silhouette Geometry
    switch (silhouette) {
      case 'gharara': {
        // A. Mid-length kurti
        const kurtiGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.52, 24);
        const kurti = new THREE.Mesh(kurtiGeo, mainGarmentMaterial);
        kurti.position.y = -0.1;
        kurti.castShadow = true;
        garmentGroup.add(kurti);

        // Gold neckline trim
        const neckTrimGeo = new THREE.TorusGeometry(0.14, 0.015, 12, 24);
        const neckTrim = new THREE.Mesh(neckTrimGeo, goldZariMaterial);
        neckTrim.rotation.x = Math.PI / 2;
        neckTrim.position.y = 0.16;
        garmentGroup.add(neckTrim);

        // Kurti hemline gold border
        const kurtiBorderGeo = new THREE.TorusGeometry(0.19, 0.014, 12, 24);
        const kurtiBorder = new THREE.Mesh(kurtiBorderGeo, goldZariMaterial);
        kurtiBorder.rotation.x = Math.PI / 2;
        kurtiBorder.position.y = -0.36;
        garmentGroup.add(kurtiBorder);

        // B. Dual Flared Gharara Lower Leg Bells (attached to legs for dynamic walk movement)
        const bellGeo = new THREE.ConeGeometry(0.32, 0.56, 24, 8, true);

        const leftBell = new THREE.Mesh(bellGeo, mainGarmentMaterial);
        leftBell.position.set(0, -0.58, 0);
        leftBell.castShadow = true;
        leftLeg.add(leftBell);

        const leftGote = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 12, 24), goldZariMaterial);
        leftGote.rotation.x = Math.PI / 2;
        leftGote.position.set(0, -0.32, 0);
        leftLeg.add(leftGote);

        const rightBell = new THREE.Mesh(bellGeo, mainGarmentMaterial);
        rightBell.position.set(0, -0.58, 0);
        rightBell.castShadow = true;
        rightLeg.add(rightBell);

        const rightGote = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 12, 24), goldZariMaterial);
        rightGote.rotation.x = Math.PI / 2;
        rightGote.position.set(0, -0.32, 0);
        rightLeg.add(rightGote);

        // C. Draped Dupatta
        const dupattaCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.22, 0.22, 0.05),
          new THREE.Vector3(-0.35, -0.1, 0.15),
          new THREE.Vector3(-0.4, -0.45, 0.2),
        ]);
        const dupatta = new THREE.Mesh(
          new THREE.TubeGeometry(dupattaCurve, 20, 0.065, 10, false),
          sheerDupattaMaterial
        );
        dupatta.castShadow = true;
        garmentGroup.add(dupatta);

        if (rigRef.current) {
          rigRef.current.leftGhararaBell = leftBell;
          rigRef.current.rightGhararaBell = rightBell;
          rigRef.current.dupattaMesh = dupatta;
          rigRef.current.skirtMesh = kurti;
        }
        break;
      }

      case 'peshwas': {
        // Royal Peshwas / Anarkali: continuous kalidar flowing gown from high bodice to floor
        const bodiceGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.35, 24);
        const bodice = new THREE.Mesh(bodiceGeo, mainGarmentMaterial);
        bodice.position.y = 0.04;
        bodice.castShadow = true;
        garmentGroup.add(bodice);

        // Gold neckline trim
        const neckTrim = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.015, 12, 24), goldZariMaterial);
        neckTrim.rotation.x = Math.PI / 2;
        neckTrim.position.y = 0.16;
        garmentGroup.add(neckTrim);

        // Empire waist gold trim
        const waistTrim = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.014, 12, 24), goldZariMaterial);
        waistTrim.rotation.x = Math.PI / 2;
        waistTrim.position.y = -0.13;
        garmentGroup.add(waistTrim);

        // Long Kalidar Flare Gown
        const flareGeo = new THREE.CylinderGeometry(0.16, 0.72, 1.05, 32, 12, true);
        const flare = new THREE.Mesh(flareGeo, mainGarmentMaterial);
        flare.position.y = -0.58;
        flare.castShadow = true;
        flare.receiveShadow = true;
        garmentGroup.add(flare);

        // Tiered gold hem rings (Gota kinari)
        const hem1 = new THREE.Mesh(new THREE.TorusGeometry(0.71, 0.024, 12, 36), goldZariMaterial);
        hem1.rotation.x = Math.PI / 2;
        hem1.position.y = -1.08;
        garmentGroup.add(hem1);

        const hem2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.015, 12, 36), goldZariMaterial);
        hem2.rotation.x = Math.PI / 2;
        hem2.position.y = -1.0;
        garmentGroup.add(hem2);

        // Regal trailing dupatta behind avatar
        const dupattaCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.25, 0.2, -0.05),
          new THREE.Vector3(-0.35, -0.2, -0.15),
          new THREE.Vector3(-0.38, -0.7, -0.22),
          new THREE.Vector3(-0.32, -1.0, -0.28),
        ]);
        const dupatta = new THREE.Mesh(
          new THREE.TubeGeometry(dupattaCurve, 24, 0.08, 12, false),
          sheerDupattaMaterial
        );
        dupatta.castShadow = true;
        garmentGroup.add(dupatta);

        if (rigRef.current) {
          rigRef.current.skirtMesh = flare;
          rigRef.current.dupattaMesh = dupatta;
        }
        break;
      }

      case 'kurta': {
        // Classic Straight Kurta: Structured columnar tunic with side chaak slits
        const tunicGeo = new THREE.CylinderGeometry(0.19, 0.21, 0.78, 24);
        const tunic = new THREE.Mesh(tunicGeo, mainGarmentMaterial);
        tunic.position.y = -0.18;
        tunic.castShadow = true;
        garmentGroup.add(tunic);

        // Center front embroidered placket
        const placketGeo = new THREE.BoxGeometry(0.04, 0.32, 0.02);
        const placket = new THREE.Mesh(placketGeo, goldZariMaterial);
        placket.position.set(0, 0.05, 0.185);
        garmentGroup.add(placket);

        // Neckline trim
        const neckTrim = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.015, 12, 24), goldZariMaterial);
        neckTrim.rotation.x = Math.PI / 2;
        neckTrim.position.y = 0.16;
        garmentGroup.add(neckTrim);

        // Kurta hem border
        const hemBorder = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 12, 24), goldZariMaterial);
        hemBorder.rotation.x = Math.PI / 2;
        hemBorder.position.y = -0.56;
        garmentGroup.add(hemBorder);

        // Tailored cigarette trouser cuffs
        const cuffGeo = new THREE.TorusGeometry(0.065, 0.012, 10, 20);
        const cuffL = new THREE.Mesh(cuffGeo, goldZariMaterial);
        cuffL.rotation.x = Math.PI / 2;
        cuffL.position.set(0, -0.8, 0);
        leftLeg.add(cuffL);

        const cuffR = new THREE.Mesh(cuffGeo, goldZariMaterial);
        cuffR.rotation.x = Math.PI / 2;
        cuffR.position.set(0, -0.8, 0);
        rightLeg.add(cuffR);

        // Velvet formal shawl draped across left arm
        const shawlCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.24, 0.18, 0.02),
          new THREE.Vector3(-0.35, -0.1, 0.08),
          new THREE.Vector3(-0.38, -0.5, 0.12),
          new THREE.Vector3(-0.35, -0.85, 0.15),
        ]);
        const shawl = new THREE.Mesh(
          new THREE.TubeGeometry(shawlCurve, 20, 0.075, 10, false),
          sheerDupattaMaterial
        );
        shawl.castShadow = true;
        garmentGroup.add(shawl);

        if (rigRef.current) {
          rigRef.current.skirtMesh = tunic;
          rigRef.current.dupattaMesh = shawl;
        }
        break;
      }

      case 'kaftan': {
        // Luxury Kaftan: Relaxed flowing core with dramatic butterfly batwing drapery
        const kaftanCoreGeo = new THREE.CylinderGeometry(0.21, 0.27, 0.92, 24);
        const kaftanCore = new THREE.Mesh(kaftanCoreGeo, mainGarmentMaterial);
        kaftanCore.position.y = -0.25;
        kaftanCore.castShadow = true;
        garmentGroup.add(kaftanCore);

        // Gold center belt / cordon
        const belt = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.016, 12, 24), goldZariMaterial);
        belt.rotation.x = Math.PI / 2;
        belt.position.y = -0.12;
        garmentGroup.add(belt);

        // Neckline detail
        const neckTrim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 12, 24), goldZariMaterial);
        neckTrim.rotation.x = Math.PI / 2;
        neckTrim.position.y = 0.16;
        garmentGroup.add(neckTrim);

        // Hemline trim
        const hemTrim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.016, 12, 24), goldZariMaterial);
        hemTrim.rotation.x = Math.PI / 2;
        hemTrim.position.y = -0.7;
        garmentGroup.add(hemTrim);

        // Flowing batwing butterfly drapery planes attached to arms
        const wingGeo = new THREE.PlaneGeometry(0.38, 0.65, 8, 8);

        const leftWing = new THREE.Mesh(wingGeo, mainGarmentMaterial);
        leftWing.position.set(-0.16, -0.3, 0);
        leftWing.rotation.y = Math.PI / 6;
        leftArm.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, mainGarmentMaterial);
        rightWing.position.set(0.16, -0.3, 0);
        rightWing.rotation.y = -Math.PI / 6;
        rightArm.add(rightWing);

        if (rigRef.current) {
          rigRef.current.skirtMesh = kaftanCore;
          rigRef.current.kaftanLeftWing = leftWing;
          rigRef.current.kaftanRightWing = rightWing;
        }
        break;
      }

      case 'lehenga':
      default: {
        // Traditional Flared Bridal Lehenga: Fitted choli bodice + flared wide skirt + gota border
        const bodiceGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.42, 24);
        const bodice = new THREE.Mesh(bodiceGeo, mainGarmentMaterial);
        bodice.position.y = 0;
        bodice.castShadow = true;
        garmentGroup.add(bodice);

        // Gold neckline trim
        const neckTrim = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.015, 12, 24), goldZariMaterial);
        neckTrim.rotation.x = Math.PI / 2;
        neckTrim.position.y = 0.16;
        garmentGroup.add(neckTrim);

        // Midriff waist trim
        const waistTrim = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.014, 12, 24), goldZariMaterial);
        waistTrim.rotation.x = Math.PI / 2;
        waistTrim.position.y = -0.21;
        garmentGroup.add(waistTrim);

        // Flared Pleated Lehenga Skirt
        const skirtGeo = new THREE.ConeGeometry(0.72, 0.96, 32, 8, true);
        const skirt = new THREE.Mesh(skirtGeo, mainGarmentMaterial);
        skirt.position.y = -0.42;
        skirt.castShadow = true;
        skirt.receiveShadow = true;
        garmentGroup.add(skirt);

        // Gold Zari Hemline Border (Gota Kinari)
        const hemBorder = new THREE.Mesh(new THREE.TorusGeometry(0.71, 0.025, 12, 36), goldZariMaterial);
        hemBorder.rotation.x = Math.PI / 2;
        hemBorder.position.y = -0.89;
        garmentGroup.add(hemBorder);

        // Flowing diagonal Dupatta
        const dupattaCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.22, 0.22, 0.05),
          new THREE.Vector3(-0.35, -0.1, 0.15),
          new THREE.Vector3(-0.42, -0.5, 0.25),
          new THREE.Vector3(-0.38, -0.9, 0.35),
        ]);
        const dupatta = new THREE.Mesh(
          new THREE.TubeGeometry(dupattaCurve, 24, 0.07, 12, false),
          sheerDupattaMaterial
        );
        dupatta.castShadow = true;
        garmentGroup.add(dupatta);

        if (rigRef.current) {
          rigRef.current.skirtMesh = skirt;
          rigRef.current.dupattaMesh = dupatta;
        }
        break;
      }
    }

    if (rigRef.current) {
      rigRef.current.currentSilhouette = silhouette;
    }
  };

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

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls for interactive 360° rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.0;
    controls.target.set(0, 1.25, 0);
    controlsRef.current = controls;

    // 5. Build Runway Catwalk Environment
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

    // Runway backdrop arch
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

    // 7. Build Articulated 3D Female Fashion Avatar
    const avatarGroup = new THREE.Group();
    avatarGroupRef.current = avatarGroup;
    scene.add(avatarGroup);

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

    // Root Torso
    const torso = new THREE.Group();
    torso.position.y = 1.05;
    avatarGroup.add(torso);

    // Garment Group (Dynamically houses procedural silhouettes)
    const garmentGroup = new THREE.Group();
    torso.add(garmentGroup);

    // Clavicle & Upper Chest Transition (bridges neck to torso and shoulders naturally)
    const clavicleGeo = new THREE.CylinderGeometry(0.065, 0.175, 0.08, 20);
    const clavicleMesh = new THREE.Mesh(clavicleGeo, skinMaterial);
    clavicleMesh.position.y = 0.13;
    torso.add(clavicleMesh);

    // Head & Neck (Anatomically calibrated: slender neck seamlessly connecting chin to clavicle)
    const neckGeo = new THREE.CylinderGeometry(0.048, 0.056, 0.075, 18);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.y = 0.19;
    torso.add(neck);

    const head = new THREE.Group();
    head.position.y = 0.29;
    torso.add(head);

    const faceGeo = new THREE.SphereGeometry(0.082, 24, 24);
    faceGeo.scale(0.95, 1.10, 1.0);
    const faceMaterial = skinMaterial.clone();
    const faceMesh = new THREE.Mesh(faceGeo, faceMaterial);
    faceMesh.castShadow = true;
    head.add(faceMesh);

    // Hair Updo (Mughal-style elegant chignon)
    const hairGeo = new THREE.SphereGeometry(0.088, 18, 18);
    hairGeo.scale(1.02, 1.08, 1.12);
    const hairMesh = new THREE.Mesh(hairGeo, hairMaterial);
    hairMesh.position.set(0, 0.025, -0.025);
    head.add(hairMesh);

    const bunGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const bun = new THREE.Mesh(bunGeo, hairMaterial);
    bun.position.set(0, 0.015, -0.10);
    head.add(bun);

    // Gold Maang Tikka
    const tikkaGeo = new THREE.ConeGeometry(0.014, 0.028, 8);
    const tikka = new THREE.Mesh(tikkaGeo, goldZariMaterial);
    tikka.position.set(0, 0.065, 0.085);
    tikka.rotation.x = -Math.PI / 3;
    head.add(tikka);

    // Articulated Arms (Natural shoulder width 0.37m, rounded deltoid, articulated elbow)
    const upperArmGeo = new THREE.CylinderGeometry(0.034, 0.029, 0.23, 14);
    const forearmGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.23, 14);
    const jointSphereGeo = new THREE.SphereGeometry(0.032, 12, 12);
    const handGeo = new THREE.SphereGeometry(0.024, 12, 12);
    const shoulderGeo = new THREE.SphereGeometry(0.04, 14, 14);

    // Left Arm
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.185, 0.14, 0);
    const leftShoulderCap = new THREE.Mesh(shoulderGeo, skinMaterial);
    leftArm.add(leftShoulderCap);
    const leftUpperArmMesh = new THREE.Mesh(upperArmGeo, skinMaterial);
    leftUpperArmMesh.position.y = -0.115;
    leftUpperArmMesh.castShadow = true;
    leftArm.add(leftUpperArmMesh);

    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.23, 0);
    const leftElbowMesh = new THREE.Mesh(jointSphereGeo, skinMaterial);
    leftElbow.add(leftElbowMesh);
    const leftForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
    leftForearmMesh.position.y = -0.115;
    leftForearmMesh.castShadow = true;
    leftElbow.add(leftForearmMesh);
    const leftHandMesh = new THREE.Mesh(handGeo, skinMaterial);
    leftHandMesh.position.set(0, -0.23, 0.01);
    leftHandMesh.scale.set(0.8, 1.2, 0.8);
    leftElbow.add(leftHandMesh);
    leftArm.add(leftElbow);
    torso.add(leftArm);

    // Right Arm
    const rightArm = new THREE.Group();
    rightArm.position.set(0.185, 0.14, 0);
    const rightShoulderCap = new THREE.Mesh(shoulderGeo, skinMaterial);
    rightArm.add(rightShoulderCap);
    const rightUpperArmMesh = new THREE.Mesh(upperArmGeo, skinMaterial);
    rightUpperArmMesh.position.y = -0.115;
    rightUpperArmMesh.castShadow = true;
    rightArm.add(rightUpperArmMesh);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.23, 0);
    const rightElbowMesh = new THREE.Mesh(jointSphereGeo, skinMaterial);
    rightElbow.add(rightElbowMesh);
    const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
    rightForearmMesh.position.y = -0.115;
    rightForearmMesh.castShadow = true;
    rightElbow.add(rightForearmMesh);
    const rightHandMesh = new THREE.Mesh(handGeo, skinMaterial);
    rightHandMesh.position.set(0, -0.23, 0.01);
    rightHandMesh.scale.set(0.8, 1.2, 0.8);
    rightElbow.add(rightHandMesh);
    rightArm.add(rightElbow);
    torso.add(rightArm);

    // Articulated Legs (Haute couture runway proportions: thigh + articulated knee + calf + metallic couture heel)
    const thighGeo = new THREE.CylinderGeometry(0.052, 0.040, 0.42, 16);
    const kneeCapGeo = new THREE.SphereGeometry(0.041, 14, 14);
    const calfGeo = new THREE.CylinderGeometry(0.038, 0.026, 0.43, 16);
    const shoeGeo = new THREE.BoxGeometry(0.052, 0.036, 0.13);

    // Left Leg
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.10, -0.18, 0);
    const leftThighMesh = new THREE.Mesh(thighGeo, skinMaterial);
    leftThighMesh.position.y = -0.21;
    leftThighMesh.castShadow = true;
    leftLeg.add(leftThighMesh);

    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -0.42, 0);
    const leftKneeMesh = new THREE.Mesh(kneeCapGeo, skinMaterial);
    leftKnee.add(leftKneeMesh);
    const leftCalfMesh = new THREE.Mesh(calfGeo, skinMaterial);
    leftCalfMesh.position.y = -0.215;
    leftCalfMesh.castShadow = true;
    leftKnee.add(leftCalfMesh);
    const leftShoe = new THREE.Mesh(shoeGeo, goldZariMaterial);
    leftShoe.position.set(0, -0.42, 0.025);
    leftShoe.castShadow = true;
    leftKnee.add(leftShoe);
    leftLeg.add(leftKnee);
    torso.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.10, -0.18, 0);
    const rightThighMesh = new THREE.Mesh(thighGeo, skinMaterial);
    rightThighMesh.position.y = -0.21;
    rightThighMesh.castShadow = true;
    rightLeg.add(rightThighMesh);

    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -0.42, 0);
    const rightKneeMesh = new THREE.Mesh(kneeCapGeo, skinMaterial);
    rightKnee.add(rightKneeMesh);
    const rightCalfMesh = new THREE.Mesh(calfGeo, skinMaterial);
    rightCalfMesh.position.y = -0.215;
    rightCalfMesh.castShadow = true;
    rightKnee.add(rightCalfMesh);
    const rightShoe = new THREE.Mesh(shoeGeo, goldZariMaterial);
    rightShoe.position.set(0, -0.42, 0.025);
    rightShoe.castShadow = true;
    rightKnee.add(rightShoe);
    rightLeg.add(rightKnee);
    torso.add(rightLeg);

    rigRef.current = {
      leftLeg,
      rightLeg,
      leftKnee,
      rightKnee,
      leftArm,
      rightArm,
      leftElbow,
      rightElbow,
      torso,
      head,
      faceMaterial,
      garmentGroup,
    };

    // 8. Build initial procedural silhouette
    const initialHex = currentOutfit.colorHex || '#631626';
    buildProceduralSilhouette(
      silhouetteInfo.type,
      garmentGroup,
      new THREE.Color(initialHex),
      currentOutfit.fabric,
      torso,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm
    );

    // 9. Continuous Catwalk Circuit State & Animation Loop
    let clock = new THREE.Clock();
    let walkPhase = 0;

    // Catwalk Runway Boundaries (back entrance to front photographer pit)
    const runwayZStart = -4.2;
    const runwayZEnd = 3.3;

    // Catwalk state machine
    type CatwalkState = 'walk_forward' | 'pose_front' | 'turn_back' | 'walk_back' | 'pose_back' | 'turn_front';
    let catwalkState: CatwalkState = 'walk_forward';
    let stateTimer = 0;

    // Set initial position: backstage, walking forward
    avatarGroup.position.set(0, 0, -3.2);
    avatarGroup.rotation.set(0, 0, 0);
    let lastAvatarZ = avatarGroup.position.z;

    // Allow user manual orbit to disengage automated camera preset snapping
    controls.addEventListener('start', () => {
      targetCameraOffsetRef.current = null;
    });

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1); // clamp delta to prevent physics jumps
      controls.update();

      if (isPlayingRef.current && rigRef.current && avatarGroupRef.current) {
        const speedMultiplier = walkSpeedRef.current;
        const forwardSpeed = 1.15 * speedMultiplier;
        const walkFreq = 3.6 * speedMultiplier;

        // Catwalk State Transitions
        if (catwalkState === 'walk_forward') {
          walkPhase += delta * walkFreq;
          avatarGroupRef.current.position.z += forwardSpeed * delta;
          avatarGroupRef.current.rotation.y = 0;

          if (avatarGroupRef.current.position.z >= runwayZEnd) {
            avatarGroupRef.current.position.z = runwayZEnd;
            catwalkState = 'pose_front';
            stateTimer = 1.8;
          }
        } else if (catwalkState === 'pose_front') {
          stateTimer -= delta;
          if (stateTimer <= 0) {
            catwalkState = 'turn_back';
            stateTimer = 1.2;
          }
        } else if (catwalkState === 'turn_back') {
          stateTimer -= delta;
          const progress = Math.min(1, Math.max(0, 1 - stateTimer / 1.2));
          const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          avatarGroupRef.current.rotation.y = ease * Math.PI;
          walkPhase += delta * 2.2 * speedMultiplier;

          if (stateTimer <= 0) {
            avatarGroupRef.current.rotation.y = Math.PI;
            catwalkState = 'walk_back';
          }
        } else if (catwalkState === 'walk_back') {
          walkPhase += delta * walkFreq;
          avatarGroupRef.current.position.z -= forwardSpeed * delta;
          avatarGroupRef.current.rotation.y = Math.PI;

          if (avatarGroupRef.current.position.z <= runwayZStart) {
            avatarGroupRef.current.position.z = runwayZStart;
            catwalkState = 'pose_back';
            stateTimer = 1.0;
          }
        } else if (catwalkState === 'pose_back') {
          stateTimer -= delta;
          if (stateTimer <= 0) {
            catwalkState = 'turn_front';
            stateTimer = 1.2;
          }
        } else if (catwalkState === 'turn_front') {
          stateTimer -= delta;
          const progress = Math.min(1, Math.max(0, 1 - stateTimer / 1.2));
          const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          avatarGroupRef.current.rotation.y = Math.PI + ease * Math.PI;
          walkPhase += delta * 2.2 * speedMultiplier;

          if (stateTimer <= 0) {
            avatarGroupRef.current.rotation.y = 0;
            catwalkState = 'walk_forward';
          }
        }

        // Limb Kinematics & Posture depending on state
        const isWalking = catwalkState === 'walk_forward' || catwalkState === 'walk_back' || catwalkState === 'turn_back' || catwalkState === 'turn_front';

        if (isWalking) {
          const swingL = Math.sin(walkPhase);
          const swingR = -Math.sin(walkPhase);

          // Articulated Legs (Leg swing + Knee flex backwards on forward stride)
          rigRef.current.leftLeg.rotation.x = swingL * 0.38;
          rigRef.current.rightLeg.rotation.x = swingR * 0.38;

          if (rigRef.current.leftKnee) {
            rigRef.current.leftKnee.rotation.x = swingL > 0 ? swingL * 0.62 : 0;
          }
          if (rigRef.current.rightKnee) {
            rigRef.current.rightKnee.rotation.x = swingR > 0 ? swingR * 0.62 : 0;
          }

          // Catwalk cross-over steps
          rigRef.current.leftLeg.rotation.z = 0.02 + Math.sin(walkPhase) * 0.025;
          rigRef.current.rightLeg.rotation.z = -0.02 + Math.sin(walkPhase) * 0.025;

          // Pelvic List & Hip Sway
          const hipSway = Math.sin(walkPhase) * 0.085;
          const pelvisYaw = Math.cos(walkPhase) * 0.055;
          rigRef.current.torso.rotation.z = hipSway;
          rigRef.current.torso.rotation.y = pelvisYaw;

          // Upper Body & Head Counter-Rotation
          rigRef.current.head.rotation.z = -hipSway * 0.45;
          rigRef.current.head.rotation.y = -pelvisYaw * 0.65;

          // Subtle Center-of-Mass vertical bob
          avatarGroupRef.current.position.y = Math.abs(Math.sin(walkPhase)) * 0.028;

          // Natural Arm & Forearm Swings
          rigRef.current.leftArm.rotation.x = -Math.sin(walkPhase) * 0.18;
          rigRef.current.leftArm.rotation.z = 0.06 + Math.abs(hipSway) * 0.04;
          if (rigRef.current.leftElbow) {
            rigRef.current.leftElbow.rotation.x = 0.22 + Math.max(0, -Math.sin(walkPhase)) * 0.12;
          }

          rigRef.current.rightArm.rotation.x = Math.sin(walkPhase) * 0.18;
          rigRef.current.rightArm.rotation.z = -0.06 - Math.abs(hipSway) * 0.04;
          if (rigRef.current.rightElbow) {
            rigRef.current.rightElbow.rotation.x = 0.22 + Math.max(0, Math.sin(walkPhase)) * 0.12;
          }

          // Garment Fabric Physics
          if (rigRef.current.skirtMesh) {
            rigRef.current.skirtMesh.rotation.z = -hipSway * 1.15;
            rigRef.current.skirtMesh.rotation.x = Math.sin(walkPhase * 2) * 0.035;
          }

          if (rigRef.current.dupattaMesh) {
            rigRef.current.dupattaMesh.rotation.z = Math.sin(walkPhase * 1.5) * 0.08;
            rigRef.current.dupattaMesh.rotation.x = 0.12 + Math.cos(walkPhase) * 0.08;
          }

          if (rigRef.current.leftGhararaBell) {
            rigRef.current.leftGhararaBell.rotation.z = Math.sin(walkPhase) * 0.12;
          }
          if (rigRef.current.rightGhararaBell) {
            rigRef.current.rightGhararaBell.rotation.z = -Math.sin(walkPhase) * 0.12;
          }

          if (rigRef.current.kaftanLeftWing) {
            rigRef.current.kaftanLeftWing.rotation.z = Math.sin(walkPhase * 1.8) * 0.15;
          }
          if (rigRef.current.kaftanRightWing) {
            rigRef.current.kaftanRightWing.rotation.z = -Math.sin(walkPhase * 1.8) * 0.15;
          }
        } else {
          // Couture Pause at Runway End (Poised stance for cameras)
          rigRef.current.leftLeg.rotation.x *= 0.88;
          rigRef.current.rightLeg.rotation.x *= 0.88;
          if (rigRef.current.leftKnee) rigRef.current.leftKnee.rotation.x *= 0.88;
          if (rigRef.current.rightKnee) rigRef.current.rightKnee.rotation.x *= 0.88;
          rigRef.current.leftArm.rotation.x *= 0.88;
          rigRef.current.rightArm.rotation.x *= 0.88;
          rigRef.current.torso.rotation.z = THREE.MathUtils.lerp(rigRef.current.torso.rotation.z, 0.08, 0.06);
          rigRef.current.torso.rotation.y *= 0.88;
          rigRef.current.head.rotation.z *= 0.88;
          rigRef.current.head.rotation.y *= 0.88;
          avatarGroupRef.current.position.y = THREE.MathUtils.lerp(avatarGroupRef.current.position.y, 0, 0.1);
          if (rigRef.current.skirtMesh) {
            rigRef.current.skirtMesh.rotation.z *= 0.88;
            rigRef.current.skirtMesh.rotation.x *= 0.88;
          }
        }
      } else if (!isPlayingRef.current && rigRef.current && avatarGroupRef.current) {
        // Paused: smoothly settle into poised resting stance
        rigRef.current.leftLeg.rotation.x *= 0.92;
        rigRef.current.rightLeg.rotation.x *= 0.92;
        if (rigRef.current.leftKnee) rigRef.current.leftKnee.rotation.x *= 0.92;
        if (rigRef.current.rightKnee) rigRef.current.rightKnee.rotation.x *= 0.92;
        rigRef.current.leftArm.rotation.x *= 0.92;
        rigRef.current.rightArm.rotation.x *= 0.92;
        rigRef.current.torso.rotation.z *= 0.92;
        rigRef.current.torso.rotation.y *= 0.92;
        avatarGroupRef.current.position.y = THREE.MathUtils.lerp(avatarGroupRef.current.position.y, 0, 0.1);
        if (rigRef.current.skirtMesh) {
          rigRef.current.skirtMesh.rotation.z *= 0.92;
        }
      }

      // Smooth Camera & OrbitControls Following
      if (avatarGroupRef.current) {
        const currentAvatarZ = avatarGroupRef.current.position.z;
        const targetLookAt = new THREE.Vector3(0, 1.25, currentAvatarZ);

        // OrbitControls smoothly follows model along runway
        controls.target.lerp(targetLookAt, 0.08);

        // Camera Position Following
        if (targetCameraOffsetRef.current && cameraRef.current) {
          const desiredPos = new THREE.Vector3(
            targetCameraOffsetRef.current.x,
            targetCameraOffsetRef.current.y,
            currentAvatarZ + targetCameraOffsetRef.current.z
          );
          cameraRef.current.position.lerp(desiredPos, 0.08);
        } else if (cameraRef.current && isPlayingRef.current) {
          const deltaZ = currentAvatarZ - lastAvatarZ;
          cameraRef.current.position.z += deltaZ * 0.88;
        }
        lastAvatarZ = currentAvatarZ;

        // Dynamic Spotlight tracking
        if (lightsRef.current) {
          lightsRef.current.mainSpot.target.position.set(0, 1.25, currentAvatarZ);
          lightsRef.current.mainSpot.target.updateMatrixWorld();
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

  // Update Procedural Silhouette, Colors, & Body Structure scaling when outfit or body changes
  useEffect(() => {
    if (!rigRef.current) return;

    const { torso, leftLeg, rightLeg, leftArm, rightArm, garmentGroup, faceMaterial } = rigRef.current;
    const dressHex = currentOutfit.colorHex || '#631626';
    const newColor = new THREE.Color(dressHex);

    // Rebuild procedural 3D silhouette
    buildProceduralSilhouette(
      silhouetteInfo.type,
      garmentGroup,
      newColor,
      currentOutfit.fabric,
      torso,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm
    );

    // Face Texture: Only use customerPhoto; never project full garments onto the face
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    if (customerPhoto) {
      textureLoader.load(
        customerPhoto,
        (faceTex) => {
          faceTex.colorSpace = THREE.SRGBColorSpace;
          faceTex.wrapS = THREE.ClampToEdgeWrapping;
          faceTex.wrapT = THREE.ClampToEdgeWrapping;
          faceMaterial.map = faceTex;
          faceMaterial.roughness = 0.45;
          faceMaterial.needsUpdate = true;
        },
        undefined,
        () => {
          faceMaterial.map = null;
          faceMaterial.needsUpdate = true;
        }
      );
    } else {
      faceMaterial.map = null;
      faceMaterial.roughness = 0.55;
      faceMaterial.needsUpdate = true;
    }

    // Dynamic body structure scaling
    if (customerBodyStructure && rigRef.current) {
      const lower = customerBodyStructure.toLowerCase();
      if (lower.includes('hourglass') || lower.includes('curated')) {
        garmentGroup.scale.set(1.04, 1.0, 1.04);
        torso.scale.set(1.02, 1.0, 0.94);
      } else if (lower.includes('pear')) {
        garmentGroup.scale.set(1.18, 1.0, 1.18);
        torso.scale.set(0.92, 1.0, 0.92);
      } else if (lower.includes('petite')) {
        garmentGroup.scale.set(0.92, 0.94, 0.92);
        torso.scale.set(0.9, 0.94, 0.9);
      } else if (lower.includes('athletic') || lower.includes('straight')) {
        garmentGroup.scale.set(0.98, 1.02, 0.98);
        torso.scale.set(1.02, 1.02, 1.02);
      } else if (lower.includes('plus') || lower.includes('curve') || lower.includes('royal')) {
        garmentGroup.scale.set(1.2, 1.0, 1.2);
        torso.scale.set(1.14, 1.0, 1.1);
      }
    }
  }, [currentOutfit, silhouetteInfo, customerPhoto, customerBodyStructure]);

  // Lighting Mode Changes
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

  // Smooth Camera Perspective Presets (Front, Left, Right, Back dynamically tracking avatar)
  const setCameraAngle = (angle: 'Front' | 'Left' | 'Right' | 'Back') => {
    setActiveAngle(angle);
    const dist = 4.8;
    const y = 1.6;

    let offset = new THREE.Vector3(0, y, dist);
    switch (angle) {
      case 'Front':
        offset = new THREE.Vector3(0, y, dist);
        break;
      case 'Left':
        offset = new THREE.Vector3(-dist, y, 0);
        break;
      case 'Right':
        offset = new THREE.Vector3(dist, y, 0);
        break;
      case 'Back':
        offset = new THREE.Vector3(0, y, -dist);
        break;
    }
    targetCameraOffsetRef.current = offset;
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const factor = direction === 'in' ? 0.85 : 1.18;
    const target = controlsRef.current.target;
    cameraRef.current.position.sub(target).multiplyScalar(factor).add(target);
    controlsRef.current.update();
  };

  const handleResetCamera = () => {
    setActiveAngle('Front');
    targetCameraOffsetRef.current = new THREE.Vector3(0, 1.6, 4.8);
  };

  return (
    <section className="py-24 bg-charcoal text-ivory relative overflow-hidden" id="runway">
      {/* Stage Fog / Ambient glow */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-charcoal-dark via-plum-dark/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-plum/80 text-champagne border border-champagne/30 text-[10px] font-brand uppercase tracking-[0.25em] mb-4 shadow-gold-subtle">
            <Sparkles className="w-3.5 h-3.5 text-champagne animate-pulse" />
            <span>Digital Haute Couture Runway</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-bold text-ivory tracking-tight uppercase mb-3">
            3D REAL-TIME FASHION RUNWAY
          </h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-4" />
          <p className="text-sm sm:text-base text-ivory/70 max-w-2xl mx-auto leading-relaxed font-light">
            Walk your selected Pakistani couture on our real-time 3D catwalk. Experience procedural silhouettes for{' '}
            <strong className="text-champagne font-normal">Lehenga, Peshwas, Gharara, Straight Kurta, and Kaftan</strong>{' '}
            with genuine fabric physics, lighting, and continuous 360° orbit.
          </p>
        </div>

        {/* 3D Runway Stage Arena */}
        <div className="bg-charcoal-dark rounded-3xl overflow-hidden border border-champagne/30 shadow-2xl relative">
          {/* Main Three.js 3D Canvas Stage Container */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden bg-black flex items-center justify-center">
            {/* Real-time WebGL Three.js Canvas */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Stage Header Overlay */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between pointer-events-auto gap-2">
              <div className="bg-plum-dark/90 backdrop-blur-md border border-champagne/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-luxury">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-brand tracking-[0.2em] uppercase text-champagne font-bold truncate">
                  3D RUNWAY • {silhouetteInfo.badge}
                </span>
              </div>

              <div className="bg-plum-dark/90 backdrop-blur-md border border-champagne/30 px-4 py-2 rounded-xl flex items-center gap-3 shadow-luxury">
                <span className="text-xs font-editorial text-ivory font-bold uppercase truncate max-w-[150px] sm:max-w-none">
                  {currentOutfit.name}
                </span>
                <span className="text-champagne text-xs font-bold font-mono">
                  PKR {currentOutfit.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* CARD A (Left): Authentic Catalog Reference Photo Card */}
            {showCatalogRefCard && (
              <div className="absolute top-16 left-4 sm:top-20 sm:left-6 z-20 w-44 sm:w-52 bg-plum-dark/95 border border-champagne/40 rounded-2xl p-3 shadow-luxury backdrop-blur-md transition-all animate-fadeIn">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-champagne/20">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-champagne" />
                    <span className="text-[10px] font-brand tracking-wider uppercase text-champagne font-bold">
                      Catalog Reference
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCatalogRefCard(false)}
                    className="p-1 text-ivory/60 hover:text-champagne transition-colors"
                    title="Minimize reference"
                    aria-label="Close catalog reference"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-charcoal border border-champagne/25 flex items-center justify-center">
                  <img
                    src={catalogRefPhotoUrl}
                    alt={`${currentOutfit.name} - ${activeAngle} Reference`}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded text-[8px] font-brand uppercase tracking-wider text-champagne">
                    {activeAngle} View
                  </div>
                  <div className="absolute bottom-1.5 inset-x-1.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-brand uppercase tracking-wider text-ivory/90 text-center truncate">
                    {currentOutfit.fabric} • {currentOutfit.color}
                  </div>
                </div>

                <div className="mt-2 text-[8px] text-ivory/60 text-center leading-tight">
                  Authentic Catalog Garment Photo
                </div>
              </div>
            )}

            {/* Re-open Catalog Reference Pill if minimized */}
            {!showCatalogRefCard && (
              <button
                onClick={() => setShowCatalogRefCard(true)}
                className="absolute top-16 left-4 sm:top-20 sm:left-6 z-20 bg-plum-dark/90 hover:bg-burgundy text-champagne border border-champagne/40 px-3 py-1.5 rounded-xl shadow-luxury text-[10px] font-brand uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105"
                title="Show Catalog Reference Photo"
              >
                <Camera className="w-3.5 h-3.5 text-champagne" />
                <span>Catalog {activeAngle} Photo</span>
              </button>
            )}

            {/* CARD B (Right): Personalized AI Try-On Preview Card (when available) */}
            {personalizedTryOnUrl && showTryOnPreview && (
              <div className="absolute top-16 right-4 sm:top-20 sm:right-6 z-20 w-44 sm:w-52 bg-plum-dark/95 border border-champagne/40 rounded-2xl p-3 shadow-luxury backdrop-blur-md transition-all animate-fadeIn">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-champagne/20">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-champagne animate-pulse" />
                    <span className="text-[10px] font-brand tracking-wider uppercase text-champagne font-bold">
                      AI Try-On Preview
                    </span>
                  </div>
                  <button
                    onClick={() => setShowTryOnPreview(false)}
                    className="p-1 text-ivory/60 hover:text-champagne transition-colors"
                    title="Minimize preview"
                    aria-label="Close preview"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-charcoal border border-champagne/25 flex items-center justify-center">
                  {!previewImgLoaded && !previewImgError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-charcoal/80 z-10">
                      <RotateCw className="w-4 h-4 text-champagne animate-spin" />
                      <span className="text-[9px] font-brand uppercase tracking-wider text-champagne/80">Loading...</span>
                    </div>
                  )}

                  {previewImgError ? (
                    <div className="p-3 text-center space-y-1">
                      <ImageIcon className="w-5 h-5 text-champagne/50 mx-auto" />
                      <p className="text-[10px] text-ivory/60">Preview unavailable</p>
                    </div>
                  ) : (
                    <img
                      src={personalizedTryOnUrl}
                      alt="Personalized AI Try-On"
                      className={`w-full h-full object-contain transition-opacity duration-300 ${
                        previewImgLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setPreviewImgLoaded(true)}
                      onError={() => {
                        setPreviewImgError(true);
                        setPreviewImgLoaded(true);
                      }}
                    />
                  )}

                  <div className="absolute bottom-1.5 inset-x-1.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-brand uppercase tracking-wider text-ivory/90 text-center truncate">
                    {tryOnProduct?.name || currentOutfit.name}
                  </div>
                </div>

                <div className="mt-2 text-[8px] text-ivory/60 text-center leading-tight">
                  2D Neural Fit • 3D Real-time Runway Walk
                </div>
              </div>
            )}

            {/* Re-open Try-On Preview Pill if minimized */}
            {personalizedTryOnUrl && !showTryOnPreview && (
              <button
                onClick={() => setShowTryOnPreview(true)}
                className="absolute top-16 right-4 sm:top-20 sm:right-6 z-20 bg-plum-dark/90 hover:bg-burgundy text-champagne border border-champagne/40 px-3 py-1.5 rounded-xl shadow-luxury text-[10px] font-brand uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105"
                title="Show 2D AI Try-On Preview"
              >
                <Sparkles className="w-3.5 h-3.5 text-champagne" />
                <span>AI Try-On Preview</span>
              </button>
            )}

            {/* Center Bottom Procedural Transparency Indicator Badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-burgundy/85 backdrop-blur-md border border-champagne/30 px-3.5 py-1.5 rounded-xl text-[10px] font-brand tracking-wider uppercase text-champagne shadow-luxury flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-champagne" />
              <span>3D Silhouette: {silhouetteInfo.label}</span>
            </div>

            {/* 3D Orbit Drag Hint Overlay */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-plum-dark/85 backdrop-blur-md border border-champagne/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-brand uppercase tracking-wider text-ivory/80 shadow-luxury pointer-events-none">
              <RotateCw className="w-3.5 h-3.5 text-champagne animate-spin" />
              <span>Drag to orbit 360°</span>
            </div>

            {/* Outfit Switch Arrows */}
            <button
              onClick={prevOutfit}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-plum-dark/85 hover:bg-burgundy border border-champagne/40 text-champagne flex items-center justify-center transition-all hover:scale-110 shadow-luxury z-10"
              aria-label="Previous Outfit"
              title="Previous Outfit"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextOutfit}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-plum-dark/85 hover:bg-burgundy text-champagne flex items-center justify-center border border-champagne/40 transition-all hover:scale-110 shadow-luxury z-10"
              aria-label="Next Outfit"
              title="Next Outfit"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Runway Control Console Bar */}
          <div className="p-4 sm:p-6 bg-plum-dark border-t border-champagne/20 space-y-4">
            {/* Top Console Row: Primary Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Play / Pause / Cadence / Catalog Switcher */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-gold-subtle hover:scale-105 transition-all flex items-center gap-2"
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
                  onClick={() => setShowMiniCatalog(!showMiniCatalog)}
                  className="bg-burgundy hover:bg-burgundy-light text-champagne border border-champagne/30 text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Browse Outfits ({allOutfits.length})</span>
                </button>

                <button
                  onClick={() => setWalkSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 0.7 : 1.0))}
                  className="bg-plum/80 hover:bg-plum text-champagne border border-champagne/30 text-xs uppercase tracking-wider px-3 py-2.5 rounded-xl transition-colors font-mono"
                  title="Toggle Walk Cadence"
                >
                  Speed: {walkSpeed}x
                </button>
              </div>

              {/* 3D Camera Angles: Front, Left, Right, Back & Zoom */}
              <div className="flex flex-wrap items-center gap-1.5 bg-charcoal/80 p-1.5 rounded-xl border border-champagne/20">
                <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/50 px-1.5">
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
                  title="Reset Camera View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stage Lighting Controls */}
              <div className="flex flex-wrap items-center gap-1.5 bg-charcoal/80 p-1.5 rounded-xl border border-champagne/20">
                <span className="text-[10px] uppercase font-brand tracking-wider text-ivory/50 px-1.5 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-champagne" />
                  <span>Light:</span>
                </span>
                {(
                  [
                    { id: 'spotlight', label: 'Spotlight' },
                    { id: 'golden', label: 'Golden' },
                    { id: 'moonlight', label: 'Moon' },
                    { id: 'glow', label: 'Glow' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLightingMode(mode.id)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-brand uppercase tracking-wider transition-all ${
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
                  title="3D Engineering Specs"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Console Row: Body Structure Calibration & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-champagne/15 text-xs">
              {/* Interactive Body Structure Calibration Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-brand uppercase tracking-wider text-champagne/80 font-bold">
                  Avatar Structure:
                </span>
                {(
                  [
                    { id: 'Hourglass / Curated Silhouette', label: 'Hourglass' },
                    { id: 'Pear / Flared Hem', label: 'Pear Flare' },
                    { id: 'Petite / Balanced', label: 'Petite' },
                    { id: 'Athletic / Straight', label: 'Athletic' },
                    { id: 'Plus Size / Royal Flare', label: 'Royal Curve' },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setCustomerBodyStructure(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-brand uppercase tracking-wider transition-all ${
                      customerBodyStructure === b.id
                        ? 'bg-champagne text-plum font-bold shadow-sm'
                        : 'bg-charcoal/70 text-ivory/70 hover:text-champagne border border-champagne/20'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Cross-navigation & Commerce CTAs */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const tryonEl = document.getElementById('virtual-try-on');
                    if (tryonEl) {
                      tryonEl.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      setPageActiveView('stylist');
                    }
                  }}
                  className="bg-plum hover:bg-burgundy text-champagne border border-champagne/30 font-semibold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-champagne" />
                  <span>Open Try-On Studio</span>
                </button>

                <button
                  onClick={() => addToCart(currentOutfit)}
                  className="bg-champagne hover:bg-champagne-light text-plum font-bold px-4 py-1.5 rounded-lg shadow-gold-subtle transition-all flex items-center gap-1.5 text-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-plum" />
                  <span>Add Look to Cart</span>
                </button>
              </div>
            </div>

            {/* Quick Catalog Outfits Drawer (Openable on-stage) */}
            {showMiniCatalog && (
              <div className="p-3 bg-charcoal/90 rounded-2xl border border-champagne/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-brand uppercase tracking-wider text-champagne font-bold">
                    Select Couture Piece for 3D Runway ({allOutfits.length} Designs)
                  </span>
                  <button
                    onClick={() => setShowMiniCatalog(false)}
                    className="text-ivory/60 hover:text-champagne text-xs"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-1">
                  {allOutfits.map((outfit, idx) => (
                    <button
                      key={outfit.id}
                      onClick={() => {
                        selectOutfitByIndex(idx);
                        setShowMiniCatalog(false);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-[3/4] border transition-all ${
                        outfitIndex === idx
                          ? 'border-champagne ring-2 ring-champagne scale-102'
                          : 'border-champagne/20 opacity-70 hover:opacity-100 hover:border-champagne/60'
                      }`}
                      title={outfit.name}
                    >
                      <img src={outfit.images.front} alt={outfit.name} className="w-full h-full object-cover" />
                      {outfitIndex === idx && (
                        <div className="absolute top-1 right-1 bg-champagne text-plum rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Specs Accordion */}
          {showTechInfo && (
            <div className="p-5 bg-plum border-t border-champagne/20 text-xs text-ivory/80 space-y-2 font-light">
              <div className="flex items-center justify-between">
                <span className="font-brand uppercase tracking-wider text-champagne font-bold text-[11px]">
                  3D Runway Real-Time Engineering Architecture
                </span>
                <button onClick={() => setShowTechInfo(false)} className="text-ivory/50 hover:text-champagne">
                  ✕
                </button>
              </div>
              <p className="leading-relaxed">
                • <strong>Procedural Pakistani Silhouettes:</strong> Dedicated real-time 3D geometry models for{' '}
                <strong className="text-champagne">Lehenga, Peshwas/Anarkali, Gharara, Straight Kurta, and Kaftan</strong>.
              </p>
              <p className="leading-relaxed">
                • <strong>Authentic Transparency:</strong> The 3D runway avatar models procedural silhouette simulation with PBR fabric physics. The authentic catalog reference card displays true garment photography, while the AI Try-On card provides personalized customer photo synthesis.
              </p>
              <p className="leading-relaxed">
                • <strong>Body Structure Adaptation:</strong> Real-time proportional calibration for Hourglass, Pear Flared, Petite Balanced, Athletic Straight, and Royal Plus-Size contours.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
