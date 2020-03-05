const diagram = new Fig.Diagram();

diagram.addElement(
  {
    name: 'eqn',
    method: 'equation',
    options: {
      color: [0.95, 0.95, 0.6, 1],
      position: [0, 0],
      elements: {
        v: { symbol: 'vinculum'},
        equals: ' = ',
        times: ' \u00D7 ',
        c: { color: [1, 0, 0, 1] },
      },

      // Align all forms to the 'equals' diagarm element
      defaultFormAlignment: { fixTo: 'equals' },

      // Define two different forms of the equation
      forms: {
        '1': ['a', 'equals', { frac: ['b', 'v', 'c'] }],
        '2': {
          content: ['c', 'times', 'a', 'equals', 'b'],
          // Define how the 'c' element will move to this form
          translation: {
            c: { style: 'curved', direction: 'down', mag: 0.5 },
          }
        },
      },
    },
  },
);
diagram.initialize();

// Show the equation form
const eqn = diagram.getElement('eqn');
eqn.showForm('1');
eqn.goToForm({
  name: '2',
  delay: 1,
  duration: 3,
  animate: 'move',
});

// Queue drawing on the next animation frame
diagram.animateNextFrame();