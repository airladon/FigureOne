// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure();

// figure.add({
//   make: 'gl',
//   // vertexShader: {
//   //   dimension: 2,
//   //   color: 'texture',
//   // },
//   // fragmentShader: {
//   //   color: 'texture',
//   // },
//   vertices: {
//     data: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
//   },
//   // attributes: [
//   //   {
//   //     name: 'a_vertex',
//   //     data: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
//   //   },
//   // ],
//   numVertices: 6,
//   texture: {
//     src: './mic.png',
//     // mapTo: [0.3, 0, 0.3333, 1],
//     // mapToBuffer: 'a_vertex',
//     coords: [-0.25, 0, 1.25, 0, -0.25, 1, 1.25, 0, 1.25, 1, -0.25, 1],
//     loadColor: [1, 1, 0, 0],
//     // mapToBuffer:
//   },
//   // color: [1, 0, 0, 0.5],
// });


// // Default options are 2D, uniform color, TRIANGLES.
// // Create two red triangles (6 vertices, 12 values)
// figure.add({
//   make: 'gl',
//   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
//   color: [1, 0, 0, 1],
// });

// // Simple moveable glGeneric element with a custom position
// figure.add({
//   make: 'gl',
//   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
//   color: [1, 0, 0, 1],
//   position: [-0.4, -0.4, 0],
//   move: { type: 'rotation' },
// });

// // Assign a color to each vertex
// figure.add({
//   make: 'gl',
//   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
//   colors: [
//     0, 0, 1, 1,
//     1, 0, 0, 1,
//     0, 0, 1, 1,
//     1, 0, 0, 1,
//     0, 0, 1, 1,
//     1, 0, 0, 1,
//   ],
// });

// // Assign a color to each vertex, using just 3 numbers per color (no alpha)
// figure.add({
//   make: 'gl',
//   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
//   colors: {
//     data: [
//       0, 0, 1,
//       1, 0, 0,
//       0, 0, 1,
//       1, 0, 0,
//       0, 0, 1,
//       1, 0, 0,
//     ],
//     size: 3,
//   },
// });

// // Make a 3D cube using composed shaders
// const [cubeVertices, cubeNormals] = Fig.tools.g2.cube({ side: 0.5 });
// figure.scene.setProjection({ style: 'orthographic' });
// figure.scene.setCamera({ position: [2, 1, 2] });
// figure.scene.setLight({ directional: [0.7, 0.5, 1] });
// figure.add({
//   make: 'gl',
//   light: 'directional',
//   dimension: 3,
//   vertices: cubeVertices,
//   normals: cubeNormals,
//   color: [1, 0, 0, 1],
// });

// // Custom shaders
// // Make a shader with a custom attribute aVertex and custom uniform uColor,
// // which are then defined in the options.
// // Note, the `u_worldViewProjectionMatrix` uniform does not need to be defined
// // as this will be passed by FigureOne using the Scene information of the
// // figure (or element if an element has a custom scene attached to it).
// figure.add({
//   make: 'gl',
//   vertexShader: {
//     src: `
//       uniform mat4 u_worldViewProjectionMatrix;
//       attribute vec4 aVertex;
//       void main() {
//         gl_Position = u_worldViewProjectionMatrixaVertex;
//       }`,
//     vars: ['aVertex', 'u_worldViewProjectionMatrix'],
//   },
//   fragmentShader: {
//     src: `
//     precision mediump float;
//     uniform vec4 uColor;
//     void main() {
//       gl_FragColor = uColor;
//       gl_FragColor.rgb gl_FragColor.a;
//     }`,
//     vars: ['uColor'],
//   },
//   attributes: [
//     {
//       name: 'aVertex',
//       size: 3,
//       data: [0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0.5, 0.5, 0],
//     },
//   ],
//   uniforms: [
//     {
//       name: 'uColor',
//       length: 4,
//       value: [1, 0, 0, 1],
//     },
//   ],
// });

// // 4 Cubes with texture on each face
// figure.scene.setProjection({ style: 'orthographic' });
// figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
// // figure.scene.setCamera({ position: [3, 0, 0.001], up: [0, 0, 1] });
// figure.scene.setLight({ directional: [0.7, 0.5, 1] });

// const { sphere, polygon, revolve } = Fig.tools.g2;
// const [spherePoints, sphereNormals] = sphere({ radius: 0.15, sides: 40 });

