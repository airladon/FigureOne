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
        },
        elementMods: {
          b: { color: [1, 0, 0, 1] }
        },
      },

      phrases: {
        'abc': ['a', 'b', 'c', '  ', '=', '  ', 'hello'],
      },
      // Define two different forms of the equation
      forms: {
        't': ['abc', 'equals'],
        'a': ['a', 'equals', { frac: ['b', 'v', 'c'] }],
        'b': {
          content: ['b', 'equals', 'a', 'times', 'c'],
          elementMods: {
            b: { color: [0.5, 1, 0.5, 1] },
          },
          // Define how the 'c' element will move to this form
          animation: {
            translation: {
              c: { style: 'curved', direction: 'up', mag: 1 },
            },
            // duration: 0.5,
          },
          scale: 2,
        },
        'c': {
          content: ['c', 'times', 'a', 'equals', 'b'],
          elementMods: {
            b: { color: [0, 1, 1, 1] },
          },
          // Define how the 'c' element will move to this form
          animation: {
            translation: {
              c: { style: 'curved', direction: 'down', mag: 0.5 },
            },
            // duration: 0.5,
          },
          fromForm: {
            a: {
              animation: {
                translation: {
                  c: { style: 'curved', direction: 'down', mag: 5 },
                },
              },
            },
          },
        },
      },
    },
  },
);
diagram.initialize();

const eqn = diagram.getElement('eqn');

// Show the equation form
eqn.showForm('t');

const a = diagram.getElement('eqn.a');
const b = diagram.getElement('eqn.b');
const c = diagram.getElement('eqn.c');
// Animate to the next form
const goTo = (form) => {
  console.log(form)
  eqn.goToForm({
    form, delay: 0.2, duration: 1.5, animate: 'move',
  });
  diagram.animateNextFrame();
}

a.makeTouchable();
b.makeTouchable();
c.makeTouchable();

a.onClick = goTo.bind(eqn, 'a');
b.onClick = goTo.bind(eqn, 'b');
c.onClick = goTo.bind(eqn, 'c');
// Queue drawing on the next animation frame
diagram.animateNextFrame();