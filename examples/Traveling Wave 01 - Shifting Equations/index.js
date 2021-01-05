figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });

const { Point } = Fig;
const x = Fig.tools.math.range(-5, 5, 0.1);
const fx = (xx, ox, oy) => new Point(xx, (xx - ox) ** 2 + oy);
const getFx = (ox, oy) => x.map(xx => fx(xx, ox, oy));

const plotPosition = new Point(-1.7, -0.8);
const width = 2;
const height = 1.6;
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
            stop: 8,
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
          // position: [plotPosition.x + width / 2, plotPosition.y + height / 2 + 0.1],
          position: [width / 2, height / 2],
          color: [1, 0, 0, 0.3],
        },
        mods: {
          isMovable: true,
          move: {
            style: 'translation',
            bounds: { translation: {
              // left: -1, right: 1, bottom: -0.2, top: -0.2
              // p1: plotPosition.add(0, height / 2 + 0.1),
              p1: [0, height / 2],
              mag: width,
              angle: 0,
            } },
          }
        }
      },
      {
        name: 'xLine',
        method: 'primitives.polyline',
        options: {
          width: 0.003,
          // dash: [0.05, 0.01],
          color: [0, 0, 1, 1],
        }
      }
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
]);

const movePad = figure.getElement('diagram.movePad');
const trace = figure.getElement('diagram.plot.powerCurver')
const value = figure.getElement('eqn.value');
const sign = figure.getElement('eqn.sign');
const xAxis = figure.getElement('diagram.plot.x');
const yAxis = figure.getElement('diagram.plot.y');
const xLine = figure.getElement('diagram.xLine');

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

  const lineRef = xAxis.valueToDraw(1);
  const lineX = xAxis.valueToDraw(1 + xOffset);
  const lineY = yAxis.valueToDraw(1);
  // console.log(lineX, lineY, fx(1 + xOffset))
  xLine.custom.updatePoints({ points: [[lineX, 0], [lineX, lineY], [lineRef, lineY]] })
}
movePad.subscriptions.add('setTransform', () => {
  update();
});
update();
