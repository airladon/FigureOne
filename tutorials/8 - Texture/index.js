const figure = new Fig.Figure();

figure.addElement(
  {
    name: 'flower',
    method: 'polygon',
    options: {
      radius: 0.8,
      sides: 6,
      fill: true,
      texture: {
        src: 'texture-rect.jpg',
        mapTo: new Fig.Rect(-1, -0.667, 2, 1.333),
      },
    },
  },
);

figure.initialize();