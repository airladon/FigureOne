figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1], });

const { Point } = Fig;
const { round, range } = Fig.tools.math;
const x = range(-5, 5, 0.1);
const xSparse = range(-5, 5, 1);
const fx = (xx, ox, oy) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));
const getFxSparse = (xMax, ox, oy) => xSparse.filter(xx => xx <= xMax + 0.001).map(xx => fx(xx, ox, oy));

const plotPosition = new Point(-1.3, -1.1);
const width = 2.67;
const height = 1.66;
const greyColor = [0.6, 0.6, 0.6, 1];
const actionColor = [0, 0.6, 1, 1];
const primaryColor = [1, 0, 0, 1];
const refX = [-2, 0, 1];
// const makeEqn = (name, position, color = primaryColor) => ({
//   name,
//   method: 'collections.equation',
//   options: {
//     elements: {
//       value1: '1',
//       value2: '1',
//       equals: '  =  ',
//       sign: ' \u2212 ',
//     },
//     phrases: {
//       yx: ['y', '_(_1', 'value1', '_)_1'],
//       fx: ['f', ' ', '_(_2', 'value2', '_)_2'],
//     },
//     forms: {
//       0: ['yx', 'equals', 'fx'],
//     },
//     formDefaults: {
//       alignment: { xAlign: 'center', fixTo: 'equals' },
//     },
//     position,
//     scale: 0.5
//   },
// });
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
      // noX: ['func', ' ', '_(', 'value', '_)'],
      // withX: ['func', ' ', '_(','x', '_ = ', 'value', '_)'],
    },
    scale: 0.6,
  },
});
// const makeYEqn = (name, xAlign) => ({
//   name,
//   method: 'collections.equation',
//   options: {
//     elements: {
//       value: '0',
//     },
//     color: primaryColor,
//     formDefaults: { alignment: { xAlign } },
//     forms: {
//       0: ['y', ' ', '_(', 'value', '_)'],
//     },
//     scale: 0.6,
//   },
// });

