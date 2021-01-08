const { Point, getPoint } = Fig;
const { round, range } = Fig.tools.math;

const greyColor = [0.6, 0.6, 0.6, 1];
const dGreyColor = [0.4, 0.4, 0.4, 1];
const actionColor = [0, 0.6, 1, 1];
const primaryCol = [1, 0, 0, 1];
const secondaryCol = [0, 0.6, 1, 1];

figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color:dGreyColor });

const x = range(-5, 5, 0.1);
const fx = (xx, ox = 0, oy = 0) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));

const plotWidth = 2.67;
const plotHeight = 1.66;

const makeEqn = (name, funcName, bottomX, color, space) => ({
  name,
  method: 'collections.equation',
  options: {
    elements: {
      value: '0',
      equals: ' = ',
      func: funcName,
      unknown: '?',
      lb: { symbol: 'bracket', side: 'left' },
      rb: { symbol: 'bracket', side: 'right' },
      min: '\u2212',
    },
    color,
    formDefaults: { alignment: { xAlign: 'left' } },
    forms: {
      0: ['func', ' ', brac('lb', 'value', 'rb', space)],
      funcX: ['func', ' ', brac('lb', 'x', 'rb', space)],
      unknown: ['func', ' ', brac('lb', 'x', 'rb', space), 'equals', 'unknown'],
      left: ['f_1', ' ', brac('lb', ['x', '_+', 'd'], 'rb')],
      right: ['f_1', ' ', brac('lb', ['x', 'min', 'd'], 'rb')],
    },
    scale: 0.6,
  },
  mods: {
    scenarios: {
      default: { position: [name === 'eqnF' ? 0.55 : 2.35, 1.3], scale: 1 },
      left: { position: [name === 'eqnF' ? 0.55 : 0.1, 1.3], scale: 1 },
      title: { position: [name === 'eqnF' ? 0.75 : 1.5, 0.1], scale: 1.2 },
      bottom: { position: [bottomX, 0.1], scale: 1.2 },
    }
  }
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

figure.add([
  {
    name: 'diagram',
    method: 'collection',
    mods: {
      scenarios: {
        default: { position: [-1.3, -1.3], scale: 1 },
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
            {
              points: getFx(2.3, 0),
              name: 'rightTrace',
              line: { width: 0.01, color: secondaryCol },
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
              length: plotHeight - plotHeight / 6 + 0.06,
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
          // isMovable: true,
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
      {
        name: 'distance',
        method: 'collections.line',
        options: {
          width: 0.004,
          dash: [0.01, 0.005],
          color: greyColor,
          label: { text: 'd', location: 'top' },
        },
      },
      makeEqn('eqnF', 'f', 1.2, dGreyColor, 0.025),
      makeEqn('eqnG', 'g', 0.5, primaryCol, 0),
      makeEqn('eqnH', 'f', 1.75, secondaryCol, 0.025),
      makeMark('markF', dGreyColor),
      makeMark('markG', primaryCol),
      {
        name: 'marks',
        method: 'collection',
        elements: [
          makeMark('markG1', primaryCol),
          makeMark('markG2', primaryCol),
          makeMark('markG3', primaryCol),
          makeMark('markG4', primaryCol),
          makeMark('markG5', primaryCol),
          makeMark('markG6', primaryCol),
          makeMark('markG7', primaryCol),
          makeMark('markF1', dGreyColor),
          makeMark('markF2', dGreyColor),
          makeMark('markF3', dGreyColor),
          makeMark('markF4', dGreyColor),
          makeMark('markF5', dGreyColor),
          makeMark('markF6', dGreyColor),
          makeMark('markF7', dGreyColor),
        ],
      },
      {
        name: 'gLine',
        method: 'collections.line',
        options: {
          width: 0.003,
          dash: [0.02, 0.005],
          label: { text: 'x\'', location: 'start' },
          color: primaryCol,
        },
      },
      {
        name: 'fLine',
        method: 'collections.line',
        options: {
          width: 0.003,
          dash: [0.02, 0.005],
          label: {
            text: {
              forms: {
                right: ['x\'', '\u2212', 'd'],
                left: ['x\'', '+', 'd'],
              }
            },
            location: 'start',
          },
          color: dGreyColor,
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
        equals: ' = ',
        xd: 'x\'',
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        g_r: { color: primaryCol },
        x_r: { color: primaryCol },
        xd_r: { text: 'x\'', color: primaryCol },
        lbr: { symbol: 'bracket', side: 'left', color: primaryCol },
        rbr: { symbol: 'bracket', side: 'right', color: primaryCol },
        line: { symbol: 'line', width: 0.005, arrow: { start: 'triangle' } },
        lineR: { symbol: 'line', width: 0.005, arrow: { start: 'triangle' }, color: primaryCol },
      },
      phrases: {
        xdTox: { bottomComment: {
          content: 'xd', comment: 'x', symbol: 'line', inSize: false, commentSpace: 0.15,
        }},
        xrdToX: { bottomComment: {
          content: 'xd_r', comment: 'x_r', symbol: 'lineR', inSize: false, commentSpace: 0.15,
        }},
        gxd: ['g_r', brac('lbr', 'xd_r', 'rbr')],
        gxdToX: ['g_r', brac('lbr', 'xrdToX', 'rbr')],
        gx: ['g_r', brac('lbr', 'x_r', 'rbr')],
        fx: ['f', brac('lb', 'x', 'rb')],
        xD: ['x', ' ', 'min', ' ', 'd'],
        xL: ['x', ' ', '_+', ' ', 'd'],
        xdD: ['xd', ' ', 'min', ' ', 'd'],
        xdDToX: ['xdTox', ' ', 'min', ' ', 'd'],
        xdL: ['xd', ' ', '_+', ' ', 'd'],
        xdLToX: ['xdTox', ' ', '_+', ' ', 'd'],
        xPlusD: ['x_2', '_ + ', 'd_1'],
        fxValue: ['f', brac('lb', ['x_2', 'sign', 'value2'], 'rb', 0.04)],
      },
      forms: {
        value: ['gx', 'equals', 'fxValue'],
        gRightD: ['gxd', 'equals', 'f', brac('lb', 'xdD', 'rb', 0.04)],
        gRightDToX: ['gxdToX', 'equals', 'f', brac('lb', 'xdDToX', 'rb', 0.04)],
        gRight: ['gx', 'equals', 'f', brac('lb', 'xD', 'rb', 0.04)],
        gLeftD: ['gxd', 'equals', 'f', brac('lb', 'xdL', 'rb', 0.04)],
        gLeftDToX: ['gxdToX', 'equals', 'f', brac('lb', 'xdLToX', 'rb', 0.04)],
        gLeft: ['gx', 'equals', 'f', brac('lb', 'xL', 'rb', 0.04)],
      },
      formDefaults: {
        alignment: { fixTo: 'equals', xAlign: 'center' },
      },
    },
    mods: { 
      scenarios: {
        default: { position: [0, -1.2], scale: 1.2 },
        title: { position: [-0.5, -1.05], scale: 1 },
        example: { position: [0, 0.7], scale: 1 },
      }
    }
  },
  {
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      prevButton: { position: [-1.7, -1.3 ] },
      nextButton: { position: [1.7, -1.3 ] },
      text: {
        font: { weight: '100', size: 0.15 },
        position: [-1.7, 1.2],
        xAlign: 'left',
      },
      equation: ['eqn', 'diagram.eqnF', 'diagram.eqnG']
    },
  },
]);

// Common elements that will be used
const nav = figure.getElement('nav');
const eqn = figure.getElement('eqn');
const diagram = figure.getElement('diagram');
const movePad = diagram.getElement('movePad');
const marks = diagram.getElement('marks');
const gLine = diagram.getElement('gLine');
const fLine = diagram.getElement('fLine');
const plot = diagram.getElement('plot');
const eqnF = diagram.getElement('eqnF');
const eqnG = diagram.getElement('eqnG');
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

const setLine = (name, fX, offset) => {
  const yDraw = yAxis.valueToDraw(fx(fX).y);
  const yDraw0 = yAxis.valueToDraw(0);
  const xDraw = xAxis.valueToDraw(fX + offset);
  const e = diagram.getElement(name);
  e.setEndPoints([xDraw, yDraw0], [xDraw, yDraw]);
};

const offsetsValue = [
  [-2, [-1.35, -0.4], [0.2, 0.2]],
  [-1, [-1.35, -0.4], [0.2, 0.2]],
  [0, [-0.3, 0.3], [-0.4, -0.45]],
  [1, [-1.15, 0.15], [0.1, -0.4]],
  [2, [-1.15, 0.15], [0.1, -0.4]],
];
const offsetsD = [[-2.1], [-1.4], [-0.7], [0], [0.7], [1.4], [2.1]];

let cycleIndex = 6;
let offsets = offsetsD;
const cycle = () => {
  cycleIndex = (cycleIndex + 1) % offsets.length;
  update();
};
let updateEqns = false;
let updateLines = false;

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
    setElement('eqnG', [xY + yLabel[0], y + yLabel[1]], xY);
    setElement('eqnF', [xF + fLabel[0], y + fLabel[1]], xF);
    setElement('markG', [xY, y]);
    setElement('markF', [xF, y]);
  }
  if (updateLines) {
    setLine('gLine', xF, xPad);
    setLine('fLine', xF, 0);
  }
  dist.setEndPoints(plot.pointToDraw([xF, y]), plot.pointToDraw([xY, y]));
  figure.animateNextFrame();
}
movePad.subscriptions.add('setTransform', () => update());
update();

const moveMarks = (xOffsetFrom, xOffsetTo = 0, type = 'G', skipAnimation = true) => {
  for (i = 0; i < 7; i += 1) {
    const pointX = i * 0.7 - 2.1;
    const y = yAxis.valueToDraw(fx(pointX).y);
    const from = xAxis.valueToDraw(pointX + xOffsetFrom);
    const to = xAxis.valueToDraw(pointX + xOffsetTo);
    const mark = marks.getElement(`mark${type}${i + 1}`);
      mark.setPosition(from, y);
    if (!skipAnimation) {
      mark.setPosition(from, y);
      mark.animations.new()
        .position({ target: [to, y], duration: 2})
        .start();
    }
  }
};
moveMarks(0, 0, 'F');

const pulseMarks = () => marks.pulse({ elements: marks.getChildren() });

const moveTrace = (xOffset, done = null, duration = 1) => {
  if (duration === 0) {
    moveMarks(xOffset);
    movePad.setPosition(xAxis.valueToDraw(xOffset), 0);
    return;
  }
  moveMarks(0);
  eqnG.hide();
  trace.hide();
  eqn.hide();
  dist.hide();
  movePad.setPosition(xAxis.valueToDraw(0), 0);
  movePad.animations.new()
    .trigger({ duration: 2, callback: () => moveMarks(0, xOffset, 'G', false) })
    .dissolveOut({ element: trace, duration: 0.4 })
    .trigger(() => movePad.setPosition(xAxis.valueToDraw(xOffset), 0))
    .inParallel([
      trace.animations.dissolveIn({ duration: 0.4 }),
      dist.animations.dissolveIn({ duration: 0.4 }),
    ])
    .trigger(() => eqnG.showForm('funcX'))
    .whenFinished(done)
    .start();
}


slides = [];
const times = 'Times New Roman'
const modifiersCommon = {
  x: { font: { family: times, style: 'italic' } },
  xd: { text: 'x\'', font: { family: times, style: 'italic' } },
  d: { font: { family: times, style: 'italic' } },
  y: { font: { family: times, style: 'italic' } },
  f: { font: { family: times, style: 'italic' }, rSpace: 0.02 },
  g: { font: { family: times, style: 'italic' }, rSpace: 0.02 },
  g1: {
    text: 'g',
    font: { family: times, style: 'italic', color: primaryCol },
    touchBorder: [0.1, 0.1, 0.25, 0.1],
    onClick: () => marks.getElement('markG7').pulse({ scale: 2 }),
  },
  f1: {
    text: 'f',
    font: { family: times, style: 'italic' },
    touchBorder: [0.1, 0.1, 0.25, 0.1],
    onClick: () => marks.getElement('markF7').pulse({ scale: 2 }),
    rSpace: 0.02,
  },
  lb: { text: '(', font: { family: times, color: primaryCol } },
  rb: { text: ')', font: { family: times, color: primaryCol } },
  lb1: { text: '(', font: { family: times } },
  rb1: { text: ')', font: { family: times } },
  xr: { text: 'x', font: { family: times, style: 'italic', color: primaryCol } },
}

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  modifiersCommon,
  show: [
    'title', { 'diagram.plot': ['titleX', 'middleY', 'mainTrace', 'fxTrace'] },
  ],
  steadyState: () => {
    figure.setScenarios(['default', 'title']);
    trace.update(getFx(1.6, 0));
    fxTrace.update(getFx(-1.6, 0));
  },
  form: [null, 'funcX', 'unknown'],
  leaveState: () => {
    fxTrace.update(getFx(0, 0));
    trace.update(getFx(0, 0));
  }
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: 'Start by plotting a function |f|(|x|).',
  showCommon: ['diagram.plot.titleX', 'diagram.plot.middleY'],
  scenarioCommon: 'default',
  form: [null, null, null],
});

