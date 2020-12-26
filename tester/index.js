// const { prevSlide, nextSlide, loadSlides } = navigator();
const slideNav = new SlideNavigator();
const { Transform } = Fig;
const { range, rand, randSign } = Fig.tools.math;

const figure = new Fig.Figure({
  limits: [-2, -1.9, 4, 3], color: [0.5, 0.5, 0.5, 1],
});
class Recording {
  constructor(initialValue) {
    // This data class will hold signal data for the most recent 10s at a
    // resolution (sampling rade) of 0.02s.
    this.duration = 10;
    this.timeStep = 0.01;
    this.len = this.duration / this.timeStep;
    this.data = Array(this.len).fill(initialValue);
    // this.data[0] = initialValue;
    // console.log(this.data)

    // record the current time
    this.lastTime = new Date().getTime();
  }

  reset(value) {
    this.data = Array(this.len).fill(value);
  }

  // Update the signal data with the new value. Signal data is has a resolution
  // of 0.02s, so if this value comes in more than 0.04s after the last value
  // was recorder, then use interpolation to fill in the missing samples.
  update(value) {
    const currentTime = new Date().getTime();
    const deltaTime = (currentTime - this.lastTime) / 1000;

    // If the value has come in faster than the time resolution, then
    // do nothing
    if (deltaTime < this.timeStep) {
      return;
    }

    this.lastTime = currentTime;

    // Count the number of samples that need to be added to the signal
    const count = Math.floor(deltaTime / this.timeStep);

    // Interpolate between the last recorded value and the new value
    const newValues = [];
    const deltaValue = (this.data[0] - value) / (count);
    for (let i = 0; i < count; i += 1) {
      newValues.push(value + deltaValue * i);
    }
    this.data = [...newValues, ...this.data.slice(0, this.len - count)];
  }

  getY(timeDelta) {
    const index = Math.floor(timeDelta / this.timeStep + this.timeStep / 10);
    // console.log(index)
    return this.data[index];
  }

  // // Make an array of points where this.data is plotted against this.x
  // getPoints() {
  //   return this.data.map((value, index) => new Fig.Point(this.x[index], value));
  // }
}

const startX = -1.5;
let f = 0.3; // Hz
const A = 0.7;   // m
let c = 1;   // m/s

// Helper function to make buttons
const button = (name, position, label) => ({
  name,
  method: 'collections.rectangle',
  options: {
    width: 0.4,
    height: 0.2,
    line: { width: 0.005 },
    corner: { radius: 0.03, sides: 5 },
    button: true,
    position,
    label,
  },
  mods: { isTouchable: true, touchBorder: 0.1 },
});

figure.add([
  {
    name: 'xAxis',
    method: 'collections.axis',
    options: {
      start: 0,
      stop: 3.2,
      length: 3.2,
      line: { width: 0.005, arrow: { end: 'barb' } },
      ticks: { step: 0.5, length: 0.1 },
      labels: [
        { font: { size: 0.08 }, text: [''] },
        { values: 0, text: '0', offset: [-0.1, 0.13], font: { size: 0.08 } },
      ],
      position: [-1.5, 0],
      title: {
        font: { style: 'italic', family: 'serif', size: 0.12 },
        text: ['x', { font: { size: 0.06 }, lineSpace: 0.08, text: 'meters' }],
        position: [3.3, 0.03],
      },
    },
  },
  {
    name: 'yAxis',
    method: 'collections.axis',
    options: {
      axis: 'y',
      start: -A - 0.1,
      stop: A + 0.1,
      length: A * 2 + 0.2,
      line: { width: 0.005, arrow: 'barb' },
      // ticks: { step: 0.5, length: 0.1 },
      // labels: { font: { size: 0.08 }, text: ['0'] },
      position: [-1.5, -A - 0.1],
      title: {
        font: { style: 'italic', family: 'serif', size: 0.12 },
        text: ['y', { font: { size: 0.06 }, lineSpace: 0.08, text: 'meters' }],
        // position: [1.2, 0],
        rotation: 0,
        offset: [0.1, A + 0.2],
      },
    },
  },
  {
    name: 'description',
    method: 'primitives.textLines',
    options: {
      font: { color: [0.5, 0.5, 0.5, 1], size: 0.1, weight: 100 },
      xAlign: 'center',
      yAlign: 'middle',
      position: [0, -A - 0.9],
      lineSpace: 0.15,
    },
    mods: {
      isTouchable: true,
    },
  },
  button('nextButton', [1.5, -A - 0.9], 'Next'),
  button('prevButton', [-1.5, -A - 0.9], 'Prev'),
  {
    name: 'balls',
    method: 'collection',
  },
]);