const makeMark = (name, color = greyColor, radius = 0.017) => ({
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
        title: { position: [-1.2, -1.25], scale: 0.9 },
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
              line: { width: 0.005, dash: [0.01, 0.01], color: greyColor },
            },
            {
              points: getFx(0, 0),
              name: 'mainTrace',
              line: { width: 0.01, color: primaryColor },
            },
            // {
            //   points: [],
            //   name: 'marks',
            //   markers: { radius: 0.02, color: [1, 0, 0, 1], sides: 10 },
            // },
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
              // position: [0, height / 6],
              position: [0, height/ 6],
              line: { arrow: { end: { head: 'triangle', scale: 2 } } },
              title: {
                text: 'y',
                font: { family: 'Times New Roman', style: 'italic', size: 0.12 },
                rotation: 0,
                offset: [0.1, 0.85],
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
      {
        name: 'arrow',
        method: 'primitives.line',
        options: {
          p1: [0.8, 0.1],
          p2: [1.9, 0.1],
          width: 0.008,
          color: primaryColor,
          arrow: {
            end: 'barb',
          },
        },
      },
      // {
      //   name: 'xLine',
      //   method: 'primitives.polyline',
      //   options: {
      //     width: 0.003,
      //     color: [0, 0, 1, 1],
      //   }
      // },
      // {
      //   name: 'vLine',
      //   method: 'collections.line',
      //   options: {
      //     width: 0.003,
      //     dash: [0.02, 0.01],
      //     color: [1, 0, 0, 1],
      //   }
      // },
      // {
      //   name: 'hLine',
      //   method: 'collections.line',
      //   options: {
      //     width: 0.003,
      //     dash: [0.02, 0.01],
      //     color: [1, 0, 0, 1],
      //     // label: {
      //     //   text: null,
      //     //   scale: 0.4,
      //     // }
      //   }
      // },
      // {
      //   name: 'drawPoint',
      //   method: 'primitives.polygon',
      //   options: {
      //     radius: 0.02,
      //     sides: 20,
      //   }
      // },
      // makeFEqn('eqnF0', 'x'),
      makeEqn('eqnF0', 'f', 'right'),
      makeEqn('eqnF1', 'f', 'center'),
      makeEqn('eqnF2', 'f', 'right'),
      makeEqn('eqnY0', 'y', 'left'),
      makeEqn('eqnY1', 'y', 'center'),
      makeEqn('eqnY2', 'y', 'left'),
      makeMark('markF0', greyColor),
      makeMark('markF1', greyColor),
      makeMark('markF2', greyColor),
      makeMark('markY0', primaryColor),
      makeMark('markY1', primaryColor),
      makeMark('markY2', primaryColor),
      makeMark('markY3', primaryColor),
      makeMark('markY4', primaryColor),
      makeMark('markY5', primaryColor),
      makeMark('markY6', primaryColor),
      {
        name: 'eqnF',
        method: 'collections.equation',
        options: {
          color: greyColor,
          scale: 0.5,
          forms: {
            0: ['f(', 'x', '_) = ', { sup: ['x_2', '_2'] }],
          },
        },
      },
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
        equals: '  =  ',
        lb1: { symbol: 'bracket', side: 'left' },
        lb2: { symbol: 'bracket', side: 'left' },
        rb1: { symbol: 'bracket', side: 'right' },
        rb2: { symbol: 'bracket', side: 'right' },
      },
      phrases: {
        yx: ['y', { brac: ['lb1', 'x_1', 'rb1'] }],
        fx: ['f', { brac: ['lb2', 'x_2', 'rb2'] }],
        yValue: ['y', { brac: ['lb1', 'value1', 'rb1'] }],
        fValue: ['f', { brac: ['lb2', 'value2', 'rb2'] }],
      },
      forms: {
        0: ['yx', 'equals', 'f', ' ', { brac: ['lb2', ['x_2', ' ', 'sign', 'value'], 'rb2'] }],
        fx: ['yx', 'equals', 'fx'],
        // values: ['yValue', 'equals', 'fValue'],
      },
      formDefaults: {
        alignment: { fixTo: 'equals', xAlign: 'center' },
      },
      // position: [-0.3, 0.8],
    },
    mods: { 
      scenarios: {
        default: { position: [0, 0.9 ] },
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
        yValue: ['y', { brac: ['lb1', ['x', 'equals1', 'value1'], 'rb1'] }],
        fValue: ['f', ' ', { brac: ['lb2', ['x_2', '_ = _1', 'value2'], 'rb2'] }],
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
      phrases: { yx: ['y', '_(', 'x_1', '_)'] },
      forms: { title: ['yx', '_  =  ', 'unknown'] },
      formDefaults: { alignment: { xAlign: 'center' } },
    },
    mods: { scenarios: { title: { position: [0.5, 0 ] } } },
  },
  // makeEqn('eqn0', [1.3, 0.6]),
  // makeEqn('eqn1', [1.3, 0.4]),
  // makeEqn('eqn2', [1.3, 0.2]),
  // makeEqn('eqn3', [1.3, 0]),
  // makeEqn('eqn4', [1.3, -0.2]),
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
const fxTrace = figure.getElement('diagram.plot.fxTrace');
const titleTrace = figure.getElement('diagram.plot.titleTrace');
const movePad = figure.getElement('diagram.movePad');
const marks = figure.getElement('diagram.plot.marks');
// const value = figure.getElement('eqn.value');
// const value1 = figure.getElement('eqn1.value1');
// const value2 = figure.getElement('eqn1.value2');
// const sign = figure.getElement('eqn.sign');
const xAxis = figure.getElement('diagram.plot.x');
const yAxis = figure.getElement('diagram.plot.y');
const diagram = figure.getElement('diagram');
const plot = diagram.getElement('plot');
// const xLine = figure.getElement('diagram.xLine');
const drawPoint = figure.getElement('diagram.drawPoint');
// const refPoint = figure.getElement('diagram.refPoint');
const eqn = figure.getElement('eqn');
const valueEqn = figure.getElement('valueEqn')
// const vLine = figure.getElement('diagram.vLine')
// const hLine = figure.getElement('diagram.hLine')
// console.log(eqn1)

const setElement = (name, position, label = null) => {
  const e = figure.getElement(`diagram.${name}`);
  if (e.isShown === false) {
    return;
  }
  const p = Fig.tools.g2.getPoint(position);
  const px = xAxis.valueToDraw(p.x);
  const py = yAxis.valueToDraw(p.y);
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
    // if (label === '0') {
    //   // e.showForm('noX');
    //   e.setText({ x: '', equals: '' });
    // } else {
    //   // e.showForm('withX');
    //   e.setText({ x: 'x', equals: ' = ' });
    // }
  }
}

// const setLine = (xx, xOffset) => {
//   const y = fx(xx, xOffset, 0);
//   const drawX = xAxis.valueToDraw(xx);
//   const drawXoffset = xAxis.valueToDraw(xx - xOffset);
//   const points = [
//     [drawX, 0],
//     [drawXoffset, 0],
//     [drawXoffset, Math.min(yAxis.valueToDraw(y.y), yAxis.valueToDraw(8))],
//   ];
//   // xLine.custom.updatePoints({ points });
//   drawPoint.setPosition(drawX, 0);
// }