slides.push({
  transition: (done) => {
    fxTrace.show();
    fxTrace.animations.new()
      .dissolveIn({ duration: 0.5 })
      .whenFinished(done)
      .start();
  },
  form: [null, 'funcX', null],
  steadyState: () => fxTrace.showAll(),
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'For each |x| value input to |f||lb1||x||rb1|, a |y| value is output.',
    'These pairs of values are |points|.'
  ],
  modifiers: {
    'points': { font: { color: actionColor }, onClick: () => nav.nextSlide() },
  },
  showCommon: { 'diagram.plot': ['titleX', 'middleY', 'fxTrace'] },
  scenarioCommon: ['default', 'initial'],
});
slides.push({
  modifiers: {
    'points': { font: { color: actionColor }, onClick: () => pulseMarks() },
  },
  enterStateCommon: () => {
    marks.showAll();
    moveMarks(0);
  },
  steadyState: () => pulseMarks(),
  leaveStateCommon: () => { marks.undim(); },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'To shift the plot to the right by distance |d|, all |points|',
    'shift to the right by |d|.',
  ],
  modifiers: {
    points: { font: { color: actionColor }, onClick: () => pulseMarks() },
  },
});

slides.push({
  showCommon: [
    { 'diagram.plot': ['titleX', 'middleY', 'fxTrace'] }, marks, movePad,
  ],
  modifiers: {
    Shifting: {
      font: { color: actionColor },
      onClick: () => moveTrace(1.6, null),
      touchBorder: 0.1,
    },
    value: { font: { color: actionColor}, onClick: pulseMarks },
  },
  transition: (done) => moveTrace(1.6, done),
  fromForm: [null, 'funcX', null],
  form: [null, 'funcX', 'funcX'],
  steadyState: () => {
    trace.show();
    dist.showAll();
    moveTrace(1.6, null, 0);
  },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'Now select a point on |g1||lb||xr||rb|, and mark it\'s',
    '|x| location.',
  ],
  showCommon: [
    { 'diagram.plot': ['titleX', 'middleY', 'fxTrace'] },
    dist, trace, { 'diagram.marks': ['markG7', 'markF7'] },
  ],
  scenarioCommon: 'default',
  enterStateCommon: () => {
    moveTrace(1.6, null, 0),
    updateLines = true;
    update();
  },
});
slides.push({
  steadyState: () => {
    gLine.showAll();
    update();
  },
  leaveStateCommon: () => { updateLines = false; }
})

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'Mark the point on |f1||lb1||x||rb1| where this point',
    'moved from.',
  ],
  steadyState: () => {
    gLine.showAll();
    updateLines = true;
    update();
  },
});

