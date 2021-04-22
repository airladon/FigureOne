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
const square = (index, position, opacity) => ({
  name: `square${index}`,
  method: 'rectangle',
  options: {
    width: 0.2,
    height: 0.2,
    position,
    color: [1, 0, 0, opacity],
  },
});

const texture = (index, src, position, opacity) => ({
  name: `texture${index}`,
  method: 'rectangle',
  options: {
    width: 0.4,
    height: 0.4,
    position,
    texture: {
      src,
      mapTo: [-0.2, -0.2, 0.4, 0.4],
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

  square(7, [-0.9, -0.6], 1),
  square(8, [-0.75, -0.6], 0.5),

  texture(0, 'gradient.png', [-0.75, -0.8], 1),
  texture(1, 'solid.png', [-0.25, -0.8], 1),
  texture(2, 'solid.png', [0.25, -0.8], 0.5),
  texture(3, 'border.png', [0.75, -0.8], 1),
  texture(4, 'solid.jpg', [-0.25, -0.3], 1),
  texture(5, 'solid.jpg', [0.25, -0.3], 0.5),
]);
// figure
