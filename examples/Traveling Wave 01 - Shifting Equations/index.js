figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });

const { Point } = Fig;
const x = Fig.tools.math.range(-5, 5, 0.1);
const fx = (ox, oy) => x.map(xx => new Point(xx, (xx - ox) ** 2 + oy));

// Movable angle
figure.add([
  {
    name: 'plot',
    method: 'collections.plot',
    options: {
      trace: {
        points: fx(0, 0),
        name: 'powerCurver',
        line: { width: 0.01, color: [1, 0, 0, 1] },
      },
      width: 2,
      height: 1.6,
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
      position: [-1, -0.8],
    },
  },
  {
    name: 'movePad',
    method: 'primitives.rectangle',
    options: {
      width: 2,
      height: 2,
      position: [0, -0.2],
      color: [1, 0, 0, 0],
    },
    mods: {
      isMovable: true,
      move: {
        style: 'translation',
        bounds: { translation: { left: -1, right: 1, bottom: -0.2, top: -0.2 } },
      }
    }
  },
  {
    name: 'eqn',
    method: 'collections.equation',
    options: {
      elements: {
        value: '0.0',
        sign: ' + ',
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

const movePad = figure.getElement('movePad');
const trace = figure.getElement('plot.powerCurver')
const value = figure.getElement('eqn.value');
const sign = figure.getElement('eqn.sign');
movePad.subscriptions.add('setTransform', () => {
  const p = movePad.getPosition();
  trace.update(fx(p.x * 5, 0));
  const xOffset = Fig.tools.math.round(p.x * 5, 1)
  value.custom.updateText({ text: `${Math.abs(xOffset).toFixed(1)}`})
  if (xOffset >= 0) {
    sign.custom.updateText({ text: ' \u2212 ' });
  } else {
    sign.custom.updateText({ text: ' + ' });
  }
});
