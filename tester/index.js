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
const scale = (content, s = 0.7) => ({
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
        arrow: {
          symbol: 'arrow',
          direction: 'up',
          arrowLength: 0.05,
          arrowWidth: 0.05,
          length: 0.2,
          // draw: 'static',
          // staticHeight: 0.2,
          lineWidth: 0.01,
        },
        line: { symbol: 'line', width: 0.007, dash: [0.01, 0.01], arrow: { start: { head: 'triangle', scale: 0.7 } } },
      },
      phrases: {
        ytx: ['y_1', brac1(['x_1', 'comma1', 't_1'])],
        sinkx: ['sin', brac2(['w1', 't_2', 'min', 'k', 'x_2'])],
        t1: { sub: ['t_2', '_1_1'] },
        x11: { sub: ['x_1', '_1_2'] },
        x12: { sub: ['x_2', '_1_3'] },
        x1OnC: { frac: ['x12', 'v', 'c'] },
        sX1OnC: scale('x1OnC'),
        x0: { sub: ['x_1', '_0'] },
        yx0t: ['y_0', brac1(['x0', 'comma1', 't_1'])],
        yx1t: ['y_0', brac1(['x11', 'comma1', 't_1'])],
        wt: ['w1', 't_3'],
        tToTMinT1: {
          bottomComment: {
            content: 't_3',
            comment: ['t_4', 'min', 't1'],
            symbol: 'arrow',
            contentSpace: 0.1,
            inSize: false,
          },
        },
        // tToTMinT1: {
        //   annotate: {
        //     content: 't_3',
        //     glyphs: {
        //       bottom: {
        //         symbol: 'arrow',
        //         annotation: {
        //           content: ['t_4', 'min', 't1'],
        //         },
        //       },
        //     },
        //   },
        // },
        // wtmint1: ['w1', brac3(['t_3', 'min', 't1'])],
        // wtminwt1:

        // // t12: { sub: ['t_3', '_1_2'] },
        // x12: { sub: ['x_3', '_1_4'] },
        // // yx0: ['y_0', brac2(['x0', 'comma2', 't_1', 'min', 't12'])],
        // xOnC: { frac: ['x_2', 'v', 'c'] },
        // sX1OnC: scale('x1OnC'),
        // sXOnC: scale('xOnC'),
        // yx1c: ['y_0', brac2(['x0', 'comma2', 't_1', 'min', 'sX1OnC'])],
        // yxc: ['y_0', brac2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
      },
      formDefaults: {
        alignment: { fixTo: 'equals' },
        duration: 1,
      },
      forms: {
        // 0: ['ytx', 'equals', 'sinkx'],
        0: {
          annotate: {
            content: 'abc',
            annotation: {
              content: 'def',
              offset: [0, 0.2],
              scale: 0.6,
              xPosition: 'right',
            },
            glyphs: {
              line: {
                symbol: 'line',
                annotation: 0,
                content: {
                  xAlign: 'center',
                  yAlign: 'top',
                  space: 0.02,
                },
                comment: {
                  xAlign: 'center',
                  yAlign: 'bottom',
                  space: 0.02,
                },
              },
            },
          },
        },
        1: [],
        2: ['t1', 'equals', 'x1OnC'],
        3: ['yx0t', 'equals', 'A', 'sin', brac2(['w1', 't_3'])],
        4: ['yx1t', 'equals', 'A', 'sin', brac2(['w1', 'tToTMinT1'])],
        5: ['yx1t', 'equals', 'A', 'sin', brac2(['w1', brac3(['t_3', 'min', 't1'])])],
        6: ['yx1t', 'equals', 'A', 'sin', brac2(['w1', brac3(['t_3', 'min', 'sX1OnC'])])],
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
  substitute: {
    font: { color: [1, 0, 0, 1] },
    onClick: () => {
      eqn.pulse({ elements: ['t_2', '_1_1'], centerOn: 't_2', xAlign: 'right' });
      sideEqn.pulse({ scale: 1.3 });
    },
  },
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
    'We can now |substitute| equation (1)',
  ],
  steadyState: () => {
    eqn.showForm('4');
    sideEqn.showForm('2');
  },
});

slides.push({
  transitionFromPrev: done => eqn.goToForm({
    form: '5', callback: done, animate: 'move', duration: 1,
  }),
  steadyState: () => {
    eqn.showForm('5');
    sideEqn.showForm('2');
  },
});









// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'In other words, the disturbance at |x||1|  is',
//     'the disturabance at |x||0| |t||1| seconds ago',
//   ],
//   steadyState: () => {
//     eqn.showForm('1');
//     sideEqn.showForm('2');
//     figure.elements._balls.highlight(['ball0', 'ball50']);
//   },
// });


// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'In this case our medium is a string made up of',
//     'particles.',
//   ],
//   steadyState: () => {
//     reset();
//     figure.elements._balls.dim();
//     eqn.showForm('1');
//   },
// });

// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'The particles can only move in |y| as the',
//     '|disturbance| passes',
//   ],
//   steadyState: () => {
//     reset();
//     disturbPulse();
//     figure.elements._balls.highlight(['ball25', 'ball50']);
//     eqn.showForm('1');
//   },
// });

// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'Make your own disturbance by moving the',
//     '|first particle| in different ways.',
//   ],
//   steadyState: () => {
//     reset();
//     figure.elements._balls.highlight(['ball0']);
//     eqn.showForm('1');
//   },
// });

// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'The |disturbance| propagates with a velocity |c|',
//   ],
//   steadyState: () => { eqn.showForm('1'); },
// });

// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'The time it takes for the disturbance to',
//     'travel some distance |x||1|  is then',
//   ],
//   steadyState: () => { eqn.showForm('1'); },
// });

// slides.push({
//   transitionFromPrev: done => eqn.goToForm({
//     form: '2', animate: 'move', duration: 1, callback: done,
//   }),
//   steadyState: () => { eqn.showForm('2'); },
// });

// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'Let\'s remember this equation as (1)',
//   ],
//   steadyState: () => {
//     eqn.showForm('2');
//     sideEqn.hide();
//   },
// });

// slides.push({
//   transitionFromPrev: (done) => {
//     sideEqn.hide();
//     const p = eqn.getPosition();
//     figure.elements.animations.new()
//       .inParallel([
//         eqn.animations.position({ target: [0.91, -0.8], duration: 1 }),
//         eqn.animations.scale({ target: 0.714, duration: 1 }),
//       ])
//       .trigger(() => {
//         eqn.setPosition(p);
//         eqn.setScale(1);
//         eqn.showForm('1');
//         sideEqn.showForm('0');
//       })
//       .whenFinished(done)
//       .start();
//   },
//   steadyState: () => {
//     eqn.showForm('1');
//     sideEqn.showForm('0');
//   },
// });

// // /////////////////////////////////////////////////////////////////
// slides.push({
//   text: [
//     'It takes |t||1|  seconds for a disturbance to',
//     'travel from |x| = 0 to |x||1|, therefore |y| at |x||1|',
//     '|y| at |x||1|  is the same as at |x| = 0',
//     '|t||1|  seconds ago.',
//   ],
//   steadyState: () => {
//     eqn.showForm('1');
//     sideEqn.showForm('0');
//   },
// });

// slides.push({
//   transitionFromPrev: done => eqn.goToForm({
//     form: '3', animate: 'dissolve', callback: done,
//   }),
//   steadyState: () => {
//     eqn.showForm('3');
//     sideEqn.showForm('0');
//   },
// });


// /////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
slideNav.loadSlides(slides, prevButton, nextButton, figure, description, modifiers);

slideNav.goToSlide(0);
