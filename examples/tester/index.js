const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

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


// // Simple
// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     forms: {
//       1: { prodOf: ['prod', 'x', 'b', 'a'] },
//     },
//   },
// });
// diagram.elements._eqn.showForm('1');

// // Example showing different options
// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     elements: {
//       p: { symbol: 'prod', draw: 'dynamic' },
//       inf: '\u221e',
//     },
//     forms: {
//       // Object form
//       1: {
//         prodOf: {
//           symbol: 'p',
//           content: [{ sup: ['x', 'n'] }],
//           from: ['n_1', ' ', '=', ' ', '_0'],
//           to: '_10',
//         },
//       },
//       // Array form
//       2: { prodOf: ['p', [{ sup: ['x', 'm'] }], 'm_1', null]},
//       // Styling with options
//       3: {
//         prodOf: {
//           symbol: 'p',
//           content: { frac: [['x', ' ', '+', ' ', 'm'], 'vinculum', 'a'] },
//           from: ['m_1', ' ', '=', ' ', '_0'],
//           to: 'inf',
//           fromScale: 0.8,
//           toScale: 0.8,
//         },
//       },
//     },
//     formSeries: ['1', '2', '3'],
//   },
// });
// const eqn = diagram.elements._eqn;
// eqn.onClick = () => eqn.nextForm();
// eqn.setTouchableRect(0.5);
// eqn.showForm('1');


// // Simple
// diagram.addElement({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     forms: {
//       1: {
//         annotate: {
//           content: 'a',
//           annotation: {
//             content: 'b',
//             yPosition: 'top',
//             yAlign: 'bottom',
//             xPosition: 'right',
//             xAlign: 'left',
//           },
//         },
//       },
//     },
//   },
// });
// diagram.elements._eqn.showForm('1');


// Add the equation with all it's forms
diagram.addElements([
  // {
  //   name: 'line',
  //   method: 'objects.annotatedLine',
  //   options: {
  //     p1: [0, 0],
  //     p2: [1, 1],
  //     label: {
  //       text: {
  //         forms: { base: ['a', 'b' ] }
  //       },
  //     },
  //     dash: [0.1, 0.1],
  //     maxLength: 2,
  //     arrows: {},
  //   },
  // },
  {
    name: 'c',
    method: 'shapes.collection',
    addElements: [
      // {
      //   name: 'p1',
      //   method: 'polygon',
      //   options: {
      //     position: [-1, 0],
      //   },
      // },
      // {
      //   name: 'l',
      //   method: 'shapes.polyline',
      //   options: {
      //     points: [[0, 0], [1, 1], [0.5, 0.7], [1, 1.5]],
      //     width: 0.06,
      //     arrow: {
      //       head: 'barb',
      //       tail: 0,
      //       // length: 0.1,
      //       scale: 1,
      //       align: 'mid',
      //       // tail: 0.05,
      //       // length: 0.2,
      //       // barb: 0.05,
      //     },
      //     dash: [0.1, 0.101],
      //   }
      // },
      // {
      //   name: 'p2',
      //   method: 'arrow',
      //   options: {
      //     head: 'barb',
      //     align: 'tail',
      //     // angle: Math.PI / 4,
      //     position: [-1, 0],
      //     length: 0.5,
      //     width: 0.3,
      //     color: [1, 0, 0, 0.5],
      //     copy: [
      //       {
      //   to: [[0.6, 0], [1.05, 0], [1.5, 0], [2.2, 0]],
      //   original: false,
      // },
      //       {
      //         along: 'rotation',
      //         num: 5,
      //         step: Math.PI / 5,
      //         start: 1,              // only copy last step, not original points
      //       },
      //     ]
      //   },
      // },
    ],
    options: {
      touchBorder: 0.2,
    },
  },
  // {
  //   name: 'arrow',
  //   method: 'shapes.arrow',
  //   options: {
  //     length: 1,
  //     width: 0.4,
  //     head: 'line',
  //     lineWidth: 0.05,
  //   },
  // },
]);
diagram.elements._c.setMovable();
// diagram.elements.hasTouchableElements = true;
// console.log(diagram.elements._c)
// console.log(diagram.elements._c.getBorder('diagram', 'border'));
// diagram.elements._line.grow(0, 5);
// diagram.elements._arrow.custom.update({
//   head: 'barb',
// });
// // Progress to the next form when the equation is clicked on
// const eqn = diagram.elements._eqn;
// eqn.onClick = () => eqn.nextForm();
// eqn.setTouchableRect(0.5);

// Line with triangle arrows on both ends
diagram.addElement({
  name: 'a',
  method: 'objects.line',
  options: {
    p1: [0, 1],
    p2: [1, 1],
    // p1: [0, 0],
    align: 'center',
    length: 2,
    width: 0.01,
    // touchBorder: 0.1,
    arrow: {
      head: 'triangle',
      // align: 'mid',
      scale: 2,
      radius: 0.1,
    },
    // dash: [0.02, 0.02],
    // offset: -0.1,
    label: {
      text: 'hello',
      offset: 0.01,
    },
    move: {
      type: 'centerTranslateEndRotation',
    },
    pulseWidth: {
      duration: 5,
      frequency: 0.5,
    },
  },
});
console.log(diagram.elements)
// diagram.elements._a.grow(0, 5);
diagram.animateNextFrame();
// diagram.elements._a.pulseWidth();
// diagram.elements._a.pulse({ duration: 2, scale: 1.5 })
// diagram.elements._a.setLength(1.5);

diagram.addElement({
  name: 'asdf',
  method: 'line',
  options: {
    points: [[0, 0], [1,0]],
    // p1: [-1, 0],
    // p2: [0, -1],
    width: 0.02,
    arrow: {
      head: 'barb',
      align: 'mid',
      sides: 7,
      radius: 0.05,
      tail: 0,
    },
    // dash: [0.1, 0.1],
  },
});

diagram.elements._a.setMultiMovable();
console.log(diagram.elements._a._line.drawingObject.touchBorder)
// // Line with customized barb arrow at end only
// diagram.addElement({a
//   name: 'a',
//   method: 'shapes.line',
//   options: {
//     p1: [0, 0],
//     p2: [0, 1],
//     width: 0.02,
//     arrow: {
//       end: {
//         head: 'barb',
//         width: 0.15,
//         length: 0.25,
//         barb: 0.05,
//         scale: 2
//       },
//     },
//     dash: [0.02, 0.02],
//   },
// });


// // Three lines showing the difference between mid align and start align for
// // circle heads
// diagram.addElements([
//   {
//     name: 'reference',
//     method: 'polyline',
//     options: {
//       points: [[0, 0.3], [0.5, 0.3]],
//     },
//   },
//   {
//     name: 'start',
//     method: 'polyline',
//     options: {
//       points: [[0, 0], [0.5, 0]],
//       arrow: {
//         head: 'circle',
//         radius: 0.1,
//       },
//     },
//   },
//   {
//     name: 'mid',
//     method: 'polyline',
//     options: {
//       points: [[0, -0.3], [0.5, -0.3]],
//       arrow: {
//         head: 'circle',
//         radius: 0.1,
//         align: 'mid',     // circle mid point is at line end
//       },
//     },
//   },
// ]);


// // Line with two different arrow ends scaled by 0.7x
// diagram.addElement({
//   name: 'a',
//   method: 'polyline',
//   options: {
//     points: [[0, 0], [1, 0]],
//     width: 0.02,
//     arrow: {
//       scale: 1.2,
//       start: 'bar',
//       end: {
//         head: 'polygon',
//         sides: 6,
//       },
//     },
//   },
// });