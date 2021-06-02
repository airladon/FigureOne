const figure = new Fig.Figure({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

const pow = (pow = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.tools.math.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
}

figure.add({
  name: 'plot',
  make: 'collections.plot',
  trace: [
    pow(2),
    { points: pow(2.5), name: 'Power 2.5' },
    {
      points: pow(3, 10, 1),
      name: 'Power 3',
      markers: { radius: 0.03 },
      line: { width: 0.01 },
    },
  ],
  legend: true,
});