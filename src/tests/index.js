const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  color: [1, 0, 0, 1],
  lineWidth: 0.1,
  font: { size: 0.1 },
});

// Hide pad 0, and make pad 2 blue and not filled
figure.add({
  name: 'p',
  method: 'collections.polyline',
  options: {
    points: [[0, 0], [0.7, 0], [0.7, 0.7], [1.4, 0.7]],
    side: [
      { label: { text: 'a' } },
      { label: { text: 'b' } },
      { label: { text: 'c' } },
    ],
  },
});
