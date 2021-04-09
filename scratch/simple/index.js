const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});
// const figure = new Fig.Figure();

// Figure has two rectangles and a slide navigator
figure.add([
  {
    name: 'rect1',
    method: 'primitives.rectangle',
    options: {
      width: 0.4, height: 0.4, position: [-0.5, 0.5],
    },
  },
  {
    name: 'rect2',
    method: 'primitives.rectangle',
    options: {
      width: 0.4, height: 0.4, position: [0.5, 0.5],
    },
  },
  {
    name: 'nav',
    method: 'collections.slideNavigator',
  },
]);

const rect2 = figure.getElement('rect2');

// Add slides to the navigator
figure.getElement('nav').loadSlides([
  // Slide 1
  { showCommon: 'rect1' },

  // Slide 2
  {
    transition: (done) => {
      rect2.animations.new()
        .dissolveIn({ duration: 1 })
        .whenFinished(done)
        .start();
    },
    // When using a transition function, any changes during the transition
    // need to be explicitly set at steady state
    steadyState: () => {
      rect2.show();
    },
  },

  // Slide 3
  // When using animation objects, the targets of animations will be
  // automatically set at steady state, so user does not need to set them
  {
    showCommon: ['rect1', 'rect2'],
    transition: { position: 'rect2', target: [0.3, 0.5], duration: 1 },
  },

  // Slide 4
  // Use an array of animation object definitions to create a sequence of steps
  {
    transition: [
      { position: 'rect1', target: [-0.3, 0.5], duration: 1 },
      { rotation: 'rect1', target: Math.PI / 4, duration: 1 },
      { rotation: 'rect2', target: Math.PI / 4, duration: 1 },
    ],
  },

  // Slide 5
  // Use an array within an array to create parallel steps
  {
    transition: [
      [
        { rotation: 'rect1', target: 0, duration: 1 },
        { rotation: 'rect2', target: 0, duration: 1 },
      ],
      [
        { position: 'rect1', target: [-0.5, 0.5], duration: 1 },
        { position: 'rect2', target: [0.5, 0.5], duration: 1 },
      ],
      { out: ['rect1', 'rect2'] },
    ],
  },
]);
