figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1], });

const { Point } = Fig;
const { round, range } = Fig.tools.math;
const x = range(-5, 5, 0.1);
const xSparse = range(-5, 5, 1);
const fx = (xx, ox = 0, oy = 0) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));
const getFxSparse = (xMax, ox, oy) => xSparse.filter(xx => xx <= xMax + 0.001).map(xx => fx(xx, ox, oy));

const plotPosition = new Point(-1.3, -1.1);
const width = 2.67;
const height = 1.66;
const greyColor = [0.6, 0.6, 0.6, 1];
const actionColor = [0, 0.6, 1, 1];
const primaryColor = [1, 0, 0, 1];
const offsets = [
  [-2, [-1.35, -0.4], [0.2, 0.2]],
  [-1, [-1.35, -0.4], [0.2, 0.2]],
  [0, [-0.3, 0.3], [-0.4, -0.45]],
  [1, [-1.15, 0.15], [0.1, -0.4]],
  [2, [-1.15, 0.15], [0.1, -0.4]],
];

const makeEqn = (name, funcName, xAlign = 'left') => ({
  name,
  method: 'collections.equation',
  options: {
    elements: {
      value: '0',
      x: '',
      equals: '',
      func: funcName,
    },
    color: funcName === 'f' ? greyColor : primaryColor,
    formDefaults: { alignment: { xAlign } },
    forms: {
      0: ['func', ' ', '_(', { scale: [['x', 'equals'], 0.4] }, 'value', '_)'],
      funcX: ['func', ' ', '_(', 'x_1', '_)'],
    },
    scale: 0.6,
  },
});

const makeMark = (name, color = greyColor, radius = 0.02) => ({
  name,
  method: 'primitives.polygon',
  options: {
    radius,
    sides: 20,
    color,
  },
});

