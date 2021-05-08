const figure = new Fig.Figure();

figure.add(
  {
    method: 'rectangle',
    width: 1.8,
    height: 1.333,
    corner: { radius: 0.1, sides: 10 },
    texture: {
      src: 'texture-rect.jpg',
      mapTo: [-1, -0.667, 2, 1.333],
    },
  },
);
