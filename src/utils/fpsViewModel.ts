import * as THREE from 'three';
import { Weapon } from '../types/game';
import { CharacterRosterItem } from '../types/characterRoster';

/**
 * Creates a detailed 3D Viewmodel for First-Person Perspective:
 * - Operative's realistic male tactical arms & forearms
 * - Tactical gloves with carbon knuckle guards
 * - Weapon held firmly in two hands with authentic aim stance
 * - Realistic muzzle flash and recoil animation transforms
 */
export class FPSViewModel {
  public root: THREE.Group;
  public weaponGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public muzzleFlash: THREE.Mesh;
  public muzzlePoint: THREE.Vector3;

  private recoilOffset: number = 0;
  private swayOffset: THREE.Vector2 = new THREE.Vector2();

  constructor(character: CharacterRosterItem, weapon: Weapon) {
    this.root = new THREE.Group();
    this.weaponGroup = new THREE.Group();
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();
    this.muzzlePoint = new THREE.Vector3();

    // Material setup matching character customization
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.handSkinTone || '#e5b88f'),
      roughness: 0.7,
      metalness: 0.1,
    });

    const gloveMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.gloveColor || '#1f2937'),
      roughness: 0.5,
      metalness: 0.3,
    });

    const knuckleMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
      metalness: 0.8,
    });

    const sleeveMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.outfitColor || '#0f172a'),
      roughness: 0.8,
    });

    // 1. BUILD RIGHT ARM (Triggers gun)
    const rightForearmGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.38, 12);
    const rightForearm = new THREE.Mesh(rightForearmGeom, sleeveMat);
    rightForearm.position.set(0.24, -0.22, -0.15);
    rightForearm.rotation.set(Math.PI / 4, -0.2, -0.15);

    // Right Wrist & Tactical Glove
    const rightHandGeom = new THREE.BoxGeometry(0.065, 0.04, 0.1);
    const rightHand = new THREE.Mesh(rightHandGeom, gloveMat);
    rightHand.position.set(0.19, -0.12, -0.32);
    rightHand.rotation.set(0.1, -0.1, 0);

    // Carbon Knuckles Plate
    const rightKnuckleGeom = new THREE.BoxGeometry(0.06, 0.015, 0.035);
    const rightKnuckle = new THREE.Mesh(rightKnuckleGeom, knuckleMat);
    rightKnuckle.position.set(0, 0.02, 0.02);
    rightHand.add(rightKnuckle);

    // Tactical Watch on Right Wrist
    const watchBandGeom = new THREE.CylinderGeometry(0.052, 0.052, 0.03, 16);
    const watchMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const watchMesh = new THREE.Mesh(watchBandGeom, watchMat);
    watchMesh.rotation.z = Math.PI / 2;
    watchMesh.position.set(0.21, -0.16, -0.26);

    this.rightArm.add(rightForearm, rightHand, watchMesh);

    // 2. BUILD LEFT ARM (Supports rifle handguard)
    const leftForearmGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.38, 12);
    const leftForearm = new THREE.Mesh(leftForearmGeom, sleeveMat);
    leftForearm.position.set(-0.2, -0.22, -0.18);
    leftForearm.rotation.set(Math.PI / 3.8, 0.45, 0.25);

    const leftHandGeom = new THREE.BoxGeometry(0.065, 0.04, 0.09);
    const leftHand = new THREE.Mesh(leftHandGeom, gloveMat);
    leftHand.position.set(-0.06, -0.13, -0.42);
    leftHand.rotation.set(0.2, 0.3, 0.1);

    const leftKnuckle = new THREE.Mesh(rightKnuckleGeom, knuckleMat);
    leftKnuckle.position.set(0, 0.02, 0.02);
    leftHand.add(leftKnuckle);

    this.leftArm.add(leftForearm, leftHand);

    // 3. BUILD 3D WEAPON MODEL
    const weaponMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(weapon.skins[0]?.primaryColor || 0x22262e),
      roughness: 0.3,
      metalness: 0.85,
    });

    const glowColor = weapon.skins[0]?.glowColor;
    const accentMat = glowColor 
      ? new THREE.MeshBasicMaterial({ color: new THREE.Color(glowColor) })
      : new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });

    // Gun receiver / body
    const receiverGeom = new THREE.BoxGeometry(0.045, 0.08, 0.32);
    const receiver = new THREE.Mesh(receiverGeom, weaponMat);
    receiver.position.set(0.12, -0.11, -0.38);

    // Gun barrel & handguard
    const barrelLength = weapon.category === 'Sniper' ? 0.48 : weapon.category === 'SMG' ? 0.22 : 0.34;
    const barrelGeom = new THREE.CylinderGeometry(0.015, 0.018, barrelLength, 12);
    const barrel = new THREE.Mesh(barrelGeom, weaponMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.12, -0.09, -0.38 - barrelLength / 2 - 0.16);

    // Magazine
    const magGeom = new THREE.BoxGeometry(0.035, 0.14, 0.06);
    const mag = new THREE.Mesh(magGeom, weaponMat);
    mag.position.set(0.12, -0.18, -0.35);
    mag.rotation.x = 0.2;

    // Tactical Scope / Holographic Sight
    const sightGeom = new THREE.BoxGeometry(0.032, 0.045, 0.09);
    const sight = new THREE.Mesh(sightGeom, weaponMat);
    sight.position.set(0.12, -0.05, -0.36);

    const reticleGeom = new THREE.RingGeometry(0.008, 0.012, 16);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const reticle = new THREE.Mesh(reticleGeom, reticleMat);
    reticle.position.set(0.12, -0.048, -0.406);

    // Glowing skin accent line
    const skinAccentGeom = new THREE.BoxGeometry(0.046, 0.01, 0.26);
    const skinAccent = new THREE.Mesh(skinAccentGeom, accentMat);
    skinAccent.position.set(0.12, -0.09, -0.38);

    // Muzzle Flash
    const flashGeom = new THREE.OctahedronGeometry(0.055, 1);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0,
    });
    this.muzzleFlash = new THREE.Mesh(flashGeom, flashMat);
    this.muzzlePoint.set(0.12, -0.09, -0.38 - barrelLength - 0.18);
    this.muzzleFlash.position.copy(this.muzzlePoint);

    this.weaponGroup.add(receiver, barrel, mag, sight, reticle, skinAccent, this.muzzleFlash);

    // Combine everything into viewmodel root
    this.root.add(this.weaponGroup, this.leftArm, this.rightArm);
    this.root.position.set(0, 0, 0);
  }

  public triggerRecoil() {
    this.recoilOffset = 0.06;
    // Show muzzle flash for a split second
    (this.muzzleFlash.material as THREE.MeshBasicMaterial).opacity = 0.95;
    this.muzzleFlash.scale.set(1.4, 1.4, 2.2);
    setTimeout(() => {
      (this.muzzleFlash.material as THREE.MeshBasicMaterial).opacity = 0;
    }, 45);
  }

  public update(dt: number, isMoving: boolean, aimPitch: number) {
    // Smooth recoil decay
    if (this.recoilOffset > 0.001) {
      this.recoilOffset = THREE.MathUtils.lerp(this.recoilOffset, 0, dt * 14);
    } else {
      this.recoilOffset = 0;
    }

    // Walking weapon sway (breathing & footsteps in FP view)
    const time = performance.now() * 0.005;
    const swayAmountX = isMoving ? Math.sin(time * 1.5) * 0.015 : Math.sin(time * 0.5) * 0.003;
    const swayAmountY = isMoving ? Math.abs(Math.cos(time * 3)) * 0.015 : Math.cos(time * 0.5) * 0.003;

    this.weaponGroup.position.z = this.recoilOffset;
    this.weaponGroup.rotation.x = this.recoilOffset * 2;
    this.weaponGroup.position.x = swayAmountX;
    this.weaponGroup.position.y = -swayAmountY;

    this.rightArm.position.z = this.recoilOffset * 0.8;
    this.leftArm.position.z = this.recoilOffset * 0.6;
  }
}
