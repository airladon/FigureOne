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

let cycler = 0;
let whichX = 'fx';
let offsets = offsetsValue;
const cycle = () => {
  cycler = (cycler + 1) % offsets.length;
  // valueEqn.updateElementText({ value2: `${offsets[cycler][0]}` });
  update();
};
let updateEqns = false;

const update = () => {
  const p = movePad.getPosition('local');
  let xPad = xAxis.drawToValue(p.x)
  trace.update(getFx(xPad, 0));
  const [curveOffset, fLabel, yLabel] = offsets[cycler];
  const yX = whichX === 'fx' ? xPad + curveOffset : curveOffset;
  const yY = fx(yX).y;
  const fX = whichX === 'fx' ? curveOffset : xPad + curveOffset;
  const y = whichX === 'fx' ? fx(fX).y : fx(yX).y;
  let sign = xPad >= 0 ? ' \u2212 ' : ' + ';
  let value2 = Math.abs(round(xPad, 1)).toFixed(precision);
  // if (round(xPad, 1) === 0) {
  //   value2 = '';
  //   sign = '';
  // }
  // eqn.clear();
  if (eqn.isShown) {
    eqn.updateElementText({ sign, value2 }, 'current');
  }
  if (updateEqns) {
    setElement('eqnY', [yX + yLabel[0], y + yLabel[1]], yX);
    setElement('eqnF', [fX + fLabel[0], y + fLabel[1]], fX);
    setElement('markY', [yX, y]);
    setElement('markF', [fX, y]);
  }
  if (dist.isShown) {
    dist.setEndPoints(plot.pointToDraw([fX, y]), plot.pointToDraw([yX, y]));
  }
  figure.animateNextFrame();
}
movePad.subscriptions.add('setTransform', () => {
  update();
});
update();

const animateShift = (offset) => {
  trace.animations.new()
    .delay(1)
    .trigger({ callback: () => setPoints(offset - 2, offset, 0), duration: 5 })
    .trigger({ callback: () => setPoints(offset - 1, offset, 1), duration: 5 })
    .trigger({ callback: () => setPoints(offset, offset, 2), duration: 5 })
    .trigger({ callback: () => setPoints(offset + 1, offset, 3), duration: 5 })
    .trigger({ callback: () => setPoints(offset + 2, offset, 4), duration: 5 })
    .trigger(() => {
      eqn.show();
      eqn.setText({ 'value': `${Math.abs(offset)}`})
      if (offset >= 0) {
        sign.custom.updateText({ text: ' \u2212 ' });
      } else {
        sign.custom.updateText({ text: ' + ' });
      }
      eqn.pulse({ scale: 1.3 })
    })
    .start();
};

setElement('eqnF', [-2.2, 4.2], '-2');
setElement('markF', [-2, 4]);

const setMark = (markName, xValue, xOffset) => {
  const mark = marks.getElement(markName);
  mark.show();
  const py = yAxis.valueToDraw(fx(xValue).y);
  const px = xAxis.valueToDraw(xValue + xOffset);
  mark.setPosition(px, py);
}

// const moveMark = (markName, xValue) => {
//   const mark = diagram.getElement(markName);
//   const target = plot.pointToDraw(fx(xValue));
//   mark.animations.new()
//     .pulse({ duration: 1})
//     .position({ target, duration: 1})
//     .start();
// }

const setMarks = (xOffset) => {
  for (i = 0; i < 7; i += 1) {
    setMark(`markY${i + 1}`, i * 0.7 - 2.1, xOffset);
  }
};

const moveMarks = (xOffsetFrom, xOffsetTo, skipAnimation = false) => {
  setMarks(xOffsetFrom);
  for (i = 0; i < 7; i += 1) {
    const pointX = i * 0.7 - 2.1;
    const from = plot.pointToDraw(fx(pointX + xOffsetFrom));
    const to = plot.pointToDraw(fx(pointX + xOffsetTo));
    const mark = marks.getElement(`markY${i + 1}`);
    if (skipAnimation) {
      mark.setPosition(to.x, from.y);
      return;
    }
    mark.setPosition(from);
    mark.animations.new()
      .pulse({ duration: 1})
      .position({ target: [to.x, from.y], duration: 1})
      .start();
  }
};


const pulseMarks = () => {
  marks.pulse({
    elements: ['markY1', 'markY2', 'markY3', 'markY4', 'markY5', 'markY6', 'markY7']},
  );
}

