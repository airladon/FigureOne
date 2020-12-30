const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1], font: { size: 0.1 },
});

// const button = (name, position, label) => ({
//   name,
//   method: 'collections.rectangle',
//   options: {
//     width: 0.4,
//     height: 0.2,
//     line: { width: 0.005 },
//     corner: { radius: 0.03, sides: 5 },
//     button: true,
//     position,
//     label,
//   },
//   mods: { isTouchable: true, touchBorder: 0.1 },
// });

// figure.add([
//   {
//     name: 'description',
//     method: 'primitives.textLines',
//     options: {
//       font: { color: [0.5, 0.5, 0.5, 1], size: 0.1, weight: 100 },
//       xAlign: 'center',
//       yAlign: 'middle',
//       position: [0, -1],
//       lineSpace: 0.15,
//     },
//     mods: {
//       isTouchable: true,
//     },
//   },
//   button('nextButton', [1.5, -1], 'Next'),
//   button('prevButton', [-1.5, -1], 'Prev'),
// ]);


// Equation to navigate through
figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      plus: '  +  ',
      equals: '  =  ',
      minus1: '  \u2212  ',
      minus2: '  \u2212  ',
    },
    formDefaults: { alignment: { xAlign: 'center' } },
    forms: {
      0: ['a', 'plus', 'b', 'equals', 'c'],
      1: ['a', 'plus', 'b', 'minus1', 'b_1', 'equals', 'c', 'minus2', 'b_2'],
      2: [
        'a', 'plus',
        { strike: ['b', 's1_strike'] },
        'minus1',
        { strike: ['b_1', 's2_strike'] },
        'equals', 'c', 'minus2', 'b_2',
      ],
      3: ['a', 'equals', 'c', 'minus2', 'b_2'],
    },
    position: [0, 0.5],
  },
});

figure.add({
  name: 'nav',
  method: 'collections.slideNavigator',
  options: {
    // prevButton: { position: [-0.5, -1] },
    // nextButton: { position: [0.5, -1] },
    // text: { position: [0, 0.5] },
    equation: 'eqn',
    slides: [
      { text: 'Initial Equation', form: '0' },
      { text: 'Subtract b from both sides' },
      { form: '1' },
      { text: 'b terms on the left cancel' },
      { form: '2' },
      { form: '3' },
    ],
  },
});

// // const nav = figure.getElement('nav');
// figure.getElement('nav').setSlides([
//   { text: 'hello' },
//   { text: 'there' },
// ]);
