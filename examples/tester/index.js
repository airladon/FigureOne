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

// diagram.addElement({
//   name: 'l',
//   method: 'shapes.line',
//   options: {
//     p1: [0, 0],
//     p2: [0, 1],
//     width: 0.03,
//     arrow: {
//       start: 'rectangle',
//       end: 'barb',
//     },
//   },
// });
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
// Right angle triangle
// diagram.addElement({
//   name: 'g',
//   method: 'shapes.line',
//   options: {
//     // points: [[0, 0], [1, 0]],
//     p1: [0, 0],
//     p2: [1, 0],
//     width: 0.02,
//     arrow: {
//       scale: 1.2,
//       start: 'bar',
//       end: {
//         head: 'polygon',
//         sides: 6,
//       },
//     },
//     touchBorder: 0.2,
//   },
//   mods: {
//     isTouchable: true,
//     isMovable: true,
//     cannotTouchHole: true,
//   },
// });
// diagram.setTouchable();
// // console.log('update')
// diagram.elements._g.custom.update({ p1: [-1, -1], p2: [-1, 0] })

// diagram.elements._pad.setMovable();
// diagram.elements._pad.setTransformCallback = () => {
//   const p = diagram.elements._pad.getPosition();
//   diagram.elements._g.custom.update({ points: [[0, 0], [1, 0], p] })
//   diagram.animateNextFrame();
// }

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

// const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2]});
diagram.addElement({
  name: 'p',
  method: 'polygon',
  options: {
    sides: 4,
    fill: true,
    radius: 0.5,
    position: [0, 0],
  },
});
const p = diagram.getElement('p');
diagram.initialize();

// // Simple trigger
// p.animations.new()
//   .delay(1)
//   .position({ target: [1, 0], duration: 2 })
//   .trigger(() => { console.log('arrived at (1, 0)') })
//   .position({ target: [0, 0], duration: 2 })
//   .trigger(() => { console.log('arrived at (0, 0)') })
//   .start();

// Trigger with delay, duration and payload
const printPosition = (pos) => {
  console.log(`arrived at ${pos}`);
};

p.animations.new()
  .position({ target: [1, 0], duration: 2 })
  .trigger({
    delay: 1,
    callback: printPosition,
    payload: '(1, 0)',
    duration: 1,
  })
  .position({ target: [0, 0], duration: 2 })
  .trigger({ callback: printPosition, payload: '(0, 0)' })
  .start();

// // Different ways to create a stand alone step
// const step1 = p.animations.trigger({
//   callback: () => { console.log('arrived at (1, 0)') },
// });
// const step2 = new Fig.Animation.TriggerAnimationStep({
//   callback: () => { console.log('arrived at (0, 0)') },
// });

// p.animations.new()
//   .position({ target: [1, 0], duration: 2 })
//   .then(step1)
//   .position({ target: [0, 0], duration: 2 })
//   .then(step2)
//   .start();