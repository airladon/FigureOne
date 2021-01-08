const { Point, getPoint } = Fig;
const { round, range } = Fig.tools.math;

const greyColor = [0.6, 0.6, 0.6, 1];
const dGreyColor = [0.4, 0.4, 0.4, 1];
const actionColor = [0, 0.6, 1, 1];
const primaryCol = [1, 0, 0, 1];

figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color:dGreyColor });

const x = range(-5, 5, 0.1);
const fx = (xx, ox = 0, oy = 0) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));

const plotWidth = 2.67;
const plotHeight = 1.66;

const makeEqn = (name, funcName, xAlign = 'left') => ({
  name,
  method: 'collections.equation',
  options: {
    elements: {
      value: '0',
      equals: ' = ',
      func: funcName,
    },
    color: funcName === 'f' ? dGreyColor : primaryCol,
    formDefaults: { alignment: { xAlign } },
    forms: {
      0: ['func', ' ', '_(', 'value', '_)'],
      x: ['func', ' ', '_(', 'x', 'equals', 'value', '_)'],
      funcX: ['func', ' ', '_(', 'x', '_)'],
    },
    scale: 0.6,
  },
});

const makeMark = (name, color = greyColor, radius = 0.02) => ({
  name,
  method: 'primitives.polygon',
  options: { radius, sides: 20, color },
});

