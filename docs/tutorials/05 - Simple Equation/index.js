// Create figure
const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

figure.add(
  {
    method: 'equation',
    // Equation elements are the individual terms in the equation
    elements: {
      a: 'a',
      b: 'b',
      c: 'c',
      v: { symbol: 'vinculum' },
      equals: ' = ',
    },
    // An equation form defines how the terms are arranged
    forms: {
      base: ['a', 'equals', { frac: ['b', 'v', 'c'] }],
    },
  },
);
