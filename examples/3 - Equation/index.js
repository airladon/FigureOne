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
        a: 'a',
        b: 'b',
        c: 'c',
        v: { symbol: 'vinculum'},
        equals: ' = ',
      },
      // An equation form is how those terms are arranged
      forms: {
        0: ['a', 'equals', { frac: ['b', 'vinculum', 'c'] }],
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('0');
diagram.initialize();