// const setVLine = (xx, xOffset) => {
//   const y = yAxis.valueToDraw(fx(xx, xOffset, 0).y);
//   const drawX = xAxis.valueToDraw(xx);
//   vLine.setEndPoints([drawX, y], [drawX, 0]);
//   // vLine.animations.new()
//   //   .length({ start: 0, target: y, duration: 0.7 })
// }

// setPoints = (xx, xOffset, index) => {
//   const y = yAxis.valueToDraw(fx(xx, xOffset, 0).y);
//   const drawX = xAxis.valueToDraw(xx);
//   const drawXoffset = xAxis.valueToDraw(xx - xOffset);
//   drawPoint.setPosition(drawXoffset, y);
//   // refPoint.stop();
//   // refPoint.setPosition(drawXoffset, y);
//   // eqn1.hide();
//   vLine.setEndPoints([drawX, y], [drawX, 0]);
//   // hLine.setEndPoints([drawXoffset, y], [drawXoffset, y]);
//   vLine.hide();
//   const eq = figure.getElement(`eqn${index}`);
//   drawPoint.animations.new()
//     .pulse({ scale: 3, duration: 0.9 })
//     .inParallel([
//       drawPoint.animations.position({ target: [drawX, y], duration: 1 }),
//       // hLine.animations.length({
//       //   start: 0,
//       //   target: drawX - drawXoffset,
//       //   duration: 1,
//       //   progression: 'easeinout',
//       //   // beforeFrame: () => {
//       //   //   const l = hLine.getLength();
//       //   //   const xLength = xAxis.drawToValue(l);
//       //   //   hLine.setLabel(`${Fig.tools.math.round(xLength, 1).toFixed(1)}`);
//       //   // }})
//       // })
//     ])
//     .trigger(() => { vLine.show() })
//     .then(vLine.animations.length({ start: 0, length: y, duration: 0.3 }))
//     .trigger(() => {
//       marks.update(getFxSparse(xx, xOffset, 0))
//       eq.undim();
//       eq.show();
//       eq.setText({
//         value1: `${xx}`,
//         value2: `${xx - xOffset}`,
//       });
//       eq.pulse({ scale: 1.3 });
//     })
//     .delay(3)
//     .trigger(() => {
//       eq.dim();
//     })
//     .start();
//   console.log(marks)
// }

let cycler = 0;
const cycle = () => {
  cycler = (cycler + 1) % 3;
  diagram.hideAll();
  diagram.show([
    plot, movePad,
    `markY${cycler}`, `markF${cycler}`, `eqnF${cycler}`, `eqnY${cycler}`,
  ]);
  plot.hide(['titleTrace', 'titleX', 'titleY']);
  eqn.updateElementText({ value2: `${refX[cycler]}` });
  valueEqn.updateElementText({ value2: `${refX[cycler]}` });
  // eqn.highlight(['y', '_(', 'x_1', '_)', 'value1'])
  update();
};

