/* globals Fig */
function makeFigure(backgroundColor, htmlId) {
  const figure = new Fig.Figure({ backgroundColor, htmlId });

  const text = (index, position, opacity) => ({
    name: `text${index}`,
    method: 'text',
    options: {
      text: 'L',
      font: { weight: '900' },
      position,
      color: [1, 0, 0, opacity],
    },
  });
  const square = (index, position, opacity, height = 0.2, width = 0.2) => ({
    name: `square${index}`,
    method: 'rectangle',
    options: {
      width,
      height,
      position,
      color: [1, 0, 0, opacity],
    },
  });

  const texture = (index, src, position, opacity, height = 0.4, width = 0.4) => ({
    name: `texture${index}`,
    method: 'rectangle',
    options: {
      width,
      height,
      position,
      texture: {
        src: `http://localhost:8080/src/tests/transparency/${src}`,
        mapTo: [-width / 2, -height / 2, width, height],
      },
    },
    mods: {
      opacity,
    },
  });

  figure.add([
    {
      name: '__minorGrid',
      method: 'primitives.grid',
      options: {
        position: [0, 0],
        color: [0.9, 0.9, 0.9, 1],
        line: { width: 0.005 },
        xStep: 0.1,
        yStep: 0.1,
        bounds: figure.limits._dup(),
      },
    },
    {
      name: '__majorGrid',
      method: 'primitives.grid',
      options: {
        position: [0, 0],
        color: [0.9, 0.9, 0.9, 1],
        line: { width: 0.005 },
        xStep: 0.5,
        yStep: 0.5,
        bounds: figure.limits._dup(),
      },
    },

    square('100', [-0.85, 0.5], 1, 1, 0.1),
    text('w1', [-0.815, 0.8], 1),
    text('bk1', [-0.815, 0.6], 1),
    text('r1', [-0.815, 0.4], 1),
    text('g1', [-0.815, 0.2], 1),
    text('b1', [-0.815, 0], 1),

    square('75', [-0.55, 0.5], 0.75, 1, 0.1),
    text('w2', [-0.515, 0.8], 0.75),
    text('bk2', [-0.515, 0.6], 0.75),
    text('r2', [-0.515, 0.4], 0.75),
    text('g2', [-0.515, 0.2], 0.75),
    text('b2', [-0.515, 0], 0.75),

    square('50', [-0.25, 0.5], 0.5, 1, 0.1),
    text('w3', [-0.215, 0.8], 0.5),
    text('bk3', [-0.215, 0.6], 0.5),
    text('r3', [-0.215, 0.4], 0.5),
    text('g3', [-0.215, 0.2], 0.5),
    text('b3', [-0.215, 0], 0.5),

    square('25', [0.05, 0.5], 0.25, 1, 0.1),
    text('w4', [0.085, 0.8], 0.25),
    text('bk4', [0.085, 0.6], 0.25),
    text('r4', [0.085, 0.4], 0.25),
    text('g4', [0.085, 0.2], 0.25),
    text('b4', [0.085, 0], 0.25),

    texture('g1', 'gradient.png', [0.75, 0.5], 1, 1, 0.09),
    texture('p1', 'solid.png', [0.85, 0.5], 0.5, 1, 0.09),
    texture('j1', 'solid.jpg', [0.95, 0.5], 0.5, 1, 0.09),


    texture(0, 'gradient.png', [-0.8, -0.5], 1, 1, 0.2),
    texture(1, 'solid.png', [-0.6, -1], 1, 0.1, 0.2),
    texture(2, 'solid.png', [-0.6, -0.9], 0.9, 0.08, 0.2),
    texture(3, 'solid.png', [-0.6, -0.8], 0.8, 0.08, 0.2),
    texture(4, 'solid.png', [-0.6, -0.7], 0.7, 0.08, 0.2),
    texture(5, 'solid.png', [-0.6, -0.6], 0.6, 0.08, 0.2),
    texture(6, 'solid.png', [-0.6, -0.5], 0.5, 0.08, 0.2),
    texture(7, 'solid.png', [-0.6, -0.4], 0.4, 0.08, 0.2),
    texture(8, 'solid.png', [-0.6, -0.3], 0.3, 0.08, 0.2),
    texture(9, 'solid.png', [-0.6, -0.2], 0.2, 0.08, 0.2),
    texture(10, 'solid.png', [-0.6, -0.1], 0.1, 0.08, 0.2),

    texture(11, 'solid.png', [-0.3, -0.9], 1, 0.2, 0.2),
    texture(13, 'solid.jpg', [-0.3, -0.7], 1, 0.2, 0.2, 0.2),
    texture(12, 'solid.png', [-0.3, -0.5], 0.5, 0.2, 0.2, 0.2),
    texture(14, 'solid.jpg', [-0.3, -0.3], 0.5, 0.2, 0.2, 0.2),
    texture(15, 'border.png', [0.75, -0.8], 1),

    square(7, [-0.05, -0.65], 1, 0.1, 0.1),
    square(8, [0.35, -0.65], 0.5, 0.1, 0.1),
    texture(16, 'gradient.png', [0.15, -0.65], 1, 0.7),
    square(9, [0.08, -0.65], 1, 0.1, 0.1),
    square(10, [0.22, -0.65], 0.5, 0.1, 0.1),

    square('ov1', [0.35, 0.5], 1, 1, 0.15),
    square('ov2', [0.45, 0.5], 0.5, 1, 0.15),
    square('ov3', [0.55, 0.5], 0.5, 1, 0.15),

    square('ov1s', [0.5, -0.3], 1, 0.4),
    square('ov2s', [0.65, -0.35], 0.5, 0.3, 0.3),
    square('ov3s', [0.8, -0.4], 0.5, 0.2),
  ]);
}

const figure1 = makeFigure([1, 1, 1, 1], 'figureOneContainer1');
const figure2 = makeFigure([1, 1, 1, 0], 'figureOneContainer2');
