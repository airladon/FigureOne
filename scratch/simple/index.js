/* globals Fig */
const figure = new Fig.Figure({ backgroundColor: [1, 1, 1, 1] });

figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: { equals: ' = ' },
    forms: {
      form1: 'a',
      form2: ['a', 'equals', 'b'],
      form3: [{
        frac: {
          numerator: 'a',
          symbol: 'vinculum',
          denominator: 'c',
        },
      }, 'equals', 'b'],
      form4: { frac: ['a', 'vinculum', 'c'] },
    },
  },
});

figure.getElement('eqn').animations.new()
  .goToForm({ target: 'form2', animate: 'move', delay: 1 })
  .goToForm({ target: 'form3', animate: 'move', delay: 1 })
  .goToForm({ target: 'form4', animate: 'move', delay: 1 })
  .start();
