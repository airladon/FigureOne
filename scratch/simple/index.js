const { polygon } = Fig.tools.g2;

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

// 4 Cubes with texture on each face
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [1, 1, 2] });
figure.scene.setLight({ directional: [0.7, 0.5, 1] });

const [points, normals] = Fig.tools.g2.sphere({ side: 0.2, radius: 0.1, sides: 6, normals: 'flat' });

console.log(Fig.tools.g2.polygon({ radius: 0.3, sides: 5, transform: [['dir', [0, 1, 0]]] }))
figure.add({
  make: 'generic3',
  points,
  normals,
  color: [1, 0, 0, 1],
  copy: [
    // { along: 'x', num: 2, step: 0.4 },
    { to: Fig.tools.g2.polygon({ radius: 0.3, sides: 5, center: [0.5, 0, 0] }) },
    // { to: [[0.5, 0, 0], [0, 0, -0.5], [-.5, 0, -0.5]]}
  ],
});

figure.add({
  make: 'rod',
  radius: 0.01,
  line: [[0, 0, 0], [1, 0, 0]],
  color: [1, 0, 0, 1],
});
figure.add({
  make: 'rod',
  radius: 0.01,
  line: [[0, 0, 0], [0, 1, 0]],
  color: [0, 0, 1, 1],
});
figure.add({
  make: 'rod',
  radius: 0.01,
  line: [[0, 0, 0], [0, 0, 1]],
  color: [0, 1, 0, 1],
});
