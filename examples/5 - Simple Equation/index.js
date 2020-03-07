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
        base: ['a', 'equals', { frac: ['b', 'vinculum', 'c'] }],
        form1: {
          deg: ['a', 'equals', 'b'],
          rad: ['a', 'equals', 'c'],
        },
        form2: {
          content: ['c', 'equals', 'b'],
          subForm: 'deg',
        }
      },
    },
  },
);
// Show the equation form
diagram.getElement('eqn').showForm('base');

diagram.getElement('eqn').addForms({
  form2: {
    content: ['b', 'equals', 'c'],
    subForm:'rad',
  }
})
diagram.getElement('eqn').showForm('form2', 'rad');
diagram.initialize();
