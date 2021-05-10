/* eslint-disable no-unused-vars */
/* global Fig __frames */
const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3],
  color: [1, 0, 0, 1],
  font: { size: 0.1 },
});

const pow = (power = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** power));
};

figure.add({
  name: 'plot',
  make: 'collections.plot',
  options: {
    width: 2,                                    // Plot width in figure
    height: 2,                                   // Plot height in figure
    yAxis: { start: 0, stop: 100 },              // Customize y axis limits
    trace: [
      { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
      {                                          // Trace with only markers
        points: pow(2, 10, 0.5),
        name: 'Power 2',
        markers: { sides: 4, radius: 0.03 },
      },
      {                                          // Trace with markers and
        points: pow(3, 10, 0.5),                 // dashed line
        name: 'Power 3',
        markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
        line: { dash: [0.04, 0.01] },
      },
    ],
    legend: true,
    position: [-1, -1],
  },
});
