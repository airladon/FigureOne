const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

// Right angle triangle
diagram.addElement({
  name: 'g',
  method: 'shapes.polygon',
  options: {
    // points: [[0, 0], [1, 0], [0, 1]],
    // width: 0.1,
    // border: 'negative',
    // dash: [0.1, 0.1],
    // close: true,
    radius: 1,
    line: { width: 0.1, widthIs: 'mid' },
    border: 'outline',
    touchBorder: 'rect',
    // rotation: Math.PI / 4,
    // border: 'rect',
    // touchBorder: 'rect',
    // cornersOnly: true,
    // cornerLength: 0.1,
    sides: 4,
    // border: 'negative',
    // touchBorder: 0.1,

    // border: 'points',
    // border: [[[0, 0], [1, 0], [0, 1]]],
    // touchBorder: [[[-0.5, -0.5], [1.5, -0.5], [-0.5, 1.5]]],
    // holeBorder: [[[0, 0], [0.5, 0], [0, 0.5]]],
  },
  mods: {
    isTouchable: true,
    isMovable: true,
    cannotTouchHole: true,
  },
});
diagram.setTouchable();

// diagram.addElement({
//   name: 'lines',
//   method: 'triangle',
//   options: {
//     points: [[0, 0], [0, 1], [1, 0]],
//     line: { width: 0.07, widthIs: 'outside' },
//     // border: 'line',
//     // touchBorder: 'rect'
//     // width: 0.08,
//     // // border: null,
//     // touchBorder: null,
//     // border: [[[0, 0], [1, 0], [0, 1]]],
//     // touchBorder: [[[-0.5, -0.5], [1.5, -0.5], [-0.5, 1.5]]],
//     // holeBorder: [[[0, 0], [0.5, 0], [0, 0.5]]],
//   },
//   mods: {
//     isTouchable: true,
//     isMovable: true,
//     // cannotTouchHole: true,
//   },
// });
// diagram.setTouchable();

// console.log(diagram.elements._lines)
// diagram.initialize();

// diagram.elements.hasTouchableElements = true;

// const p = diagram.getElement('p')
// const rotation = new Fig.Transform().rotate(Math.PI / 2);
// const translation = new Fig.Transform().translate(0.5, 0);
// const t = translation.transformBy(rotation)
// p.transform = t;

// const translate = p.animations.position({ target: [0.5, 0], duration: 2 });
// const rotate = p.animations.rotation({ target: Math.PI, duration: 2 });
// p.animations.new()
//   .translation({ target: [0.5, 0], duration: 2 })
//   .rotation({ target: Math.PI, duration: 2 })
//   .start();

// diagram.animateNextFrame();

diagram.addElements([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1]
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.001 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.8, 0.8, 0.8, 1],
      line: { width: 0.004 }
    },
  },
]);
// // diagram.initialize();
// // const m = diagram.getElement('m');
// // const n = diagram.getElement('n');

// // m.animations.new()
// //   .translation({ target: [-0.5, 0.5], duration: 1 })
// //   .then(n.animations.rotation({ target: 2, duration: 1 }))
// //   .then(n.animations.builder()
// //     .translation({ target: [0.5, -0.5], duration: 1})
// //     .rotation({ target: -2, duration: 1, direction: 2 })
// //   )
// //   .start();


// diagram.animateNextFrame();
