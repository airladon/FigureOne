const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});

// const yValues = [0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6]
// const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
// let index = 0;
// const arrow = (arrowOptions) => {
//   const y = yValues[index];
//   const name = names[index];
//   index += 1;
//   return {
//     name,
//     method: 'shapes.polyline',
//     options: {
//       arrow: {
//         end: arrowOptions
//       },
//       width: 0.015,
//       points: [[0, y], [1, y]],
//     },
//   }
// };
// diagram.addElements([
//   arrow({ head: 'triangle' }),
//   arrow({ head: 'barb' }),
//   arrow({ head: 'line' }),
//   arrow({ head: 'circle' }),
//   arrow({ head: 'polygon', sides: 4 }),
//   arrow({ head: 'bar' }),
//   arrow({ head: 'rectangle' }),
//   arrow({ head: 'triangle', reverse: 'true' }),
// ])

diagram.addElement({
  name: 'a',
  method: 'shapes.polyline',
  options: {
    points: [[0, 0], [1, 0]],
    width: 0.02,
    arrow: {
      scale: 1.2,
      start: 'bar',
      end: {
        head: 'polygon',
        sides: 6,
      },
    },
  },
});
// diagram.addElement(
//  {
//    name: 'p',
//    method: 'shapes.polyline',
//    options: {
//      points: [[-0.5, -0.5], [0.5, -0.5], [0, 0.5]],
//      width: 0.05,
//      close: true,
//      cornersOnly: true,
//      cornerLength: 0.2,
//    },
//  },
// );

// diagram.addElement(
//   {
//     name: 'pad',
//     method: 'polygon',
//     options: {
//       radius: 0.2,
//       sides: 20,
//       color: [1, 1, 0, 1],
//     },
//   },
// );
// // Right angle triangle
// diagram.addElement({
//   name: 'g',
//   method: 'shapes.polyline',
//   options: {
//     points: [[0, 0], [1, 0], [2, 1]],
//     // length: 1,
//     // angle: 0,
//     width: 0.015,
//     widthIs: 'mid',
//     // dash: [0.1, 0.1],
//     arrow: {
//       head: 'barb',
//       scale: 2,
//       end: {
//         head: 'triangle',
//         reverse: true,
//         scale: 4,
//       },

//       // radius: 0.3,
//       // sides: 6,
//     },
//     // touchBorder: 0.1,
//     // radius: 1,
//     // width: 2,
//     // height: 1,
//     // line: { width: 0.1 },
//   },
//   mods: {
//     isTouchable: true,
//     isMovable: true,
//     cannotTouchHole: true,
//   },
// });
// diagram.setTouchable();
// // console.log('update')
// diagram.elements._g.custom.update({ points: [[0, 0], [1, 0], [2, -1]] })

// diagram.elements._pad.setMovable();
// diagram.elements._pad.setTransformCallback = () => {
//   const p = diagram.elements._pad.getPosition();
//   diagram.elements._g.custom.update({ points: [[0, 0], [1, 0], p] })
//   diagram.animateNextFrame();
// }

// diagram.addElements([
//   {
//     name: 'origin',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       line: { width: 0.01 },
//       sides: 10,
//       color: [0.7, 0.7, 0.7, 1]
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-3, -3, 6, 6],
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
//       bounds: [-3, -3, 6, 6],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.8, 0.8, 0.8, 1],
//       line: { width: 0.004 }
//     },
//   },
// ]);
