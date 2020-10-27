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
//       font: { size: 0.2 },
//       elements: {
//         a: 'a',
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
// // equation.addForms({
// //   bCurved: {
// //     content: ['b', 'equals', { frac: ['a', 'vinculum', 'c'] }],
// //     animation: {
// //       translation: {
// //         a: { style: 'curve', direction: 'up', mag: 0.8 },
// //         b: { style: 'curve', direction: 'down', mag: 1.2 },
// //       },
// //     },
// //   },
// // });


// equation.showForm('b');
// // equation.goToForm({
// //   form: 'bCurved',
// //   animate: 'move',
// //   duration: 2,
// //   delay: 1,
// // });

// equation.touchInBoundingRect = true;
// equation.setMovable();
// diagram.initialize();
// equation.setMoveBounds('diagram', true);
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
diagram.addElements([
  {
    name: 'c',
    method: 'collection',
    options: {
      position: [0.5, 0],
    },
    addElements: [
      {
        name: 'c',
        method: 'collection',
        options: {
          position: [0.5, 0],
        },
        addElements: [
          {
            name: 'p',
            method: 'shapes.rectangle',
            options: {
              width: 1,
              height: 1,
              position: [0.5, 0],
            },
          },
        ],
      },
    ],
  },
]);
diagram.initialize();
console.log(diagram.elements._c)
const c = diagram.getElement('c');
const cc = diagram.getElement('c.c');
const p = diagram.getElement('c.c.p');

console.log(p.getPosition('diagram'))
console.log(p.getBoundingRect('diagram'))
console.log(p.getBoundingRect('local'))
console.log(cc.getBoundingRect('diagram'))
console.log(cc.getBoundingRect('local'))
console.log(c.getBoundingRect('local'))