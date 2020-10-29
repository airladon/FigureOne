const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

// // const yValues = [0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6]
// // const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
// // let index = 0;
// // const arrow = (arrowOptions) => {
// //   const y = yValues[index];
// //   const name = names[index];
// //   index += 1;
// //   return {
// //     name,
// //     method: 'shapes.polyline',
// //     options: {
// //       arrow: {
// //         end: arrowOptions
// //       },
// //       width: 0.015,
// //       points: [[0, y], [1, y]],
// //     },
// //   }
// // };
// // diagram.addElements([
// //   arrow({ head: 'triangle' }),
// //   arrow({ head: 'barb' }),
// //   arrow({ head: 'line' }),
// //   arrow({ head: 'circle' }),
// //   arrow({ head: 'polygon', sides: 4 }),
// //   arrow({ head: 'bar' }),
// //   arrow({ head: 'rectangle' }),
// //   arrow({ head: 'triangle', reverse: 'true' }),
// // ])

// // diagram.addElement({
// //   name: 'l',
// //   method: 'shapes.line',
// //   options: {
// //     p1: [0, 0],
// //     p2: [0, 1],
// //     width: 0.03,
// //     arrow: {
// //       start: 'rectangle',
// //       end: 'barb',
// //     },
// //   },
// // });
// // diagram.addElement(
// //  {
// //    name: 'p',
// //    method: 'shapes.polyline',
// //    options: {
// //      points: [[-0.5, -0.5], [0.5, -0.5], [0, 0.5]],
// //      width: 0.05,
// //      close: true,
// //      cornersOnly: true,
// //      cornerLength: 0.2,
// //    },
// //  },
// // );

// // diagram.addElement(
// //   {
// //     name: 'pad',
// //     method: 'polygon',
// //     options: {
// //       radius: 0.2,
// //       sides: 20,
// //       color: [1, 1, 0, 1],
// //     },
// //   },
// // );
// // Right angle triangle
// // diagram.addElement({
// //   name: 'g',
// //   method: 'shapes.line',
// //   options: {
// //     // points: [[0, 0], [1, 0]],
// //     p1: [0, 0],
// //     p2: [1, 0],
// //     width: 0.02,
// //     arrow: {
// //       scale: 1.2,
// //       start: 'bar',
// //       end: {
// //         head: 'polygon',
// //         sides: 6,
// //       },
// //     },
// //     touchBorder: 0.2,
// //   },
// //   mods: {
// //     isTouchable: true,
// //     isMovable: true,
// //     cannotTouchHole: true,
// //   },
// // });
// // diagram.setTouchable();
// // // console.log('update')
// // diagram.elements._g.custom.update({ p1: [-1, -1], p2: [-1, 0] })

// // diagram.elements._pad.setMovable();
// // diagram.elements._pad.setTransformCallback = () => {
// //   const p = diagram.elements._pad.getPosition();
// //   diagram.elements._g.custom.update({ points: [[0, 0], [1, 0], p] })
// //   diagram.animateNextFrame();
// // }

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

// // const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2]});
// // diagram.addElement({
// //   name: 'p',
// //   method: 'polygon',
// //   options: {
// //     sides: 4,
// //     fill: true,
// //     radius: 0.5,
// //     position: [0, 0],
// //   },
// // });
// // const p = diagram.getElement('p');
// // diagram.initialize();

// // // Simple dissolve out
// // p.animations.new()
// //   .dissolveOut(2)
// //   .start();


// // // Dissolve out using options object
// // p.animations.new()
// //   .dissolveOut({ delay: 1, duration: 2 })
// //   .start();


// // // Different ways to create a stand-alone step
// // const step1 = p.animations.dissolveOut(2);
// // const step2 = new Fig.Animation.DissolveOutAnimationStep({
// //   element: p,
// //   duration: 2,
// // });

// // p.animations.new()
// //   .then(step1)
// //   .dissolveIn(1)
// //   .then(step2)
// //   .start();

