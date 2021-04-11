/* globals Fig */
const figure = new Fig.Figure();

// Figure consists of an equation and a description
const [eqn, description] = figure.add([
  {
    name: 'eqn',
    method: 'equation',
    options: {
      formDefaults: { alignment: { xAlign: 'center' } },
      forms: {
        0: ['a', '_ + ', 'b_1', '_ = ', 'c'],
        1: ['a', '_ + ', 'b_1', '_ - b_2', '_ = ', 'c', '_ - ', 'b_3'],
        2: ['a', '_ = ', 'c', '_ - ', 'b_3'],
      },
      formSeries: ['0', '1', '2'],
    },
    mods: {
      isTouchable: true,
      touchBorder: 0.1,
    },
  },
  {
    name: 'description',
    method: 'primitives.textLines',
    options: {
      modifiers: {
        a: { font: { family: 'Times New Roman', style: 'italic', size: 0.12 } },
        b: { font: { family: 'Times New Roman', style: 'italic', size: 0.12 } },
      },
      xAlign: 'center',
      font: { size: 0.1 },
      position: [0, -0.5],
    },
  },
]);

// Slides define a a figure state, and an animated transition between
// consecutive states. Each slide should define state compleletly and not
// depend on state from other slides. That way jumping between slides will not
// produce unexpected behavior.
const slides = [
  // Slide 0
  {
    show: [eqn, description],
    steadyState: () => {
      eqn.showForm('0');
      description.custom.updateText({ text: 'Goal: Rearrange for |a|' });
    },
  },

  // Slide 1
  {
    show: [eqn, description],
    enterState: () => {
      eqn.showForm('0');
      description.custom.updateText({ text: 'Goal: Rearrange for |a|' });
    },
    transition: (done) => {
      description.animations.new()
        .dissolveOut(0.5)
        .trigger({
          callback: () => description.custom.updateText({
            text: 'Subtract |b| from both sides',
          }),
        })
        .dissolveIn(0.5)
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      description.custom.updateText({ text: 'Subtract |b| from both sides' });
    },
  },

  // Slide 2
  {
    show: [eqn, description],
    enterState: () => {
      eqn.showForm('0');
      description.custom.updateText({ text: 'Subtract |b| from both sides' });
    },
    transition: (done) => {
      eqn.animations.new()
        .goToForm({ target: '1', animate: 'move' })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      eqn.showForm('1');
    },
  },

  // Slide 3
  {
    show: [eqn, description],
    enterState: () => {
      eqn.showForm('1');
      description.custom.updateText({ text: 'Subtract |b| from both sides' });
    },
    transition: (done) => {
      description.animations.new()
        .dissolveOut(0.5)
        .trigger({
          callback: () => description.custom.updateText({
            text: '|b| cancels on left side',
          }),
        })
        .dissolveIn(0.5)
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      description.custom.updateText({ text: '|b| cancels on left side' });
    },
  },

  // Slide 4
  {
    show: [eqn, description],
    enterState: () => {
      eqn.showForm('1');
      description.custom.updateText({ text: '|b| cancels on left side' });
    },
    transition: (done) => {
      eqn.animations.new()
        .goToForm({ target: '2', animate: 'move' })
        .whenFinished(done)
        .start();
    },
    steadyState: () => {
      eqn.showForm('2');
    },
  },
];

// Create a slide navigator. If slides aren't provided it will auto generate
// slides from the equation form series.
const nav = new Fig.SlideNavigator({ collection: figure.elements, slides });
nav.goToSlide(0);

// Clicking on the equation progresses to the next slide, or next equation form
eqn.subscriptions.add('onClick', () => nav.nextSlide());

