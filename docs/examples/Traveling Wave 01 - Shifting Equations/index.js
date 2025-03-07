/* globals Fig */
/* eslint-disable camelcase, object-curly-newline */

const { Point } = Fig;
const { round, range } = Fig;

const greyColor = [0.6, 0.6, 0.6, 1];
const dGreyColor = [0.4, 0.4, 0.4, 1];
const actionColor = [0, 0.6, 1, 1];
const primaryCol = [1, 0, 0, 1];
const secondaryCol = [0, 0.6, 1, 1];

const figure = new Fig.Figure({ scene: [-2, -1.5, 2, 1.5], color: dGreyColor });

/*
.......##..........###....##....##..#######..##.....##.########
.......##.........##.##....##..##..##.....##.##.....##....##...
.......##........##...##....####...##.....##.##.....##....##...
.......##.......##.....##....##....##.....##.##.....##....##...
.......##.......#########....##....##.....##.##.....##....##...
.......##.......##.....##....##....##.....##.##.....##....##...
.......########.##.....##....##.....#######...#######.....##...
*/
const x = range(-5, 5, 0.1);
const fx = (xx, ox = 0, oy = 0) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));

const plotWidth = 2.67;
const plotHeight = 1.383;
const mathFont = 'Times New Roman';

const brac = (left, content, right, outsideSpace = 0.025) => ({
  brac: {
    content, left, right, topSpace: 0.03, bottomSpace: 0.03, outsideSpace,
  },
});

const makeEqn = (name, funcName, bottomX, color, space) => ({
  name,
  make: 'collections.equation',
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
      default: { position: [name === 'eqnF' ? 0.45 : 2.45, 1.3], scale: 1 },
      left: { position: [name === 'eqnF' ? 0.9 : 0, 1.3], scale: 1 },
      title: { position: [name === 'eqnF' ? 0.75 : 1.5, -0.15], scale: 1.2 },
      bottom: { position: [bottomX, -0.15], scale: 1.2 },
      example: { scale: 0.9 },
    },
  },
});

const makeMark = (name, color = greyColor, radius = 0.02) => ({
  name,
  make: 'primitives.polygon',
  options: { radius, sides: 20, color },
});