// // diagram.addElement(
// //   // Add equation element
// //   {
// //     name: 'eqn',
// //     method: 'equation',
// //     options: {
// //       color: [1, 0, 0, 1],
// //       // Equation elements are the individual terms in the equation
// //       elements: {
// //         a: 'a',
// //         b: 'b',
// //         c: 'c',
// //         v: { symbol: 'vinculum'},
// //         equals: ' = ',
// //         times: ' \u00D7 ',
// //       },
// //       // An equation form is how those terms are arranged
// //       forms: {
// //         a: ['a', 'equals', 'b', 'times', 'c'],
// //         b: ['b', 'equals', { frac: ['a', 'vinculum', 'c'] }],
// //       },
// //     },
// //   },
// // );
// // // Show the equation form
// // diagram.getElement('eqn').showForm('b');
// // diagram.initialize();


// diagram.addElement(
//   {
//     name: 'equation',
//     method: 'equation',
//     options: {
//       color: [1, 0, 0, 1],
//       font: { size: 0.5 },
//       elements: {
//         a: 't',
//         b: 'b',
//         c: 'c',
//         v: { symbol: 'vinculum'},
//         equals: ' = ',
//         times: ' \u00D7 ',  // unicode times symbol
//       },
//       forms: {
//         a: ['a', 'equals', 'b', 'times', 'c'],
//         b: ['b', 'equals', { frac: ['a', 'vinculum', 'c'] }],
//         bCurve: {
//           content: ['b', 'equals', { frac: ['a', 'vinculum', 'c'] }],
//           animation: {
//             translation: {
//               a: { style: 'curve', direction: 'up', mag: 0.8 },
//               b: { style: 'curve', direction: 'down', mag: 1.2 },
//             },
//           },
//         },
//       },
//     },
//   },
// );

// const equation = diagram.getElement('equation')
// equation.showForm('b');
// // equation.pulse(['a', 'c'], () => { console.log('qwer') });
// equation.animations.new()
//       .delay(1)
//       .pulse({ scale: 2, duration: 2 })
//       .start();
// // // equation.addForms({
// // //   bCurved: {
// // //     content: ['b', 'equals', { frac: ['a', 'vinculum', 'c'] }],
// // //     animation: {
// // //       translation: {
// // //         a: { style: 'curve', direction: 'up', mag: 0.8 },
// // //         b: { style: 'curve', direction: 'down', mag: 1.2 },
// // //       },
// // //     },
// // //   },
// // // });


// equation.showForm('b');
// // equation.goToForm({
// //   form: 'bCurved',
// //   animate: 'move',
// //   duration: 2,
// //   delay: 1,
// // });

// equation.touchInBoundingRect = true;
// // equation.setMovable();
// equation.setMoveBounds('diagram');
// // equation.setRotation(Math.PI / 3);
// console.log(equation.move.bounds)
// equation.setPosition([1, 0]);
// diagram.initialize();
// console.log()
// equation._a.onClick = () => {
// equation._a.pulse({
//   // elements: ['a', 'c'],
//   // centerOn: diagram.elements._equation,
//   // centerOn: [1.3, 0.05],
//   // space: 'diagram',
//   // xAlign: 0,
//   // yAlign: 0,
//   // start: 2,
//   // min: 0.8,
//   // scale: 1.3,
//   // rotation: -0.5,
//   // min: -0.02,
//   translation: 0.02,
//   // start: 0.1,
//   angle: 0,
//   // scale: 1.5,
//   // min: 0.6,
//   duration: 1,
//   frequency: 2,
//   // thick: { num: 10, min: 0.5 },
//   // num: 10,
//   progression: 'sinusoid',
//   // start: 1,
// });
// diagram.animateNextFrame();
// };
// equation._a.makeTouchable();
// // equation.setMoveBounds('diagram');



