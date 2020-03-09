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
        lb: { symbol: 'squareBracket', side: 'left' },
        rb: { symbol: 'squareBracket', side: 'right' },
      },
      forms: {
        base: {
          matrix: {
            left: 'lb',
            right: 'rb',
            content: ['aasdf', 'b', 'c', { frac: ['d', 'vinculum', 'e'] }],
            order: [2, 2],
            space: [0.1, 0.1],
            fit: [1, 0.3],
          },
        },
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');
diagram.initialize();