const moveTrace = (xOffset, done = null, duration = 1) => {
  if (duration === 0) {
    setMarks(xOffset);
    movePad.setPosition(xAxis.valueToDraw(xOffset), 0);
    return;
  }
  setMarks(0);
  eqnY.hide();
  trace.hide();
  fxTrace.show();
  eqn.hide();
  // eqn.showForm('fx')
  // eqn.dim();
  // eqnY.showForm('funcX');
  movePad.setPosition(xAxis.valueToDraw(0), 0);
  movePad.animations.new()
    .trigger({
      duration: 2,
      callback: () => moveMarks(0, xOffset),
    })
    // .position({ target: [xAxis.valueToDraw(xOffset), 0], duration })
    .dissolveOut({ element: trace, duration: 0.4 })
    .trigger(() => {
      movePad.setPosition(xAxis.valueToDraw(xOffset), 0);
    })
    .inParallel([
      trace.animations.dissolveIn({ duration: 0.4 }),
      fxTrace.animations.dissolveOut({ duration: 0.4 }),
    ])
    .trigger(() => {
      eqnY.showForm('funcX')
      // eqn.showForm('yxUnknown')
    })
    .whenFinished(done)
    // .dissolveOut({ element: eqn, duration: 0.4 })
    // .trigger(() => {
    //   eqn.highlight(['y', 'lb1', 'rb1', 'x_1']);
    //   // eqn.showForm('fxyx');
    // })
    // .dissolveIn({ element: eqn, duration: 0.4 })
    // .then(eqn.animations.goToForm({ target: 'fxyx' }))
    .start();
}


slides = [];
const times = 'Times New Roman'
// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
slides.push({
  modifiersCommon: {
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
  },
  steadyState: () => {
    figure.showOnly([
      'nav', trace, 'diagram.plot.fxTrace', 'eqnTitle',
      'diagram.plot.titleX', 'diagram.plot.middleY', 'title',
    ]);
    figure.setScenarios('default');
    figure.setScenarios('title');
    trace.update(getFx(1.6, 0));
    fxTrace.update(getFx(-1.6, 0));
    eqn.showForm('fx');
  },
  leaveState: () => {
    fxTrace.update(getFx(0, 0));
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
    // fxTrace.update(getFx(0, 0));
    // eqn.showForm('fx');
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
    figure.setScenarios('default');
    // fxTrace.update(getFx(0, 0));
    eqn.showForm('fx');
    eqn.setScenario('initial');
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
    setMarks(0);
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
    setMarks(0);
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
  },
  form: null,
  modifiers: {
    Shifting: {
      font: { color: actionColor },
      onClick: () => moveTrace(2, null),
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
    // 'A |positive| shift of |each| |y||lb||xr||rb| value is the same',
    // 'as |f|(|x||n|) where |x||n| is on the negative side of |x|.',
    // 'A |positive| shift |d| means each |y||lb||xr||rb| value',
    // 'has a corresponding |f1| value distance |d| to the left.',
    // 'Each |y||lb||xr||rb| value has a corresponding |f1| value',
    // 'that is |d| more negative'
    'In other words, each value of |f| is |d1| to the left of',
    'the shifted function.'
  ],
  enterState: () => {
    marks.undim();
  },
  steadyState: () => {
    offsets = offsetsD;
    // updateEqns = false;
    dist.showAll();
    dist.setEndPoints([10, 10], [11, 11]);
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
  },
  form: 'fxd',
  steadyState: () => {
    offsets = offsetsD;
    // updateEqns = false;
    dist.showAll();
    dist.setEndPoints([10, 10], [11, 11]);
  },
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
    cycler = 2;
    precision = 1;
    updateEqns = true;
    eqn.showForm('value');
    diagram.getElement('eqnF').showForm('0');
    diagram.getElement('eqnY').showForm('0');
    movePad.setTouchable();
    movePad.setPosition(plotWidth / 2, 0);
    figure.setScenarios('example');
  },
  leaveState: () => {
    precision = 0;
    updateEqns = false;
  },
});

figure.getElement('nav').loadSlides(slides);



// figure.getElement('nav').goToSlide(9);

