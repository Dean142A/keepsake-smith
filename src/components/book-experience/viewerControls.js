'use client';

/**
 * A shared handle between the 3D scene and the DOM overlay.
 *
 * This lives in its own module so UI.jsx can reach it without importing
 * Experience.jsx, which imports Book.jsx in turn.
 */

/** The live OrbitControls instance, so the overlay can reset the view. */
export const bookControls = { current: null };
