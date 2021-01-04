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
      position: [-1, -1],
    },
  },
  {
    name: 'movePad',
    method: 'primitives.rectangle',
    options: {
      width: 2,
      height: 2,
      position: [0, -0.2],
      color: [1, 0, 0, 0.4],
    },
    mods: {
      isMovable: true,
      move: {
        style: 'translation',
        bounds: { translation: { left: -1, right: 1, bottom: -0.2, top: -0.2 } },
      }
    }
  },
]);

const movePad = figure.getElement('movePad');
const trace = figure.getElement('plot.powerCurver')
movePad.subscriptions.add('setTransform', () => {
  const p = movePad.getPosition();
  trace.update(fx(p.x * 5, 0));
});