slides.push({
  steadyState: () => {
    gLine.showAll();
    fLine.showAll();
    fLine.label.showForm('right')
    updateLines = true;
    update();
  },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'As these two points have the same y value',
    'we can say:',
  ],
  showCommon: [
    { 'diagram.plot': ['titleX', 'middleY', 'fxTrace'] },
    dist, trace, { 'diagram.marks': ['markG7', 'markF7'] },
    gLine, fLine,
  ],
  enterStateCommon: () => {
    fLine.label.showForm('right')
    updateLines = true;
    moveTrace(1.6, null, 0);
  },
});

slides.push({
  fromForm: [null, 'funcX', 'funcX'],
  form: ['gRightD', 'funcX', 'funcX'],
});

slides.push({
  text: 'As |xd| is arbitrary, we can replace it with |x|.',
});
slides.push({
  fromForm: ['gRightD', 'funcX', 'funcX'],
  form: ['gRightDToX', 'funcX', 'funcX'],
});
slides.push({
  fromForm: ['gRightDToX', 'funcX', 'funcX'],
  form: ['gRight', 'funcX', 'funcX'],
});


// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: 'Now what happens if we shift to the left instead?',
});

slides.push({
  showCommon: [
    { 'diagram.plot': ['titleX', 'middleY', 'fxTrace'] }, movePad, trace,
    dist,
  ],
  show: marks,
  scenarioCommon: ['default', 'left'],
  enterStateCommon: () => {
    cycleIndex = 0;
    updateLines = true;
    moveTrace(-1.6, null, 0);
  },
  fromForm: [null, 'funcX', null],
  form: [null, 'funcX', 'funcX'],
  transition: (done) => moveTrace(-1.6, done),
  steadyState: () => {
    moveTrace(-1.6, null, 0);
    update();
  },
  leaveStateCommon: () => { updateLines = false; cycleIndex = 6; },
});

