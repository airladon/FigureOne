
const { Figure, surfaceGrid } = Fig;

// Orthographic scene with camera oriented so z is up
const figure = new Figure({
  scene: {
    style: 'orthographic',
    camera: { up: [0, 0, 1] },
  },
});

// Compute surface points
const points = surfaceGrid({
  x: [-0.8, 0.8, 0.02],
  y: [-0.8, 0.8, 0.02],
  z: (x, y) => {
    const r = Math.sqrt(x * x + y * y) * Math.PI * 2 * 2;
    return 0.9 * Math.sin(r) / r;
  },
});

figure.add([
  // Create a surface fill
  {
    make: 'surface',
    points,
    color: [1, 0, 0, 1],
    normals: 'curve',
  },
  // Create a surface wire mesh
  {
    make: 'surface',
    points,
    lines: true,
    color: [0, 0, 0, 1],
    position: [0, 0, 0.001],
  },
  // Add a camera control
  { make: 'cameraControl', axis: [0, 0, 1] },
]);
