const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

const [s1, s2] = figure.add([
  {
    make: 'polygon',
    sides: 4,
    radius: 0.2,
    position: [-0.4, 0],
    color: [1, 0, 0, 1],
  },
  {
    make: 'polygon',
    sides: 4,
    radius: 0.3,
    position: [0.4, 0],
    color: [0, 0, 1, 0.5],
  },
]);


// Dissolve in, rotate, then move to position
s1.animations.new()
  .dissolveIn()
  .rotation(Math.PI / 4)
  .position({ target: [0, 0], duration: 2 })
  .start();


// Dissolve in, then rotate and move to position simultaneously
s2.animations.new()
  .dissolveIn()
  .inParallel([
    s2.animations.position({ target: [0, 0], duration: 3 }),
    s2.animations.rotation({ target: Math.PI / 4, duration: 3 }),
  ])
  .start();