const update = () => {
  const p = movePad.getPosition('local');
  let xOffset = xAxis.drawToValue(p.x)
  trace.update(getFx(xOffset, 0));
  rxOffset = Fig.tools.math.round(xOffset + refX[cycler], 1);
  // let eqnValue = `${Math.abs(rxOffset).toFixed(1)}`
  const sign = rxOffset >= 0 ? ' \u2212 ' : ' + ';
  eqn.updateElementText({
    sign,
    value: `${Math.abs(rxOffset).toFixed(1)}`,
  }, 'current');
  valueEqn.updateElementText({
    value1: `${rxOffset.toFixed(1)}`,
  }, 'current');
  // value.custom.updateText({ text: `${Math.abs(rxOffset).toFixed(1)}`})
  // if (rxOffset >= 0) {
  //   sign.custom.updateText({ text: ' \u2212 ' });
  // } else {
  //   sign.custom.updateText({ text: ' + ' });
  // }
  setElement('eqnY0', [xOffset - 1.8, 3.65], xOffset - 2);
  setElement('eqnY1', [xOffset, -0.45], xOffset);
  setElement('eqnY2', [xOffset + 1.1, 0.65], xOffset + 1);
  setElement('markY0', [xOffset - 2, 4]);
  setElement('markY1', [xOffset, 0]);
  setElement('markY2', [xOffset + 1, 1]);
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
// animateShift(-1);

setElement('eqnF', [2.4, 4.6]);
setElement('eqnF0', [-2.2, 4.2], '-2');
setElement('eqnF1', [-0, 0.3], '0');
setElement('eqnF2', [0.9, 1.15], '1');
setElement('markF0', [-2, 4]);
setElement('markF1', [0, 0]);
setElement('markF2', [1, 1]);

const showElements = (elements = []) => {
  diagram.exec(['hide'], ['eqnF', 'eqnF1', 'eqnF2', 'eqnF3', 'markF1', 'markF2', 'markF3', 'eqnY1', 'eqnY2', 'eqnY3', 'markY1', 'markY2', 'markY3']);
  if (elements.length > 0) {
    diagram.exec(['show'], elements);
  }
}

const show = (elements = []) => {
  figure.elements.hideAll();
  if (elements.length > 0) {
    console.log(elements)
    figure.elements.exec(['showAll'], elements);
  }
  figure.animateNextFrame();
}

slides = [];
slides.push({
  text: [
    '', '    How does an equation change when shifted?',
  ],
  modifiersCommon: {
    x: { font: { family: 'Times New Roman', style: 'italic' } },
  },
  steadyState: () => {
    show([
      'nav', trace, titleTrace, 'eqnTitle',
      'diagram.plot.titleX', 'diagram.plot.titleY',
      'diagram.arrow',
    ]);
    figure.elements.setScenarios('title');
    movePad.isTouchable = false;
    trace.update(getFx(2, 0));
    eqn.showForm('fx');
    eqn.dim();
  },
});
slides.push({
  text: 'We start by plotting f(x)',
  steadyState: () => {
    show([
      'nav', trace,
      'diagram.plot.titleX', 'diagram.plot.titleY',
    ]);
    // eqn.highlight(['y', '_(', 'x_1', '_)'])
    figure.elements.setScenarios('default');
    movePad.isTouchable = false;
    trace.update(getFx(0, 0));
    eqn.showForm('fx');
  },
});

const move = (markName, from, by) => {
  const mark = diagram.getElement(markName);
  const xFrom = xAxis.valueToDraw(from)
  const xTo = xAxis.valueToDraw(from + by);
  const y = yAxis.valueToDraw(fx(from, 0, 0).y);
  mark.showAll();
  mark.setPosition([xFrom, y]);
  if (by != 0) {
    mark.animations.new()
      .pulse({ duration: 1})
      .position({ target: [xTo, y], duration: 1})
      .start();
  }
}

slides.push({
  text: [
    '|Shifting| f(x) along x is the same as moving each',
    'f values to a new x',
  ],
  modifiers: {
    Shifting: {
      font: { color: actionColor },
      onClick: () => {
        move('markY0', -2.1, 2);
        move('markY1', -1.4, 2);
        move('markY2', -0.7, 2);
        move('markY3', 0, 2);
        move('markY4', 0.7, 2);
        move('markY5', 1.4, 2);
        move('markY6', 2.1, 2);
      }
    }
  },
  steadyState: () => {
    show([
      'nav', trace,
      'diagram.plot.titleX', 'diagram.plot.titleY',
    ]);
    // eqn.highlight(['y', '_(', 'x_1', '_)'])
    figure.elements.setScenarios('default');
    movePad.isTouchable = false;
    // trace.update(getFx(0, 0));
    trace.update(getFx(0, 0));
    eqn.showForm('fx');
  },
});

slides.push({
  text: [
    'Let\'s look at |one| point at a time',
  ],
  modifiers: {
    one: {
      font: { color: actionColor },
      onClick: () => cycle(),
    }
  },
  // modifiers: {
  //   couple: {
  //     font: { color: actionColor },
  //     onClick: () => {
  //       const move = (name, from, by) => {
  //         const e = diagram.getElement(name);
  //         const xFrom = xAxis.valueToDraw(from)
  //         const xTo = xAxis.valueToDraw(from + by);
  //         const y = yAxis.valueToDraw(fx(from, 0, 0).y);
  //         e.showAll();
  //         e.setPosition([xFrom, y])
  //         e.animations.new()
  //           .pulse({ duration: 1})
  //           .position({ target: [xTo, y], duration: 1})
  //           .start();
  //       }
  //       move('markY1', -2, 2);
  //       move('markY2', 0, 2);
  //       move('markY3', 1, 2);
  //     }
  //   }
  // },
  steadyState: () => {
    show([
      'nav', trace,
      // 'diagram.plot.titleX', 'diagram.plot.titleY',
      // diagram,
    ]);
    // diagram.show([plot, movePad, 'markY1', 'markF1', 'eqnF1', 'eqnY1'])
    diagram.showAll();
    // diagram.hide(['titleTrace', 'titleX', 'arrow'])
    // eqn.hide()
    plot.hide(['titleTrace', 'titleX', 'titleY']);
    movePad.setPosition(width / 2, movePad.getPosition().y)
    eqn.highlight(['y', 'lb1', 'x_1', 'rb1'])
    figure.elements.setScenarios('default');
    movePad.isTouchable = true;
    trace.update(getFx(0, 0));
    // eqn.showForm('0');
    valueEqn.showForm('0');
    cycle();
  },
});

figure.getElement('nav').setSlides(slides);
figure.getElement('nav').goToSlide(3);

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