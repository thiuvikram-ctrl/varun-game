import * as THREE from 'three';
import { MapEnvironment } from '../types/characterRoster';

export interface ForestObject {
  mesh: THREE.Object3D;
  type: 'tree' | 'bamboo' | 'rock' | 'bunker' | 'vehicle' | 'crate' | 'bench' | 'bridge';
  radius: number;
  position: THREE.Vector3;
}

export function buildForestWorld(scene: THREE.Scene, env: MapEnvironment): ForestObject[] {
  const worldObjects: ForestObject[] = [];
  const mapSize = 350; // 350x350 meter combat & dating forest area

  // 1. TERRAIN / FOREST FLOOR - VIBRANT SUNNY MORNING GRASS (ALWAYS MORNING)
  const groundGeom = new THREE.PlaneGeometry(mapSize, mapSize, 64, 64);
  const morningGrassColor = new THREE.Color(
    env.groundColor && !env.groundColor.startsWith('#0') && !env.groundColor.startsWith('#1') 
      ? env.groundColor 
      : '#22c55e'
  );
  const groundMat = new THREE.MeshStandardMaterial({
    color: morningGrassColor,
    roughness: 0.78,
    metalness: 0.05,
  });

  // Rolling hills and scenic river depression
  const posAttr = groundGeom.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    // River valley carving through (x near y * 0.4)
    const distToRiver = Math.abs(x - y * 0.35 + 20);
    let riverDip = 0;
    if (distToRiver < 16) {
      riverDip = -Math.cos((distToRiver / 16) * Math.PI * 0.5) * 2.2;
    }
    const rollingMounds = Math.sin(x * 0.035) * Math.cos(y * 0.035) * 2.2 + Math.sin(x * 0.012) * 1.5;
    posAttr.setZ(i, rollingMounds + riverDip);
  }
  groundGeom.computeVertexNormals();

  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 2. ROMANTIC DATING POND & SPARKLING WATER STREAM
  const waterGeom = new THREE.PlaneGeometry(120, 24, 16, 16);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.78,
  });
  const waterStream = new THREE.Mesh(waterGeom, waterMat);
  waterStream.rotation.x = -Math.PI / 2;
  waterStream.rotation.z = Math.PI / 5;
  waterStream.position.set(-15, -0.6, 5);
  scene.add(waterStream);

  // Water lilies floating in the dating pond
  const lilyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  const lotusMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.3 });
  for (let l = 0; l < 18; l++) {
    const lx = -25 + (Math.random() - 0.5) * 40;
    const lz = 5 + (Math.random() - 0.5) * 30;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 12), lilyMat);
    pad.position.set(lx, -0.55, lz);
    scene.add(pad);

    if (l % 2 === 0) {
      const flower = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 6), lotusMat);
      flower.position.set(lx, -0.4, lz);
      scene.add(flower);
    }
  }

  // 3. ROMANTIC ARCHED WOODEN BRIDGE OVER STREAM
  const bridgeGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(6, 0.35, 14), woodMat);
  bridgeDeck.position.y = 0.8;
  bridgeDeck.rotation.y = Math.PI / 3.5;
  bridgeGroup.add(bridgeDeck);

  // Bridge handrails with fairy lanterns
  const railMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
  [-2.8, 2.8].forEach(rx => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 14), railMat);
    rail.position.set(rx, 1.25, 0);
    rail.rotation.y = Math.PI / 3.5;
    bridgeGroup.add(rail);

    // Warm hanging lanterns
    for (let lp = -4; lp <= 4; lp += 4) {
      const lantern = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.45, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
      );
      lantern.position.set(rx, 1.6, lp);
      bridgeGroup.add(lantern);
    }
  });

  bridgeGroup.position.set(-16, 0, 6);
  scene.add(bridgeGroup);
  worldObjects.push({
    mesh: bridgeGroup,
    type: 'bridge',
    radius: 3.5,
    position: new THREE.Vector3(-16, 0, 6),
  });

  // 4. ROMANTIC DATING BENCHES UNDER SCENIC TREES
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
  const benchPositions = [
    { x: -5, z: 12, rot: 0.4 },
    { x: 12, z: -8, rot: -0.6 },
    { x: -28, z: 26, rot: 1.2 },
    { x: 32, z: 20, rot: -1.8 },
    { x: -14, z: -25, rot: 0.8 },
  ];

  benchPositions.forEach(bp => {
    const bench = new THREE.Group();
    // Seat slats
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.7), benchMat);
    seat.position.y = 0.55;
    bench.add(seat);

    // Backrest slats
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.1), benchMat);
    back.position.set(0, 0.9, -0.32);
    bench.add(back);

    // Iron armrests / legs
    [-1.1, 1.1].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.65), ironMat);
      leg.position.set(lx, 0.28, 0);
      bench.add(leg);
    });

    bench.position.set(bp.x, 0, bp.z);
    bench.rotation.y = bp.rot;
    scene.add(bench);

    worldObjects.push({
      mesh: bench,
      type: 'bench',
      radius: 1.5,
      position: new THREE.Vector3(bp.x, 0, bp.z),
    });
  });

  // 5. ROMANTIC STONE PAVERS / DATING FOREST PATH
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
  for (let p = -50; p <= 50; p += 2.8) {
    const px = Math.sin(p * 0.08) * 12 + (Math.random() - 0.5) * 1.2;
    const pz = p + (Math.random() - 0.5) * 0.8;
    const paver = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85 + Math.random() * 0.3, 0.95, 0.12, 8),
      stoneMat
    );
    paver.rotation.y = Math.random() * Math.PI;
    paver.position.set(px, 0.04, pz);
    scene.add(paver);
  }

  // 6. ALWAYS SUNNY MORNING SKY, GOLDEN SUN & MORNING ATMOSPHERE (NO NIGHT)
  const morningSky = new THREE.Color(
    env.skyColor && !env.skyColor.startsWith('#0') && !env.skyColor.startsWith('#1')
      ? env.skyColor
      : '#70b5ff'
  );
  const morningFog = new THREE.Color(
    env.fogColor && !env.fogColor.startsWith('#0') && !env.fogColor.startsWith('#1')
      ? env.fogColor
      : '#e0f2fe'
  );

  scene.background = morningSky;
  scene.fog = new THREE.FogExp2(morningFog, 0.0035); // Soft morning mist, 400m+ clear visibility

  // Glowing Morning Sun in the Sky
  const sunGeom = new THREE.SphereGeometry(18, 16, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
  const sunMesh = new THREE.Mesh(sunGeom, sunMat);
  sunMesh.position.set(140, 210, 110);
  scene.add(sunMesh);

  // Glowing Morning Sun Corona Halo
  const sunCoronaGeom = new THREE.SphereGeometry(30, 16, 16);
  const sunCoronaMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.35 });
  const sunCorona = new THREE.Mesh(sunCoronaGeom, sunCoronaMat);
  sunCorona.position.copy(sunMesh.position);
  scene.add(sunCorona);

  // Warm golden morning sunbeam directional light
  const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
  sunLight.position.set(80, 170, 70);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 420;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Radiant sky blue & morning grass hemisphere light
  const morningHemisphere = new THREE.HemisphereLight(0xbae6fd, 0x22c55e, 1.25);
  scene.add(morningHemisphere);

  // Warm morning golden fill light
  const morningFill = new THREE.DirectionalLight(0xfef08a, 0.7);
  morningFill.position.set(-60, 90, -40);
  scene.add(morningFill);

  // 7. SAKURA / CHERRY BLOSSOM & DENSE ROMANTIC FOREST TREES
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 });
  const oakLeavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.75 });
  const sakuraLeavesMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.65 });
  const goldenAutumnLeavesMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });

  const totalTrees = Math.floor(140 * (env.treeDensity || 1.1));

  for (let i = 0; i < totalTrees; i++) {
    const x = (Math.random() - 0.5) * (mapSize - 40);
    const z = (Math.random() - 0.5) * (mapSize - 40);

    // Keep center clearing open
    if (Math.hypot(x, z) < 14) continue;

    const treeGroup = new THREE.Group();
    const isSakura = i % 3 === 0; // 1 out of 3 trees is a blooming Sakura cherry blossom tree!
    const isGolden = i % 5 === 0;
    const leafMat = isSakura ? sakuraLeavesMat : isGolden ? goldenAutumnLeavesMat : oakLeavesMat;

    const height = 9 + Math.random() * 8;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.6, height, 8),
      trunkMat
    );
    trunk.position.y = height / 2;
    treeGroup.add(trunk);

    // Multi-tier lush foliage cloud
    const foliageTiers = isSakura ? 4 : 3;
    for (let t = 0; t < foliageTiers; t++) {
      const radius = 3.5 - t * 0.6;
      const sphereLeaves = new THREE.Mesh(
        new THREE.DodecahedronGeometry(radius, 1),
        leafMat
      );
      sphereLeaves.position.set(
        (Math.random() - 0.5) * 0.8,
        height * 0.55 + t * 2.2,
        (Math.random() - 0.5) * 0.8
      );
      sphereLeaves.castShadow = true;
      sphereLeaves.receiveShadow = true;
      treeGroup.add(sphereLeaves);
    }

    // Warm glowing fairy lanterns hanging on dating Sakura trees
    if (isSakura && i % 6 === 0) {
      const fairyLantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.2 })
      );
      fairyLantern.position.set(1.4, height * 0.6, 0.8);
      treeGroup.add(fairyLantern);
    }

    treeGroup.position.set(x, 0, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(treeGroup);

    worldObjects.push({
      mesh: treeGroup,
      type: 'tree',
      radius: 1.4,
      position: new THREE.Vector3(x, 0, z),
    });
  }

  // 7b. ROBLOX-STYLE FLUFFY SKY CLOUDS (Future Lighting Aesthetic)
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.1,
    transparent: true,
    opacity: 0.82,
  });

  for (let c = 0; c < 16; c++) {
    const cloudGroup = new THREE.Group();
    const cx = (Math.random() - 0.5) * (mapSize + 80);
    const cy = 45 + Math.random() * 20;
    const cz = (Math.random() - 0.5) * (mapSize + 80);

    for (let p = 0; p < 5; p++) {
      const puff = new THREE.Mesh(
        new THREE.DodecahedronGeometry(6 + Math.random() * 5, 1),
        cloudMat
      );
      puff.position.set(
        (p - 2) * 5 + (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 4
      );
      cloudGroup.add(puff);
    }
    cloudGroup.position.set(cx, cy, cz);
    scene.add(cloudGroup);
  }

  // 7c. ROBLOX-STYLE GLOWING AIRDROP SUPPLY CRATES WITH VERTICAL LIGHT BEACONS
  const airdropLocs = [
    { x: -18, z: -15, color: 0xf59e0b, name: 'Legendary Weapon Crate' },
    { x: 22, z: 28, color: 0x38bdf8, name: 'Tactical Armor Cache' },
    { x: -40, z: 35, color: 0x10b981, name: 'Medical Surplus Drop' },
  ];

  airdropLocs.forEach(drop => {
    const dropGroup = new THREE.Group();

    // Reinforced metal supply crate
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8,
    });
    const crate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2.2), crateMat);
    crate.position.y = 0.9;
    crate.castShadow = true;
    crate.receiveShadow = true;
    dropGroup.add(crate);

    // Glowing neon banding (classic Roblox neon brick style)
    const neonMat = new THREE.MeshBasicMaterial({ color: drop.color });
    const neonBand = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.3, 2.25), neonMat);
    neonBand.position.y = 0.9;
    dropGroup.add(neonBand);

    // Vertical sky beacon of light
    const beaconGeom = new THREE.CylinderGeometry(0.12, 0.45, 90, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: drop.color,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const beacon = new THREE.Mesh(beaconGeom, beaconMat);
    beacon.position.y = 45;
    dropGroup.add(beacon);

    dropGroup.position.set(drop.x, 0, drop.z);
    scene.add(dropGroup);

    worldObjects.push({
      mesh: dropGroup,
      type: 'crate',
      radius: 1.8,
      position: new THREE.Vector3(drop.x, 0, drop.z),
    });
  });

  // 8. FLOATING SAKURA PETALS & GLOWING FIREFLIES PARTICLE SYSTEM
  const petalCount = 180;
  const petalGeom = new THREE.BufferGeometry();
  const petalPositions = new Float32Array(petalCount * 3);
  for (let p = 0; p < petalCount * 3; p += 3) {
    petalPositions[p] = (Math.random() - 0.5) * 120;
    petalPositions[p + 1] = Math.random() * 14 + 0.5;
    petalPositions[p + 2] = (Math.random() - 0.5) * 120;
  }
  petalGeom.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
  const petalMat = new THREE.PointsMaterial({
    color: 0xfbcfe8,
    size: 0.35,
    transparent: true,
    opacity: 0.85,
  });
  const petalParticles = new THREE.Points(petalGeom, petalMat);
  scene.add(petalParticles);

  // Glowing Fireflies
  const fireflyCount = 90;
  const fireflyGeom = new THREE.BufferGeometry();
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  for (let f = 0; f < fireflyCount * 3; f += 3) {
    fireflyPositions[f] = (Math.random() - 0.5) * 100;
    fireflyPositions[f + 1] = Math.random() * 5 + 0.5;
    fireflyPositions[f + 2] = (Math.random() - 0.5) * 100;
  }
  fireflyGeom.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
  const fireflyMat = new THREE.PointsMaterial({
    color: 0xfacc15,
    size: 0.45,
    transparent: true,
    opacity: 0.9,
  });
  const fireflies = new THREE.Points(fireflyGeom, fireflyMat);
  scene.add(fireflies);

  // 9. VIBRANT WILDFLOWER CLUSTERS (Roses, Lavender, Golden Poppies)
  const flowerColors = [0xf43f5e, 0xa855f7, 0xfacc15, 0x38bdf8];
  flowerColors.forEach(col => {
    const fMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 });
    for (let c = 0; c < 28; c++) {
      const cx = (Math.random() - 0.5) * (mapSize - 60);
      const cz = (Math.random() - 0.5) * (mapSize - 60);
      const flowerCluster = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 6), fMat);
      flowerCluster.position.set(cx, 0.22, cz);
      scene.add(flowerCluster);
    }
  });

  // 10. DRIVABLE TACTICAL VEHICLES IN DATING FOREST
  const vehicleLocations = [
    { x: -25, z: 15, name: 'Tactical Safari Jeep' },
    { x: 30, z: -20, name: 'Dune Combat Buggy' },
    { x: -10, z: -45, name: 'All-Terrain Quad' },
  ];

  vehicleLocations.forEach((vLoc, idx) => {
    const vehGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: idx === 0 ? 0x15803d : idx === 1 ? 0xb45309 : 0x0f172a,
      roughness: 0.35,
      metalness: 0.7,
    });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 4.4), bodyMat);
    chassis.position.y = 0.9;
    vehGroup.add(chassis);

    const rollcage = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.0, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.4 })
    );
    rollcage.position.set(0, 1.7, -0.4);
    vehGroup.add(rollcage);

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const tireGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 16);
    const tireOffsets = [
      { x: -1.25, z: 1.4 },
      { x: 1.25, z: 1.4 },
      { x: -1.25, z: -1.4 },
      { x: 1.25, z: -1.4 },
    ];
    tireOffsets.forEach(tPos => {
      const tire = new THREE.Mesh(tireGeom, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(tPos.x, 0.48, tPos.z);
      vehGroup.add(tire);
    });

    vehGroup.position.set(vLoc.x, 0, vLoc.z);
    scene.add(vehGroup);

    worldObjects.push({
      mesh: vehGroup,
      type: 'vehicle',
      radius: 2.5,
      position: new THREE.Vector3(vLoc.x, 0, vLoc.z),
    });
  });

  return worldObjects;
}