// diagram.addElements([
//           {
//             name: 'c',
//             method: 'collection',
//             addElements: [
//               // {
//               //   name: 'a',
//               //   method: 'polygon',
//               //   options: {
//               //     radius: 1,
//               //     sides: 4,
//               //     // transform: [['t', 1, 0], ['r', Math.PI / 4]],
//               //   },
//               // },
//               {
//                 name: 'a',
//                 method: 'text',
//                 options: {
//                   text: 'hello world',
//                   touchBorder: 0.5,
//                 }
//               }
//             ],
//             options: {
//               // transform: [['s', 0.5, 0.5], ['t', 1, 0], ['r', Math.PI / 4]],
//               // transform: [['s', 0.5, 0.5]],
//             },
//           },
//         ]);

// const c = diagram.elements._c;
// const a = c._a;
// // c.setPosition(1, 0);
// // c.setScale(0.5, 0.5);
// // c.setRotation(Math.PI / 4);
// // c.setTransform(new Fig.Transform().scale(0.5, 0.5).translate(1, 0).rotate(Math.PI / 4))
// // p.setPosition(1, 0);
// diagram.initialize();
// // console.log(a.getPosition('vertex'));
// // console.log(a.getPosition('local'));
// // console.log(a.getPosition('diagram'));
// // // console.log(a.getPosition('gl'));
// // // console.log(a.lastDrawTransform)
// // console.log(a)

// // console.log(new Fig.Point(0, 0).transformBy(a.spaceTransform('vertex', 'diagram')))
// // console.log(new Fig.Point(0, 0).transformBy(a.spaceTransform('diagram', 'vertex')))
// // console.log(new Fig.Point(0, 0).transformBy(a.spaceTransform('vertex', 'pixel')))

// // console.log(new Fig.Point(500, 500).transformBy(a.spaceTransform('pixel', 'vertex')))

// console.log(a.getPosition('vertex'))
// console.log(a.getPosition('local'))
// console.log(a.getPosition('diagram'))
// console.log(a.getPosition('pixel'))

// a.setMovable();

// // c.spaceTransforms.vertexToDiagram
// // c.spaceTransforms.vertexToLocal
// // c.spaceTransforms.localToDiagram
// // c.spaceTransforms.diagramToVertex
// // c.spaceTransforms.diagramToLocal
// // c.spaceTransforms.localToVertex


// diagram.addElements([
//   {
//     name: 'c',
//     method: 'collection',
//     options: {
//       position: [0.5, 0],
//     },
//     addElements: [
//       {
//         name: 'c',
//         method: 'collection',
//         options: {
//           position: [0.5, 0],
//         },
//         addElements: [
//           {
//             name: 'p',
//             method: 'shapes.rectangle',
//             options: {
//               width: 1,
//               height: 1,
//               position: [0.5, 0],
//             },
//           },
//         ],
//       },
//     ],
//   },
// ]);
// const p = diagram.getElement('c.c.p')

// diagram.addElements([
//   {
//     name: 'r',
//     method: 'shapes.rectangle',
//     options: {
//       width: 1,
//       height: 1,
//       // position: [0.5, 0],
//     },
//     mods: {
//       move: { bounds: 'diagram' },
//     },
//   },
// ]);
// const r = diagram.getElement('r');
// r.setRotation(Math.PI / 4)
// r.setMovable();
// diagram.initialize();
// // console.log(r)

// diagram.addElements([
//   {
//     name: 'p1',
//     method: 'polygon',
//     options: {
//       radius: 0.3,
//       line: { width: 0.05, },
//       position: [-1, 0],
//     },
//   },
//   {
//     name: 'p2',
//     method: 'polygon',
//     options: {
//       radius: 0.3,
//       line: { width: 0.05, },
//       position: [0, 0],
//     },
//   },
//   {
//     name: 'p3',
//     method: 'polygon',
//     options: {
//       radius: 0.3,
//       line: { width: 0.05, },
//       position: [1, 0],
//     },
//   },
//   {
//     name: 'p4',
//     method: 'polygon',
//     options: {
//       radius: 0.3,
//       line: { width: 0.05, },
//       position: [2, 0],
//     },
//   },
// ]);