const brac = (left, content, right) => ({
  brac: {
    content,
    left,
    right,
    topSpace: 0.03,
    bottomSpace: 0.03,
  },
});
// Movable angle
figure.add([
  {
    name: 'diagram',
    method: 'collection',
    mods: {
      scenarios: {
        default: { position: plotPosition, scale: 1 },
        // title: { position: [-1.2, -1.25], scale: 0.9 },
        title: { position: plotPosition, scale: 1 },
      },
    },
    elements: [
      {
        name: 'plot',
        method: 'collections.plot',
        options: {
          trace: [
            {
              points: getFx(-2, 0),
              name: 'titleTrace',
              line: { width: 0.01, dash: [0.05, 0.01], color: greyColor },
            },
            {
              points: getFx(0, 0),
              name: 'fxTrace',
              line: { width: 0.005, dash: [0.05, 0.01], color: greyColor },
            },
            {
              points: getFx(0, 0),
              name: 'mainTrace',
              line: { width: 0.01, color: primaryColor },
            },
          ],
          width,
          height,
          xAxis: {
            // start: -4.5,
            // stop: 4.5,
            // ticks: { values: [-4, -3, -2, -1, 1, 2, 3, 4], width: 0.003, offset: -0.015, length: 0.03 },
            // labels: { offset: [0, 0.02], font: { size: 0.07, color: greyColor } },
            // line: { width: 0.003, arrow: 'triangle' },
            // // grid: false,
            // title: {
            //   text: 'x',
            //   font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
            //   offset: [1.2, 0.2],
            // },
            // position: [0, height / 8 * 1.5],
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
          axes: [
            {
              name: 'titleX',
              axis: 'x',
              ticks: null,
              grid: null,
              position: [0, height / 6],
              line: { arrow: { end: { head: 'triangle', scale: 2 } } },
              title: {
                text: 'x',
                font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
                offset: [1.45, 0.12],
              }
            },
            {
              name: 'titleY',
              axis: 'y',
              ticks: null,
              grid: null,
              length: height - height / 6,
              // position: [0, height / 6],
              position: [0, height/ 6],
              line: { arrow: { end: { head: 'triangle', scale: 2 } } },
              title: {
                text: 'y',
                font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
                rotation: 0,
                offset: [0.1, 0.75],
              }
            },
            {
              name: 'middleY',
              axis: 'y',
              ticks: null,
              grid: null,
              length: height - height / 6,
              // position: [0, height / 6],
              position: [width / 2, height/ 6],
              line: { arrow: { end: { head: 'triangle', scale: 2 } } },
              title: {
                text: 'y',
                font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
                rotation: 0,
                offset: [0.1, 0.75],
              }
            },
          ],
          yAxis: {
            // start: -1.5,
            // stop: 5.5,
            // ticks: { values: [-1, 1, 2, 3, 4, 5], width: 0.003, offset: -0.025, },
            // // grid: false,
            // line: { width: 0.003, arrow: 'triangle' },
            // labels: { font: { size: 0.07, color: greyColor } },
            // position: [width / 2, 0],
            // title: {
            //   text: 'y',
            //   rotation: 0,
            //   offset: [0.2, 0.85],
            //   font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
            // }
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
        },
      },
      {
        name: 'movePad',
        method: 'primitives.rectangle',
        options: {
          width: 2,
          height: height + 0.2,
          position: [width / 2, height / 2],
          color: [1, 0, 0, 0.1],
        },
        mods: {
          isMovable: true,
          move: {
            style: 'translation',
            bounds: { translation: {
              p1: [width / 5, height / 2],
              mag: width / 5 * 3,
              angle: 0,
            } },
          }
        }
      },
      makeEqn('eqnF0', 'f', 'left'),
      makeEqn('eqnY0', 'y', 'left'),
      makeMark('markF0', greyColor),
      makeMark('markY0', primaryColor),
      makeMark('markY1', primaryColor),
      makeMark('markY2', primaryColor),
      makeMark('markY3', primaryColor),
      makeMark('markY4', primaryColor),
      makeMark('markY5', primaryColor),
      makeMark('markY6', primaryColor),
      makeMark('markY7', primaryColor),
    ],
  },
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      color: primaryColor,
      elements: {
        value1: { text: '0.0' },
        value2: '0.0',
        sign: ' \u2212 ',
        equals: ' = ',
        lb1: { symbol: 'bracket', side: 'left' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        rb2: { symbol: 'bracket', side: 'right' },
      },
      phrases: {
        yx: ['y', brac('lb1', 'x_1', 'rb1')],
        fx: ['f', brac('lb2', 'x_2', 'rb2')],
        yValue: ['y', brac('lb1', 'value1', 'rb1')],
        fValue: ['f', brac('lb2', 'value2', 'rb2')],
      },
      forms: {
        0: ['yx', 'equals', 'f', ' ', brac('lb2', ['x_2', ' ', 'sign', 'value'], 'rb2')],
        fx: ['yx', 'equals', 'fx'],
      },
      formDefaults: {
        alignment: { fixTo: 'equals', xAlign: 'center' },
      },
    },
    mods: { 
      scenarios: {
        default: { position: [0, 0.75] },
        title: { position: [-0.5, -1.05] },
      }
    }
  },
  {
    name: 'valueEqn',
    method: 'collections.equation',
    options: {
      elements: {
        value1: '0.0',
        value2: '0.0',
        equals: '  =  ',
        equals1: { text: ' = ', color: primaryColor },
        x: { color: primaryColor },
        y: { color: primaryColor },
        lb1: { symbol: 'bracket', side: 'left', color: primaryColor },
        rb1: { symbol: 'bracket', side: 'right', color: primaryColor },
        lb2: { symbol: 'bracket', side: 'left' },
        rb2: { symbol: 'bracket', side: 'right' },
        value1: { text: '0', color: primaryColor },
        value2: '0',
      },
      phrases: {
        yValue: ['y', brac('lb1', ['x', 'equals1', 'value1'], 'rb1')],
        fValue: ['f', ' ', brac('lb2', ['x_2', '_ = _1', 'value2'], 'rb2')],
      },
      forms: {
        0: ['yValue', 'equals', 'fValue'],
      },
      formDefaults: {
        alignment: { fixTo: 'equals', xAlign: 'center' },
      },
    },
    mods: { 
      scenarios: {
        default: { position: [0, 0.75 ] },
      }
    }
  },
  {
    name: 'eqnTitle',
    method: 'collections.equation',
    options: {
      color: primaryColor,
      elements: {
        unknown: '?',
        lb1: { symbol: 'bracket', side: 'left', color: primaryColor },
        rb1: { symbol: 'bracket', side: 'right', color: primaryColor },
      },
      phrases: { yx: ['y', brac('lb1', 'x_1', 'rb1')] },
      forms: { title: ['yx', '_  =  ', 'unknown'] },
      formDefaults: { alignment: { xAlign: 'center' } },
    },
    mods: { scenarios: { title: { position: [0.5, -1.05 ] } } },
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

const trace = figure.getElement('diagram.plot.mainTrace');
// const fxTrace = figure.getElement('diagram.plot.fxTrace');
// const titleTrace = figure.getElement('diagram.plot.titleTrace');
const movePad = figure.getElement('diagram.movePad');
const marks = figure.getElement('diagram.plot.marks');
const xAxis = figure.getElement('diagram.plot.x');
const yAxis = figure.getElement('diagram.plot.y');
const diagram = figure.getElement('diagram');
const plot = diagram.getElement('plot');
// const drawPoint = figure.getElement('diagram.drawPoint');
const eqn = figure.getElement('eqn');
const valueEqn = figure.getElement('valueEqn')
const nav = figure.getElement('nav');
const eqnF = diagram.getElement('eqnF0');
const eqnY = diagram.getElement('eqnY0');

const setElement = (name, position, label = null) => {
  const e = figure.getElement(`diagram.${name}`);
  if (e.isShown === false) {
    return;
  }
  const p = Fig.tools.g2.getPoint(position);
  const px = xAxis.valueToDraw(p.x);
  const py = yAxis.valueToDraw(p.y);
  e.clear();
  e.setPosition(px, py);
  if (label != null) {
    if (typeof label === 'number') {
      let value = round(label, 1);
      if (value < 0) {
        value = `${value.toFixed(1)}`;
      } else if (value > 0) {
        value = `${value.toFixed(1)}`;
      } else {
        value = '0';
      }
      e.updateElementText({ value }, 'current');
    } else {
      e.updateElementText({ value: label }, 'current');
    }
  }
}

let cycler = 0;
let whichX = 'fx';
const cycle = () => {
  cycler = (cycler + 1) % offsets.length;
  valueEqn.updateElementText({ value2: `${offsets[cycler][0]}` });
  update();
};

const update = () => {
  const p = movePad.getPosition('local');
  let xPad = xAxis.drawToValue(p.x)
  trace.update(getFx(xPad, 0));
  const [curveOffset, fLabel, yLabel] = offsets[cycler];
  const yX = whichX === 'fx' ? xPad + curveOffset : curveOffset;
  const yY = fx(yX).y;
  const fX = whichX === 'fx' ? curveOffset : xPad + curveOffset;
  const y = whichX === 'fx' ? fx(fX).y : fx(yX).y;
  valueEqn.updateElementText({
    value1: `${yX.toFixed(1)}`,
    value2: `${fX.toFixed(1)}`,
  }, 'current');
  setElement('eqnY0', [yX + yLabel[0], y + yLabel[1]], yX);
  setElement('eqnF0', [fX + fLabel[0], y + fLabel[1]], fX);
  setElement('markY0', [yX, y]);
  setElement('markF0', [fX, y]);
  // const sign = fX >= 0 ? ' \u2212 ' : ' + ';
}
movePad.subscriptions.add('setTransform', () => {
  update();
});
update();
// const hideEquations = () => {
//   for (let i = 0; i < 5; i += 1) {
//     figure.getElement(`eqn${i}`).hide();
//   }
//   // eqn.hide();
// }
// hideEquations();

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

setElement('eqnF0', [-2.2, 4.2], '-2');
setElement('markF0', [-2, 4]);

const setMark = (markName, xValue, xOffset) => {
  const mark = diagram.getElement(markName);
  mark.show();
  const py = yAxis.valueToDraw(fx(xValue).y);
  const px = xAxis.valueToDraw(xValue + xOffset);
  mark.setPosition(px, py);
}

const moveMark = (markName, xValue) => {
  const mark = diagram.getElement(markName);
  const target = plot.pointToDraw(fx(xValue));
  mark.animations.new()
    .pulse({ duration: 1})
    .position({ target, duration: 1})
    .start();
}

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
    const mark = diagram.getElement(`markY${i + 1}`);
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
  diagram.show(['markY1', 'markY2', 'markY3', 'markY4', 'markY5', 'markY6', 'markY7']);
  diagram.pulse({
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
    .dissolveIn({ element: trace, duration: 0.4 })
    .whenFinished(done)
    .start();
}


// const show = (elements = []) => {
//   figure.elements.hideAll();
//   if (elements.length > 0) {
//     figure.elements.exec(['showAll'], elements);
//   }
//   figure.animateNextFrame();
// }

slides = [];
slides.push({
  text: [
    '', '    How does an equation change when shifted?',
  ],
  modifiersCommon: {
    x: { font: { family: 'Times New Roman', style: 'italic' } },
    f: { font: { family: 'Times New Roman', style: 'italic' } },
    y: { font: { family: 'Times New Roman', style: 'italic' } },
  },
  steadyState: () => {
    figure.showOnly([
      'nav', trace, 'diagram.plot.titleTrace', 'eqnTitle',
      'diagram.plot.titleX', 'diagram.plot.titleY',
    ]);
    figure.setScenarios('title');
    trace.update(getFx(2, 0));
    eqn.showForm('fx');
    eqn.dim();
  },
});

// //////////////////////////////////////////////////////////
slides.push({
  text: 'We start by plotting a function  |f| (|x|).',
  steadyState: () => {
    figure.showOnly(['nav', 'diagram.plot.titleX', 'diagram.plot.middleY']);
    figure.setScenarios('default');
  },
});

slides.push({
  enterStateCommon: () => {
    figure.showOnly(['nav', 'diagram.plot.titleX', 'diagram.plot.middleY']);
    figure.setScenarios('default');
    trace.update(getFx(0, 0));
  },
  transition: (done) => {
    trace.show();
    trace.animations.new()
      .dissolveIn({ duration: 0.5 })
      .whenFinished(done)
      .start();
  },
  form: 'fx',
  steadyState: () => {
    trace.show()
    eqn.highlight(['y', 'lb1', 'rb1', 'x_1'])
    eqn.setPosition([0, -1]);
  },
});

// //////////////////////////////////////////////////////////
slides.push({
  text: [
    '|Shifting| the function in |x| moves each |value| of',
    '|f| (|x|) to a new |x|.',
  ],
  modifiers: {
    Shifting: { font: { color: actionColor }, onClick: () => nav.nextSlide() },
    value: { font: { color: actionColor }, onClick: () => pulseMarks() },
  },
  enterStateCommon: () => {
    setMarks(0);
    figure.showOnly([
      'nav', trace, 'diagram.plot.titleX', 'diagram.plot.middleY', movePad,
      'diagram.plot.fxTrace',
    ]);
    figure.setScenarios('default');
    trace.update(getFx(0, 0));
    eqn.highlight(['y', 'lb1', 'rb1', 'x_1'])
    eqn.showForm('fx');
    eqn.setPosition([0, -1]);
    movePad.isTouchable = false;
  },
});

slides.push({
  enterState: () => {
    eqn.hide();
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
  steadyState: () => {
    moveTrace(2, null, 0);
    eqnF.showForm('funcX');
    eqnY.showForm('funcX');
    setElement('eqnF0', [-0.3, -0.5])
    setElement('eqnY0', [1.7, -0.5])
    // eqnY.setPosition([1, 1]);
    // console.log(eqnF)
  },
});

slides.push({
  enterStateCommon: () => {},
  text: [
    'Let\'s look at |one| point at a time',
  ],
  modifiers: {
    one: {
      font: { color: actionColor },
      onClick: () => cycle(),
    }
  },
  steadyStateCommon: () => {
    figure.showOnly([
      'nav', trace,
      'diagram.plot.fxTrace', 'diagram.plot.titleX', 'diagram.plot.middleY',
    ]);
    diagram.show([
      movePad,
      `markY0`, `markF0`, `eqnF0`, `eqnY0`,
    ]);
    movePad.setPosition(xAxis.valueToDraw(2), 0)
    // eqn.highlight(['y', 'lb1', 'x_1', 'rb1'])
    figure.elements.setScenarios('default');
    movePad.isTouchable = true;
    // trace.update(getFx(2, 0));
    valueEqn.showForm('0');
    diagram.getElement('eqnF0').showForm('0');
    diagram.getElement('eqnY0').showForm('0');
    cycle();
  },
});

figure.getElement('nav').loadSlides(slides);
figure.getElement('nav').goToSlide(4);

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