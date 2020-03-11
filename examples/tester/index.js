// Create diagram
const diagram = new Fig.Diagram();

// Add elements to the diagram
diagram.addElements([
  // Add equation element
  // {
  //   name: 'eqn',
  //   method: 'equation',
  //   options: {
  //     color: [0.95, 0.95, 0.6, 1],
  //     position: [-0.2, 0],
  //     // Equation elements are the individual terms in the equation
  //     elements: {
  //       arrow: { symbol: 'arrow', direction: 'left' },
  //       lb: { symbol: 'squareBracket', side: 'left', radius: 0.05, },
  //       rb: { symbol: 'squareBracket', side: 'right' },
  //       bb: { symbol :'box', fill: true, color: [1, 0, 0, 0.5]},
  //       box: { symbol: 'box', color: [1, 0, 0, 1] },
  //       radical: { symbol: 'radical', tickHeight: 0.08, tickWidth: 0.05, startWidth: 0.3, downWidth: 0.03, proportionalToHeight: true},
  //       // b: { symbol: 'bracket', width: 0.1}
  //     },
  //     forms: {
  //       base: {
  //         // root: {
  //         //   content: { frac: ['aasdf', 'vinculum', 'b'] },
  //         //   symbol: 'radical',
  //         // },
  //         brac: { left: 'lb', content: 'a', topSpace: 0.3, bottomSpace: 0.3 }
  //         // root: { symbol: 'radical', content: 'a', root: '_2'}
  //       },
  //     },
  //   },
  // },
  {
    name: 'p',
    method: 'polygon',
    options: {
      radius: 0.4,
      sides: 100,
      width: 0.08,
      angleToDraw: Math.PI / 2,
      clockwise: true,
      fill: true,
    },
  },
  {
    name: 'a',
    method: 'polygon',
    options: {
      color: [0, 1, 0, 1],
      radius: 0.4,
      sides: 10,
      width: 0.01,
      // linePrimitives: true,
    },
  }
]);
// Show the equation form
// diagram.getElement('eqn').showForm('base');
console.log(diagram.getElement('p'))
diagram.initialize();
