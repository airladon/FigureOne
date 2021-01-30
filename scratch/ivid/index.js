
/* globals Fig, Recorder, TimeKeeper */
const { Transform, Point } = Fig;
const { range, rand, randSign } = Fig.tools.math;
// const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });


const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3],
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.1 },
});

figure.add([
  {
    name: 'gridMinor',
    method: 'grid',
    options: {
      bounds: figure.limits,
      xStep: 0.1,
      yStep: 0.1,
      color: [0.9, 0.9, 0.9, 1],
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: figure.limits,
      xStep: 0.5,
      yStep: 0.5,
    },
  },

]);
figure.add({
  name: 'p',
  method: 'polygon',
  options: {
    radius: 0.5,
    color: [0.3, 0.3, 0.3, 0.7],
  },
  mods: {
    isMovable: true,
  },
});

const [eqn, nav] = figure.add([
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      forms: {
        0: ['a', '_ + ', 'b', '_ = ', 'c'],
        1: ['a', '_ + ', 'b', '_ - b_1', '_ = ', 'c', '_ - ', 'b_2'],
        2: ['a', '_ = ', 'c', '_ - ', 'b_2'],
      },
    },
  },
  {
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      equation: 'eqn',
      nextButton: { position: [1, -1] },
      prevButton: { position: [-1, -1] },
      text: { position: [0, -1], yAlign: 'middle' },
    },
  },
]);

figure.add({
  name: 'cursor',
  method: 'collections.cursor',
  options: {
    color: [1, 0.6, 0.6, 0.7],
  },
  mods: {
    isShown: false,
  },
});

const slides = [
  {
    showCommon: ['p', 'gridMinor', 'gridMajor'],
    text: 'hello world',
    form: '0',
  },
  {
    text: 'how are you',
  },
  {
    // text: 'hello world',
    fromForm: '0',
    form: '1',
  },
];
console.log(eqn, nav)
nav.loadSlides(slides);
// nav.goToSlide(0);
console.log(figure.recorder)