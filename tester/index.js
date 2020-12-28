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
    this.timeOffset = 0;
    this.paused = false;
    this.pauseStart = 0;
  }

  reset(value) {
    this.data = Array(this.len).fill(value);
  }

  pause() {
    this.pauseStart = this.now();
    this.paused = true;
  }

  unPause() {
    this.paused = false;
    this.timeOffset += new Date().getTime() - this.pauseStart + this.timeOffset;
  }

  now() {
    if (this.paused) {
      return this.pauseStart;
    }
    return new Date().getTime() - this.timeOffset;
  }

  // Update the signal data with the new value. Signal data is has a resolution
  // of 0.02s, so if this value comes in more than 0.04s after the last value
  // was recorder, then use interpolation to fill in the missing samples.
  update(value) {
    if (this.paused) {
      return;
    }
    const currentTime = this.now();
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
let f = 0.2; // Hz
const A = 0.7;   // m
let c = 0.5;   // m/s

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


const ball = (x, index, sides = 20) => ({
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
let lastTime = 0.0;
const disturbSine = (delay = 0, resetSignal = true) => {
  if (resetSignal) {
    reset();
  }
  // let timeOffset = 0;
  // if (useLastTime) {
  //   timeOffset = lastTime;
  // }
  const startTime = data.now();
  b0.animations.new('_noStop_sine')
    .delay(delay)
    .custom({
      callback: (p) => {
        // const time = p * 10000 + timeOffset;
        const time = (data.now() - startTime) / 1000;
        // if (p < 1) {
          // lastTime = time;
        console.log(time)
        b0.setPosition(startX, A * Math.sin(time * 2 * Math.PI * f));
        // }
      },
      duration: 10000,
    })
    .start();
};
// disturbSine();

figure.elements._balls.dim();

const b1 = content => ({
  brac: {
    left: 'lb1', content, right: 'rb1', height: 0.2, descent: 0.05,
  },
});
const ASin = content => ([
  'A', 'sin',
  {
    brac: {
      left: 'lb2', content, right: 'rb2', height: 0.2, descent: 0.05,
    },
  },
]);
const b2 = content => ({
  brac: {
    left: 'lb2', content, right: 'rb2', height: 0.2, descent: 0.05,
  },
});
const brac3 = content => ({
  brac: {
    left: 'lb3', content, right: 'rb3', descent: 0.05,
  },
});
const scale = (content, s = 0.8) => ({
  scale: { content, scale: s },
});

const ann = (content, comment, symbol, space = 0.2) => ({
  bottomComment: {
    content,
    comment,
    commentSpace: space,
    symbol,
    inSize: false,
  },
});

const tann = (content, comment, symbol, space = 0.2) => ({
  topComment: {
    content,
    comment,
    commentSpace: space,
    symbol,
    inSize: false,
  },
});

const color0 = [1, 0, 0, 1];
const color1 = [0, 0.5, 1, 1];
// const color2 = [0, ]

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
        w3: '\u03c9',
        min: ' \u2212 ',
        min2: ' \u2212 ',
        _2pi1: '2\u03c0',
        _2pi2: '2\u03c0',
        comma1: ', ',
        comma2: ', ',
        v: { symbol: 'vinculum' },
        brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.005 },
        line1: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
        line2: { symbol: 'line', width: 0.005, arrow: { start: { head: 'triangle' } } },
        x_4: { color: color0 },
        _0_4: { color: color0 },
        x_5: { color: color1 },
        x_6: { color: color1 },
        x_7: { color: color1 },
        _1_5: { color: color1 },
        _1_6: { color: color1 },
        _1_7: { color: color1 },
      },
      phrases: {
        ytx: ['y_1', b1(['x_1', 'comma1', 't_1'])],
        sinkx: ['sin', b2(['w1', 't_2', 'min', 'k', 'x_2'])],
        t1: { sub: ['t_2', '_1_1'] },
        t12: { sub: ['t_6', '_1_3'] },
        x11: { sub: ['x_2', '_1_2'] },
        x12: { sub: ['x_6', '_1_6'] },
        x13: { sub: ['x_7', '_1_7'] },
        x1OnC: { frac: ['x11', 'v', 'c'] },
        x1OnCb: { frac: ['x13', 'v', 'c'] },
        sX1OnC: scale('x1OnCb'),
        sX1ToXOnC: scale({ frac: [tann('x13', 'x_1', 'line2'), 'v', 'c'] }),
        // swX1OnC: scale({ frac: [['w3', 'x13'], 'v', 'c'] }),
        // swX1ToXOnC: scale({ frac: [['w3', tann('x13', 'x_1', 'line2')], 'v', 'c'] }),
        x0: { sub: ['x_4', '_0_4'] },
        yx0t: ['y_0', b1(['x0', 'comma1', 't_1'])],
        yx0To1t: ['y_0', b1([ann('x0', 'x12', 'line1'), 'comma1', 't_1'])],
        yx1t: ['y_0', b1(['x12', 'comma1', 't_1'])],
        yx1ToXt: ['y_0', b1([tann('x12', 'x_0', 'line1'), 'comma1', 't_1'])],
        yxt: ['y_0', b1(['x_0', 'comma1', 't_1'])],
        sXOnC: scale({ frac: ['x_1', 'v', 'c'] }),
        wt: ['w1', 't_3'],
        tToTMinT1: ann('t_3', ['t_4', 'min', 't1'], 'line2'),

        // // t12: { sub: ['t_3', '_1_2'] },
        // x12: { sub: ['x_3', '_1_4'] },
        // // yx0: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 't12'])],
        // xOnC: { frac: ['x_2', 'v', 'c'] },
        // sX1OnC: scale('x1OnC'),
        // sXOnC: scale('xOnC'),
        // yx1c: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 'sX1OnC'])],
        // yxc: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
      },
      formDefaults: {
        alignment: { fixTo: 'equals' },
        duration: 1,
      },
      forms: {
        0: ['ytx', 'equals', 'sinkx'],
        1: [],
        2: ['t1', 'equals', 'x1OnC'],
        3: ['yx0t', 'equals', ASin(['w1', 't_3'])],
        4: ['yx0To1t', 'equals', ASin(['w1', 'tToTMinT1'])],
        5: ['yx1t', 'equals', ASin(['w1', brac3(['t_4', 'min', 't1'])])],
        6: [
          'yx1t', 'equals', ASin(
            {
              bottomComment: [
                ['w1', brac3(['t_4', 'min', 't1'])],
                ['w2', 't_5', 'min2', 'w3', 't12'],
                'brace',
              ],
            },
          ),
        ],
        7: [
          'yx1t', 'equals', ASin(
            ['w2', 't_5', 'min2', 'w3', 't12'],
          ),
        ],
        8: [
          'yx1t', 'equals', ASin(
            ['w2', 't_5', 'min2', 'w3', ann('t12', 'sX1OnC', 'line2')],
          ),
        ],
        9: ['yx1t', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sX1OnC'])],
        10: ['yx1ToXt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sX1ToXOnC'])],
        11: ['yxt', 'equals', ASin(['w2', 't_5', 'min2', 'w3', 'sXOnC'])],
        12: [
          'yxt', 'equals', ASin([
            ann('w2', ['_2pi1', ' ', 'f_1'], 'line1'), 't_5',
            'min2', ann('w3', ['_2pi2', ' ', 'f_2'], 'line2'), 'sXOnC']),
        ],
        13: [
          'yxt', 'equals', ASin([
            '_2pi1', ' ', 'f_1', ' ', 't_5', 'min2', '_2pi2', ' ', 'f_2', ' ', 'sXOnC',
          ]),
        ],
        // 10: ['yx1t', 'equals', 'A', 'sin', b2(['w2', 't_5', 'min2', 'swX1OnC'])],
        // 11: ['yx1ToXt', 'equals', 'A', 'sin', b2(['w2', 't_5', 'min2', 'swX1ToXOnC'])],
        // 12: ['yxt', 'equals', 'A', 'sin', b2(['w2', 't_5', 'min2', 'sXOnC'])],
        // 13: ['w2', 't_5', 'min2', 'sXOnC'],
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
        ytx: ['y_1', b1(['x_3', 'comma1', 't_0'])],
        xOnC: { frac: ['x_2', 'v', 'c'] },
        sXOnC: scale('xOnC'),
        yxc: ['y_0', b2(['x0', 'comma2', 't_1', 'min', 'sXOnC'])],
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
// const ballx0 = figure.getElement('balls.ball0');
const bx1 = figure.getElement('balls.ball25');
bx1.setColor(color1);
balls.toFront(bx1.name);

nextButton.onClick = slideNav.nextSlide;
prevButton.onClick = slideNav.prevSlide;

prevButton.onClick = () => {
  if (data.paused) {
    data.unPause();
  } else {
    data.pause();
  }
}

const slides = [];

const modifiers = {
  disturbance: {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => disturbPulse(),
    touchBorder: [0.1, 0.03, 0.1, 0.1],
  },
  'first particle': {
    font: { color: color0 },
    onClick: () => b0.pulse({ scale: 4 }),
  },
  'sine function': {
    font: { color: [0, 0.5, 1, 1] },
    onClick: () => disturbSine(0, true),
  },
  // 'some point': {
  //   font: { color: color1 },
  //   onClick: () => figure.getElement('balls.ball50').pulse({ scale: 4 }),
  // },
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
      eqn.pulse({ elements: ['t_6', '_1_3'], centerOn: 't_6', xAlign: 0.3 });
      sideEqn.pulse({ elements: ['t', '_1_1'], centerOn: 't', xAlign: 'right' });
    },
    touchBorder: 0.1,
  },
  xr0: {
    text: 'x',
    font: { family: 'Times New Roman', style: 'italic', color: color0 },
    onClick: () => b0.pulse({ scale: 4 }),
    touchBorder: 0.1,
  },
  _0r: {
    text: '0',
    font: {
      family: 'Times New Roman', color: color0, size: 0.06,
    },
    offset: [0, -0.03],
    inLine: false,
  },
  xb1: {
    text: 'x',
    font: { family: 'Times New Roman', style: 'italic', color: color1 },
    onClick: () => bx1.pulse({ scale: 4 }),
    touchBorder: 0.1,
  },
  _1b: {
    text: '1',
    font: {
      family: 'Times New Roman', color: color1, size: 0.06,
    },
    offset: [0, -0.03],
    inLine: false,
  },
  w: {
    text: '\u03c9',
    font: {
      family: 'Times New Roman', style: 'italic',
    },
  },
};