slides.push({ show: [gLine] });

slides.push({
  showCommon: [
    { 'diagram.plot': ['titleX', 'middleY', 'fxTrace'] }, movePad, trace,
    dist, gLine, fLine,
  ],
  enterStateCommon: () => {
    cycleIndex = 0;
    updateLines = true;
    moveTrace(-1.6, null, 0);
    fLine.label.showForm('left')
  },
});

slides.push({
  fromForm: [null, 'funcX', 'funcX'],
  form: ['gLeftD', 'funcX', 'funcX'],
});
slides.push({
  fromForm: ['gLeftD', 'funcX', 'funcX'],
  form: ['gLeftDToX', 'funcX', 'funcX'],
});
slides.push({
  fromForm: ['gLeftDToX', 'funcX', 'funcX'],
  form: ['gLeft', 'funcX', 'funcX'],
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'We can now summarize a shift |d| in function |f||lb1||x||rb1|.',
  ],
  form: [null, 'funcX', 'left'],
  scenarioCommon: ['default', 'bottom'],
  showCommon: [
    { 'diagram.plot': ['titleX', 'middleY', 'fxTrace', 'rightTrace'] },
    movePad, trace,
  ],
  enterStateCommon: () => {
    diagram.getElement('eqnH').showForm('right');
    moveTrace(-2.3, null, 0);
  },
});


// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  enterStateCommon: () => {},
  text: [
    'As an example, drag the curve to shift it, and observe',
    'the corresponding |points|.'
  ],
  modifiers: {
    points: {
      font: { color: actionColor }, onClick: () => cycle(), touchBorder: 0.1,
    }
  },
  scenario: ['default', 'example'],
  showCommon: [
    { 'diagram.plot': ['titleX', 'middleY', 'fxTrace', ] },
    { 'diagram': ['markG', 'markF'] },
    movePad, trace,
    // diagram,
  ],
  steadyState: () => {
    // figure.showOnly([nav, diagram, eqn]);
    // diagram.hide([
    //   'distance', 'plot.titleX', 'plot.middleY', fxTrace, 'marks',
    //   'plot.rightTrace', 'gLine', 'fLine', 'eqnH',
    // ])
    offsets = offsetsValue;
    cycleIndex = 2;
    precision = 1;
    updateEqns = true;
    eqn.showForm('value');
    eqnF.showForm('0');
    eqnG.showForm('0');
    movePad.setMovable();
    movePad.setPosition(plotWidth / 2, 0);
    figure.setScenarios('example');
  },
  leaveState: () => {
    precision = 0;
    updateEqns = false;
    cycleIndex = 0;
    offsets = offsetsD;
  },
  form: ['value', '0', '0']
});

nav.loadSlides(slides);
nav.goToSlide(24);

