function fig3() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-2, -0.6, 4, 2],
    htmlId: 'figureOneContainer3',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, 13, 0.05);
  const sine = (r) => thetaValues.map(theta => new Point(theta, Math.sin(2 * Math.PI / r * theta)));

  fig.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3.5,
      height: 1.3,
      position: [-1.75, -0.5],
      trace: {
        name: 'trace',
        points: sine(2),
        line: { width: 0.01 },
        color: [1, 0, 0, 1],
      },
      xAxis: {
        line: { width: 0.006 },
        grid: { width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
        position: [0, 0.65],
        start: 0,
        stop: 13,
        title: {
          text: '\u03b8',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [1.85, 0.22],
        },
        ticks: {
          values: range(1, 13, 1),
          length: 0.05,
          offset: -0.025,
        },
        labels: { precision: 0, offset: [0, 0] },
      },
      yAxis: {
        grid: { values: [-1, 1], width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
        start: -1,
        stop: 1,
        line: { width: 0.006 },
        ticks: { values: range(-1, 1, 1), offset: -0.035, length: 0.07 },
        labels: { precision: 1 },
        title: {
          text: 'y',
          font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
          offset: [0.25, 0.7],
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
        width: 3.5,
        height: 1.3,
        color: [0, 0, 0, 0],
      },
      mods: {
        isMovable: true,
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
      formDefaults: { alignment: { xAlign: 'center' } },
      forms: {
        0: ['y', '_ = ', 'sin', { brac: ['lb', [{ frac: ['twoPi', 'vinculum', 'value'] }, ' ', 'theta'], 'rb'] }]
      },
      position: [0, 1.05],
    }
  });

  const [mover, trace, xAxis, eqn] = fig.elements.getElements(
    ['mover', 'plot.trace', 'plot.x', 'eqn']
  );

  let offset = 0;
  mover.subscriptions.add('setTransform', () => {
    offset += mover.getPosition().x * 2;
    mover.transform.updateTranslation(0, 0.15);
    if (offset > 1) { offset = 1; }
    if (offset < -1) { offset = -1; }
    const newR = offset * 3 + 5;
    trace.update(sine(newR));
    eqn.updateElementText({ value: `${newR.toFixed(1)}`});
  });

  // Initialize
  mover.setPosition(0, 0.15);

  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, frequency: 2,
  });
  const pulseEqn = () => eqn.pulse({ scale: 1.5, yAlign: 'bottom' });
  return { pulseTrace, pulseEqn };
}

const figure3 = fig3();