/*
We start with some function g(x). Each value of g aligns with an x value.

To shift the function g(x) by distance d, we want to align g with new x values:
h()
If we align g(x) with different x values, we will have a new function:

h(x + d)


Shifting a function g(x) to the right along the x axis is the same as saying we wish to move each value of g to a new x
Shifting a function g(x) along x is the same as saying we wish to move each value of g to a new x value.

The shifted function h, will be the g function but aligned with new x values:

h(x_new) = g(x)


Shifting a function f(x) along x is the same as saying we wish to move each value of f to a new x value.

The shifted function g will align the new x value with f(x)
g(x_new) = f(x)

If we shift f(x) to the right by distance d, then we are associating each value of f(x) with a new position x + d:

g(x+d) = f(x)

Similarly, if we shift f(x) to the left by distance d, then we are associating each value of f(x) with a new position x - d:
g(x - d) = f(x)

In summary, if function g is the same as f, just shifted to the right then:
g(x + d) = f(x)

When some function g is to the left of f, then
g(x - d) = f(x).

Now, we will plot out y(x) = f(x).

If we shift y(x) to the right by distance d, then y(x) is now to the right of f(x), and so our plot is now:

y(x) = f(x - d)

If we shift y(x) to the left by distance d

If we shift it right by distance d, then we are saying each value of f(x) should now be associated with position x + d.

Our shifted function is then:
y(x + d) = f(x)

If we shift it left by distance d, then we are saying each value of f(x) should now be associated with an x to the left:
y(x - d) = f(x)

The function y(x+d) is to the right of f(x).
The function y(x-d) is to the left of f(x).

If y(x-d) is to the left of f(x), then f(x-d) must be to the left of y(x).


How does an equation change when it is shifted?

Let's start by plotting out some fuynction f(x) shuch that:

y(x) = f(x)

In other words, each value of f(x) appears at the corresponding x value on the plot.

Now, if we move the plot by +d along the x axis, we are saying we want each value of f(x) to be at (a shifted value of x) x + d, instead of x.

y(x + d) = f(x)

In other words, each value of y is ahead of f by some distance along the x axis.
Correspondingly, each value of f is the same distance behind y along the x axis.

y(x) = f(x - d)

This can be mathematically clear, but conceptually confusing, so another way to approach this is by looking at an example.




Let's start with y(x) = f(x) = x^2.


In other words the value of y leads the value of f along the x Axis.
We can therefore also say the value of f lags the value of y along the x Axis.

y(x) = f(x - d)


In other words, each value of y comes from the value of f at x - d.

In other words, each value of y(x) is the value of f for the x value x - d:


y(x) = f(x - d)
This says that each value of f(x) is plotted at x + d. It also says that each value of y(x) is the f(x - d) value.


If we substitute:
x_shift = x + d we get:
y(x_shift) = f(x_shift - d)

x_shift is all x, so we can just as easily write
y(x) = f(x - d)


How does an equation change when it is shifted?

Let's start by plotting out some function f(x) such that:

y(x) = f(x)

We see at
x=0: y(x = 0) = f(0)
x=1: y(x = 1) = f(1)

Now, what happens if y(x) moves distance d in the +x direction?

Each point along f(x) moves distance d to the right meaning f(0) should now be at x = d, instead of x = 0.

y(0 + d) = f(0)
y(1 + d) = f(1)

y(x + d) = f(x)

if x + d = xShifted, then xShifted - d = x
y(xShifted) = f(xShifted - d)
y(x) = f(x - d)

We can achieve this by transforming out input to f(x) to make x look like the unshifted x:

y(x) = f(x - d)

Let's look at an example.

We have f(x) = x^2, and we will track three points along the curve.

when y(x) has no shift, y(x) aligns with f(x).

Now shift y(x) in the positive or negative direction. The y values at the new shifted location will now align with new x values.


Now each y value looks like the y value when x was 1 unit before the current x.


The function f(x) takes an x value as input, and outputs a y value.

Plotting the function f(x) means inputting many values of x, and plotting the corresponsing y outputs.

ie: at x=0, we have y(x = 0) = f(0)
at x = 1, we have y(x = 1) = f(1)

Now, let's say we want to move the plot 1 unit in the positive x direction.

Let's compare the y values for the two functions:

Now y(x = 0) = f(-1)
y(x = 1) = f(0)
y(x = 2) = f(1)

In words, the x value has been transformed to look like the x value negative 1 unit away.

y(x) = f(x-1)


That means that y(x) for each x will look like the y value from corresponding x values 1 unit before.


If we transform each x input to look like the x from distance a before, then 
Each y value of x before the shift get's shifted by +a along x.
That 


when we shift the plot by +a, we want the y value for each x value to look like the y value for the x value that is a before.
Now, if we shift the plot by +a, then that means we want the y value at each value of x to be the y value from the corresponding x value before the shift.

i.e. at x = a, we have y(a) = f(0)


Let's consider now a plot that is shifted by 
Now, we can transform each value of x before we input it into f(x)
When we shift the plot by +x, it means the 
To shift a function by +x' then means all out input values need to be transformed to look like values from before the shift.

Now shifting a function by +a along x means we for each input x, we want the function f(x) to see the unshifted value as an input
To shift a function in the positive direction, each input to the function must look like the input from before the shift
*/