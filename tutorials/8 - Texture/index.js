const figure = new Fig.Figure();

figure.add(
  {
    name: 'flower',
    method: 'polygon',
    options: {
      radius: 0.8,
      sides: 6,
      texture: {
        src: 'texture-rect.jpg',
        mapTo: new Fig.Rect(-1, -0.667, 2, 1.333),
      },
    },
  },
);