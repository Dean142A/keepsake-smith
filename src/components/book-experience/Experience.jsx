'use client';

import React, { useEffect } from 'react';
import { Environment, Float, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Book } from './Book';
import { bookControls } from './viewerControls';

const ControlsBinding = () => {
  const controls = useThree((state) => state.controls);

  useEffect(() => {
    bookControls.current = controls || null;
    return () => {
      bookControls.current = null;
    };
  }, [controls]);

  return null;
};

export const Experience = ({ leaves = [] }) => {
  return (
    <>
      <OrbitControls
        makeDefault
        // Panning lets people lose the book off-screen with nothing to grab;
        // rotation and distance are enough to read any page closely.
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.8}
        // Close enough to read a caption, far enough to see the whole book.
        minDistance={1.6}
        maxDistance={9}
        // Stay above the shadow plane; looking up from underneath is just the
        // underside of a page.
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 + 0.22}
        target={[0, 0, 0]}
      />
      <ControlsBinding />

      <Float
        rotation-x={-Math.PI / 8}
        floatIntensity={0.3}
        speed={2}
        rotationIntensity={0.5}
      >
        <Book leaves={leaves} />
      </Float>
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={0.00005}
      />
      <directionalLight position={[-4, 5, -4]} intensity={1.0} />
      <Environment preset="studio" />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
