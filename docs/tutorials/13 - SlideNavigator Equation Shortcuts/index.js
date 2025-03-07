/* globals Fig */
const figure = new Fig.Figure();

// Figure consists of an equation and a description
const [eqn, description] = figure.add([
  {
    make: 'equation',
    formDefaults: { alignment: { xAlign: 'center' } },
    forms: {
      0: ['a', '_ + ', 'b_1', '_ = ', 'c'],
      1: ['a', '_ + ', 'b_1', '_ - b_2', '_ = ', 'c', '_ - ', 'b_3'],
      2: ['a', '_ = ', 'c', '_ - ', 'b_3'],
    },
    formSeries: ['0', '1', '2'],
    mods: {
      isTouchable: true,
      touchBorder: 0.1,
    },
  },
  {
    make: 'ftext',
    modifiers: {
      a: { font: { family: 'Times New Roman', style: 'italic', size: 0.12 } },
      b: { font: { family: 'Times New Roman', style: 'italic', size: 0.12 } },
    },
    xAlign: 'center',
    font: { size: 0.1 },
    position: [0, -0.5],
  },
]);

// The SlideNavigator will automatically animate equations and a text element.
// If `form` and `text` properties are the same for consecutive slides, they
// only need to be defined in the first slide.
const slides = [
  { form: '0', text: 'Goal: Rearrange for |a|' },
  { text: 'Subtract |b| from both sides' },
  { form: '1' },
  { text: '|b| cancels on left side' },
  { form: '2' },
];

// Create a slide navigator
const nav = new Fig.SlideNavigator({
  collection: figure.elements, slides, equation: eqn, text: description,
});
nav.goToSlide(0);

// Clicking on the equation progresses to the next slide, or next equation form
eqn.notifications.add('onClick', () => nav.nextSlide());
