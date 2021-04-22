/* globals Fig */
const figure = new Fig.Figure({ backgroundColor: [1, 1, 1, 0] });

const text = (index, position, opacity) => ({
  name: `text${index}`,
  method: 'text',
  options: {
    text: `a${index}`,
    font: { weight: '900' },
    position,
    color: [1, 0, 0, opacity],
  },
});
const square = (index, position, opacity, side = 0.2) => ({
  name: `square${index}`,
  method: 'rectangle',
  options: {
    width: side,
    height: side,
    position,
    color: [1, 0, 0, opacity],
  },
});

const texture = (index, src, position, opacity, height = 0.4) => ({
  name: `texture${index}`,
  method: 'rectangle',
  options: {
    width: 0.4,
    height,
    position,
    texture: {
      src: `http://localhost:8080/src/tests/transparency/${src}`,
      mapTo: [-0.2, -height / 2, 0.4, height],
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
      line: { width: 0.004 },
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
  text(0, [-1, 0.8], 1),
  text(1, [-0.5, 0.8], 0.75),
  text(2, [0, 0.8], 0.5),
  text(3, [0.5, 0.8], 0.25),
  square(0, [-0.9, 0.7], 1),
  square(1, [-0.4, 0.7], 0.75),
  square(2, [0.1, 0.7], 0.5),
  square(3, [0.6, 0.7], 0.25),

  square(4, [-0.9, 0.4], 1),
  square(5, [-0.75, 0.35], 0.5),
  square(6, [-0.6, 0.3], 0.5),


  texture(0, 'gradient.png', [-0.75, -0.5], 1, 1),
  texture(1, 'solid.png', [-0.35, -1], 1, 0.1),
  texture(2, 'solid.png', [-0.35, -0.9], 0.9, 0.08),
  texture(3, 'solid.png', [-0.35, -0.8], 0.8, 0.08),
  texture(4, 'solid.png', [-0.35, -0.7], 0.7, 0.08),
  texture(5, 'solid.png', [-0.35, -0.6], 0.6, 0.08),
  texture(6, 'solid.png', [-0.35, -0.5], 0.5, 0.08),
  texture(7, 'solid.png', [-0.35, -0.4], 0.4, 0.08),
  texture(8, 'solid.png', [-0.35, -0.3], 0.3, 0.08),
  texture(9, 'solid.png', [-0.35, -0.2], 0.2, 0.08),
  texture(10, 'solid.png', [-0.35, -0.1], 0.1, 0.08),
  texture(11, 'solid.png', [0.1, -0.9], 1, 0.2),
  texture(12, 'solid.jpg', [0.1, -0.6], 1, 0.2),
  texture(13, 'solid.jpg', [0.1, -0.3], 0.5, 0.2),
  texture(14, 'border.png', [0.75, -0.8], 1),

  square(7, [0.55, -0.25], 1, 0.1),
  square(8, [0.95, -0.25], 0.5, 0.1),
  texture(15, 'gradient.png', [0.75, -0.25], 1, 0.7),
  square(9, [0.68, -0.25], 1, 0.1),
  square(10, [0.82, -0.25], 0.5, 0.1),
]);
// figure
