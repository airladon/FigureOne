// Create diagram
const diagram = new Fig.Diagram();

// Add elements to the diagram
diagram.addElement(
  // Add equation element
  {
    name: 'eqn',
    method: 'equation',
    options: {
      color: [0.95, 0.95, 0.6, 1],
      position: [-0.2, 0],
      // Equation elements are the individual terms in the equation
      elements: {
        arrow: { symbol: 'arrow', direction: 'left' },
        lb: { symbol: 'squareBracket', side: 'left' },
        rb: { symbol: 'squareBracket', side: 'right' },
        bb: { symbol :'box', fill: true, color: [1, 0, 0, 0.5]},
        box: { symbol: 'box', color: [1, 0, 0, 1] },
        v: { symbol: 'vinculum' },
      },
      forms: {
        base: {
          frac: {
            numerator: 'a',
            symbol: 'v',
            denominator: 'b',
            overhang: 0.2,
          },
          // root: { symbol: 'radical', content: 'a', root: '_2'}
        },
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');
diagram.initialize();
