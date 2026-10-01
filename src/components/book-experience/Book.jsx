'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCursor, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { easing } from 'maath';
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from 'three';
import { pageAtom, pages } from './UI';

const easingFactor = 1.0;
const easingFactorFold = 0.6;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;
const TURN_ANIMATION_DURATION = 400;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;
  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
  'skinIndex',
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  'skinWeight',
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color('white');
const emissiveColor = new Color('orange');

const pageMaterials = [
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: '#111' }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: whiteColor }),
];

// Preload static texture maps
if (typeof window !== 'undefined') {
  pages.forEach((page) => {
    useTexture.preload(`/textures/${page.front}.jpg`);
    useTexture.preload(`/textures/${page.back}.jpg`);
  });
  useTexture.preload(`/textures/book-cover-roughness.jpg`);
}

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length - 1
      ? [`/textures/book-cover-roughness.jpg`]
      : []),
  ]);

  useEffect(() => {
    if (picture) {
      picture.colorSpace = SRGBColorSpace;
      picture.needsUpdate = true;
    }
    if (picture2) {
      picture2.colorSpace = SRGBColorSpace;
      picture2.needsUpdate = true;
    }
  }, [picture, picture2]);

  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(number === 0
          ? { roughnessMap: pictureRoughness }
          : { roughness: 1 }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(number === pages.length - 1
          ? { roughnessMap: pictureRoughness }
          : { roughness: 1 }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [number, picture, picture2, pictureRoughness]);

  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  const [_, setPage] = useAtom(pageAtom);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity = MathUtils.lerp(
      skinnedMeshRef.current.material[4].emissiveIntensity,
      emissiveIntensity,
      0.1
    );
    skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
      skinnedMeshRef.current.material[5].emissiveIntensity,
      emissiveIntensity,
      0.1
    );

    if (lastOpened.current !== opened) {
      turnedAt.current = Date.now();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(
      (Date.now() - turnedAt.current) / TURN_ANIMATION_DURATION,
      1
    );

    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += opened ? number * 0.005 : -number * 0.005;
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    let foldRotationAngle =
      MathUtils.degToRad(Math.sin(turningTime * Math.PI) * 50) *
      (opened ? -1 : 1);

    if (bookClosed) {
      if (opened) {
        targetRotation = -Math.PI;
        foldRotationAngle = 0;
      } else {
        targetRotation = 0;
        foldRotationAngle = 0;
      }
    }

    if (group.current) {
      easing.dampAngle(
        group.current.rotation,
        'y',
        targetRotation,
        easingFactor,
        delta
      );
    }

    const foldIntensity =
      number === 0
        ? Math.sin(turningTime * Math.PI) * 0.2
        : number === pages.length - 1
        ? Math.sin(turningTime * Math.PI) * 0.2
        : 1;

    bones.forEach((bone, index) => {
      if (index === 0) {
        bone.rotation.y = group.current ? group.current.rotation.y : 0;
        return;
      }

      let rotationAngle =
        insideCurveStrength * Math.sin(index * 0.2 + turningTime * Math.PI);

      if (bookClosed) {
        rotationAngle = 0;
      }

      easing.dampAngle(
        bone.rotation,
        'y',
        rotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    });
  });

  return (
    <group
      ref={group}
      {...props}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);

  return (
    <group {...props} rotation-y={-Math.PI / 6}>
      {pages.map((pageData, index) => (
        <Page
          key={index}
          number={index}
          opened={page > index}
          bookClosed={page === 0 || page === pages.length}
          {...pageData}
        />
      ))}
    </group>
  );
};