// const [ringPoints, ringNormals] = revolve({
//   profile: polygon({
//     close: true,
//     sides: 20,
//     radius: 0.05,
//     center: [0, 0.3],
//     direction: -1,
//     transform: ['s', 0.1, 1, 1],
//   }),
//   normals: 'curve',
//   sides: 50,
//   transform: ['dir', [0, 1, 0]],
// });

// const a = figure.add({
//   make: 'generic3',
//   points: [...spherePoints, ...ringPoints],
//   normals: [...sphereNormals, ...ringNormals],
//   color: [1, 0, 0, 1],
//   transform: ['xyz', 0, 0, 0],
// });

// figure.add({
//   make: 'sphere',
//   light: null,
//   radius: 0.9999,
//   // lines: true,
//   color: [1, 1, 1, 1],
//   sides: 50,
// });
// figure.add({
//   make: 'cylinder',
//   sides: 10,
//   radius: 0.2,
//   // lines: true,
//   // sides: 20,
//   // ends: false,
//   // rotation: 0.2,
//   color: [0, 0.6, 0, 1],
// });

// figure.add({
//   make: 'cylinder',
//   radius: 0.01,
//   line: [[0, 0, 0], [1, 0, 0]],
//   color: [1, 0, 0, 1],
// });
// figure.add({
//   make: 'cylinder',
//   radius: 0.01,
//   line: [[0, 0, 0], [0, 1, 0]],
//   color: [0, 0, 1, 1],
//   transform: ['s', 1, 1, 0.5],
// });
// figure.add({
//   make: 'cone',
//   radius: 0.03,
//   line: [[0, 1, 0], [0, 1.1, 0]],
//   color: [0, 0, 1, 1],
//   transform: ['s', 1, 1, 0.5],
// });
// figure.add({
//   make: 'cylinder',
//   radius: 0.01,
//   line: [[0, 0, 0], [0, 0, 1]],
//   color: [0, 1, 0, 1],
// });
// figure.add({
//   make: 'revolve',
//   profile: [[0, 0], [0.5, 0.1], [0.7, 0.05], [0.7, 0]],
//   color: [0, 1, 1, 1],
//   lines: true,
// });

// a.animations.new()
//   .rotation({ velocity: ['xyz', 0.05, 0.1, 0], duration: null })
//   .start();

// const x = Fig.range(-0.5, 0.5, 0.015);
// const y = Fig.range(-0.5, 0.5, 0.015);
// const rows = [];
// for (let i = 0; i < x.length; i += 1) {
//   const cols = [];
//   for (let j = 0; j < y.length; j += 1) {
//     cols.push(new Fig.Point(x[i], y[j], 0.05Math.cos(y[j]2Math.PI2)));
//   }
//   rows.push(cols);
// }

// figure.add({
//   make: 'surface',
//   name: 'surf',
//   color: [0, 0, 1, 0.9],
//   points: rows,
//   lines: true,
// });
// figure.add({
//   make: 'cone',
//   radius: 0.2,
//   normals: 'curve',
//   sides: 20,
//   color: [1, 0, 0, 1],
//   length: 0.5,
//   copy: [
//     { to: [['xyz', 0, Math.PI, 0], ['t', 0.5, 0, 0]], original: false },
//   ],
// });

// figure.add({
//   make: 'revolve',
//   profile: [[0, 0], [0, 0.05], [0.5, 0.05], [0.6, 0.1], [0.7, 0]],
//   axis: ['dir', 0, 1, 0],
//   color: [1, 0, 0, 1],
//   sides: 20,
// });

// Torus
// Use curve normals around radial sweep

// Wire mesh arrow
// const x = Fig.range(-0.5, 0.5, 0.05);
// const y = Fig.range(-0.5, 0.5, 0.05);

// const points = Fig.tools.g2.surfaceGrid({
//   x: [-0.8, 0.8, 0.03],
//   y: [-0.8, 0.8, 0.03],
//   z: (x, y) => {
//     // const r = Math.sqrt(x * x + y * y) * Math.PI * 2 * 2;
//     // return Math.sin(r) / r;
//     return  x * Math.exp((-(x ** 2) - y ** 2 ) * 3)
//   },
// });
// // // Surface with mesh and fill
// // const points = [];
// // for (let x = -0.8; x <= 0.8; x += 0.03) {
// //   const row = [];
// //   for (let y = -0.8; y <= 0.8; y += 0.03) {
// //     const r = Math.sqrt(x * x + y * y) * Math.PI * 2 * 2;
// //     row.push([x, y, Math.sin(r) / r]);
// //   }
// //   points.push(row);
// // }
// // Orient the camera so z is up
// figure.scene.setCamera({ position: [-1, -1, 0.7], up: [0, 0, 1] });
// // figure.add({
// //   make: 'surface',
// //   points,
// //   color: [1, 0, 0, 1],
// // });
// figure.add({
//   make: 'surface',
//   points,
//   lines: true,
//   color: [1, 0, 0, 1],
// });