figure.add([
  {
    name: 'diagram',
    make: 'collection',
    mods: {
      scenarios: {
        default: { position: [-1.3, -0.8], scale: 1 },
        low: { position: [-1.3, -1], scale: 1 },
      },
    },
    elements: [
      {
        name: 'plot',
        make: 'collections.plot',
        options: {
          width: plotWidth,
          height: plotHeight,
          trace: [
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
          x: {
            color: greyColor,
            line: { width: 0.006 },
            start: -5,
            stop: 5,
            grid: { width: 0.005, dash: [], color: greyColor },
            labels: {
              font: { size: 0.08, color: greyColor },
              offset: [0, -0.03],
              hide: [0],
            },
            step: 1,
            ticks: {
              length: 0,
            },
            title: {
              text: 'x',
              font: { family: mathFont, style: 'italic', size: 0.12 },
              location: 'right',
            },
          },
          y: {
            start: 0,
            stop: 5,
            grid: { width: 0.005, dash: [], color: greyColor },
            step: 1,
            labels: {
              font: { size: 0.08 },
              offset: [-1.32, 0],
            },
            ticks: { step: 1, width: 0 },
            position: [plotWidth / 2, 0],
            color: greyColor,
            line: { width: 0.006 },
            title: {
              text: 'y',
              rotation: 0,
              font: { family: mathFont, style: 'italic', size: 0.12 },
              location: 'top',
            },
          },
        },
      },
      {
        name: 'movePad',
        make: 'primitives.rectangle',
        width: 2,
        height: plotHeight + 0.2,
        position: [plotWidth / 2, plotHeight / 2],
        color: [1, 0, 0, 0],
        move: {
          style: 'translation',
          bounds: {
            p1: [plotWidth / 5, plotHeight / 2],
            p2: [plotWidth / 5 * 4, plotHeight / 2],
            ends: 2,
          },
        },
      },
      {
        name: 'distance',
        make: 'collections.line',
        options: {
          width: 0.006,
          dash: [0.01, 0.005],
          color: greyColor,
          label: { text: 'd', location: 'top', font: { family: 'Times New Roman' } },
        },
      },
      makeEqn('eqnF', 'f', 1.2, dGreyColor, 0.025),
      makeEqn('eqnG', 'g', 0.5, primaryCol, 0),
      makeEqn('eqnH', 'f', 1.75, secondaryCol, 0.025),
      makeMark('markF', dGreyColor),
      makeMark('markG', primaryCol),
      {
        name: 'marks',
        make: 'collection',
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
        make: 'collections.line',
        options: {
          width: 0.006,
          dash: [0.02, 0.005],
          label: { text: 'x\'', location: 'start', font: { family: 'Times New Roman' } },
          color: primaryCol,
        },
      },
      {
        name: 'fLine',
        make: 'collections.line',
        options: {
          width: 0.006,
          dash: [0.02, 0.005],
          label: {
            text: {
              forms: {
                right: ['x\'', '\u2212', 'd'],
                left: ['x\'', '+', 'd'],
              },
            },
            font: { family: 'Times New Roman' },
            location: 'start',
          },
          color: dGreyColor,
        },
      },
    ],
  },
  {
    name: 'title',
    make: 'primitives.text',
    options: {
      text: 'Equation Shifting',
      xAlign: 'center',
      position: [0, 1],
      font: { size: 0.2 },
    },
  },
  {
    name: 'highlighter',
    make: 'collections.rectangle',
    options: {
      line: { width: 0.005 },
      color: greyColor,
    },
  },
  {
    name: 'eqn',
    make: 'collections.equation',
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
        } },
        xrdToX: { bottomComment: {
          content: 'xd_r', comment: 'x_r', symbol: 'lineR', inSize: false, commentSpace: 0.15,
        } },
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
        default: { position: [0, 0.8], scale: 1.2 },
        title: { position: [-0.5, -1.05], scale: 1 },
        example: { position: [0, -1.25], scale: 1 },
      },
    },
  },
  {
    name: 'nav',
    make: 'collections.slideNavigator',
    options: {
      prevButton: { position: [-1.7, -1.3] },
      nextButton: { position: [1.7, -1.3] },
      text: {
        font: { weight: '100', size: 0.15 },
        position: [-1.7, 1.2],
        xAlign: 'left',
      },
      equation: ['eqn', 'diagram.eqnF', 'diagram.eqnG'],
    },
  },
]);


/*
..........##........#######...######...####..######.
..........##.......##.....##.##....##...##..##....##
..........##.......##.....##.##.........##..##......
..........##.......##.....##.##...####..##..##......
..........##.......##.....##.##....##...##..##......
..........##.......##.....##.##....##...##..##....##
..........########..#######...######...####..######.
*/
// Common elements that will be used in LOGIC and SLIDES
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
const eqnH = diagram.getElement('eqnH');
const dist = diagram.getElement('distance');
const trace = plot.getElement('mainTrace');
const xAxis = plot.getElement('x');
const yAxis = plot.getElement('y');
const fxTrace = plot.getElement('fxTrace');
const highlighter = figure.getElement('highlighter');

// Predetermined offsets for positioning equations at different locations
// on plots of g(x) and f(x)
const offsetsValue = [
  [-2, [-1.35, -0.4], [0.2, 0.2]],
  [-1, [-1.35, -0.4], [0.2, 0.2]],
  [0, [-0.3, -0.45], [-0.45, 0.4]],
  [1, [-1.15, 0.15], [0.1, -0.4]],
  [2, [-1.15, 0.15], [0.1, -0.4]],
];
const offsetsD = [[-2.1], [-1.4], [-0.7], [0], [0.7], [1.4], [2.1]];

// Global variables that are changed within the slides to give different
// behaviors to the update function
let precision = 0;
let cycleIndex = 6;
let offsets = offsetsD;
let updateEqns = false;
let updateLines = false;

// Position a mark or equation on the plot. Will also update the
// equation with a value if 'label' is defined
const setElementPosition = (name, position, label = null) => {
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
};

// Set end points of a line on the plot
const setLine = (name, fX, offset) => {
  const yDraw = yAxis.valueToDraw(fx(fX).y);
  const yDraw0 = yAxis.valueToDraw(0);
  const xDraw = xAxis.valueToDraw(fX + offset);
  const e = diagram.getElement(name);
  e.setEndPoints([xDraw, yDraw0], [xDraw, yDraw]);
};