const brac = (left, content, right, outsideSpace = 0.025) => ({
  brac: {
    content, left, right, topSpace: 0.03, bottomSpace: 0.03, outsideSpace,
  },
});
// Movable angle
figure.add([
  {
    name: 'diagram',
    method: 'collection',
    mods: {
      scenarios: {
        default: { position: [-1.3, -1.1], scale: 1 },
      },
    },
    elements: [
      {
        name: 'plot',
        method: 'collections.plot',
        options: {
          width: plotWidth,
          height: plotHeight,
          trace: [
            {
              points: getFx(0, 0),
              name: 'fxTraceDash',
              line: { width: 0.005, dash: [0.05, 0.01], color: greyColor },
            },
            {
              points: getFx(-2, 0),
              name: 'fxTrace',
              line: { width: 0.01, color: dGreyColor },
            },
            {
              points: getFx(0, 0),
              name: 'mainTrace',
              line: { width: 0.01, color: primaryCol },
            },
          ],
          xAxis: {
            grid: [
              { step: 1, width: 0.002, line: [0.8, 0.8, 0.8, 1] },
              { values: [0], width: 0.003, dash: [], },
            ],
            line: { width: 0 },
            start: -5,
            stop: 5,
            labels: { font: { size: 0.08 } },
            ticks: { step: 1, width: 0, offset: [0, 0.02] },
            title: {
              text: 'x',
              font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
            }
          },
          yAxis: {
            start: -1,
            stop: 5,
            labels: { font: { size: 0.08 }, offset: [0.04, 0] },
            grid: [
              { step: 1, width: 0.002, line: [0.8, 0.8, 0.8, 1] },
              { values: [0], width: 0.003, dash: [], },
            ],
            ticks: { step: 1, width: 0 },
            line: { width: 0 },
            title: {
              text: 'y',
              rotation: 0,
              font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
            }
          },
          axes: [
            {
              name: 'titleX',
              axis: 'x',
              ticks: null,
              grid: null,
              position: [0, plotHeight / 6],
              color: greyColor,
              line: { arrow: { end: { head: 'triangle', scale: 2 } } },
              title: {
                text: 'x',
                font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
                offset: [1.45, 0.12],
              }
            },
            {
              name: 'middleY',
              axis: 'y',
              ticks: null,
              grid: null,
              color: greyColor,
              length: plotHeight - plotHeight / 6,
              position: [plotWidth / 2, plotHeight/ 6],
              line: { arrow: { end: { head: 'triangle', scale: 2 } } },
              title: {
                text: 'y',
                font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
                rotation: 0,
                offset: [0.1, 0.75],
              }
            },
          ],
        },
      },
      {
        name: 'movePad',
        method: 'primitives.rectangle',
        options: {
          width: 2,
          height: plotHeight + 0.2,
          position: [plotWidth / 2, plotHeight / 2],
          color: [1, 0, 0, 0],
        },
        mods: {
          isMovable: true,
          move: {
            style: 'translation',
            bounds: { translation: {
              p1: [plotWidth / 5, plotHeight / 2],
              mag: plotWidth / 5 * 3,
              angle: 0,
            } },
          }
        }
      },
      makeEqn('eqnF', 'f', 'left'),
      makeEqn('eqnY', 'y', 'left'),
      makeMark('markF', greyColor),
      makeMark('markY', primaryCol),
      {
        name: 'marks',
        method: 'collection',
        elements: [
          makeMark('markY1', primaryCol),
          makeMark('markY2', primaryCol),
          makeMark('markY3', primaryCol),
          makeMark('markY4', primaryCol),
          makeMark('markY5', primaryCol),
          makeMark('markY6', primaryCol),
          makeMark('markY7', primaryCol),
        ],
      },
      {
        name: 'distance',
        method: 'collections.line',
        options: {
          width: 0.004,
          arrow: {
            head: 'circle',
            align: 'mid',
            radius: 0.02
          },
          color: actionColor,
          label: 'd',
        },
      },
    ],
  },
  {
    name: 'title',
    method: 'primitives.text',
    options: {
      text: 'Equation Shifting',
      xAlign: 'center',
      position: [0, 1],
      font: { size: 0.2 },
    },
  },
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      elements: {
        value2: '0.0',
        sign: ' \u2212 ',
        min: '\u2212',
        min2: '\u2212',
        equals: ' = ',
        lb1: { symbol: 'bracket', side: 'left' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        rb2: { symbol: 'bracket', side: 'right' },
        y_r: { color: primaryCol },
        lbr: { symbol: 'bracket', side: 'left', color: primaryCol },
        rbr: { symbol: 'bracket', side: 'right', color: primaryCol },
        x_r: { color: primaryCol },
        line: { symbol: 'line', width: 0.005, arrow: { start: 'triangle' } },
        brace: { symbol: 'brace', side: 'bottom', lineWidth: 0.005 },
      },
      phrases: {
        yx: ['y', brac('lb1', 'x_1', 'rb1')],
        yxr: ['y_r', brac('lbr', 'x_r', 'rbr')],
        fx: ['f', brac('lb2', 'x_2', 'rb2')],
        xD: ['x_2', ' ', 'min', ' ', 'd'],
        xDToMinD: [
          'x_2', ' ', 'min', ' ',
          {
            bottomComment: {
              content: 'd',
              comment: ['min2', 'd_1'],
              symbol: 'line',
              inSize: false,
              commentSpace: 0.2,
            },
          },
        ],
        minToPlus: {
          bottomComment: {
            content: ['min', ' ', 'min2'],
            comment: '_ + ',
            symbol: 'brace',
            inSize: false,
          },
        },
        xDMinD: ['x_2', ' ', 'min', ' ', 'min2', 'd_1'],
        xDMinStrikeD: ['x_2', ' ', 'minToPlus', 'd_1'],
        xPlusD: ['x_2', '_ + ', 'd_1'],
        fxValue: ['f', brac('lb2', ['x_2', 'sign', 'value2'], 'rb2', 0.04)],
      },
      forms: {
        fx: ['yx', 'equals', 'fx'],
        fxd: ['yxr', 'equals', 'f', brac('lb2', 'xD', 'rb2', 0.04)],
        fxd1: ['yxr', 'equals', 'f', brac('lb2', 'xDToMinD', 'rb2', 0.04)],
        fxd2: ['yxr', 'equals', 'f', brac('lb2', 'xDMinD', 'rb2', 0.04)],
        fxd3: ['yxr', 'equals', 'f', brac('lb2', 'xDMinStrikeD', 'rb2', 0.04)],
        fxd4: ['yxr', 'equals', 'f', brac('lb2', 'xPlusD', 'rb2', 0.04)],
        value: ['yxr', 'equals', 'fxValue'],
      },
      formDefaults: {
        alignment: { fixTo: 'equals', xAlign: 'center' },
      },
    },
    mods: { 
      scenarios: {
        default: { position: [0, -1.2], scale: 1.2 },
        center: { position: [-0.1, -0.3], scale: 2.2 },
        title: { position: [-0.4, -1.05], scale: 1 },
        example: { position: [0, 0.7], scale: 1 },
      }
    }
  },
  {
    name: 'eqnTitle',
    method: 'collections.equation',
    options: {
      color: primaryCol,
      elements: {
        unknown: '?',
        lb1: { symbol: 'bracket', side: 'left', color: primaryCol },
        rb1: { symbol: 'bracket', side: 'right', color: primaryCol },
      },
      phrases: { yx: ['y', brac('lb1', 'x_1', 'rb1')] },
      forms: { title: ['yx', '_  =  ', 'unknown'] },
      formDefaults: { alignment: { xAlign: 'center' } },
      position: [0.4, -1.05 ],
    },
  },
  {
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      prevButton: { position: [-1.7, -1.4 ] },
      nextButton: { position: [1.7, -1.4 ] },
      text: {
        font: { weight: '100', size: 0.15 },
        position: [-1.7, 1.2],
        xAlign: 'left',
      },
      equation: 'eqn'
    },
  },
]);

