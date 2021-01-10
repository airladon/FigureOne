function fig2() {
  const { Point } = Fig;
  const { round, range } = Fig.tools.math;

  fig1 = new Fig.Figure({
    limits: [-2 * 0.9, -1.5 * 0.9, 4 * 0.9, 3 * 0.9],
    htmlId: 'figureOneContainer2',
    color: [0.4, 0.4, 0.4, 1],
  });

  const thetaValues = range(0, Math.PI * 4.12, 0.01);
  const points = thetaValues.map(theta => new Point(theta, Math.sin(theta)));

  fig1.add({
    name: 'plot',
    method: 'collections.plot',
    options: {
      width: 3,
      height: 2,
      position: [-1.5, -1],
      trace: {
        points,
        line: { width: 0.01 },
        color: [1, 0, 0, 1],
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
            values: range(0, Math.PI * 4, Math.PI),
            length: 0.3,
            offset: 0,
            dash: [0.01, 0.005],
          },
          {
            values: range(1, Math.PI * 4.2, 1),
            length: 0.05,
            offset: -0.025,
          },
        ],
        labels: [
          {
            text: ['', 'π', '2π', '3π', '4π',],
            offset: [0, 0.5],
          },
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

  fig1.add({
    name: 'eqn',
    method: 'equation',
    options: {
      elements: {
        sin: { style: 'normal' },
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        theta: '\u03b8',
      },
      forms: {
        0: ['y', '_ = ', 'sin', { brac: ['lb', 'theta', 'rb'] }]
      },
      position: [-0.2, -1],
    }
  })
}
fig2();