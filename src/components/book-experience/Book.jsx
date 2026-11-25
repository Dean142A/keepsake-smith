'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCursor } from '@react-three/drei';
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
  Uint16BufferAttribute,
  Vector3,
} from 'three';
import { pageAtom } from './UI';
import { usePageTextures } from './pageTexture';

const easingFactor = 1.0;
const easingFactorFold = 0.6;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;
const TURN_ANIMATION_DURATION = 400;
// How far a pointer may travel and still count as a tap rather than a drag.
const DRAG_SLOP_PX = 6;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.008;
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
  const skinIndex = Math.min(PAGE_SEGMENTS - 1, Math.max(0, Math.floor(x / SEGMENT_WIDTH)));
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndexes.push(skinIndex, Math.min(PAGE_SEGMENTS, skinIndex + 1), 0, 0);
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

/**
 * `front` and `back` are face descriptors for this order's leaf: either a
 * photo (a CDN-hosted customer image plus its caption) or the letter. Both
 * are composited into the texture by usePageTextures, so the words bend with
 * the paper instead of floating over it.
 */
const Page = ({
  number,
  front,
  back,
  totalLeaves,
  page,
  opened,
  bookClosed,
  ...props
}) => {
  const [picture, picture2] = usePageTextures(front, back);
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

    // Every leaf sits at the same place, separated only by a fraction of a
    // degree of fan. Polygon offset decides the order explicitly rather than
    // leaving it to depth-buffer precision, which is what tore the artwork
    // into vertical bands and let a back cover win over a photo.
    // Covers read as board rather than paper, so they take a slightly lower
    // roughness. The map that used to do this was a texture carrying another
    // project's watermark, which showed through on the cover of every gift.
    const faceMaterial = (isOuter) =>
      new MeshStandardMaterial({
        color: whiteColor,
        roughness: isOuter ? 0.72 : 1,
        emissive: emissiveColor,
        emissiveIntensity: 0,
        polygonOffset: true,
        polygonOffsetFactor: 0,
        polygonOffsetUnits: 0,
      });

    const materials = [
      ...pageMaterials,
      faceMaterial(number === 0),
      faceMaterial(number === totalLeaves - 1),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [number, totalLeaves]);

  // Attach the composited artwork to the long-lived materials.
  useEffect(() => {
    const materials = manualSkinnedMesh.material;
    materials[4].map = picture;
    materials[4].needsUpdate = true;
    materials[5].map = picture2;
    materials[5].needsUpdate = true;
  }, [manualSkinnedMesh, picture, picture2]);

  // Free this leaf's GPU resources when the book closes or the order changes.
  useEffect(
    () => () => {
      manualSkinnedMesh.material.forEach((m, i) => {
        if (i >= 4) m.dispose();
      });
    },
    [manualSkinnedMesh]
  );

  const pointerStart = useRef(null);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  const [_, setPage] = useAtom(pageAtom);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    // Leaves already turned stack upwards on the left; leaves still to come
    // stack downwards on the right. Re-derive the order each frame because it
    // inverts the moment a page is turned.
    const depthRank = opened ? number : totalLeaves - number;
    for (const i of [4, 5]) {
      const mat = skinnedMeshRef.current.material[i];
      mat.polygonOffsetFactor = -depthRank;
      mat.polygonOffsetUnits = -depthRank;
    }

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

    let targetRotation = opened ? -Math.PI : 0;
    if (!bookClosed) {
      // The fan is what physically separates leaves that otherwise occupy the
      // same plane, so its direction decides which one the viewer sees. On
      // each side the leaf nearest the middle of the book must tilt furthest
      // towards the camera: the next unread page on the right, the page just
      // turned on the left. Fanning the other way buried the current page
      // under the rest of the stack.
      targetRotation = opened
        ? -Math.PI + (number + 1) * 0.005
        : -(totalLeaves - number) * 0.005;
    } else {
      targetRotation = opened ? -Math.PI : 0;
    }

    const bones = skinnedMeshRef.current.skeleton.bones;

    // Animate root bone Y rotation smoothly
    if (bones[0]) {
      easing.dampAngle(
        bones[0].rotation,
        'y',
        targetRotation,
        easingFactor,
        delta
      );
    }

    // Stack the leaves through the book's thickness. Until now every leaf sat
    // in the same plane and only a fraction of a degree of fan kept them
    // apart, which is why surfaces tore into each other when the book was
    // turned side-on. One page-depth per leaf is what a real book does: the
    // sheets touch, and no two faces are ever coplanar.
    if (group.current) {
      const fromTop = opened ? page - 1 - number : number - page;
      easing.damp(
        group.current.position,
        'z',
        -Math.max(0, fromTop) * PAGE_DEPTH,
        0.22,
        delta
      );
    }

    // Bend the leaf as it turns. The curve travels from the spine out to the
    // edge rather than the whole sheet pivoting rigidly: a stiff inner curve
    // near the binding, a softer one towards the fore-edge, and a wave that
    // runs along the page over the course of the turn.
    const bendDirection = opened ? -1 : 1;
    const lastBone = bones.length - 1;

    bones.forEach((bone, index) => {
      if (index === 0) return;

      let rotationAngle = 0;
      let foldAngle = 0;

      if (!bookClosed) {
        const along = index / lastBone; // 0 at the spine, 1 at the fore-edge
        const inside = insideCurveStrength * Math.sin(along * Math.PI);
        const outside = outsideCurveStrength * Math.cos(along * Math.PI * 0.5);
        const travelling =
          turningCurveStrength * Math.sin(along * Math.PI * 1.5 - turningTime * Math.PI);

        rotationAngle = bendDirection * (inside + outside + travelling) * turningTime;
        // A little lift across the sheet so a turning page is not a flat plane.
        foldAngle = bendDirection * Math.sin(along * Math.PI) * turningTime * 0.05;
      }

      easing.dampAngle(bone.rotation, 'y', rotationAngle, easingFactorFold, delta);
      easing.dampAngle(bone.rotation, 'x', foldAngle, easingFactorFold, delta);
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
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        e.stopPropagation();
        // A drag that rotates the book ends in a click on whatever is under
        // the finger. Only treat it as a page turn if the pointer stayed put.
        const start = pointerStart.current;
        const moved =
          start &&
          Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_SLOP_PX;
        pointerStart.current = null;
        if (moved) return;

        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  );
};

/**
 * `leaves` comes from buildSpreads() for this specific order, so the book has
 * exactly as many leaves as the customer's photos require.
 */
export const Book = ({ leaves = [], ...props }) => {
  const [page] = useAtom(pageAtom);

  return (
    <group {...props} rotation-y={-Math.PI / 6}>
      {leaves.map((leaf, index) => (
        <Page
          key={`${index}-${leaf.front?.imageUrl || leaf.front?.kind}`}
          number={index}
          totalLeaves={leaves.length}
          page={page}
          opened={page > index}
          bookClosed={page === 0 || page === leaves.length}
          front={leaf.front}
          back={leaf.back}
        />
      ))}
    </group>
  );
};
