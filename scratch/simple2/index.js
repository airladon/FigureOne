const figure = new Fig.Figure({ color: [1, 0, 0, 1]});

const c1 = figure.add({
  make: 'cube',
  lines: true,
  side: 0.24,
  position: [-0.5, -0.07, 0],
});
c1.scene = new Fig.Scene({
  style: 'orthographic',
  camera: { position: [1, 0.5, 2] },
  left: -1,
  right: 1,
  bottom: -0.5,
  top: 0.5,
});

const c2 = figure.add({
  make: 'cube',
  lines: true,
  side: 0.4,
  position: [0, 0, 0],
});
c2.scene = new Fig.Scene({
  style: 'perspective',
  camera: { position: [0.35, 0.3, 0.7] },
  aspectRatio: 2,
  fieldOfView: 1.7,
});

// const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

// const c1 = figure.add({
//   make: 'sphere',
//   position: [-0.5, 0, 0],
//   radius: 0.2,
//   sides: 100,
// });
// c1.scene = new Fig.Scene({
//   light: { ambient: 1 }, left: -1, bottom: -0.5, right: 1, top: 0.5,
// });

// const c2 = figure.add({
//   make: 'sphere',
//   radius: 0.2,
//   sides: 100,
//   position: [0, 0, 0],
// });
// c2.scene = new Fig.Scene({
//   left: -1, bottom: -0.5, right: 1, top: 0.5, light: { directional: [1, 1, -1] },
// });
