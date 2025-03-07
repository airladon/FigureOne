// Create figure
const figure = new Fig.Figure();

const pow = (power, stop = 10, step = 0.05) => {
  const xValues = Fig.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** power));
};

figure.add({
  make: 'collections.plot',
  // Plot size
  width: 1,
  height: 1,
  position: [-0.5, -0.5],
  // Plot Title
  title: {
    text: [
      'Traveled Distance',
      { text: 'Power Comparison', font: { size: 0.05 } },
    ],
    offset: [0, 0.1],
  },
  // Axes customizations
  x: {
    title: 'time (s)',
  },
  y: {
    start: 0,
    stop: 100,
    title: 'distance (m)',
  },
  // Traces with names for the legend
  trace: [
    { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
    {                                          // Trace with only markers
      points: pow(2, 10, 0.5),
      name: 'Power 2',
      markers: { sides: 4, radius: 0.02 },
    },
    {                                          // Trace with markers and
      points: pow(3, 10, 0.5),                 // dashed line
      name: 'Power 3',
      markers: { radius: 0.02, sides: 10, line: { width: 0.005 } },
      line: { dash: [0.04, 0.01] },
    },
  ],
  // Turn on the legend
  legend: { font: { size: 0.05 } },
});
