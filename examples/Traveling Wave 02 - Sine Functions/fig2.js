function fig2() {
  const { Point } = Fig;
  const { range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-2, -1, 4, 2],
    htmlId: 'figureOneContainer2',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, Math.PI * 4.12, 0.1);
  const sine = (A) => thetaValues.map(theta => new Point(theta, A * Math.sin( theta)));

  fig.add([
    {
      name: 'plot',
      method: 'collections.plot',
      options: {
        width: 3.5,
        height: 1.5,
        position: [-1.75, -0.75],
        trace: {
          name: 'trace',
          points: sine(1),
          line: { width: 0.01 },
          color: [1, 0, 0, 1],
        },
        xAxis: {
          // grid: false,
          grid: { values: [0, 13], width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
          position: [0, 0.75],
          line: { width: 0.006 },
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
          line: { width: 0.006 },
          grid: { width: 0.004, dash: [], color: [0.7, 0.7, 0.7, 1] },
          start: -2,
          stop: 2,
          ticks: { values: range(-2, 2, 0.5), offset: -0.035, length: 0.07 },
          labels: { precision: 1 },
          title: {
            text: 'y',
            font: { family: 'Times New Roman', style: 'italic', size: 0.1 },
            offset: [0.27, 0.8],
            rotation: 0,
          },
        },
      },
    },
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
          bounds: { translation: { p1: [0, 0], mag: 1, angle: Math.PI / 2 } },
        },
      },
    },
    {
      name: 'eqn',
      method: 'equation',
      options: {
        elements: {
          sin: { style: 'normal' },
          lb: { symbol: 'bracket', side: 'left' },
          rb: { symbol: 'bracket', side: 'right' },
          theta: '\u03b8',
          A: { text: '0.0', color: [1, 0, 0, 1] },
        },
        formDefaults: { alignment: { xAlign: 'center' } },
        forms: {
          0: ['y', '_  =  ', 'A', ' ', 'sin', { brac: ['lb', 'theta', 'rb'] }]
        },
        position: [0, -0.9],
      }
    }
  ]);

  const [mover, trace, eqn] = fig.getElements(['mover', 'plot.trace', 'eqn']);

  mover.subscriptions.add('setTransform', () => {
    const newA = mover.getPosition().y * 1.8 + 0.2;
    trace.update(sine(newA));
    eqn.updateElementText({ A: `${newA.toFixed(1)}`});
  });

  // Initialize
  mover.setPosition(0, 0.5);

  const pulseTrace = () => trace.pulse({
    translation: 0.02, min: -0.02, angle: Math.PI / 2, frequency: 2,
  });
  const pulseAmplitude = () => eqn.pulse({ elements: ['A'], scale: 2 });
  return { pulseTrace, pulseAmplitude };
}

const figure2 = fig2();