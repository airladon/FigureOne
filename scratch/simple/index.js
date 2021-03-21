const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});
// const figure = new Fig.Figure();

// Create the shape
figure.add([

  {
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        // lb: { symbol: 'bracket', side: 'left', color: [0, 1, 0, 1] },
        rb: { symbol: 'bracket', side: 'right', color: [0, 0, 1, 1] },
      },
      forms: {
        0: { brac: [{lb_bracket: {color: [1, 1, 0, 1]}}, 'asdf1', 'rb'] },
      },
    },
  },
]);

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