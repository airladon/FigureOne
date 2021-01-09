const { Point } = Fig;
const { round, range } = Fig.tools.math;

fig1 = new Fig.Figure({ limits: [-2, -1.5, 4, 3], htmlId: 'figureOneContainer1' });

const thetaValues = range(0, Math.PI * 4, 0.01);
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
        offset: [1.6, 0.25],
      },
      ticks: {
        values: range(0, Math.PI * 4, Math.PI),
        length: 0.07,
        offset: -0.035,
      },
      labels: {
        text: ['', 'π', '2π', '3π', '4π',],
        offset: [0.08, 0.07],
      },
    },
    yAxis: {
      grid: false,
      ticks: false,
      start: -1.2,
      stop: 1.2,
      ticks: { values: [-1, 0, 1], offset: -0.035, length: 0.07 },
      labels: { text: ['-A', '0', 'A'] },
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