const ball = (x, index, sides = 10) => ({
  name: `ball${index}`,
  method: 'primitives.polygon',
  path: 'balls',
  options: {
    sides,
    radius: 0.02,
    transform: new Transform().translate(x, 0),
    color: [1, 0, 0, 1],
  },
  mods: {
    dimColor: [0.7, 0.7, 0.7, 1],
  },
});


const xValues = range(-1.46, 1.5, 0.04);
const data = new Recording(0);

xValues.forEach((x, index) => {
  figure.add(ball(x, index + 1));
  const b = figure.getElement(`balls.ball${index + 1}`);
  b.custom.x = x;
});

figure.add(ball(-1.5, 0, 50));
const b0 = figure.getElement('balls.ball0');
b0.setMovable();
b0.touchBorder = 0.2;
b0.move.bounds = {
  translation: { left: startX, right: startX, bottom: -A, top: A }
};

// Update function for everytime we want to update the signal
function update() {
  const { y } = figure.elements._balls._ball0.transform.order[0];
  data.update(y);
  for (let i = 1; i < xValues.length + 1; i += 1) {
    const b = figure.elements._balls[`_ball${i}`];
    const by = data.getY((b.custom.x - startX) / c);
    b.setPosition(b.custom.x, by);
  }
}

// Before each draw, update the points
figure.subscriptions.add('beforeDraw', () => {
  update();
});

// After each draw, call a next animation frame so udpates happen on each frame
figure.subscriptions.add('afterDraw', () => {
  figure.animateNextFrame();
});

const reset = () => {
  figure.stop();
  data.reset(0);
  b0.setPosition(startX, 0);
};

const disturbPulse = () => {
  reset();
  const y = rand(0.1, 0.4) * randSign();
  const t = rand(0.2, 0.4);
  b0.animations.new()
    .position({ duration: t, target: [startX, y], progression: 'easeout' })
    .position({ duration: t, target: [startX, 0], progression: 'easein' })
    .start();
};
// disturbPulse();

const disturbSine = (delay = 0, resetSignal = true) => {
  if (resetSignal) {
    reset();
  }
  b0.animations.new()
    .delay(delay)
    .custom({
      callback: p => b0.setPosition(startX, A * Math.sin(p * 10000 * 2 * Math.PI * f)),
      duration: 10000,
    })
    .start();
};
// disturbSine();

figure.elements._balls.dim();

