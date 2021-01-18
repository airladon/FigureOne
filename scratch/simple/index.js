const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});
// figure.add({
//   method: 'equation',
//   options: {
//     elements: {
//       rarrow: { symbol: 'arrow', direction: 'right' },
//       larrow: { symbol: 'arrow', direction: 'left' },
//     },
//     forms: {
//       form1: {
//         annotate: {
//           content: 'a',
//           glyphs: {
//             top: {
//               symbol: 'rarrow',
//               space: 0.05,
//               overhang: 0.1,
//             },
//             bottom: {
//               symbol: 'larrow',
//               space: 0.05,
//               overhang: 0.02,
//             },
//           },
//         },
//       },
//     },
//   },
// });

figure.add({
  method: 'equation',
  options: {
    elements: {
      brace: { symbol: 'brace', side: 'top' },
    },
    forms: {
      form1: {
        annotate: {
          content: ['2_1', 'x_1'],
          glyphs: {
            bottom: {
              symbol: 'brace',
              space: 0.05,
              overhang: 0.2,
              annotations: [
                {
                  content: '2_2',
                  xPosition: 'left',
                  yPosition: 'bottom',
                  xAlign: 'center',
                  yAlign: 'baseline',
                  offset: [0, -0.2],
                },
                {
                  content: 'x_2',
                  xPosition: 'right',
                  yPosition: 'bottom',
                  xAlign: 'center',
                  yAlign: 'baseline',
                  offset: [0, -0.2],
                },
              ],
            },
          },
        },
      },
    },
  },
});