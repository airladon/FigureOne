// // Tutorial 20 - 3D
// const figure = new Fig.Figure({ scene: { style: 'orthographic' } });

// figure.add([
//   // Add x, y, z axes
//   {
//     make: 'collections.axis3',
//     start: -0.8,
//     length: 1.6,
//     arrow: { ends: 'all' },
//     width: 0.01,
//   },
//   // Add a cube at the origin
//   {
//     make: 'cube',
//     side: 0.3,
//     color: [1, 0, 0, 1],
//   },
//   // Allow user to rotate the scene
//   {
//     make: 'cameraControl',
//   },
// ]);


// // Tutorial 21 - 3D Surface
// const { Figure, surfaceGrid } = Fig;

// // Orthographic scene with camera oriented so z is up
// const figure = new Figure({
//   scene: {
//     style: 'orthographic',
//     camera: { up: [0, 0, 1] },
//   },
// });

// // Surface with wire mesh and fill
// const points = surfaceGrid({
//   x: [-0.8, 0.8, 0.02],
//   y: [-0.8, 0.8, 0.02],
//   z: (x, y) => {
//     const r = Math.sqrt(x * x + y * y) * Math.PI * 2 * 2;
//     return 0.9 * Math.sin(r) / r;
//   },
// });

// // Bug in Scene where this needs to be here - fix BUG!!!
// figure.add([
//   {
//     make: 'surface',
//     points,
//     color: [1, 0, 0, 1],
//     normals: 'curve',
//   },
//   {
//     make: 'surface',
//     points,
//     lines: true,
//     color: [0, 0, 0, 1],
//     position: [0, 0, 0.001],
//   },
//   { make: 'cameraControl', axis: [0, 0, 1] },
// ]);



// Tutorial 21 - 3D - Interactive cube
const { Figure, round } = Fig;
const figure = new Figure({
  // color: [1, 0, 0, 1],
  // backgroundColor: [0, 0, 0, 1]
});

// Simple button
const button = figure.add({
  make: 'collections.button',
  states: ['Slow', 'Medium', 'Fast'],
  width: 0.7,
  height: 0.3,
});

button.notifications.add('touch', (index) => {
  console.log(index);
});