// const p1 = diagram.elements._p1;
// const p2 = diagram.elements._p2;
// const p3 = diagram.elements._p3;
// const p4 = diagram.elements._p4;
// p1.makeTouchable();
// p1.onClick = () => {
//   p1.pulse({
//     duration: 1,
//     scale: 1.3,
//   });
//   setTimeout(() => {
//     p2.pulse({
//       duration: 1,
//       rotation: 0.15,
//       frequency: 4,
//     });
//   }, 1000);
//   setTimeout(() => {
//     p3.pulse({
//       duration: 1,
//       translation: 0.02,
//       min: -0.02,
//       frequency: 4,
//     });
//   }, 2000);
//   setTimeout(() => {
//     p4.pulse({
//       duration: 1,
//       scale: 1.1,
//       min: 0.9,
//       num: 7,
//     });
//   }, 3000);
//   diagram.animateNextFrame();
// };


// diagram.addElement({
//   name: 'p',
//   method: 'polygon',
//   options: {
//     radius: 0.3,
//     line: { width: 0.05, },
//   },
// });

// const p = diagram.getElement('p');
// // p.pulse({
// //   duration: 1,
// //   scale: 1.1,
// //   min: 0.9,
// //   num: 7,
// // });
// p.pulse(() => {console.log('asdf')})

// p.animations.new()
//   .position({ target: [1, 0], duration: 1 })
//   .pulse({ scale: 3, num: 4, duration: 1 })
//   .position({ target: [0, 0], duration: 1 })
//   .start();

// diagram.addElement(
//   {
//     name: 'equation',
//     method: 'equation',
//     options: {
//       color: [1, 0, 0, 1],
//       font: { size: 0.2 },
//       elements: {
//         a: 'a',
//         b: 'b',
//         c: { touchBorder: 0.2 },
//         v: { symbol: 'vinculum' },
//         equals: ' = ',
//         times: ' \u00D7 ',  // unicode times symbol
//       },
//       forms: {
//         a: ['a', 'equals', 'b', 'times', 'c'],
//         b: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
//         bCurve: {
//           content: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
//           animation: {
//             translation: {
//               a: { style: 'curve', direction: 'up', mag: 0.8 },
//               b: { style: 'curve', direction: 'down', mag: 1.2 },
//             },
//           },
//         },
//       },
//     },
//   },
// );
// const equation = diagram.getElement('equation');

// equation.showForm('b')
// setTimeout(() => {
//   equation._c.pulse({ scale: 2, yAlign: 'top' });
// }, 1000);

// diagram.addElements(
//   {
//     name: 'p',
//     method: 'shapes.polygon'
//   },
//   ['name', ]
// )
// // equation.showForm('b');
// // // equation.setPosition(0.04, 0);
// // diagram.initialize();
// // equation.setMovable();
// // equation.setMoveBounds('diagram');
// // equation.touchInBoundingRect = true;
// // console.log(equation._v.getBoundingRect('diagram'))
// // console.log(equation._v.getBoundingRect('local'))
// // console.log(equation.getBoundingRect('local'))
// // // console.log(equation._v.spaceTransformMatrix('draw', 'local'))
// // // console.log(equation._v.spaceTransformMatrix('draw', 'diagram'))
// // // console.log(equation._v.lastDrawTransform)
// // // console.log(equation._v.transform)
// // // console.log(equation._v)
// // equation.showForm('b')
// // equation.setMovable();
// // equation.touchInBoundingRect = 0.2;

// equation.showForm('b')
// // equation._c.makeTouchable();
// // equation._c.onClick = () => { console.log('c was touched') }
// equation._a.makeTouchable();
// equation._a.onClick = () => { console.log('a was touched') }

const equation = diagram.create.equation({ color: [1, 0, 0, 1] });
equation.addElements({
  a: 'a',
  b: 'b',
  c: 'c',
  v: { symbol: 'vinculum'},
  equals: ' = ',
  times: ' \u00D7 ',
});

const e = equation.eqn.functions;
equation.addForms({
  a: ['a', 'equals', 'b', 'times', 'c'],
  b: ['b', 'equals', e.frac(['a', 'v', 'c'])],
});

diagram.add('equation', equation);
equation.showForm('a');