const brac1 = content => ({
  brac: {
    left: 'lb1', content, right: 'rb1', height: 0.2, descent: 0.05,
  },
});
const brac2 = content => ({
  brac: {
    left: 'lb2', content, right: 'rb2', height: 0.2, descent: 0.05,
  },
});
const brac3 = content => ({
  brac: {
    left: 'lb3', content, right: 'rb3', height: 0.2, descent: 0.05,
  },
});
const scale = (content, s = 0.8) => ({
  scale: { content, scale: s },
});
// Add equation
figure.add([
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      // Define the elements that require specific styling
      color: [0.5, 0.5, 0.5, 1],
      elements: {
        sin: { style: 'normal' },
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
        lb3: { symbol: 'squareBracket', side: 'left' },
        rb3: { symbol: 'squareBracket', side: 'right' },
        equals: '  =  ',
        w1: '\u03c9',
        w2: '\u03c9',
        min: ' \u2212 ',
        comma1: ', ',
        comma2: ', ',
        v: { symbol: 'vinculum' },
      },
      phrases: {
        ytx: ['y_0', brac1(['x_3', 'comma1', 't_0'])],
        sinkx: ['sin', brac2(['w1', 't_2', 'min', 'k', 'x_2'])],
        t1: { sub: ['t_2', '_1_1'] },
        // t12: { sub: ['t_3', '_1_2'] },
        x1: { sub: ['x_1', '_1_3'] },
        x12: { sub: ['x_3', '_1_4'] },
        x0: { sub: ['x_1', '_0'] },
        yx1: ['y_0', brac1(['x12', 'comma1', 't_0'])],
        // yx0: ['y_0', brac2(['x0', 'comma2', 't_1', 'min', 't12'])],
        y0: ['y_0', brac1(['x0', 'comma1', 't_1'])],
        x1OnC: { frac: ['x1', 'v', 'c'] },
        xOnC: { frac: ['x_2', 'v', 'c'] },
        sX1OnC: scale('x1OnC'),
        sXOnC: scale('xOnC'),
        yx1c: ['y_0', brac2(['x0', 'comma2', 't_1', 'min', 'sX1OnC'])],
        yxc: ['y_0', brac2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
      },
      formDefaults: {
        alignment: { fixTo: 'equals' },
        duration: 1,
      },
      forms: {
        0: ['ytx', 'equals', 'sinkx'],
        1: [],
        2: ['t1', 'equals', 'x1OnC'],
        3: ['y0', 'equals', 'A', 'sin', brac2(['w1', 't_3'])],
        4: ['yx1', 'equals', 'A', 'sin', brac2(['w1', brac3(['t_3', 'min', 't1'])])],
        // 3: ['yx1', 'equals', 'yx0'],
        // 4: ['yx1', 'equals', 'yx1c'],
        // 5: ['ytx', 'equals', 'yxc'],
      },
      formSeries: ['0'],
      position: [-0.3, -A - 0.4],
    },
  },
  {
    name: 'sideEqn',
    method: 'equation',
    options: {
      scale: 0.5,
      elements: {
        id1: '    (1)',
        id2: '    (2)',
        v: { symbol: 'vinculum' },
        comma1: ', ',
        comma2: ', ',
        min: ' \u2212 ',
        lb1: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
      },
      phrases: {
        t1: { sub: ['t', '_1_1'] },
        x1: { sub: ['x', '_1_2'] },
        x0: { sub: ['x_1', '_0'] },
        ytx: ['y_1', brac1(['x_3', 'comma1', 't_0'])],
        xOnC: { frac: ['x_2', 'v', 'c'] },
        sXOnC: scale('xOnC'),
        yxc: ['y_0', brac2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
      },
      formDefaults: { alignment: { xAlign: 'right' } }, // { fixTo: 'equals' } },
      forms: {
        2: ['t1', '_  =  ', { frac: ['x1', 'vinculum', 'c'] }, 'id1'],
        5: ['ytx', '_  =  ', 'yxc', 'id2'],
      },
      position: [1.4, -0.8],
    },
  },
]);

const eqn = figure.getElement('eqn');
const nextButton = figure.getElement('nextButton');
const prevButton = figure.getElement('prevButton');
const description = figure.getElement('description');
const sideEqn = figure.getElement('sideEqn');
const balls = figure.getElement('balls');

nextButton.onClick = slideNav.nextSlide;
prevButton.onClick = slideNav.prevSlide;

const slides = [];

const modifiers = {
  disturbance: {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => disturbPulse(),
    touchBorder: [0.1, 0.03, 0.1, 0.1],
  },
  'first particle': {
    font: { color: [1, 0, 0, 1] },
    onClick: () => b0.pulse({ scale: 4 }),
  },
  'sine function': {
    font: { color: [1, 0, 0, 1] },
    onClick: () => disturbSine(0, true),
  },
  'some point': {
    font: { color: [1, 0, 0, 1] },
    onClick: () => figure.getElement('balls.ball50').pulse({ scale: 4 }),
  },
  1: {
    font: { family: 'Times New Roman', size: 0.06 },
    offset: [0, -0.03],
    inLine: false,
  },
  0: {
    font: { family: 'Times New Roman', size: 0.06 },
    offset: [0, -0.03],
    inLine: false,
  },
  x: { font: { family: 'Times New Roman', style: 'italic' } },
  y: { font: { family: 'Times New Roman', style: 'italic' } },
  t: { font: { family: 'Times New Roman', style: 'italic' } },
  c: { font: { family: 'Times New Roman', style: 'italic' } },
};

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'Discover why a travelling sine wave can be',
    'defined by the equation above.',
    {
      font: { size: 0.06 },
      text: 'And the relationship between frequency wavelength, and velocity.',
    },
  ],
  steadyState: () => {
    reset();
    disturbSine(1);
    figure.elements._balls.dim();
    sideEqn.hide();
    eqn.showForm('0');
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'A wave is a |disturbance| that propagates through',
    'a medium or field.',
    {
      text: 'Touch the word |disturbance| or move the |first particle| manually.',
      font: { size: 0.07 },
      // lineSpace: 0.2,
    },
    // {
    //   font: { size: 0.07 },
    //   text: 'The medium above is a string of particles that move in |y|',
    // },
    // {
    //   font: { size: 0.06 },
    //   text: 'The particles do not travel along |x| with the wave, they are just disturbed by it.',
    // },
  ],
  steadyState: () => {
    reset();
    disturbPulse();
    eqn.showForm('1');
    figure.elements._balls.highlight(['ball0']);
  },
});


// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The |disturbance| moves with a constant velocity |c|.',
    {
      text: 'Thus, the time it takes to move some distance |x||1|',
      lineSpace: 0.2,
    },
    'can be calculated.',
  ],
  steadyState: () => {
    reset();
    disturbPulse();
    eqn.showForm('1');
  },
});

slides.push({
  transitionFromPrev: done => eqn.goToForm({
    form: '2', callback: done,
  }),
  steadyState: () => { eqn.showForm('2'); },
});

slides.push({
  transitionFromPrev: (done) => {
    sideEqn.hide();
    const p = eqn.getPosition();
    figure.elements.animations.new()
      .inParallel([
        eqn.animations.position({ target: [0.91, -0.8], duration: 1 }),
        eqn.animations.scale({ target: 0.714, duration: 1 }),
      ])
      .trigger(() => {
        eqn.setPosition(p);
        eqn.setScale(1);
        eqn.showForm('1');
        sideEqn.showForm('2');
      })
      .whenFinished(done)
      .start();
  },
  steadyState: () => {
    eqn.showForm('1');
    sideEqn.showForm('2');
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'Now, let\'s disturb the |first particle| with a',
    '|sine function|.',
  ],
  steadyState: () => {
    eqn.showForm('1');
    sideEqn.showForm('2');
  },
});

slides.push({
  transitionFromPrev: done => eqn.goToForm({
    form: '3', callback: done,
  }),
  steadyState: () => {
    eqn.showForm('3');
    sideEqn.showForm('2');
    balls.hasTouchableElements = false;
    if (!figure.getElement('balls.ball0').isAnimating()) {
      disturbSine(0, true);
    }
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The disturbance at |some point| |x||1|  is the',
    'disturbance at |x||0|  from |t||1|  seconds ago.',
  ],
  steadyState: () => {
    eqn.showForm('3');
    sideEqn.showForm('2');
    figure.elements._balls.highlight(['ball0', 'ball50']);
  },
});

slides.push({
  transitionFromPrev: done => eqn.goToForm({
    form: '4', callback: done, animate: 'move', duration: 1,
  }),
  steadyState: () => {
    eqn.showForm('4');
    sideEqn.showForm('2');
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'In other words, the disturbance at |x||1|  is',
    'the disturabance at |x||0| |t||1| seconds ago',
  ],
  steadyState: () => {
    eqn.showForm('1');
    sideEqn.showForm('2');
    figure.elements._balls.highlight(['ball0', 'ball50']);
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'In this case our medium is a string made up of',
    'particles.',
  ],
  steadyState: () => {
    reset();
    figure.elements._balls.dim();
    eqn.showForm('1');
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The particles can only move in |y| as the',
    '|disturbance| passes',
  ],
  steadyState: () => {
    reset();
    disturbPulse();
    figure.elements._balls.highlight(['ball25', 'ball50']);
    eqn.showForm('1');
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'Make your own disturbance by moving the',
    '|first particle| in different ways.',
  ],
  steadyState: () => {
    reset();
    figure.elements._balls.highlight(['ball0']);
    eqn.showForm('1');
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The |disturbance| propagates with a velocity |c|',
  ],
  steadyState: () => { eqn.showForm('1'); },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The time it takes for the disturbance to',
    'travel some distance |x||1|  is then',
  ],
  steadyState: () => { eqn.showForm('1'); },
});

slides.push({
  transitionFromPrev: done => eqn.goToForm({
    form: '2', animate: 'move', duration: 1, callback: done,
  }),
  steadyState: () => { eqn.showForm('2'); },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'Let\'s remember this equation as (1)',
  ],
  steadyState: () => {
    eqn.showForm('2');
    sideEqn.hide();
  },
});

