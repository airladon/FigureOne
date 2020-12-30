const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1], font: { size: 0.1 },
});

// // At its simplest, the SlideNavigator can be used to navigate an equation
// figure.add([
//   {
//     name: 'eqn',
//     method: 'equation',
//     options: {
//       formDefaults: { alignment: { xAlign: 'center' } },
//       forms: {
//         0: ['a', '_ + ', 'b', '_ = ', 'c'],
//         1: ['a', '_ + ', 'b', '_ - b_1', '_ = ', 'c', '_ - ', 'b_2'],
//         2: ['a', '_ = ', 'c', '_ - ', 'b_2'],
//       },
//     },
//   },
//   {
//     name: 'nav',
//     method: 'collections.slideNavigator',
//     options: {
//       equation: 'eqn',
//       text: { position: [0, 0.3] },
//       slides: [
//         { text: 'Start with the equation', form: '0' },
//         { text: 'Subtract b from both sides' },
//         { form: '1' },
//         { text: 'The b terms cancel on the left hand side' },
//         { form: '2' },
//       ],
//     },
//   },
// ]);

// This example creates a story by evolving a description, a diagram
// and an equation.
figure.add([
  {
    name: 'square',
    method: 'primitives.rectangle',
    options: {
      width: 0.4,
      height: 0.4,
      line: { width: 0.005 },
    },
  },
  {
    name: 'label',
    method: 'text',
    options: {
      text: '1',
      yAlign: 'middle',
      position: [0.3, 0],
    },
  },
  {
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        eq1: '  =  ',
        eq2: '  =  ',
        eq3: '  =  ',
      },
      phrases: {
        areaSquare: { bottomComment: ['Area', 'square'] },
        sideSqrd: { sup: ['side', '_2'] },
        areaEqSide: ['areaSquare', 'eq1', 'sideSqrd'],
      },
      formDefaults: { alignment: { xAlign: 'center' } },
      forms: {
        0: ['areaEqSide'],
        1: ['areaEqSide', 'eq2', { sup: ['_1', '_2_1'] }, 'eq3', '_1_1'],
        2: ['areaEqSide', 'eq2', { sup: ['_2_2', '_2_1'] }, 'eq3', '4'],
      },
      position: [0, -0.8],
    },
  },
  {
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      equation: 'eqn',
      nextButton: { type: 'arrow', position: [1.2, -0.8] },
      prevButton: { type: 'arrow', position: [-1.2, -0.8] },
      text: { position: [0, 0.7], font: { size: 0.12 } },
    },
  },
]);

const nav = figure.getElement('nav');
const square = figure.getElement('square');
const label = figure.getElement('label');

const slides = [];
slides.push({
  text: 'The area of a square is the side length squared',
  form: '0',
  steadyStateCommon: () => {
    const side = 0.4;
    square.custom.updatePoints({ width: side, height: side });
    label.setPosition(side / 2 + 0.1, 0);
    label.custom.updateText({ text: '1.0' });
  },
});
slides.push({ text: 'So for side length of 1 we have and area of 1' });
slides.push({ form: '1' });
slides.push({
  text: 'So what is the area when the side length is 2?',
  form: '0',
});
slides.push({
  transition: (done) => {
    square.animations.new()
      .custom({
        duration: 1,
        callback: (p) => {
          const side = 0.4 + p * 0.4;
          square.custom.updatePoints({ width: side, height: side });
          label.setPosition(side / 2 + 0.1, 0);
          label.custom.updateText({ text: `${(side / 0.4).toFixed(1)}` });
        },
      })
      .whenFinished(done)
      .start();
  },
  steadyStateCommon: () => {
    square.custom.updatePoints({ width: 0.8, height: 0.8 });
    label.setPosition(0.5, 0);
    label.custom.updateText({ text: '2.0' });
  },
});
slides.push({ form: '2' });
nav.setSlides(slides);