// Main update function, called each time the plot changes
const update = () => {
  const [curvePosition, fLabel, yLabel] = offsets[cycleIndex];
  const xPad = xAxis.drawToValue(movePad.getPosition('local').x);
  const xY = xPad + curvePosition;
  const xF = curvePosition;
  const { y } = fx(xF);

  // Update the trace with a new x location
  trace.update(getFx(xPad, 0));

  // Update the main equation on the interactive example slide to
  // include the x offset value
  if (eqn.isShown) {
    eqn.updateElementText({
      sign: xPad >= 0 ? ' \u2212 ' : ' + ',
      value2: Math.abs(round(xPad, 1)).toFixed(precision),
    }, 'current');
  }

  // Update mark and plot equations with a new position and value
  if (updateEqns) {
    setElementPosition('eqnG', [xY + yLabel[0], y + yLabel[1]], xY);
    setElementPosition('eqnF', [xF + fLabel[0], y + fLabel[1]], xF);
    setElementPosition('markG', [xY, y]);
    setElementPosition('markF', [xF, y]);
  }

  // Update lines from plot points to x axis locations
  if (updateLines) {
    setLine('gLine', xF, xPad);
    setLine('fLine', xF, 0);
  }

  // Update distance label
  dist.setEndPoints(plot.pointToDraw([xF, y]), plot.pointToDraw([xY, y]));

  // Call an animation frame
  figure.animateNextFrame();
};

// Cycle which global offsets to use to determine where to draw
// plot equations, marks and distance label.
const cycle = () => {
  cycleIndex = (cycleIndex + 1) % offsets.length;
  update();
};

// Everytime the movePad changes, the trace needs to be updated
movePad.notifications.add('setTransform', () => update());

// Helper function to animate moving marks in x
const moveMarks = (xOffsetFrom, xOffsetTo = 0, type = 'G', skipAnimation = true) => {
  for (let i = 0; i < 7; i += 1) {
    const pointX = i * 0.7 - 2.1;
    const y = yAxis.valueToDraw(fx(pointX).y);
    const from = xAxis.valueToDraw(pointX + xOffsetFrom);
    const to = xAxis.valueToDraw(pointX + xOffsetTo);
    const mark = marks.getElement(`mark${type}${i + 1}`);
    mark.setPosition(from, y);
    if (!skipAnimation) {
      mark.setPosition(from, y);
      mark.animations.new()
        .position({ target: [to, y], duration: 2 })
        .start();
    }
  }
};

// Helper function to pulse individual marks
const pulseMarks = () => marks.pulse({ elements: marks.getChildren() });

// Helper function to animate moving marks and trace
const moveTrace = (xOffset, done = null, duration = 1) => {
  if (duration === 0) {
    moveMarks(xOffset);
    movePad.setPosition(xAxis.valueToDraw(xOffset), 0);
    return;
  }
  moveMarks(0);
  diagram.hide([eqnG, trace, dist]);
  movePad.setPosition(xAxis.valueToDraw(0), 0);
  eqnG.showForm('funcX');
  eqnG.hide();
  movePad.animations.new()
    .trigger({ duration: 2, callback: () => moveMarks(0, xOffset, 'G', false) })
    .trigger(() => movePad.setPosition(xAxis.valueToDraw(xOffset), 0))
    .inParallel([
      trace.animations.dissolveIn(0.4),
      dist.animations.dissolveIn(0.4),
      eqnG.animations.dissolveIn(0.4),
    ])
    .whenFinished(done)
    .start();
};

// Initializiation
update();
moveMarks(0, 0, 'F');

/*
...........######..##.......####.########..########..######.
..........##....##.##........##..##.....##.##.......##....##
..........##.......##........##..##.....##.##.......##......
...........######..##........##..##.....##.######....######.
................##.##........##..##.....##.##.............##
..........##....##.##........##..##.....##.##.......##....##
...........######..########.####.########..########..######.
*/
const slides = [];

