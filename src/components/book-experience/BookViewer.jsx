'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './Experience';
import { UI } from './UI';
import { playBackgroundMusic, pauseBackgroundMusic } from './backgroundMusic';
import { normaliseExperience, buildSpreads } from '@/lib/keepsake';
import { useAtom } from 'jotai';
import { pageAtom } from './UI';

export default function BookViewer({ order, personalization, onExit }) {
  const [mounted, setMounted] = useState(false);
  const [musicActive, setMusicActive] = useState(false);
  const [, setPage] = useAtom(pageAtom);

  // The book is built from this order's own media, so its leaf count follows
  // however many photos were uploaded for the customer.
  const experience = useMemo(
    () => normaliseExperience(order || { customPhoto: personalization?.photo }),
    [order, personalization?.photo]
  );
  const leaves = useMemo(() => buildSpreads(experience), [experience]);

  // Reset to the closed cover whenever a different order is opened.
  useEffect(() => {
    setPage(0);
  }, [order?.id, setPage]);

  useEffect(() => {
    setMounted(true);

    const handleFirstInteraction = () => {
      playBackgroundMusic(experience.backgroundMusicUrl);
      setMusicActive(true);
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      pauseBackgroundMusic();
    };
  }, [experience.backgroundMusicUrl]);

  const toggleMusic = () => {
    if (musicActive) {
      pauseBackgroundMusic();
      setMusicActive(false);
    } else {
      playBackgroundMusic(experience.backgroundMusicUrl);
      setMusicActive(true);
    }
  };

  if (!mounted) return null;

  return (
    <div style={styles.viewerContainer}>
      <UI
        personalization={personalization}
        experience={experience}
        leafCount={leaves.length}
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
            <Experience leaves={leaves} />
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
