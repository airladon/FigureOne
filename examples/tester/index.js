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

      // Align all forms to the 'equals' diagram element
      formDefaults: {
        alignment: { fixTo: 'equals' },
        animation: {
          translation: {
            c: { style: 'curved', direction: 'up', mag: 0.5 },
          },
          duration: 4,
        }
      },

      // Define two different forms of the equation
      forms: {
        '1': ['a', 'equals', { frac: ['b', 'v', 'c'] }],
        '2': {
          content: ['c', 'times', 'a', 'equals', 'b'],
          // Define how the 'c' element will move to this form
          animation: {
            translation: {
              c: { style: 'curved', direction: 'down', mag: 0.5 },
            },
            duration: 0.5,
          },
        },
      },
    },
  },
);
diagram.initialize();

const eqn = diagram.getElement('eqn');

// Show the equation form
eqn.showForm('1');

// Animate to the next form
eqn.goToForm({
  name: '2',
  delay: 1,
  duration: 1.5,
  animate: 'move',
});

// Queue drawing on the next animation frame
diagram.animateNextFrame();