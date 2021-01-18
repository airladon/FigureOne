const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// figure.add({
//   name: 'eqn',
//   method: 'equation',
//   options: {
//     forms: {
//       form1: {
//         content: ['a', 'b', 'c'],
//         scale: 1.2,
//         alignment: {
//           fixTo: 'b',
//           xAlign: 'center',
//           yAlign: 'bottom',
//         },
//         description: '|Form| 1 |description|',
//         modifiers: {
//           Form: { font: { color: [0, 0, 1, 1] } },
//         },
//         elementMods: {
//           a: {
//             color: [0, 0, 1, 1],
//             isTouchable: true,
//           },
//         },
//         duration: 1,
//         translation: {
//           a: {
//             style: 'curved',
//             direction: 'up',
//             mag: 0.95,
//           },
//           b: ['curved', 'down', 0.45],
//         },
//         fromForm: {
//           form0: {
//             duration: null,
//             translation: {
//               a: ['curved', 'down', 0.2],
//               b: ['curved', 'down', 0.2],
//             },
//             elementMods: {
//               a: {
//                 color: [0, 1, 0, 1],
//                 isTouchable: false,
//               },
//             },
//             onTransition: () => console.log('animate to form1 from form0 start'),
//             onShow: () => console.log('animation to form1 from form0 complete'),
//           },
//         },
//         onTransition: () => console.log('animate to form1 start'),
//         onShow: () => console.log('animation to form1 complete'),
//       },
//     },
//   },
// });

// figure.getElement('eqn').animations.new()
//   .goToForm({ target: 'form2', animate: 'move', delay: 1 })
//   .goToForm({ target: 'form3', animate: 'move', delay: 1 })
//   .goToForm({ target: 'form4', animate: 'move', delay: 1 })
//   .start();

// Note - the points are drawn in the figure's draw space, but as the
// equation collection is at (0, 0) and it has not scaling applied, then
// the equation's draw space is the same as the figure's draw space.

figure.add({
  method: 'rectangle',
  options: {
    width: 1,
    height: 0.5,
    line: { width: 0.001 },
    position: [0, 0.05],
  },
});
// // Draw (0, 0) point in equation collection
// figure.add({
//   method: 'polygon', options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 },
// });
// // Default alignment is left, baseline
// figure.add([
//   {
//     method: 'equation',
//     options: {
//       forms: { 0: ['a', '_ = ', 'bg'] },
//     },
//   },
// ]);

// // Draw (0, 0) point in equation collection
// figure.add({
//   method: 'polygon', options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 },
// });
// // Align with right, middle
// figure.add([
//   {
//     method: 'equation',
//     options: {
//       forms: { 0: ['a', '_ = ', 'bg'] },
//       formDefaults: {
//         alignment: {
//           xAlign: 'right',
//           yAlign: 'middle',
//         },
//       },
//     },
//   },
// ]);

// // Draw (0, 0) point in equation collection
// figure.add({
//   method: 'polygon', options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 },
// });
// // Align with center of equals sign
// figure.add([
//   {
//     method: 'equation',
//     options: {
//       forms: { 0: ['a', '_ = ', 'bg'] },
//       formDefaults: {
//         alignment: {
//           fixTo: '_ = ',
//           xAlign: 'center',
//           yAlign: 'baseline',
//         },
//       },
//     },
//   },
// ]);

// Draw (0, 0) and (0.2, 0.1) points
figure.add([
  {
    method: 'polygon',
    options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 }
  },
  {
    method: 'polygon',
    options: {
      radius: 0.01, color: [0, 0.8, 0, 1], sides: 9, position: [0.2, 0.1],
    },
  },
]);
// Align with point (0.2, 0.1) in the equation collection
figure.add([
  {
    method: 'equation',
    options: {
      forms: { 0: ['a', '_ = ', 'bg'] },
      formDefaults: {
        alignment: {
          fixTo: [0.2, 0.1],
          xAlign: 'right',
          yAlign: 'baseline',
        },
      },
    },
  },
]);
