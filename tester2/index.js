const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });

figure.add([
  {   // Square drawing
    name: 'square',
    method: 'primitives.rectangle',
    options: {
      width: 0.4,
      height: 0.4,
      line: { width: 0.005 },
    },
  },
  {   // Side length label
    name: 'label',
    method: 'text',
    options: {
      yAlign: 'middle',
      position: [0.3, 0],
      font: { size: 0.1 },
    },
  },
  {   // Equation
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        eq1: '  =  ',
        eq2: '  =  ',
        eq3: '  =  ',
      },
      phrases: {
        sideSqrd: { sup: ['side', '_2'] },
        areaEqSide: [{ bottomComment: ['Area', 'square'] }, 'eq1', 'sideSqrd'],
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
  {   // Slide Navigator
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
const square = figure.getElement('square');
const label = figure.getElement('label');
// Update the square size, and side label for any sideLength
const update = (sideLength) => {
  square.custom.updatePoints({ width: sideLength, height: sideLength });
  label.setPosition(sideLength / 2 + 0.1, 0);
  label.custom.updateText({ text: `${(sideLength / 0.4).toFixed(1)}` });
};
// Add slides to the navigator
figure.getElement('nav').loadSlides([
  {
    showCommon: ['square', 'label', 'eqn'],
    text: 'The area of a square is the side length squared',
    form: '0',
    steadyStateCommon: () => update(0.4),
  },
  { text: 'So for side length of 1 we have and area of 1' },
  { form: '1' },
  { form: null, text: 'What is the area for side length 2?' },
  {
    transition: (done) => {
      square.animations.new()
        .custom({
          duration: 1,
          callback: p => update(0.4 + p * 0.4),
        })
        .whenFinished(done)
        .start();
    },
    steadyStateCommon: () => update(0.4),
  },
  { form: '2' },
]);