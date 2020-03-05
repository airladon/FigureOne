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
        v: { symbol: 'vinculum' },
      },
      forms: {
        base: {
          frac: {
            numerator: 'a',
            symbol: 'v',
            denominator: 'b',
            numeratorSpace: 0.1,
            denominatorSpace: 0.2,
          },
        },
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');
diagram.initialize();
