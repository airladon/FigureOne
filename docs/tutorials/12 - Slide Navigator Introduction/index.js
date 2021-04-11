const figure = new Fig.Figure({ limits: [-2, -2, 4, 4], color: [1, 0, 0, 1] });

// Create a movable ball and text that shows the balls coordinates
const [ball, text] = figure.add([
  {
    name: 'ball',
    method: 'primitives.polygon',
    options: {
      radius: 0.5,
      sides: 100,
      position: [0, 0],
    },
    mods: {
      isMovable: 'true',
    },
  },
  {
    name: 'text ',
    method: 'primitives.text',
    options: {
      position: [0, -1.5],
      text: '(0.0, 0.0)',
      xAlign: 'center',
    },
  },
]);

// Subscribe to ball to receive the 'setTransform' notification. When ball's
// transform changes, get its new position and update the text.
ball.subscriptions.add('setTransform', () => {
  // Get ball position and round to one decimal place
  const p = ball.getPosition().round(1);
  // Convert x and y to string with 1 decimal place
  const x = p.x.toFixed(1);
  const y = p.y.toFixed(1);
  text.custom.updateText({ text: `(${x}, ${y})` });
});
