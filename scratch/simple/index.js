const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});
// const figure = new Fig.Figure();

// Subscribe to the setTransform subscription of a figure element
const [ball1, ball2] = figure.add([
  {
    name: 'ball1',
    method: 'primitives.polygon',
    options: {
      sides: 100,
      radius: 0.5,
      color: [1, 0, 0, 1],
    },
  },
  {
    name: 'ball2',
    method: 'primitives.polygon',
    options: {
      sides: 100,
      radius: 0.3,
      color: [0, 0, 1, 1],
    },
  },
]);

ball1.subscriptions.add('setTransform', (transform) => {
  ball2.setTransform(transform[0]);
});

ball1.animations.new()
  .position({ target: [1, 0], duration: 2 })
  .start();

// figure.getElement('rect2').animations.new()
//   .delay(1)
//   .dissolveOut(2)
//   .start();

// figure.getElement('tri').pulseAngle({ curve: {
//   scale: 2,
//   // centerOn: figure.getElement('tri').getPosition(),
// }, corner: 1 })
// // Animate the shape
// figure.getElement('tri').animations.new()
//   .position({ target: [0.8, 0], duration: 1 })
//   .rotation({ target: Math.PI, duration: 2 })
//   .position({ target: [0, 0], duration: 1 })
//   .start();