// Define common text modifiers that will be used on several slides
const modifiersCommon = {
  x: { font: { family: mathFont, style: 'italic' } },
  xd: { text: 'x\'', font: { family: mathFont, style: 'italic' } },
  d: { font: { family: mathFont, style: 'italic' } },
  y: { font: { family: mathFont, style: 'italic' } },
  f: { font: { family: mathFont, style: 'italic' }, rSpace: 0.02 },
  g: { font: { family: mathFont, style: 'italic' }, rSpace: 0.02 },
  g1: {
    text: 'g',
    font: { family: mathFont, style: 'italic', color: primaryCol },
    touch: [0.1, 0.1, 0.25, 0.1],
    onClick: () => marks.getElement('markG7').pulse({ scale: 2 }),
  },
  f1: {
    text: 'f',
    font: { family: mathFont, style: 'italic' },
    touch: [0.1, 0.1, 0.25, 0.1],
    onClick: () => marks.getElement('markF7').pulse({ scale: 2 }),
    rSpace: 0.02,
  },
  lb: { text: '(', font: { family: mathFont, color: primaryCol } },
  rb: { text: ')', font: { family: mathFont, color: primaryCol } },
  lb1: { text: '(', font: { family: mathFont } },
  rb1: { text: ')', font: { family: mathFont } },
  xr: { text: 'x', font: { family: mathFont, style: 'italic', color: primaryCol } },
};

// //////////////////////////////////////////////////////////
// Slide 1
// //////////////////////////////////////////////////////////
slides.push({
  modifiersCommon,
  show: [
    'title',
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title'] },
    { 'diagram.plot': ['mainTrace', 'fxTrace'] },
  ],
  scenarioCommon: ['default', 'title'],
  form: { 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'unknown' },
  steadyState: () => {
    trace.update(getFx(1.6, 0));
    fxTrace.update(getFx(-1.6, 0));
    movePad.isMovable = false;
  },
  leaveState: () => {
    fxTrace.update(getFx(0, 0));
    trace.update(getFx(0, 0));
  },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: 'Start by plotting a function |f|(|x|).',
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title'] },
  ],
  scenarioCommon: 'default',
  fromForm: null,
  form: null,
});

slides.push({
  fromForm: { 'diagram.eqnF': 'funcX' },
  transition: [
    { in: [fxTrace, eqnF] },
  ],
  form: { 'diagram.eqnF': 'funcX' },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'For each |x| value input to |f||lb1||x||rb1|, a |y| value is output.',
    'These pairs of values are |points|.',
  ],
  modifiers: {
    points: { touch: 0.05, font: { color: actionColor }, onClick: () => nav.nextSlide() },
  },
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
  ],
});
slides.push({
  modifiers: {
    points: { touch: 0.05, font: { color: actionColor }, onClick: () => pulseMarks() },
  },
  enterStateCommon: () => {
    marks.showAll();
    moveMarks(0);
  },
  transition: { trigger: () => pulseMarks() },
  // steadyState: () => pulseMarks(),
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
    points: { touch: 0.05, font: { color: actionColor }, onClick: () => pulseMarks() },
  },
});

slides.push({
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
    { diagram: ['marks', 'movePad'] },
  ],
  transition: done => moveTrace(1.6, done),
  form: { 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
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
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
    { diagram: ['marks.markG7', 'marks.markF7', 'plot.mainTrace', 'distance'] },
  ],
  enterStateCommon: () => {
    moveTrace(1.6, null, 0);
    updateLines = true;
    update();
  },
});
slides.push({
  enterState: () => {
    updateLines = true;
    update();
  },
  transition: { in: gLine },
  leaveStateCommon: () => { updateLines = false; },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'Mark the point on |f1||lb1||x||rb1| where this point',
    'moved from.',
  ],
  show: gLine,
});

slides.push({
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
    { diagram: ['marks.markG7', 'marks.markF7', 'plot.mainTrace'] },
    { diagram: ['distance', 'gLine', 'fLine'] },
  ],
  transition: { in: fLine },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'As these two points have the same y value',
    'we can say:',
  ],
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
    { diagram: ['marks.markG7', 'marks.markF7', 'plot.mainTrace'] },
    { diagram: ['distance', 'gLine', 'fLine'] },
  ],
  enterStateCommon: () => {
    fLine.label.showForm('right');
    updateLines = true;
    moveTrace(1.6, null, 0);
  },
});

