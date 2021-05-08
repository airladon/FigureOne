const figure = new Fig.Figure();

// Add two squares to the figure
const [s1, s2] = figure.add([
  {
    method: 'polygon',
    sides: 4,
    radius: 0.2,
    position: [-0.4, 0],
    color: [1, 0, 0, 1],
  },
  {
    method: 'polygon',
    sides: 4,
    radius: 0.3,
    position: [0.4, 0],
    color: [0, 0, 1, 0.5],
  },
]);

s2.hide();
s1.animations.new()
  .dissolveIn()
  .rotation(Math.PI / 4)
  .dissolveIn({ element: s2 })
  .then(s2.animations.position({ target: [-0.4, 0], duration: 3 }))
  .start();

// // Dissolve in, rotate, then move to position
// s1.animations.new()
//   .dissolveIn()
//   .rotation(Math.PI / 4)
//   .position({ target: [0, 0], duration: 2 })
//   .start();


// // Dissolve in, then rotate and move to position simultaneously
// s2.animations.new()
//   .dissolveIn()
//   .inParallel([
//     s2.animations.position({ target: [0, 0], duration: 3 }),
//     s2.animations.rotation({ target: Math.PI / 4, duration: 3 }),
//   ])
//   .start();
