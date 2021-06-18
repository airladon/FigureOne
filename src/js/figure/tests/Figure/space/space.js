/* globals Fig, figure testCases */
/* eslint-disable no-global-assign */

const screenCursor = figure.add({
  make: 'polygon',
  radius: 0.05,
  sides: 10,
  color: [1, 0, 0, 1],
  position: [0.5, 0.5],
});
screenCursor.scene = new Fig.Scene();

const mark = figure.add({
  make: 'polygon',
  radius: 0.03,
  color: [0, 0, 1, 1],
  sides: 10,
  position: [0.5, 0.2],
});

// figure.scene.setCamera({ position: [1, 1, 1] });
// figure.animations.new()
//   .camera({ start: { position: [0, 0, 3] }, target: { position: [3, 2, 1] } })
//   .start();


testCases = {
  basic: () => {
    figure.scene.setCamera({ position: [2, 2, 1] });
  },
};

testCases.basic();