slides.push({
  fromForm: { eqn: 'gRightD', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
  transition: [
    { scenario: diagram, target: 'low', duration: 1 },
    { in: eqn, duration: 0.8 },
  ],
  form: { eqn: 'gRightD', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
});

slides.push({
  scenarioCommon: ['default', 'low'],
  text: 'As |xd| is arbitrary, we can replace it with |x|.',
});
slides.push({
  form: { eqn: 'gRightDToX', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
});
slides.push({
  form: { eqn: 'gRight', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
});
slides.push({
  steadyState: () => {
    highlighter.showAll();
    highlighter.surround(eqn, 0.07);
    highlighter.pulse({ scale: 1.2 });
  },
});


// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: 'Now what happens if we shift to the left instead?',
  steadyState: () => {
    highlighter.showAll();
    highlighter.surround(eqn, 0.07);
  },
});

slides.push({
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
    { diagram: ['plot.mainTrace', 'movePad', 'distance'] },
  ],
  show: marks,
  scenarioCommon: ['default', 'low', 'left'],
  enterStateCommon: () => {
    cycleIndex = 0;
    updateLines = true;
    moveTrace(-1.6, null, 0);
  },
  fromForm: { 'diagram.eqnF': 'funcX', 'diagram.eqnG': null },
  form: { 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
  transition: done => moveTrace(-1.6, done),
  steadyState: () => {
    moveTrace(-1.6, null, 0);
    update();
  },
  leaveStateCommon: () => { updateLines = false; cycleIndex = 6; },
});

slides.push({ transition: { in: gLine } });

slides.push({
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
    { diagram: ['marks.markG0', 'marks.markF0', 'plot.mainTrace'] },
    { diagram: ['distance', 'gLine', 'fLine'] },
  ],
  enterStateCommon: () => {
    cycleIndex = 0;
    updateLines = true;
    moveTrace(-1.6, null, 0);
    fLine.label.showForm('left');
  },
  transition: { in: fLine },
});

slides.push({
  transition: { in: eqn },
  fromForm: { eqn: 'gLeftD', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
  form: { eqn: 'gLeftD', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
});
slides.push({
  form: { eqn: 'gLeftDToX', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
});
slides.push({
  form: { eqn: 'gLeft', 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'funcX' },
});
slides.push({
  steadyState: () => {
    highlighter.showAll();
    highlighter.surround(eqn, 0.07);
    highlighter.pulse({ scale: 1.2 });
  },
});

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  text: [
    'We can now summarize a shift of function |f||lb1||x||rb1|',
    'by distance |d| to the |left| and |right| .',
  ],
  modifiers: {
    left: {
      font: { color: primaryCol },
      touch: 0.1,
      onClick: () => eqnG.pulse({ yAlign: 'top' }),
    },
    right: {
      font: { color: secondaryCol },
      touch: 0.1,
      onClick: () => eqnH.pulse({ yAlign: 'top' }),
    },
  },
  // form: [null, 'funcX', 'left'],
  form: { eqn: null, 'diagram.eqnF': 'funcX', 'diagram.eqnG': 'left' },
  scenarioCommon: ['default', 'bottom'],
  showCommon: [
    { 'diagram.plot': ['x.line', 'x.title', 'y.line', 'y.title', 'fxTrace'] },
    { 'diagram.plot': ['mainTrace', 'rightTrace'] },
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
    'Interactive example: Drag the curve to shift,',
    '|change| points, and compare |f||lb1||x||rb1| and |g1||lb||xr||rb|.',
  ],
  modifiers: {
    change: {
      font: { color: actionColor }, onClick: () => cycle(), touch: 0.1,
    },
  },
  scenario: ['default', 'example'],
  showCommon: [
    { diagram: ['markG', 'markF', 'plot'] },
    movePad, trace,
  ],
  steadyState: () => {
    plot.hide('rightTrace');
    offsets = offsetsValue;
    cycleIndex = 2;
    precision = 1;
    updateEqns = true;
    eqn.showForm('value');
    eqnF.showForm('0');
    eqnG.showForm('0');
    movePad.setMovable();
    movePad.setPosition(plotWidth / 2, plotHeight / 2);
    figure.setScenarios('example');
  },
  leaveState: () => {
    precision = 0;
    updateEqns = false;
    cycleIndex = 6;
    offsets = offsetsD;
    movePad.isMovable = false;
  },
  fromForm: { eqn: 'value', 'diagram.eqnF': '0', 'diagram.eqnG': '0' },
  form: { eqn: 'value', 'diagram.eqnF': '0', 'diagram.eqnG': '0' },
});

// Load slides into slideNavigator
nav.loadSlides(slides);