// Common elements that will be used
const nav = figure.getElement('nav');
const eqn = figure.getElement('eqn');
const diagram = figure.getElement('diagram');
const movePad = diagram.getElement('movePad');
const marks = diagram.getElement('marks');
const plot = diagram.getElement('plot');
const eqnF = diagram.getElement('eqnF');
const eqnY = diagram.getElement('eqnY');
const dist = diagram.getElement('distance');
const trace = plot.getElement('mainTrace');
const xAxis = plot.getElement('x');
const yAxis = plot.getElement('y');
const fxTrace = plot.getElement('fxTrace');

let precision = 0;

// Set a diagram element to a plot position with some label
const setElement = (name, position, label = null) => {
  const e = diagram.getElement(name);
  if (e.isShown === false) {
    return;
  }
  const p = plot.pointToDraw(position);
  e.clear();
  e.setPosition(p.x, p.y);
  if (label != null) {
    if (typeof label === 'number') {
      let value = round(label, 1);
      if (value < 0) {
        value = `${value.toFixed(precision)}`;
      } else if (value > 0) {
        value = `${value.toFixed(precision)}`;
      } else {
        value = '0';
      }
      e.updateElementText({ value }, 'current');
    } else {
      e.updateElementText({ value: label }, 'current');
    }
  }
}

const offsetsValue = [
  [-2, [-1.35, -0.4], [0.2, 0.2]],
  [-1, [-1.35, -0.4], [0.2, 0.2]],
  [0, [-0.3, 0.3], [-0.4, -0.45]],
  [1, [-1.15, 0.15], [0.1, -0.4]],
  [2, [-1.15, 0.15], [0.1, -0.4]],
];
const offsetsD = [[-2.1], [-1.4], [-0.7], [0], [0.7], [1.4], [2.1]];

let cycleIndex = 0;
let offsets = offsetsD;
const cycle = () => {
  cycleIndex = (cycleIndex + 1) % offsets.length;
  update();
};
let updateEqns = false;

const update = () => {
  const [curvePosition, fLabel, yLabel] = offsets[cycleIndex];
  const xPad = xAxis.drawToValue(movePad.getPosition('local').x)
  const xY = xPad + curvePosition;
  const xF = curvePosition;
  const y = fx(xF).y;
  trace.update(getFx(xPad, 0));
  if (eqn.isShown) {
    eqn.updateElementText({
      sign: xPad >= 0 ? ' \u2212 ' : ' + ',
      value2: Math.abs(round(xPad, 1)).toFixed(precision),
    }, 'current');
  }
  if (updateEqns) {
    setElement('eqnY', [xY + yLabel[0], y + yLabel[1]], xY);
    setElement('eqnF', [xF + fLabel[0], y + fLabel[1]], xF);
    setElement('markY', [xY, y]);
    setElement('markF', [xF, y]);
  }
  dist.setEndPoints(plot.pointToDraw([xF, y]), plot.pointToDraw([xY, y]));
  figure.animateNextFrame();
}
movePad.subscriptions.add('setTransform', () => update());
update();

setElement('eqnF', [-2.2, 4.2], '-2');
setElement('markF', [-2, 4]);

const moveMarks = (xOffsetFrom, xOffsetTo = 0, skipAnimation = true) => {
  for (i = 0; i < 7; i += 1) {
    const pointX = i * 0.7 - 2.1;
    const y = yAxis.valueToDraw(fx(pointX).y);
    const from = xAxis.valueToDraw(pointX + xOffsetFrom);
    const to = xAxis.valueToDraw(pointX + xOffsetTo);
    const mark = marks.getElement(`markY${i + 1}`);
      mark.setPosition(from, y);
    if (!skipAnimation) {
      console.log(from, y)
      mark.setPosition(from, y);
      mark.animations.new()
        .pulse({ duration: 1})
        .position({ target: [to, y], duration: 1})
        .start();
    }
  }
};

const pulseMarks = () => marks.pulse({ elements: marks.getChildren() });

