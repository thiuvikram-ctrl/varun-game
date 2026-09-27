import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterRosterItem } from '../types/characterRoster';
import { RealisticAnimeCharacterModel } from '../utils/characterModel3D';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles } from 'lucide-react';

interface LobbyCharacterViewer3DProps {
  character: CharacterRosterItem;
}

export const LobbyCharacterViewer3D: React.FC<LobbyCharacterViewer3DProps> = ({ character }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'body' | 'portrait'>('body');
  const rotationRef = useRef({ yaw: 0.15, isDragging: false, startX: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    
    // Position camera based on zoomLevel
    if (zoomLevel === 'portrait') {
      camera.position.set(0, 1.76, 1.15); // Close-up on illustrated Chitra face and Roblox head
    } else {
      camera.position.set(0, 1.25, 2.75); // Full body showcase of Roblox dress and avatar
    }
    camera.lookAt(0, zoomLevel === 'portrait' ? 1.76 : 1.2, 0);

    // 2. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Studio Daylight & Dramatic Rimlights for Roblox Avatar
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.6);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.6);
    rimLight.position.set(-2.5, 3, -2);
    scene.add(rimLight);

    const goldenFill = new THREE.DirectionalLight(0xf59e0b, 1.5);
    goldenFill.position.set(2, 1, -2);
    scene.add(goldenFill);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // 4. Character 3D Model Instance
    const model = new RealisticAnimeCharacterModel(character, false);
    model.root.position.set(0, 0, 0);
    model.root.rotation.y = rotationRef.current.yaw;
    scene.add(model.root);

    // Subtle showroom pedestal
    const pedestalGeom = new THREE.CylinderGeometry(0.7, 0.75, 0.08, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.3,
      metalness: 0.8,
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.y = -0.04;
    scene.add(pedestal);

    const ringGeom = new THREE.RingGeometry(0.71, 0.74, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.005;
    scene.add(ring);

    // Mouse drag rotation listeners
    const handleMouseDown = (e: MouseEvent) => {
      rotationRef.current.isDragging = true;
      rotationRef.current.startX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!rotationRef.current.isDragging) return;
      const dx = e.clientX - rotationRef.current.startX;
      rotationRef.current.startX = e.clientX;
      rotationRef.current.yaw += dx * 0.01;
      model.root.rotation.y = rotationRef.current.yaw;
    };

    const handleMouseUp = () => {
      rotationRef.current.isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        rotationRef.current.isDragging = true;
        rotationRef.current.startX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!rotationRef.current.isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - rotationRef.current.startX;
      rotationRef.current.startX = e.touches[0].clientX;
      rotationRef.current.yaw += dx * 0.01;
      model.root.rotation.y = rotationRef.current.yaw;
    };

    const handleTouchEnd = () => {
      rotationRef.current.isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();
      model.updateAnimation(time, false);

      // Slow gentle auto-rotation when user is not dragging
      if (!rotationRef.current.isDragging) {
        rotationRef.current.yaw += 0.003;
        model.root.rotation.y = rotationRef.current.yaw;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [character, zoomLevel]);

  return (
    <div className="relative w-full h-[360px] md:h-[460px] flex items-center justify-center">
      {/* 3D WebGL Canvas container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Drag horizontally to rotate 3D anime operative 360°"
      />

      {/* Floating 3D Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-800">
        <button
          onClick={() => setZoomLevel(z => (z === 'body' ? 'portrait' : 'body'))}
          className={`p-2 rounded flex items-center gap-1.5 text-[10px] font-tactical font-bold transition-all ${
            zoomLevel === 'portrait'
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Zoom in on illustrated Chitra face & Roblox head"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{zoomLevel === 'portrait' ? 'CHITRA FACE & HEAD' : 'INSPECT CHITRA FACE'}</span>
        </button>

        <div className="text-[9px] text-center text-slate-500 font-tactical">
          DRAG TO ROTATE 360°
        </div>
      </div>
    </div>
  );
};
