figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });

const { Point } = Fig;
const { round, range } = Fig.tools.math;
const x = range(-5, 5, 0.1);
const xSparse = range(-5, 5, 1);
const fx = (xx, ox, oy) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));
const getFxSparse = (xMax, ox, oy) => xSparse.filter(xx => xx <= xMax + 0.001).map(xx => fx(xx, ox, oy));

const plotPosition = new Point(-1.1, -1);
const width = 2.25;
const height = 1.575;
const greyColor = [0.6, 0.6, 0.6, 1];
const primaryColor = [1, 0, 0, 1];
const makeEqn = (name, position, color = primaryColor) => ({
  name,
  method: 'collections.equation',
  options: {
    elements: {
      value1: '1',
      value2: '1',
      equals: '  =  ',
      sign: ' \u2212 ',
    },
    phrases: {
      yx: ['y', '_(_1', 'value1', '_)_1'],
      fx: ['f', ' ', '_(_2', 'value2', '_)_2'],
    },
    forms: {
      0: ['yx', 'equals', 'fx'],
    },
    formDefaults: {
      alignment: { xAlign: 'center', fixTo: 'equals' },
    },
    position,
    scale: 0.5
  },
});
const makeFEqn = (name, label = '0') => ({
  name,
  method: 'collections.equation',
  options: {
    elements: {
      value: label,
    },
    color: greyColor,
    forms: {
      0: ['f', ' ', '_(', 'value', '_)'],
    },
    scale: 0.4,
  },
});
const makeYEqn = (name, label = '0') => ({
  name,
  method: 'collections.equation',
  options: {
    elements: {
      value: label,
    },
    color: primaryColor,
    forms: {
      0: ['y', ' ', '_(', 'value', '_)'],
    },
    scale: 0.4,
  },
});

const makeMark = (name, color = greyColor, radius = 0.017) => ({
  name,
  method: 'primitives.polygon',
  options: {
    radius,
    sides: 20,
    color,
  },
});