slides.push({
  transitionFromPrev: (done) => {
    sideEqn.hide();
    const p = eqn.getPosition();
    figure.elements.animations.new()
      .inParallel([
        eqn.animations.position({ target: [0.91, -0.8], duration: 1 }),
        eqn.animations.scale({ target: 0.714, duration: 1 }),
      ])
      .trigger(() => {
        eqn.setPosition(p);
        eqn.setScale(1);
        eqn.showForm('1');
        sideEqn.showForm('0');
      })
      .whenFinished(done)
      .start();
  },
  steadyState: () => {
    eqn.showForm('1');
    sideEqn.showForm('0');
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'It takes |t||1|  seconds for a disturbance to',
    'travel from |x| = 0 to |x||1|, therefore |y| at |x||1|',
    '|y| at |x||1|  is the same as at |x| = 0',
    '|t||1|  seconds ago.',
  ],
  steadyState: () => {
    eqn.showForm('1');
    sideEqn.showForm('0');
  },
});

slides.push({
  transitionFromPrev: done => eqn.goToForm({
    form: '3', animate: 'dissolve', callback: done,
  }),
  steadyState: () => {
    eqn.showForm('3');
    sideEqn.showForm('0');
  },
});


// /////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
slideNav.loadSlides(slides, prevButton, nextButton, figure, description, modifiers);

slideNav.goToSlide(5);
// // Unique descriptions to use
// const descriptions = [
//   [ // 5
//     'In other words, the disturbance at |x||1|  is the same',
//     'as the disturbance at |x||0| , |t||1|  seconds ago.',
//   ],
//   [ // 6
//     'We can substitute in (1)',
//   ],
//   [ // 7
//     '|x||1|  is arbitrary, so really this can be rewritten for',
//     'any |x|',
//   ],
//   [
//     // 8
//     'Let\'s remember this equation as (2)',
//   ],
//   [ // 9
//     'A |disturbance| at x = 0 happens over time, and is thus',
//     'a function of time ',
//     'disturbance takes x/c to propagate to x, then the function',
//     'at x will be the same as at x=0, just x/c seconds ago',
//   ],
//   'The right hand side simplifies to 1',
//   'Use mathematical notation for the |limit|',
//   'The |vertical| line is the |sine| of |x|',
//   ['The |radius| is 1, so the |arc| length equals', 'the |angle1|'],
//   [
//     'Summary: for |very small angles| |x|, the angle',
//     'and |sin| |x1| can often be considered |equal|',
//   ],
// ];

// const modifiers = {
//   disturbance: {
//     font: { color: [0, 0.5, 1, 1] },
//     onClick: () => {
//       disturbPulse();
//     },
//     touchBorder: [0.1, 0.03, 0.1, 0.1],
//   },
//   'red particle': {
//     font: { color: [1, 0, 0, 1] },
//     onClick: () => {
//       b0.pulse({ scale: 4 });
//     },
//   },
//   1: {
//     font: { family: 'Times New Roman', size: 0.06 },
//     offset: [0, -0.03],
//     inLine: false,
//   },
//   0: {
//     font: { family: 'Times New Roman', size: 0.06 },
//     offset: [0, -0.03],
//     inLine: false,
//   },
//   x: { font: { family: 'Times New Roman', style: 'italic' } },
//   t: { font: { family: 'Times New Roman', style: 'italic' } },
//   c: { font: { family: 'Times New Roman', style: 'italic' } },
//   // radius: {
//   //   font: { color: [0, 0.5, 1, 1] },
//   //   onClick: () => radiusLine.pulseWidth(),
//   //   touchBorder: [0.1, 0.03, 0.1, 0.1],
//   // },
//   // arc: {
//   //   font: { color: [1, 0, 0, 1] },
//   //   onClick: () => figure.getElement('arc.label').pulse({ xAlign: 'left' }),
//   //   touchBorder: 0.1,
//   // },
// };

