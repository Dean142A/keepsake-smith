'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './Experience';
import { UI } from './UI';
import { playBackgroundMusic, pauseBackgroundMusic } from './backgroundMusic';

export default function BookViewer({ personalization }) {
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

  if (!mounted) return null;

  return (
    <div style={styles.viewerContainer}>
      <UI personalization={personalization} />
      <Loader />
      
      {/* Audio Indicator Badge */}
      <div style={styles.audioPill} onClick={() => {
        if (musicActive) {
          pauseBackgroundMusic();
          setMusicActive(false);
        } else {
          playBackgroundMusic();
          setMusicActive(true);
        }
      }}>
        <span>{musicActive ? '🔊 Music On' : '🔈 Tap for Music'}</span>
      </div>

      <Canvas
        shadows
        camera={{
          position: [-50, 30, typeof window !== 'undefined' && window.innerWidth > 800 ? -30 : -40],
          fov: 45,
        }}
        style={{ width: '100%', height: '100%' }}
      >
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
    backgroundColor: '#0A0A0A',
    zIndex: 50,
  },
  audioPill: {
    position: 'fixed',
    top: '2rem',
    right: '2rem',
    zIndex: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
};