// Movable angle
figure.add([
  {
    name: 'diagram',
    method: 'collection',
    options: {
      position: plotPosition,
    },
    elements: [
      {
        name: 'plot',
        method: 'collections.plot',
        options: {
          trace: [
            {
              points: getFx(0, 0),
              name: 'ref',
              line: { width: 0.005, dash: [0.01, 0.01], color: greyColor },
            },
            {
              points: getFx(0, 0),
              name: 'powerCurver',
              line: { width: 0.01, color: [1, 0, 0, 1] },
            },
            {
              points: [],
              name: 'marks',
              markers: { radius: 0.02, color: [1, 0, 0, 1], sides: 10 },
            },
          ],
          width,
          height,
          xAxis: {
            start: -5,
            stop: 5,
            ticks: { step: 1, width: 0 },
            line: { width: 0 },
            grid: [
              { step: 1, width: 0.002, line: [0.8, 0.8, 0.8, 1] },
              { values: [0], width: 0.003, dash: [], },
            ],
            title: {
              text: 'x',
              font: { family: 'Times New Roman', style: 'italic', size: 0.15 },
            }
          },
          yAxis: {
            start: -1,
            stop: 6,
            ticks: { step: 1, width: 0 },
            line: { width: 0 },
            grid: [
              { step: 1, width: 0.002, line: [0.8, 0.8, 0.8, 1] },
              { values: [0], width: 0.003, dash: [], },
            ],
            title: {
              text: 'y',
              rotation: 0,
              font: { family: 'Times New Roman', style: 'italic', size: 0.15 },
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
      makeFEqn('eqnF1'),
      makeFEqn('eqnF2'),
      makeFEqn('eqnF3'),
      // makeYEqn('eqnY0', 'x'),
      makeYEqn('eqnY1'),
      makeYEqn('eqnY2'),
      makeYEqn('eqnY3'),
      makeMark('markF1', greyColor, 0.012),
      makeMark('markF2', greyColor, 0.012),
      makeMark('markF3', greyColor, 0.012),
      makeMark('markY1', primaryColor),
      makeMark('markY2', primaryColor),
      makeMark('markY3', primaryColor),
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
      elements: {
        value: '0.0',
        sign: ' \u2212 ',
      },
      phrases: {
        yx: ['y', '_(', 'x_1', '_)'],
      },
      forms: {
        0: ['yx', '_ = ', 'f', '_ (_', 'x_2', 'sign', 'value', '_)_'],
      },
      formDefaults: {
        alignment: { fixTo: '_ = ', xAlign: 'center' },
      },
      position: [-0.3, 0.8],
    },
  },
  makeEqn('eqn0', [1.3, 0.6]),
  makeEqn('eqn1', [1.3, 0.4]),
  makeEqn('eqn2', [1.3, 0.2]),
  makeEqn('eqn3', [1.3, 0]),
  makeEqn('eqn4', [1.3, -0.2]),
  {
    name: 'nav',
    method: 'collections.slideNavigator',
    options: {
      prevButton: { position: [-1.7, -1.4 ] },
      nextButton: { position: [1.7, -1.4 ] },
      // equation: 'eqn'
    },
  },
]);

const movePad = figure.getElement('diagram.movePad');
const trace = figure.getElement('diagram.plot.powerCurver');
const marks = figure.getElement('diagram.plot.marks');
const value = figure.getElement('eqn.value');
const value1 = figure.getElement('eqn1.value1');
const value2 = figure.getElement('eqn1.value2');
const sign = figure.getElement('eqn.sign');
const xAxis = figure.getElement('diagram.plot.x');
const yAxis = figure.getElement('diagram.plot.y');
// const xLine = figure.getElement('diagram.xLine');
const drawPoint = figure.getElement('diagram.drawPoint');
// const refPoint = figure.getElement('diagram.refPoint');
const eqn = figure.getElement('eqn');
// const vLine = figure.getElement('diagram.vLine')
// const hLine = figure.getElement('diagram.hLine')
// console.log(eqn1)

const setElement = (name, position, label = null) => {
  const e = figure.getElement(`diagram.${name}`);
  const p = Fig.tools.g2.getPoint(position);
  const px = xAxis.valueToDraw(p.x);
  const py = yAxis.valueToDraw(p.y);
  e.setPosition(px, py);
  if (label != null) {
    e.setText({ value: label });
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

const update = () => {
  const p = movePad.getPosition('local');
  let xOffset = xAxis.drawToValue(p.x)
  trace.update(getFx(xOffset, 0));
  rxOffset = Fig.tools.math.round(xOffset, 1);
  value.custom.updateText({ text: `${Math.abs(rxOffset).toFixed(1)}`})
  if (rxOffset >= 0) {
    sign.custom.updateText({ text: ' \u2212 ' });
  } else {
    sign.custom.updateText({ text: ' + ' });
  }

  // setElement('eqnY0', [xOffset + 1, 3], 'x');
  setElement('eqnY1', [xOffset - 1.8, 3.7], `${round(xOffset - 2, 1)}`);
  setElement('eqnY2', [xOffset - 0.4, 0.3], `${round(xOffset, 1)}`);
  setElement('eqnY3', [xOffset + 1.2, 1.15], `${round(xOffset + 1, 1)}`);
  setElement('markY1', [xOffset - 2, 4]);
  setElement('markY2', [xOffset, 0]);
  setElement('markY3', [xOffset + 1, 1]);
}
movePad.subscriptions.add('setTransform', () => {
  update();
});
update();
const hideEquations = () => {
  for (let i = 0; i < 5; i += 1) {
    figure.getElement(`eqn${i}`).hide();
  }
  // eqn.hide();
}
hideEquations();

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

setElement('eqnF', [-3.9, 5.6]);
setElement('eqnF1', [-2.8, 4.2], '-2');
setElement('eqnF2', [-0.6, -0.3], '0');
setElement('eqnF3', [1.1, 0.7], '1');
setElement('markF1', [-2, 4]);
setElement('markF2', [0, 0]);
setElement('markF3', [1, 1]);