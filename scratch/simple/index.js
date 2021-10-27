// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({ scene: [-3, -3, 6, 6]});
// Zoomable and Pannable plot

const pow = (pow = 2, start = 0, stop = 10, step = 0.05) => {
  const xValues = Fig.range(start, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
}
// Cartesian axes crossing at the zero point
// Automatic layout doesn't support this, but axes, ticks, labels and titles
// can all be customized to create it.
figure.add({
  make: 'collections.plot',
  trace: pow(3, -10, 10),
  font: { size: 0.1 },
  styleTheme: 'numberLine',
  x: {
    title: {
      text: 'x',
      font: { style: 'italic', family: 'Times New Roman', size: 0.15 },
    },
  },
  y: {
    step: 500,
    title: {
      text: 'y',
      font: { style: 'italic', family: 'Times New Roman', size: 0.15 },
    },
  },
  grid: false,
});