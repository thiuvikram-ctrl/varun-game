import * as THREE from 'three';
import { CharacterRosterItem } from '../types/characterRoster';

/**
 * Generates an illustrated 2D "Chitra" Face Decal on a 256x256 Canvas.
 * "Chitra" (चित्र) = Illustrated picture/artwork.
 * Features:
 * - Large, expressive anime/Roblox eyes with luminous gradients
 * - Shiny catchlights & star highlights
 * - Expressive comic eyebrows
 * - Illustrated smiling mouth with teeth or confident battle smirk
 * - Rosy anime blush marks
 * - Ninja / Tactical clan forehead plate
 */
function createChitraFaceTexture(char: CharacterRosterItem, isEnemy: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Skin Base Fill
    ctx.fillStyle = char.handSkinTone || '#fed7aa';
    ctx.fillRect(0, 0, 256, 256);

    // 2. Forehead Clan Headband
    ctx.fillStyle = isEnemy ? '#991b1b' : '#1e293b';
    ctx.fillRect(0, 10, 256, 44);

    // Metallic Clan Emblem Plate
    ctx.fillStyle = isEnemy ? '#f87171' : '#cbd5e1';
    ctx.beginPath();
    ctx.roundRect(88, 16, 80, 32, 6);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rivets on plate
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(94, 32, 2.5, 0, Math.PI * 2);
    ctx.arc(162, 32, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Clan Insignia (Chitra symbol)
    ctx.fillStyle = isEnemy ? '#7f1d1d' : '#0284c7';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('忍', 128, 32);

    // 3. Eyebrows (bold, determined comic strokes)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(50, 78);
    ctx.quadraticCurveTo(80, 68, 108, 80);
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(148, 80);
    ctx.quadraticCurveTo(176, 68, 206, 78);
    ctx.stroke();

    // 4. Large Sparkling Anime / Chitra Eyes
    const eyeColors = [
      { x: 78, y: 118, flip: false },
      { x: 178, y: 118, flip: true },
    ];

    eyeColors.forEach(eye => {
      // Sclera (White eye background)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, 34, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Iris gradient (Dual-tone glowing eye matching character)
      const primaryColor = isEnemy ? '#ef4444' : char.eyeStyle.color || '#38bdf8';
      const glowColor = isEnemy ? '#991b1b' : char.eyeStyle.glow || '#0284c7';

      const irisGrad = ctx.createRadialGradient(eye.x, eye.y - 6, 4, eye.x, eye.y, 28);
      irisGrad.addColorStop(0, '#ffffff');
      irisGrad.addColorStop(0.2, primaryColor);
      irisGrad.addColorStop(0.7, glowColor);
      irisGrad.addColorStop(1, '#050b14');

      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y + 2, 24, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupil with diamond core
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y + 4, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight Highlights (the secret to vibrant Chitra anime eyes!)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eye.x - 8, eye.y - 8, 7, 0, Math.PI * 2); // Big shiny sparkle
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eye.x + 8, eye.y + 10, 4, 0, Math.PI * 2); // Small shiny sparkle
      ctx.fill();

      // Upper Eyelash line
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 36, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Winged eyeliner flick
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (!eye.flip) {
        ctx.moveTo(eye.x - 34, eye.y - 4);
        ctx.lineTo(eye.x - 44, eye.y - 10);
      } else {
        ctx.moveTo(eye.x + 34, eye.y - 4);
        ctx.lineTo(eye.x + 44, eye.y - 10);
      }
      ctx.stroke();
    });

    // 5. Rosy Anime Blush Marks ("Chitra" charm)
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.ellipse(65, 156, 18, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(191, 156, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute blush hatch lines
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2;
    [-4, 0, 4].forEach(off => {
      ctx.beginPath();
      ctx.moveTo(65 + off - 6, 152);
      ctx.lineTo(65 + off + 6, 160);
      ctx.moveTo(191 + off - 6, 152);
      ctx.lineTo(191 + off + 6, 160);
      ctx.stroke();
    });

    // 6. Anime Nose (delicate cute dot)
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.ellipse(128, 162, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 7. Illustrated Mouth ("Chitra" confident winning smile)
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(128, 184, 28, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 4;
    ctx.stroke();

    // White teeth in smile
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.rect(112, 184, 32, 9);
    ctx.fill();

    // Pink tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(128, 204, 14, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates an authentic, high-resolution illustrated "Roblox Dress" texture.
 * Wraps around the blocky torso with collar, hoodie/tunic lines, graphic chest emblem ("Chitra"),
 * zipper, and golden utility belt.
 */
function createRobloxDressTexture(char: CharacterRosterItem, isEnemy: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const baseColor = isEnemy ? '#7f1d1d' : char.outfitColor || '#0f172a';
    const accentColor = isEnemy ? '#ef4444' : '#f59e0b';

    // 1. Dress Base Fabric
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle fabric weave texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let y = 0; y < 512; y += 8) {
      ctx.fillRect(0, y, 512, 4);
    }

    // 2. Collar & Neckline
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(190, 0);
    ctx.lineTo(256, 90);
    ctx.lineTo(322, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner undershirt
    ctx.fillStyle = isEnemy ? '#111827' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(215, 0);
    ctx.lineTo(256, 60);
    ctx.lineTo(297, 0);
    ctx.closePath();
    ctx.fill();

    // 3. Central Zipper / Button Placket
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(256, 90);
    ctx.lineTo(256, 410);
    ctx.stroke();

    // Zipper teeth marks
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    for (let z = 100; z < 400; z += 14) {
      ctx.beginPath();
      ctx.moveTo(250, z);
      ctx.lineTo(262, z);
      ctx.stroke();
    }

    // 4. Chest Graphic Emblem ("Chitra" Artwork on Roblox Shirt/Dress)
    ctx.save();
    // Shield badge background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.moveTo(256, 140);
    ctx.lineTo(330, 180);
    ctx.lineTo(310, 270);
    ctx.lineTo(256, 320);
    ctx.lineTo(202, 270);
    ctx.lineTo(182, 180);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Illustrated Chitra Dragon / Shinobi Icon inside badge
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 256, 225);

    // Clan banner text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(char.clan.slice(0, 10).toUpperCase(), 256, 290);
    ctx.restore();

    // 5. Front Tactical Pockets with flaps
    [100, 350].forEach(px => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(px - 45, 230, 90, 80, 8);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pocket flap
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px - 45, 220, 90, 25);
      // Snap button
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(px, 232, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Tactical Utility Belt with Golden Buckle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 410, 512, 60);

    // Golden Buckle
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(216, 400, 80, 80);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(228, 412, 56, 56);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(246, 420, 20, 40);

    // Belt pouches
    [80, 140, 370, 430].forEach(bx => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx - 20, 415, 40, 50);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 20, 415, 40, 50);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates an illustrated Roblox Pants & High-top Sneakers Texture.
 */
function createRobloxPantsTexture(char: CharacterRosterItem, isEnemy: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const pantsColor = isEnemy ? '#1e1b18' : '#1e293b';

    // 1. Denim / Tactical Pants Base
    ctx.fillStyle = pantsColor;
    ctx.fillRect(0, 0, 256, 256);

    // Seam stitches
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 180);
    ctx.stroke();

    // Knee Guard Armor Patch
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(40, 70, 176, 55, 8);
    ctx.fill();
    ctx.strokeStyle = isEnemy ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. High-Top Roblox Sneakers
    // Colored sneaker upper
    ctx.fillStyle = isEnemy ? '#dc2626' : '#2563eb';
    ctx.fillRect(0, 180, 256, 50);

    // White laces
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    for (let l = 188; l < 225; l += 8) {
      ctx.beginPath();
      ctx.moveTo(100, l);
      ctx.lineTo(156, l);
      ctx.stroke();
    }

    // Classic Thick White Rubber Roblox Outsole
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 230, 256, 26);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 230, 256, 26);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Authentic Roblox Character Model with:
 * - Classic blocky R6/R15 proportions & joints
 * - Iconic Roblox head with cylindrical top stud
 * - High-res illustrated "Chitra" 2D facial expression decal
 * - Authentic illustrated Roblox Dress / Graphic outfit texture
 * - Roblox high-top sneakers & knee guards
 * - Layered angular Roblox anime hair
 * - Gaming headset with glowing LED ear cups
 * - Back-mounted tactical katana accessory
 * - Authentic Roblox walking, jumping, and crouching physics animations
 */
export class RobloxCharacterModel {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public torso: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftForearm: THREE.Group;
  public rightForearm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public weaponMesh: THREE.Group;
  public characterData: CharacterRosterItem;
  public isAlive: boolean = true;
  public health: number;
  public maxHealth: number;

  constructor(char: CharacterRosterItem, isEnemy: boolean = false) {
    this.characterData = char;
    this.health = char.hp;
    this.maxHealth = char.hp;

    this.root = new THREE.Group();
    this.torso = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();
    this.leftForearm = new THREE.Group();
    this.rightForearm = new THREE.Group();
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();
    this.weaponMesh = new THREE.Group();

    // 1. MATERIAL GENERATION
    const chitraFaceTexture = createChitraFaceTexture(char, isEnemy);
    const robloxDressTexture = createRobloxDressTexture(char, isEnemy);
    const robloxPantsTexture = createRobloxPantsTexture(char, isEnemy);

    const skinColor = new THREE.Color(char.handSkinTone || '#fed7aa');
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.5,
      metalness: 0.05,
    });

    const hairColor = new THREE.Color(char.hairColor || '#1e1b18');
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.35,
      metalness: 0.2,
    });

    const torsoDressMaterial = new THREE.MeshStandardMaterial({
      map: robloxDressTexture,
      roughness: 0.6,
      metalness: 0.1,
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
      map: robloxPantsTexture,
      roughness: 0.7,
      metalness: 0.1,
    });

    const accessoryMaterial = new THREE.MeshStandardMaterial({
      color: isEnemy ? 0x991b1b : 0x0284c7,
      roughness: 0.3,
      metalness: 0.7,
    });

    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.85,
    });

    // 2. ICONIC ROBLOX BLOCKY TORSO (Classic R6/R15 proportions)
    // Box dimensions: Width: 0.58m, Height: 0.62m, Depth: 0.30m
    const torsoMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.62, 0.30),
      torsoDressMaterial
    );
    torsoMesh.position.y = 1.25;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    this.torso.add(torsoMesh);

    // Back Accessory: Roblox Katana with Sheath mounted on the back
    const katanaSheath = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.75, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    katanaSheath.rotation.z = Math.PI / 4;
    katanaSheath.position.set(0, 1.25, -0.18);
    this.torso.add(katanaSheath);

    const katanaHilt = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.22, 0.08),
      goldAccentMaterial
    );
    katanaHilt.position.set(-0.3, 1.55, -0.18);
    katanaHilt.rotation.z = Math.PI / 4;
    this.torso.add(katanaHilt);

    this.root.add(this.torso);

    // 3. CLASSIC ROBLOX HEAD WITH STUD & ILLUSTRATED "CHITRA" FACE
    this.headGroup.position.set(0, 1.76, 0);

    // Neck joint stud
    const neckStud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16),
      skinMaterial
    );
    neckStud.position.y = -0.18;
    this.headGroup.add(neckStud);

    // Classic Roblox cylinder-beveled head
    const headGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.44, 24);
    const headSideMat = skinMaterial;
    const headMesh = new THREE.Mesh(headGeom, headSideMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Top Stud (the hallmark of an authentic Roblox avatar)
    const topStud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16),
      skinMaterial
    );
    topStud.position.y = 0.25;
    this.headGroup.add(topStud);

    // Front Face Plate displaying the 2D Illustrated "Chitra" Face Decal
    const faceDecalMat = new THREE.MeshBasicMaterial({
      map: chitraFaceTexture,
      transparent: true,
    });
    const faceDecalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.38),
      faceDecalMat
    );
    faceDecalMesh.position.set(0, 0.02, 0.245);
    this.headGroup.add(faceDecalMesh);

    // 4. ROBLOX LAYERED ANGULAR ANIME HAIR
    const hairGroup = new THREE.Group();

    // Crown cap
    const hairCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.16, 0.52),
      hairMaterial
    );
    hairCap.position.set(0, 0.22, -0.02);
    hairGroup.add(hairCap);

    // Front angular anime bangs (blocky Roblox wedges)
    const bangOffsets = [
      { x: -0.16, y: 0.18, z: 0.23, ry: 0.1, sx: 0.12, sy: 0.16, sz: 0.1 },
      { x: -0.05, y: 0.2, z: 0.25, ry: 0.0, sx: 0.14, sy: 0.2, sz: 0.1 },
      { x: 0.07, y: 0.2, z: 0.25, ry: -0.05, sx: 0.14, sy: 0.19, sz: 0.1 },
      { x: 0.17, y: 0.18, z: 0.23, ry: -0.15, sx: 0.12, sy: 0.15, sz: 0.1 },
    ];
    bangOffsets.forEach(b => {
      const strand = new THREE.Mesh(new THREE.BoxGeometry(b.sx, b.sy, b.sz), hairMaterial);
      strand.position.set(b.x, b.y, b.z);
      strand.rotation.set(-0.25, b.ry, 0);
      hairGroup.add(strand);
    });

    // Sideburns
    [-0.26, 0.26].forEach(side => {
      const sideHair = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.32, 0.32),
        hairMaterial
      );
      sideHair.position.set(side, 0.06, 0.04);
      hairGroup.add(sideHair);
    });

    // Spiky Roblox anime crown tufts
    for (let s = 0; s < 6; s++) {
      const angle = (s / 6) * Math.PI * 1.8 - Math.PI * 0.9;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.24, 4),
        hairMaterial
      );
      spike.position.set(Math.sin(angle) * 0.18, 0.35, Math.cos(angle) * 0.16);
      spike.rotation.set(Math.cos(angle) * 0.4, 0, -Math.sin(angle) * 0.4);
      hairGroup.add(spike);
    }

    // Roblox Gaming Headset with glowing RGB ear pads
    const headband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16, 1, true, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2 })
    );
    headband.rotation.z = Math.PI / 2;
    headband.position.set(0, 0.12, 0);
    hairGroup.add(headband);

    [-0.28, 0.28].forEach(ex => {
      const earCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.07, 16),
        accessoryMaterial
      );
      earCup.rotation.z = Math.PI / 2;
      earCup.position.set(ex, 0.06, 0);
      hairGroup.add(earCup);

      // Glowing RGB ring
      const rgbRing = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.08, 16),
        new THREE.MeshBasicMaterial({ color: isEnemy ? 0xef4444 : 0x38bdf8, side: THREE.DoubleSide })
      );
      rgbRing.rotation.y = Math.PI / 2;
      rgbRing.position.set(ex + (ex > 0 ? 0.04 : -0.04), 0.06, 0);
      hairGroup.add(rgbRing);
    });

    this.headGroup.add(hairGroup);
    this.root.add(this.headGroup);

    // 5. ICONIC ROBLOX BLOCKY ARMS (Shoulder joints)
    // Left Arm (0.24m x 0.62m x 0.24m)
    this.leftArm.position.set(-0.42, 1.48, 0);
    const leftArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.62, 0.24),
      torsoDressMaterial
    );
    leftArmMesh.position.y = -0.28;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    // Left blocky hand
    const leftHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.14, 0.22),
      skinMaterial
    );
    leftHand.position.y = -0.58;
    this.leftArm.add(leftHand);

    this.root.add(this.leftArm);

    // Right Arm (0.24m x 0.62m x 0.24m) - Holds Weapon Forward
    this.rightArm.position.set(0.42, 1.48, 0);
    const rightArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.62, 0.24),
      torsoDressMaterial
    );
    rightArmMesh.position.y = -0.28;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);

    // Right blocky hand
    const rightHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.14, 0.22),
      skinMaterial
    );
    rightHand.position.y = -0.58;
    this.rightArm.add(rightHand);

    // 6. CARRIED ROBLOX COMBAT RIFLE
    this.buildHeldWeapon(goldAccentMaterial);
    this.rightArm.add(this.weaponMesh);
    this.root.add(this.rightArm);

    // 7. ICONIC ROBLOX BLOCKY LEGS (Hip joints)
    // Left Leg
    this.leftLeg.position.set(-0.16, 0.94, 0);
    const leftLegMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.64, 0.26),
      pantsMaterial
    );
    leftLegMesh.position.y = -0.32;
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    this.leftLeg.add(leftLegMesh);
    this.root.add(this.leftLeg);

    // Right Leg
    this.rightLeg.position.set(0.16, 0.94, 0);
    const rightLegMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.64, 0.26),
      pantsMaterial
    );
    rightLegMesh.position.y = -0.32;
    rightLegMesh.castShadow = true;
    rightLegMesh.receiveShadow = true;
    this.rightLeg.add(rightLegMesh);
    this.root.add(this.rightLeg);

    // Default combat ready stance
    this.rightArm.rotation.x = -Math.PI / 4;
    this.rightArm.rotation.y = -0.15;
    this.leftArm.rotation.x = -Math.PI / 3.5;
    this.leftArm.rotation.y = 0.35;
  }

  private buildHeldWeapon(accentMat: THREE.Material) {
    this.weaponMesh.position.set(0, -0.56, 0.24);
    this.weaponMesh.rotation.set(-Math.PI / 3, 0, 0);

    const gunBodyMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Receiver
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.48), gunBodyMat);
    this.weaponMesh.add(receiver);

    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), accentMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.4);
    this.weaponMesh.add(barrel);

    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.1), gunBodyMat);
    mag.position.set(0, -0.12, 0.08);
    this.weaponMesh.add(mag);

    // Holographic Reflex Sight
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.09), accentMat);
    sight.position.set(0, 0.1, -0.06);
    this.weaponMesh.add(sight);
  }

  /**
   * Updates authentic Roblox character physics & movement animations
   */
  public updateAnimation(time: number, isMoving: boolean, isJumping: boolean = false, isCrouching: boolean = false) {
    if (!this.isAlive) {
      this.root.rotation.x = Math.PI / 2;
      this.root.position.y = 0.25;
      return;
    }

    if (isJumping) {
      // Classic Roblox airborne jumping stance:
      // Legs kick apart, arms raise up
      this.leftLeg.rotation.x = -0.65;
      this.rightLeg.rotation.x = 0.55;
      this.torso.position.y = 0.1;
      this.headGroup.position.y = 1.82;
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = -Math.PI / 2.8;
    } else if (isCrouching) {
      // Tactical Roblox crouch stance
      this.leftLeg.rotation.x = 0.85;
      this.rightLeg.rotation.x = 0.65;
      this.torso.position.y = -0.32;
      this.headGroup.position.y = 1.44;
    } else if (isMoving) {
      // Classic, beloved Roblox walking stride:
      // Arms and legs swinging in perfect rhythmic sync with torso bob
      const walkFreq = time * 8.5;
      const legStride = Math.sin(walkFreq) * 0.75;
      const armSwing = Math.cos(walkFreq) * 0.65;

      this.leftLeg.rotation.x = legStride;
      this.rightLeg.rotation.x = -legStride;

      // Arm counter-swing
      this.leftArm.rotation.x = armSwing;
      this.rightArm.rotation.x = -Math.PI / 4 - armSwing * 0.35; // Hold weapon steadily while swinging

      // Torso bobbing
      this.torso.position.y = Math.abs(Math.sin(walkFreq)) * 0.05;
      this.headGroup.position.y = 1.76 + Math.abs(Math.sin(walkFreq)) * 0.04;
    } else {
      // Natural gentle Roblox idle breathing
      const breath = Math.sin(time * 2.8) * 0.015;
      this.torso.position.y = breath;
      this.headGroup.position.y = 1.76 + breath * 0.6;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = -Math.PI / 3.5;
      this.rightArm.rotation.x = -Math.PI / 4;
    }
  }
}

// Aliases so all other codebase imports resolve seamlessly
export { RobloxCharacterModel as RealisticAnimeCharacterModel };
export { RobloxCharacterModel as RealCharacterModel };
