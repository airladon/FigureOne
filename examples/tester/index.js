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
      {
        name: 'l',
        method: 'shapes.polyline',
        options: {
          points: [[0, 0], [1, 1], [0.5, 0.7], [1, 1.5]],
          width: 0.01,
          arrow: {
            head: 'rectangle',
            // tail: 0.05,
            // length: 0.1,
            scale: 3,
            // barb: 0.05,
          },
          dash: [0.1, 0.101],
        }
      },
      {
        name: 'p2',
        method: 'arrow',
        options: {
          head: 'line',
          align: 'mid',
          // angle: Math.PI / 4,
          position: [-1, 0],
          // tail: false,
          length: 1,
          width: 0.9,
          tail: 0.2,
          // tail: 0.05,
          // length: 0.4,
          // length: 1,
          tailWidth: 0.3,
          // width: 1, 
          // barb: 0.15,
          color: [1, 0, 0, 0.5],
          // tailWidth: 0.165,
          // width: 0.5,
          // tailWidth: 0.1,
          // barb: 0.3 / 5,
          // tailWidth: 0.3333 / 5,
          // width: 1/5,
          // length: 1/5,
          // scale: 2,
          // position: [1, 0],
          // tip: [1, 0],
          angle: Math.PI / 4,
        },
      },
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




// transparency
// tail false
// tail true
// tail 0
// tail 0.1
// tail -0.1
// -tail > barb
// tip
// start
// tail
// mid