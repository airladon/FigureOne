const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});
// const figure = new Fig.Figure();

// Create the shape
figure.add([
  // {
  //   name: 'tri',
  //   method: 'equation',
  //   options: {
  //     elements: { stk1: { symbol: 'strike', style: 'forward' } },
  //     forms: {
  //       0: [{
  //         lines: {
  //           content: ['a', 'bde', { strike: [{ container: ['c', 0.5] }, 'stk1', false, 0.2, 0.2] }],
  //         },
  //       }, 'r'],
  //     },
  //   },
  // },
  {
    method: 'rectangle',
    options: { width: 1, height: 0.2, position: [0, 0.1], xAlign: 'left' }
  },
  {
    name: 'rect2',
    method: 'rectangle',
    options: {
      width: 0.5, height: 0.1, position: [0, 0.1], xAlign: 'left',
      color: [1, 0, 0, 1],
    }
  }
]);

figure.getElement('rect2').animations.new()
  .delay(1)
  .dissolveOut(2)
  .start();

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