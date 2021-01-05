figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });

const { Point } = Fig;
const x = Fig.tools.math.range(-5, 5, 0.1);
const xSparse = Fig.tools.math.range(-5, 5, 1);
const fx = (xx, ox, oy) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));
const getFxSparse = (xMax, ox, oy) => xSparse.filter(xx => xx <= xMax + 0.001).map(xx => fx(xx, ox, oy));

const plotPosition = new Point(-1.7, -0.8);
const width = 2;
const height = 1.8;
const makeEqn = (name, position) => ({
  name,
  method: 'collections.equation',
  options: {
    elements: {
      value1: '1',
      value2: '1',
      equals: ' = ',
      sign: ' \u2212 ',
    },
    phrases: {
      yx: ['y', '_(_1', 'value1', '_)_1'],
      fx: ['f', ' ', '_(_2', 'value2', '_)_2'],
    },
    forms: {
      0: ['yx', '_ = ', 'fx'],
    },
    formDefaults: {
      alignment: { xAlign: 'left' },
    },
    position,
    scale: 0.5
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
              line: { width: 0.005, dash: [0.01, 0.01], color: [1, 0, 0, 1] },
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
            }
          ],
          width,
          height,
          xAxis: {
            start: -5,
            stop: 5,
            ticks: { step: 1 },
          },
          yAxis: {
            start: 0,
            stop: 9,
            ticks: { step: 1 },
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
              p1: [0, height / 2],
              mag: width,
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
      {
        name: 'vLine',
        method: 'collections.line',
        options: {
          width: 0.003,
          dash: [0.02, 0.01],
          color: [1, 0, 0, 1],
        }
      },
      {
        name: 'hLine',
        method: 'collections.line',
        options: {
          width: 0.003,
          dash: [0.02, 0.01],
          color: [1, 0, 0, 1],
        }
      },
      {
        name: 'drawPoint',
        method: 'primitives.polygon',
        options: {
          radius: 0.02,
          sides: 20,
        }
      },
      // {
      //   name: 'refPoint',
      //   method: 'primitives.polygon',
      //   options: {
      //     radius: 0.03,
      //     sides: 20,
      //   }
      // }
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
        alignment: { fixTo: '_ =', xAlign: 'center' },
      },
      position: [0, -1.3],
    },
  },
  // {
  //   name: 'eqn1',
  //   method: 'collections.equation',
  //   options: {
  //     elements: {
  //       value1: '1',
  //       value2: '1',
  //       equals: ' = ',
  //       sign: ' \u2212 ',
  //     },
  //     phrases: {
  //       yx: ['y', '_(_1', 'value1', '_)_1'],
  //       fx: ['f', ' ', '_(_2', 'value2', '_)_2'],
  //     },
  //     forms: {
  //       0: ['yx', '_ = ', 'fx'],
  //     },
  //     formDefaults: {
  //       alignment: { fixTo: '_ =', xAlign: 'center' },
  //     },
  //     position: [-0.7, -1.1],
  //   },
  // },
  makeEqn('eqn0', [0.8, 0.8]),
  makeEqn('eqn1', [0.8, 0.6]),
  makeEqn('eqn2', [0.8, 0.4]),
  makeEqn('eqn3', [0.8, 0.2]),
  makeEqn('eqn4', [0.8, 0]),
  makeEqn('eqn5', [0.8, -0.2]),
  makeEqn('eqn6', [0.8, -0.4]),
  // makeEqn('eqn6'),
  // makeEqn('eqn7'),
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
// const eqn1 = figure.getElement('eqn1');
const vLine = figure.getElement('diagram.vLine')
const hLine = figure.getElement('diagram.hLine')
// console.log(eqn1)

const setLine = (xx, xOffset) => {
  const y = fx(xx, xOffset, 0);
  const drawX = xAxis.valueToDraw(xx);
  const drawXoffset = xAxis.valueToDraw(xx - xOffset);
  const points = [
    [drawX, 0],
    [drawXoffset, 0],
    [drawXoffset, Math.min(yAxis.valueToDraw(y.y), yAxis.valueToDraw(8))],
  ];
  // xLine.custom.updatePoints({ points });
  drawPoint.setPosition(drawX, 0);
}

// const setVLine = (xx, xOffset) => {
//   const y = yAxis.valueToDraw(fx(xx, xOffset, 0).y);
//   const drawX = xAxis.valueToDraw(xx);
//   vLine.setEndPoints([drawX, y], [drawX, 0]);
//   // vLine.animations.new()
//   //   .length({ start: 0, target: y, duration: 0.7 })
// }

setPoints = (xx, xOffset, index) => {
  const y = yAxis.valueToDraw(fx(xx, xOffset, 0).y);
  const drawX = xAxis.valueToDraw(xx);
  const drawXoffset = xAxis.valueToDraw(xx - xOffset);
  drawPoint.setPosition(drawXoffset, y);
  // refPoint.stop();
  // refPoint.setPosition(drawXoffset, y);
  // eqn1.hide();
  vLine.setEndPoints([drawX, y], [drawX, 0]);
  hLine.setEndPoints([drawXoffset, y], [drawXoffset, y]);
  vLine.hide();
  const eq = figure.getElement(`eqn${index}`);
  drawPoint.animations.new()
    .inParallel([
      drawPoint.animations.position({ target: [drawX, y], duration: 1 }),
      hLine.animations.length({ start: 0, target: drawX - drawXoffset, duration: 1, progression: 'easeinout' })
    ])
    .trigger(() => { vLine.show() })
    .then(vLine.animations.length({ start: 0, length: y, duration: 1 }))
    .trigger(() => {
      marks.update(getFxSparse(xx, xOffset, 0))
      eq.undim();
      eq.show();
      eq.setText({
        value1: `${xx}`,
        value2: `${xx - xOffset}`,
      })
    })
    .delay(3)
    .trigger(() => {
      eq.dim();
    })
    .start();
  console.log(marks)
}

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

  // const lineRef = xAxis.valueToDraw(1);
  // const lineX = xAxis.valueToDraw(1 + xOffset);
  // const lineY = yAxis.valueToDraw(1);
  // xLine.custom.updatePoints({ points: [[lineX, 0], [lineX, lineY], [lineRef, lineY]] })
}
movePad.subscriptions.add('setTransform', () => {
  update();
});
update();
const hideEquations = () => {
  for (let i = 0; i < 7; i += 1) {
    figure.getElement(`eqn${i}`).hide();
  }
}
hideEquations();
trace.animations.new()
  .trigger({ callback: () => setPoints(-2, 1, 0), duration: 5 })
  .trigger({ callback: () => setPoints(-1, 1, 1), duration: 5 })
  .trigger({ callback: () => setPoints(0, 1, 2), duration: 5 })
  .trigger({ callback: () => setPoints(1, 1, 3), duration: 5 })
  .trigger({ callback: () => setPoints(2, 1, 4), duration: 5 })
  .trigger({ callback: () => setPoints(3, 1, 5), duration: 5 })
  .trigger({ callback: () => setPoints(4, 1, 6), duration: 5 })
  .start();

  // .custom({
  //   callback: (p) => {
  //     const xx = -4 + p * 8;
  //     setLine(xx, 1);
  //   },
  //   duration: 10,
  // })
  // .start();