// const slides = [
//   {
//     description: 0,
//     form: '0',
//     shapeState: () => {
//       reset();
//       disturbSine();
//       sideEqn.hide();
//     },
//   },
//   {
//     description: 1,
//     form: '1',
//     shapeState: () => {
//       figure.elements._balls.dim();
//       disturbPulse();
//     },
//   },
//   {
//     description: 2,
//     form: '1',
//     shapeState: () => {
//       reset();
//       figure.elements._balls.highlight(['ball0']);
//     },
//   },
//   { description: 3, form: '1' },
//   { description: 3, form: '2' },
//   {
//     description: 4,
//     form: '2',
//     shapeState: () => {
//       sideEqn.hide();
//     },
//   },
//   {
//     description: 4,
//     form: '2',
//     shapeState: () => {
//       sideEqn.hide();
//       const p = eqn.getPosition();
//       figure.elements.animations.new()
//         .inParallel([
//           eqn.animations.position({ target: [1.45, -0.8], duration: 1 }),
//           eqn.animations.scale({ target: 0.714, duration: 1 }),
//         ])
//         .trigger(() => {
//           eqn.setPosition(p);
//           eqn.setScale(1);
//           eqn.showForm('1');
//           sideEqn.showForm('0');
//         })
//         .start();
//     },
//   },
//   {
//     description: 5,
//     form: '1',
//     shapeState: () => {
//       reset();
//       figure.elements._balls.highlight(['ball0']);
//     },
//   },
//   { description: 5, form: '3' },
//   { description: 6, form: '3' },
//   {
//     description: 6,
//     form: '4',
//     shapeState: () => {
//       sideEqn.showForm('0');
//     },
//   },
//   {
//     description: 7,
//     form: '4',
//     shapeState: () => {
//       sideEqn.animations.new()
//         .dissolveOut(0.5)
//         .start();
//     },
//   },
//   { description: 7, form: '5' },
//   { description: 8, form: '5' },
//   {
//     description: 8,
//     form: '5',
//     shapeState: () => {
//       sideEqn.hide();
//       const p = eqn.getPosition();
//       figure.elements.animations.new()
//         .inParallel([
//           eqn.animations.position({ target: [1.45, -0.8], duration: 1 }),
//           eqn.animations.scale({ target: 0.714, duration: 1 }),
//         ])
//         .trigger(() => {
//           eqn.setPosition(p);
//           eqn.setScale(1);
//           eqn.showForm('1');
//           sideEqn.showForm('5');
//         })
//         .start();
//     },
//   },
// ];

// // // Slide management
// // let slideIndex = 0;
// // // const eqn = figure.getElement('eqn');

// // // Each slide defines which equation form to show, which
// // // description to use and what state the shape should be in
// // const showSlide = (index) => {
// //   const slide = slides[index];
// //   // Set equation form
// //   if (slide.form) {
// //     eqn.goToForm({ form: slide.form, animate: 'move' });
// //   }
// //   // Stop any description animations and set updated description
// //   description.stop();
// //   description.custom.updateText({
// //     text: descriptions[slide.description],
// //     modifiers,
// //   });
// //   // Set the shape state
// //   if (slide.shapeState != null) {
// //     slide.shapeState();
// //   }
// //   // Disable previous button if at first slide
// //   if (index === 0) {
// //     prevButton.setOpacity(0.7);
// //     prevButton.isTouchable = false;
// //   } else if (prevButton.isTouchable === false) {
// //     prevButton.setOpacity(1)
// //     prevButton.isTouchable = true;
// //   }
// // };

// // // When the Next button is clicked, progress to the next slide.
// // nextButton.onClick = () => {
// //   // If the equation is still animating, then do not progress, simply
// //   // complete the animation instantly
// //   if (eqn.eqn.isAnimating) {
// //     eqn.stop('complete');
// //     return;
// //   }
// //   const oldDescription = slides[slideIndex].description;
// //   slideIndex = (slideIndex + 1) % slides.length;
// //   showSlide(slideIndex);
// //   // If the description changes, then dissolve it in
// //   const newDescription = slides[slideIndex].description;
// //   if (newDescription != oldDescription) {
// //     description.animations.new()
// //       .dissolveIn(0.2)
// //       .start();
// //   }
// // };

// // // Go backwards through slides
// // prevButton.onClick = () => {
// //   if (eqn.eqn.isAnimating) {
// //     eqn.stop('complete');
// //     return;
// //   }
// //   slideIndex = (slideIndex - 1) < 0 ? slides.length - 1 : slideIndex - 1;
// //   showSlide(slideIndex);
// // };

// // showSlide(0);

// // const slides1 = [];

// // slides1.push({
// //   description: [
// //     'Discover why a travelling sine wave can be',
// //     'defined by the equation above.',
// //     {
// //       font: { size: 0.06 },
// //       text: 'And the relationship between frequency wavelength, and velocity.',
// //     },
// //   ],
// //   modifiers: {},
// //   form: '1',
// //   transitionFromPrev: (done) => {},
// //   steadyState: () => {},
// // });
