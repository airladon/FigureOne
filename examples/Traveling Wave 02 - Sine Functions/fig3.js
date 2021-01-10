function fig3() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig = new Fig.Figure({
    limits: [-2 * 0.9, -1.5 * 0.9, 4 * 0.9, 3 * 0.9],
    htmlId: 'figureOneContainer3',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, Math.PI * 4.12, 0.05);
  const sine = (r) => thetaValues.map(theta => new Point(theta, Math.sin(2 * Math.PI / r * theta)));


  fig.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3,
      height: 2,
      position: [-1.5, -1],
      trace: {
        name: 'trace',
        points: sine(2),
        line: { width: 0.01 },
      },
      xAxis: {
        grid: false,
        position: [0, 1],
        start: 0,
        stop: Math.PI * 4.25,
        line: { arrow: { end: 'triangle'} },
        title: {
          text: '\u03b8',
          font: { family: 'Times New Roman', style: 'italic' },
          offset: [1.6, 0.2],
        },
        ticks: [
          {
            values: range(1, Math.PI * 4.2, 1),
            length: 0.05,
            offset: -0.025,
          },
        ],
        labels: [
          {
            precision: 0,
            offset: [0, 0],
          },
        ],
      },
      yAxis: {
        grid: false,
        ticks: false,
        start: -1.2,
        stop: 1.2,
        ticks: { values: [-1, 0, 1], offset: -0.035, length: 0.07 },
        labels: { precision: 0 },
        line: { arrow: 'triangle' },
        title: {
          text: 'y',
          font: { family: 'Times New Roman', style: 'italic' },
          offset: [0.25, 1.05],
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
    // {
    //   name: 'rLine',
    //   method: 'collections.line',
    //   options: {
    //     width: 0.005,
    //     color: [0.4, 0.4, 0.4, 1],
    //     arrow: 'triangle',
    //     label: {
    //       text: {
    //         elements: { value: '1' },
    //         forms: { 0: ['r = ', 'value'] },
    //       },
    //     },
    //   },
    // },
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
        value: '0.0',
      },
      forms: {
        0: ['y', '_ = ', 'sin', { brac: ['lb', [{ frac: ['twoPi', 'vinculum', 'value'] }, 'theta'], 'rb'] }]
      },
      position: [-0.4, -1.2],
    }
  });

  const [mover, trace, xAxis, eqn] = fig.elements.getElements(
    ['mover', 'plot.trace', 'plot.x', 'eqn']
  );
  console.log(fig.elements._plot)
  mover.subscriptions.add('setTransform', () => {
    const newR = mover.getPosition().x * 3 + 5;
    trace.update(sine(newR));
    eqn.updateElementText({ value: `${newR.toFixed(1)}`});
  });
  mover.setPosition(0, 0);
}
fig3();