// const figure = new Fig.Figure();

const figure = new Fig.Figure({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// // Simple fill
// figure.add({
//   make: 'arc',
//   angle: Math.PI * 2 / 3,
//   sides: 20,
// });

// // Fill to center
// figure.add({
//   make: 'arc',
//   angle: Math.PI * 2 / 3,
//   startAngle: Math.PI / 3,
//   sides: 20,
//   fillCenter: true,
// });

// Arc line
figure.add({
  make: 'arc',
  angle: Math.PI, // * 2 / 3,
  sides: 4,
  radius: 1,
  line: { width: 0.2, widthIs: 'inside' },
  color: [1, 0, 0, 0.5],
});

// Arc dashed line
figure.add({
  make: 'arc',
  angle: Math.PI, // * 3 / 2,
  radius: 1,
  sides: 100,
  line: { width: 0.05, dash: [0.3, 0.1, 0.1, 0.1] },
});

// figure.add({
//   make: 'arc',
//   angle: Math.PI,
//   sides: 4,
// });