// const points = Fig.tools.g2.surfaceGrid({
//   x: [-0.8, 0.8, 0.03],
//   y: [-0.8, 0.8, 0.03],
//   z: (x, y) => y * 0.2 * Math.cos(x * 2 * Math.PI),
// });
// figure.scene.setCamera({ position: [-1, -1, 0.7], up: [0, 0, 1] });
// figure.add({
//   make: 'surface',
//   points,
//   lines: true,
//   color: [1, 0, 0, 1],
// });
// figure.add({
//   make: 'gl',
//   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
//   color: [1, 0, 0, 1],
//   position: [-0.4, -0.4, 0],
//   move: { type: 'rotation' },
// });

// @example
// Simple rotatable element with a custom position
figure.add({
  make: 'gl',
  vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
  color: [1, 0, 0, 1],
  position: [-0.4, -0.4, 0],
  move: { type: 'rotation' },
});
// @example
// Assign a color to each vertex
// figure.add({
//   make: 'gl',
//   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
//   colors: [
//     0, 0, 1, 1,
//     1, 0, 0, 1,
//     0, 0, 1, 1,
//     1, 0, 0, 1,
//     0, 0, 1, 1,
//     1, 0, 0, 1,
//   ],
// });
// // @example
// // Assign a color to each vertex, using just 3 numbers per color (no alpha)
// figure.add({
//   make: 'gl',
//   vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
//   colors: {
//     data: [
//       0, 0, 1,
//       1, 0, 0,
//       0, 0, 1,
//       1, 0, 0,
//       0, 0, 1,
//       1, 0, 0,
//     ],
//     size: 3,
//   },
// });
// // @example
// // Texture filled square
// figure.add({
//   make: 'gl',
//   vertices: [-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5],
//   numVertices: 6,
//   texture: {
//     src: './flower.jpeg',
//     coords: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
//     loadColor: [0, 0, 0, 0],
//   },
// });
// // @example
// // Make a 3D cube using composed shaders
// const { toNumbers } = Fig.tools.g2;
// const [cubeVertices, cubeNormals] = Fig.tools.g2.cube({ side: 0.5 });
// figure.scene.setProjection({ style: 'orthographic' });
// figure.scene.setCamera({ position: [2, 1, 2] });
// figure.scene.setLight({ directional: [0.7, 0.5, 1] });

// figure.add({
//   make: 'gl',
//   light: 'directional',
//   dimension: 3,
//   vertices: toNumbers(cubeVertices),
//   normals: toNumbers(cubeNormals),
//   color: [1, 0, 0, 1],
// });
// @example
// Custom shaders
// Make a shader with a custom attribute aVertex and custom uniform uColor,
// which are then defined in the options.
// Note, the `u_worldViewProjectionMatrix` uniform does not need to be defined
// as this will be passed by FigureOne using the Scene information of the
// figure (or element if an element has a custom scene attached to it).
// figure.add({
//   make: 'gl',
//   vertexShader: {
//     src: `
//       uniform mat4 u_worldViewProjectionMatrix;
//       attribute vec4 aVertex;
//       void main() {
//         gl_Position = u_worldViewProjectionMatrix * aVertex;
//       }`,
//     vars: ['aVertex', 'u_worldViewProjectionMatrix'],
//   },
//   fragmentShader: {
//     src: `
//     precision mediump float;
//     uniform vec4 uColor;
//     void main() {
//       gl_FragColor = uColor;
//       gl_FragColor.rgb *= gl_FragColor.a;
//     }`,
//     vars: ['uColor'],
//   },
//   attributes: [
//     {
//       name: 'aVertex',
//       size: 3,
//       data: [0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0.5, 0.5, 0],
//     },
//   ],
//   uniforms: [
//     {
//       name: 'uColor',
//       length: 4,
//       value: [1, 0, 0, 1],
//     },
//   ],
// });