const figure = new Fig.Figure();

const eqn = figure.add({
  make: 'equation',
  elements: { b: 'b' },
  formDefaults: {
    alignment: { fixTo: 'b' },
  },
  forms: {
    0: 'a',
  },
});
