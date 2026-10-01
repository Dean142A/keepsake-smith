'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './Experience';
import { UI } from './UI';
import { playBackgroundMusic, pauseBackgroundMusic } from './backgroundMusic';

export default function BookViewer({ personalization, onExit }) {
  const [mounted, setMounted] = useState(false);
  const [musicActive, setMusicActive] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleFirstInteraction = () => {
      playBackgroundMusic();
      setMusicActive(true);
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      pauseBackgroundMusic();
    };
  }, []);

  const toggleMusic = () => {
    if (musicActive) {
      pauseBackgroundMusic();
      setMusicActive(false);
    } else {
      playBackgroundMusic();
      setMusicActive(true);
    }
  };

  if (!mounted) return null;

  return (
    <div style={styles.viewerContainer}>
      <UI
        personalization={personalization}
        onExit={onExit}
        musicActive={musicActive}
        onToggleMusic={toggleMusic}
      />
      <Loader />

      <Canvas
        shadows
        camera={{
          position: [0, 1.5, 5.5],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#0D0D0D']} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 8, 4]} intensity={2.5} castShadow />
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </div>
  );
}

const styles = {
  viewerContainer: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0D0D0D',
    zIndex: 50,
  },
};
