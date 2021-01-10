function fig3() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-2, -1, 4, 2],
    htmlId: 'figureOneContainer3',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, 13, 0.05);
  const sine = (r) => thetaValues.map(theta => new Point(theta, Math.sin(2 * Math.PI / r * theta)));

  fig.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3,
      height: 1.5,
      position: [-1.75, -0.75],
      trace: {
        name: 'trace',
        points: sine(2),
        line: { width: 0.01 },
        color: [1, 0, 0, 1],
      },
      xAxis: {
        position: [0, 0.75],
        start: 0,
        stop: 13,
        title: {
          text: '\u03b8',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [1.6, 0.22],
        },
        ticks: {
          values: range(1, 13, 1),
          length: 0.05,
          offset: -0.025,
        },
        labels: { precision: 0, offset: [0, 0] },
      },
      yAxis: {
        grid: false,
        start: -1,
        stop: 1,
        ticks: { values: range(-1, 1, 1), offset: -0.035, length: 0.07 },
        labels: { precision: 1 },
        title: {
          text: 'y',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [0.27, 0.8],
          rotation: 0,
        },
      },
    },
  });

  fig.add([
    {
      name: 'mover',
      method: 'rectangle',
      options: {
        width: 10,
        height: 10,
        color: [0, 0, 0, 0],
      },
      mods: {
        isMovable: true,
        move: {
          bounds: { translation: { p1: [-1, 0], mag: 2, angle: 0 } },
        },
      },
    },
  ]);

  fig.add({
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        sin: { style: 'normal' },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        theta: '\u03b8',
        twoPi: '2\u03c0',
        value: { text: '0.0', color: [1, 0, 0, 1] },
      },
      forms: {
        0: ['y', '_ = ', 'sin', { brac: ['lb', [{ frac: ['twoPi', 'vinculum', 'value'] }, ' ', 'theta'], 'rb'] }]
      },
      position: [0.87, -0.88],
    }
  });

  const [mover, trace, xAxis, eqn] = fig.elements.getElements(
    ['mover', 'plot.trace', 'plot.x', 'eqn']
  );

  mover.subscriptions.add('setTransform', () => {
    const newR = mover.getPosition().x * 3 + 5;
    trace.update(sine(newR));
    eqn.updateElementText({ value: `${newR.toFixed(1)}`});
  });

  // Initialize
  mover.setPosition(0, 0);

  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, frequency: 2,
  });
  const pulseEqn = () => eqn.pulse({ scale: 1.5, yAlign: 'bottom' });
  return { pulseTrace, pulseEqn };
}

const figure3 = fig3();