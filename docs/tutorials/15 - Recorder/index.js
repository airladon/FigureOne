/* globals Fig */
const figure = new Fig.Figure();

const solutionOffset = { right: [-0.3, -0], left: [-0.5, -0.2] };

// Generic helper function to make a number of arrows.
const arrow = (left, count) => {
  const arrows = [];
  for (let i = 0; i < count; i += 1) {
    const offset = left ? solutionOffset.left : solutionOffset.right;
    const solutionPosition = new Fig.Point(
      (i % 3) * 0.4 + offset[0],
      Math.floor(i / 3 + 0.1) * 0.4 + offset[1],
    );
    arrows.push({
      name: `${left ? 'left' : 'right'}${i}`,
      method: 'primitives.arrow',
      options: {
        tail: 0.2,
        tailWidth: 0.2,
        width: 0.4,
        length: 0.4,
        color: left ? [0, 0, 1, 0.8] : [1, 0, 0, 0.8],
        angle: left ? Math.PI : 0,
      },
      mods: {
        isMovable: true,
        scenarios: {
          start: { position: left ? [0.3, 0.7] : [-0.3, 0.7] },
          solution: { position: solutionPosition },
        },
      },
    });
  }
  return arrows;
};
figure.add([
  ...arrow(true, 6),
  ...arrow(false, 6),
  {
    name: 'solutionButton',
    method: 'primitives.text',
    options: {
      text: 'Solution',
      position: [0.7, -0.8],
      xAlign: 'center',
      font: { size: 0.1 },
    },
    mods: { isTouchable: true, touchBorder: 0.1 },
  },
]);

const solutionButton = figure.getElement('solutionButton');

// Set initial positions and visibility
figure.elements.setScenarios('start');
solutionButton.hide();

solutionButton.subscriptions.add('onClick', () => {
  figure.elements.animations.new()
    .scenarios({ target: 'solution', velocity: { position: 0.1 }, maxDuration: 5 })
    .start();
});

figure.elements.animations.new()
  .delay(10)
  .dissolveIn({ element: solutionButton })
  .scenarios({ target: 'start', duration: 2 })
  .start();