// let lastPhase = 0;
// const getPhase = () => {
//   lastPhase = Math.asin(b0.getPosition().y / A);
// };
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
  form: '0',
  steadyState: () => {
    reset();
    disturbSine(1);
    figure.elements._balls.dim();
    sideEqn.hide();
  },
  // leaveStateCommon: () => { getPhase(); },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'A wave is a |disturbance| that propagates through',
    'a medium or field.',
    {
      text: 'Touch the word |disturbance| or move the |first particle| manually.',
      font: { size: 0.07 },
    },
  ],
  form: null,
  steadyState: () => {
    reset();
    b0.animations.cancel('_noStop_sine');
    disturbPulse();
    figure.elements._balls.highlight(['ball0']);
  },
});


// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The |disturbance| moves with a constant velocity |c|.',
    { text: 'Thus, the time it takes to move some distance |x||1|', lineSpace: 0.2 },
    'can be calculated.',
  ],
  steadyState: () => {
    reset();
    disturbPulse();
  },
  leaveState: () => { reset(); },
});

slides.push({ form: '2' });
slides.push({
  form: '2',
  text: 'Let\'s record this as equation (1)',
  steadyState: () => { sideEqn.hide(); },
});
slides.push({
  transition: (done) => {
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
  steadyStateCommon: () => { sideEqn.showForm('2'); },
  steadyState: () => { eqn.hide(); },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  form: null,
  text: [
    'Now, let\'s disturb the |first particle| with a',
    '|sine function|.',
  ],
  enterState: () => {
    b0.isTouchable = true;
    b0.animations.cancel('_noStop_sine');
  },
});

slides.push({
  enterStateCommon: () => {
    if (!b0.isAnimating()) {
      disturbSine(0, true);
    }
    b0.isTouchable = false;
  },
  form: '3',
  steadyState: () => {
    sideEqn.showForm('2');
    balls.hasTouchableElements = false;
    figure.elements._balls.highlight(['ball0']);
    if (!b0.isAnimating()) {
      disturbSine(0, true);
    }
  },
});

// /////////////////////////////////////////////////////////////////
slides.push({
  text: [
    'The disturbance at some point |xb1||_1b|  is the',
    'disturbance at |xr0||_0r|  from |t||1|  seconds ago.',
  ],
  steadyState: () => {
    figure.elements._balls.highlight(['ball0', bx1.name]);
    bx1.pulse({ scale: 4 });
  },
});

slides.push({ form: '4' });
slides.push({ form: '5' });
slides.push({ text: 'Multiply |w| through' });
slides.push({ form: '6' });
slides.push({ form: '7' });
slides.push({ text: 'We can now |substitute| equation (1)' });
slides.push({ form: '8' });
slides.push({ form: '9', steadyState: () => sideEqn.hide() });
slides.push({
  text: [
    '|xb1||_1b|  was arbitrarily selected, so we',
    'can say |x| more generally',
  ],
  steadyStateCommon: () => { sideEqn.hide(); },
});
slides.push({ form: '10' });
slides.push({ form: '11' });
slides.push({
  text: [
    'This equation describes the string at any',
    'position |x| at any time |t|.',
  ],
});
slides.push({
  text: [
    'Now let\'s examine the terms within the sine',
    'function more closely.',
  ],
});
slides.push({
  text: [
    '|w| is the angular frequency',
    {
      text: 'the number of times 2\u03c0 radians is cycled through per second',
      font: { size: 0.07 },
    },
  ],
});
slides.push({ form: '12' });
slides.push({ form: '13' });

// slides.push({
//   text: []
// })


// wt is constant, so this is just a normal sine wave dependent on f, c and x.
// The wavelenght of the sine wave is the distance it takes for the angle to cycle
// through 2π radians.
// The 2πf term says how many times per second the angle moves through a full 2π
// radians, therefore the time it takes to go through a single 2π radians must be 1/f.
// If the velocity of the wave is c, then the distance it travels in 1/fs is c/fm.
// In other words, the wavelength is equal to c/f,  or more commonly c = lamda f.
// Knowning this we can rearrange 2πf/c = 2π/wavelength. This is often called
// the phase term of the propagation constant, and is denoted as k.
// In other words, the propagation constant describes how many radians per meter
// are cycled through - which when finally multiplied by x gives a final angle term dependent on f, c, and x.
// This also means, as our velocity gets faster, then our wavelength must
// get smaller.


// 2πf says how many times per second the angle moves through a full 2π radians.
// Therefore 2πft says how many times the angle has moved through 2π radians in time t, and leaves us with a resultant angle.
// For 2πf x/c we similarly have 2πf saying how many times per second the angle
// covers 2π radians, and then the x/c term is the time giving us a resultant
// angle. Antoher way to think of this is 2πf revoltions per second per c m/s.
// 2π f/c (1/s / m/s = 1/m) which is how many times does the angle traverse
// through 2π radians per meter. Now the wavelength is how many meters is
// 2π radians, 



// /////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////
slideNav.loadSlides(slides, prevButton, nextButton, figure, description, modifiers, eqn);

slideNav.goToSlide(5);
