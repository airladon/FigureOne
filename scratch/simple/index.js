const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure();

figure.add({
  make: 'gl',
  vertexShader: {
    dimension: 2,
    color: 'texture',
  },
  fragShader: {
    color: 'texture',
  },
  vertices: {
    data: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
  },
  // buffers: [
  //   {
  //     name: 'a_texcoord',
  //     data: [0, 0, 1, 0, 0, 1],
  //   },
  // ],
  texture: {
    src: './mic.png',
    mapTo: [0.25, 0, 0.5, 1],
  },
  // color: 'texture',
});
