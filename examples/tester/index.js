const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

// Right angle triangle
diagram.addElement({
  name: 'lines',
  method: 'shapes.simpleLine',
  options: {
    p1: [0.5, 0],
    p2: [1, 0],
    width: 0.01,
    dash: [0.08, 0.02 ],
    // border: {
    //   width: 1,
    //   length: 2,
    // },
    copy: [
      // {
      //   along: 'x',
      //   num: 10,
      //   step: 0.3,
      // }
      {
        along: 'rotation',
        num: 10,
        step: Math.PI / 10,
      },
    ],
  },
  mods: {
    isTouchable: true,
    isMovable: true,
  },
});
diagram.setTouchable();

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

// diagram.addElements([
//   {
//     name: 'a',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       width: 0.01,
//       sides: 10,
//       color: [0.7, 0.7, 0.7, 1]
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-2, -2, 4, 4],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.001 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-2, -2, 4, 4],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.8, 0.8, 0.8, 1],
//       line: { width: 0.004 }
//     },
//   },
//   // {
//   //   name: 'm',
//   //   method: 'polygon',
//   //   options: {
//   //     sides: 5,
//   //     radius: 0.2,
//   //     fill: true,
//   //   },
//   // },
//   // {
//   //   name: 'n',
//   //   method: 'polygon',
//   //   options: {
//   //     sides: 3,
//   //     radius: 0.2,
//   //     fill: true,
//   //   },
//   // }
// ]);
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