const moveTrace = (xOffset, done = null, duration = 1) => {
  if (duration === 0) {
    moveMarks(xOffset);
    movePad.setPosition(xAxis.valueToDraw(xOffset), 0);
    return;
  }
  moveMarks(0);
  eqnY.hide();
  trace.hide();
  fxTrace.show();
  eqn.hide();
  dist.hide();
  movePad.setPosition(xAxis.valueToDraw(0), 0);
  movePad.animations.new()
    .trigger({ duration: 2, callback: () => moveMarks(0, xOffset, false) })
    .dissolveOut({ element: trace, duration: 0.4 })
    .trigger(() => movePad.setPosition(xAxis.valueToDraw(xOffset), 0))
    .inParallel([
      trace.animations.dissolveIn({ duration: 0.4 }),
      fxTrace.animations.dissolveOut({ duration: 0.4 }),
      dist.animations.dissolveIn({ duration: 0.4 }),
    ])
    .trigger(() => eqnY.showForm('funcX'))
    .whenFinished(done)
    .start();
}


slides = [];
const times = 'Times New Roman'
const modifiersCommon = {
  x: { font: { family: times, style: 'italic' } },
  d: { font: { family: times, style: 'italic' } },
  d1: {
    text: 'd',
    font: { family: times, style: 'italic', color: actionColor },
    onClick: () => { dist.show(); cycle(); },
    touchBorder: 0.08,
  },
  f: { font: { family: times, style: 'italic' }, rSpace: 0.02 },
  f1: {
    touchBorder: 0.08,
    text: 'f',
    onClick: () => eqnF.pulse(),
    font: { family: times, style: 'italic', color: actionColor },
    rSpace: 0.02,
  },
  y: {
    font: { family: times, style: 'italic', color: primaryCol },
    touchBorder: [0.1, 0.1, 0.2, 0.1],
    onClick: () => pulseMarks(),
  },
  lb: { text: '(', font: { family: times, color: primaryCol } },
  rb: { text: ')', font: { family: times, color: primaryCol } },
  xr: { text: 'x', font: { family: times, style: 'italic', color: primaryCol } },
  n: { font: { family: times, style: 'italic', size: 0.1, }, offset: [0, -0.05 ] },
}

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  modifiersCommon,
  steadyState: () => {
    figure.showOnly([
      'nav', trace, 'diagram.plot.fxTrace', 'eqnTitle',
      'diagram.plot.titleX', 'diagram.plot.middleY', 'title',
    ]);
    figure.setScenarios(['default', 'title']);
    trace.update(getFx(1.6, 0));
    fxTrace.update(getFx(-1.6, 0));
    eqn.showForm('fx');
  },
  leaveState: () => {
    fxTrace.update(getFx(0, 0));
    trace.update(getFx(0, 0));
  }
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: 'Start by plotting a function |f|(|x|).',
  steadyState: () => {
    figure.showOnly(['nav', 'diagram.plot.titleX', 'diagram.plot.middleY']);
    figure.setScenarios('default');
  },
});

slides.push({
  enterState: () => {
    figure.showOnly(['nav', 'diagram.plot.titleX', 'diagram.plot.middleY', fxTrace]);
    figure.setScenarios('default');
  },
  transition: (done) => {
    fxTrace.show();
    fxTrace.animations.new()
      .dissolveIn({ duration: 0.5 })
      .whenFinished(done)
      .start();
  },
  steadyState: () => {
    fxTrace.show()
    eqn.setScenario('initial');
    eqnF.showForm('funcX')
    setElement('eqnF', [-3.1, 4]);
  },
  form: 'fx'
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  enterStateCommon: () => {
    figure.showOnly(['nav', 'diagram.plot.titleX', 'diagram.plot.middleY', fxTrace]);
    figure.setScenarios('default', 'initial');
    eqn.showForm('fx');
    // eqn.setScenario('initial');
    eqnF.showForm('funcX')
    setElement('eqnF', [-3.1, 4]);
  },
  text: [
    'We can think of this function |f| as a number of',
    '|values| at different |x| positions.'
  ],
  modifiers: {
    values: { font: { color: actionColor }, onClick: () => nav.nextSlide() },
  },
});
slides.push({
  modifiers: {
    values: { font: { color: actionColor }, onClick: () => pulseMarks() },
  },
  steadyState: () => {
    marks.showAll();
    marks.dim();
    moveMarks(0);
    pulseMarks();
  },
  leaveStateCommon: () => { marks.undim(); },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    '|Shifting| |f| some distance +|d| moves each |value| of',
    '|f| to the right by |d|.'
  ],
  modifiers: {
    Shifting: { font: { color: actionColor }, onClick: () => nav.nextSlide() },
    value: { font: { color: actionColor }, onClick: () => pulseMarks() },
    d1: { text: 'd', font: { family: times, style: 'italic' } },
  },
  enterStateCommon: () => {
    moveMarks(0);
    marks.dim();
    figure.showOnly([
      'nav', 'diagram.plot.titleX', 'diagram.plot.middleY', movePad,
      eqn, 'diagram.plot.fxTraceDash', marks,
    ]);
    figure.setScenarios('default');
    eqn.setScenario('initial');
    eqnF.showForm('funcX')
    setElement('eqnF', [-3.1, 4]);
  },
  enterState: () => { fxTrace.showAll(); },
});

