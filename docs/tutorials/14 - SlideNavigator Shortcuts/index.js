/* globals Fig */
const figure = new Fig.Figure();

// Figure has two squares and a slide navigator. Slides will dissolve in,
// dissolve out, move and rotate squares
const [sq1, sq2] = figure.add([
  {
    name: 'sq1',
    make: 'primitives.rectangle',
    options: {
      width: 0.4, height: 0.4, position: [-0.5, 0.5],
    },
  },
  {
    name: 'sq2',
    make: 'primitives.rectangle',
    options: {
      width: 0.4, height: 0.4, position: [0.5, 0.5],
    },
  },
]);

const nav = figure.addSlideNavigator();

// Helper function to set position and rotation of sq1 and sq2
const setPositionAndRotation = (sq1Pos, sq1Rot, sq2Pos, sq2Rot) => {
  sq1.setPosition(sq1Pos);
  sq1.setRotation(sq1Rot);
  sq2.setPosition(sq2Pos);
  sq2.setRotation(sq2Rot);
};

// Add slides to the navigator
nav.loadSlides([
  // Slide 0
  {
    showCommon: 'sq1',
    enterStateCommon: () => setPositionAndRotation([-0.5, 0.5], 0, [0.5, 0.5], 0),
  },

  // Slide 1
  {
    transition: { in: 'sq2' },
  },

  // Slide 2
  // When using animation objects, the targets of animations will be
  // automatically set at steady state, so user does not need to set them
  {
    showCommon: ['sq1', 'sq2'],
    transition: { position: 'sq2', target: [0.3, 0.5], duration: 1 },
  },

  // Slide 3
  // Use an array of animation object definitions to create a sequence of steps
  {
    enterState: () => setPositionAndRotation([-0.5, 0.5], 0, [0.3, 0.5], 0),
    transition: [
      { position: 'sq1', target: [-0.3, 0.5], duration: 1 },
      { rotation: 'sq1', target: Math.PI / 4, duration: 1 },
      { rotation: 'sq2', target: Math.PI / 4, duration: 1 },
    ],
  },

  // Slide 4
  // Use an array within an array to create parallel steps
  {
    enterState: () => setPositionAndRotation([-0.3, 0.5], Math.PI / 4, [0.3, 0.5], Math.PI / 4),
    transition: [
      [
        { rotation: 'sq1', target: 0, duration: 1 },
        { rotation: 'sq2', target: 0, duration: 1 },
      ],
      [
        { position: 'sq1', target: [-0.5, 0.5], duration: 1 },
        { position: 'sq2', target: [0.5, 0.5], duration: 1 },
      ],
      { out: ['sq1', 'sq2'] },
    ],
  },
]);
