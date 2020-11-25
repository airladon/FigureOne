// Create figure
const figure = new Fig.Figure();

figure.add(
  // Add equation element
  {
    name: 'eqn',
    method: 'equation',
    options: {
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
        base: ['a', 'equals', { frac: ['b', 'v', 'c'] }],
      },
    },
  },
);
