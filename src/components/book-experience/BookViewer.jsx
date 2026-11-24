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
  const [isNarrow, setIsNarrow] = useState(false);
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
    setIsNarrow(typeof window !== 'undefined' && window.innerWidth < 800);
    setMounted(true);

    let cancelled = false;

    // Start the score straight away. Redeeming a code is itself a gesture, so
    // the browser normally permits this; the listener below only matters for a
    // recipient who arrived on a direct ?code= link. musicActive follows what
    // actually happened, so the control never claims sound that isn't playing.
    const start = () => {
      playBackgroundMusic(experience.backgroundMusicUrl)
        .then(() => {
          if (!cancelled) setMusicActive(true);
        })
        .catch(() => {
          if (!cancelled) setMusicActive(false);
        });
    };

    start();
    window.addEventListener('click', start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('click', start);
      pauseBackgroundMusic();
    };
  }, [experience.backgroundMusicUrl]);

  const toggleMusic = () => {
    if (musicActive) {
      pauseBackgroundMusic();
      setMusicActive(false);
      return;
    }
    playBackgroundMusic(experience.backgroundMusicUrl)
      .then(() => setMusicActive(true))
      .catch(() => setMusicActive(false));
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
          // Phones need to stand further back to fit the book in a narrow
          // viewport; OrbitControls takes the camera from here.
          position: isNarrow ? [0, 1.1, 7.2] : [-0.5, 1, 4.2],
          fov: 45,
          // The book is about two units tall and the rig settles four units
          // away, so a tight frustum spends the depth buffer where it is
          // actually needed instead of on empty space out to 1000.
          near: 0.5,
          far: 60,
        }}
        // Without this the browser claims pinch and drag for page scrolling.
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
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
