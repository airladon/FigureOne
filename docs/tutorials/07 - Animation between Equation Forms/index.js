const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

const eqn = figure.add(
  {
    method: 'equation',
    elements: {
      v: { symbol: 'vinculum' },
      equals: ' = ',
      times: ' \u00D7 ',
      c: { color: [0, 0, 1, 1] },
    },

    // Align all forms to the 'equals' figure element
    formDefaults: { alignment: { fixTo: 'equals' } },

    // Define two different forms of the equation
    forms: {
      1: ['a', 'equals', { frac: ['b', 'v', 'c'] }],
      2: {
        content: ['c', 'times', 'a', 'equals', 'b'],
        // Define how the 'c' element will move to this form
        translation: {
          c: { style: 'curved', direction: 'down', mag: 0.5 },
        },
      },
    },
  },
);

// Show the equation form
eqn.showForm('1');

// // Animate to the next form
eqn.goToForm({
  form: '2',
  delay: 1,
  duration: 1.5,
  animate: 'move',
});