slides.push({
  enterState: () => {
    eqn.hide();
    fxTrace.showAll();
    marks.undim();
    // offsets = offsetsD;
  },
  form: null,
  modifiers: {
    Shifting: {
      font: { color: actionColor },
      onClick: () => moveTrace(2, null),
      touchBorder: 0.1,
    },
    value: { font: { color: actionColor}, onClick: pulseMarks },
  },
  transition: (done) => {
    moveTrace(2, done);
  },
  steadyStateCommon: () => {
    trace.show();
    fxTrace.hide();
    moveTrace(2, null, 0);
    setElement('eqnF', [-3.1, 4]);
    setElement('eqnY', [4.4, 4]);
    eqnY.showForm('funcX');
  },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'In other words, each value of |f| is |d1| to the left of',
    'the shifted function.'
  ],
  enterState: () => {
    marks.undim();
  },
  steadyState: () => {
    // offsets = offsetsD;
    dist.showAll();
    trace.show();
    setElement('eqnY', [4.4, 4]);
    eqnY.showForm('funcX');
  },
});
slides.push({
  enterState: () => {
    eqn.setPosition([0, -1.3])
    eqn.hide();
    moveTrace(2, null, 0);
    eqnF.showForm('funcX');
    eqnY.showForm('funcX');
    setElement('eqnF', [-3.1, 4]);
    setElement('eqnY', [4.4, 4]);
    trace.show();
    marks.undim();
    // offsets = offsetsD;
    dist.showAll();
  },
  form: 'fxd',
});
slides.push({
  enterStateCommon: () => {},
  steadyStateCommon: () => {},
  enterState: () => figure.showOnly(['nav', eqn]),
  transition: (done) => {
    figure.showOnly([nav, 'eqn']);
    eqn.showForm('fxd');
    eqn.setPosition([0, -1.3]);
    eqn.animations.new()
      .scenario({ target: 'center', duration: 1 })
      .whenFinished(done)
      .start();
  },
  steadyState: () => {
    eqn.showForm('fxd');
    eqn.setScenario('center');
  },
  modifiers: {
    d1: { font: { family: times, style: 'italic', color: [0.5, 0.5, 0.5, 1] } },
  },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'This holds for positive or negative shifts of |d|.',
    '',
    'When |d| is negative, the equation shows |f|',
    'being to the right of a left shifted function.',
  ],
  enterStateCommon: () => {
    figure.showOnly([nav, 'eqn']);
    eqn.setScenario('center');
  },
});
slides.push({ form: 'fxd1' });
slides.push({ form: 'fxd2' });
slides.push({ form: 'fxd3' });
slides.push({ form: 'fxd4' });


// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  enterStateCommon: () => {},
  text: [
    'Example: drag the curve to shift, and observe',
    'the corresponding |points|.'
  ],
  modifiers: {
    points: {
      font: { color: actionColor }, onClick: () => cycle(), touchBorder: 0.1,
    }
  },
  steadyState: () => {
    figure.showOnly([nav, diagram, eqn]);
    diagram.hide(['distance', 'plot.titleX', 'plot.middleY', fxTrace, 'marks'])
    offsets = offsetsValue;
    cycleIndex = 2;
    precision = 1;
    updateEqns = true;
    eqn.showForm('value');
    eqnF.showForm('0');
    eqnY.showForm('0');
    movePad.setTouchable();
    movePad.setPosition(plotWidth / 2, 0);
    figure.setScenarios('example');
  },
  leaveState: () => {
    precision = 0;
    updateEqns = false;
    cycleIndex = 0;
    offsets = offsetsD;
  },
});

figure.getElement('nav').loadSlides(slides);


