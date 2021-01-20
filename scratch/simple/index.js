const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

// Add name and element
const [p] = figure.add({
  method: 'equation',
  options: {
    forms: { 
      0: 't',
    },
  },
});
// p.showForm('0');
console.log(p._t.lastDrawTransform.order);


// const [eqn] = figure.add(
//   {
//     name: 'eqn',
//     method: 'equation',
//     options: {
//       forms: {
//         test: ['at_1'],
//       },
//     },
//   },
// );
// eqn.showForm('test')
// console.log(eqn._at_1.lastDrawTransform.order)