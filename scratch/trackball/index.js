/* globals Fig */
// Set the 3D scene via the constructor so figure.scene AND figure.elements.scene
// are wired consistently (assigning figure.scene after construction does not
// update elements.scene, which renders the cube through the default 2D scene).
const figure = new Fig.Figure({
  scene: {
    style: 'orthographic',
    near: 0.1,
    far: 10,
    camera: { position: [1, 0.6, 1.5], lookAt: [0, 0, 0], up: [0, 1, 0] },
    light: { directional: [0.7, 0.5, 1], ambient: 0.4 },
  },
});

const cube = figure.add({
  make: 'cube',
  side: 0.6,
  color: [1, 0, 0, 1],
  light: 'directional', // must NOT be null, or shading won't change
});

// Drag anywhere to rotate the cube. Same motion as `cameraControl`, but the
// object turns (under the fixed light) instead of the camera orbiting.
// controlElement MUST point at the object to rotate - without it the control
// rotates its parent (here the root collection, i.e. everything).
figure.add({ make: 'rotateControl', controlElement: cube });
