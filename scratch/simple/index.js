const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure();

// figure.add({
//   make: 'gl',
//   vertexShader: {
//     dimension: 2,
//     color: 'texture',
//   },
//   fragmentShader: {
//     color: 'texture',
//   },
//   // vertices: {
//   //   data: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
//   // },
//   attributes: [
//     {
//       name: 'a_vertex',
//       data: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
//     },
//   ],
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


// Default options are 2D, uniform color, TRIANGLES.
// Create two red triangles (6 vertices, 12 values) next to each other
figure.add({
  make: 'gl',
  vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
  color: [1, 0, 0, 1],
});
