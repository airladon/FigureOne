/* eslint-disable no-unused-vars */
/* global Fig __frames */
const figure = new Fig.Figure({
  scene: {
    left: -2,
    bottom: -1.5,
    right: 2,
    top: 1.5,
  },
  color: [1, 0, 0, 1],
});

const count = figure.add({
  make: 'txt',
  font: { type: 'bmp' },
  text: '0',
  yAlign: 'middle',
  position: [0, 1],
});

function onClick(p, e) {
  e.custom.count += 1;
  count.setText({ text: `${e.custom.count}` });
  figure.animateNextFrame();
}


figure.add({
  name: 'cube',
  make: 'cube',
  position: [-1, 0],
  side: 0.3,
});

figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [1, 1, 2] });
figure.scene.setLight({ directional: [0.7, 0.5, 1] });

const [points, normals] = Fig.cube({ side: 0.8 });

figure.add({
  make: 'generic3',
  points,
  normals,
  texture: {
    src: 'http://localhost:8080/src/tests/misc/context/flowers.jpeg',
    coords: [
      0, 0, 0.333, 0, 0.333, 0.5,
      0, 0, 0.333, 0.5, 0, 0.5,
      0.333, 0, 0.666, 0, 0.666, 0.5,
      0.333, 0, 0.666, 0.5, 0.333, 0.5,
      0.666, 0, 1, 0, 1, 0.5,
      0.666, 0, 1, 0.5, 0.666, 0.5,
      0, 0.5, 0.333, 1, 0, 1,
      0, 0.5, 0.333, 0.5, 0.333, 1,
      0.333, 0.5, 0.666, 1, 0.333, 1,
      0.333, 0.5, 0.666, 0.5, 0.666, 1,
      0.666, 0.5, 1, 1, 0.666, 1,
      0.666, 0.5, 1, 0.5, 1, 1,
    ],
    loadColor: [0, 0, 1, 0],
  },
  touch: { onClick },
  mods: {
    custom: { count: 0 },
  },
});
