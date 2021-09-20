// Create a figure with an orthographic scene
const figure = new Fig.Figure({ scene: { style: 'orthographic' } });

figure.add([
  // Add x, y, z axes
  {
    make: 'collections.axis3',
    start: -0.8,
    length: 1.6,
    arrow: { ends: 'all' },
    width: 0.01,
  },
  // Add a cube at the origin
  {
    make: 'cube',
    side: 0.3,
    color: [1, 0, 0, 1],
  },
  // Allow user to rotate the scene
  {
    make: 'cameraControl',
  },
]);
