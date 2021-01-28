const figure = new Fig.Figure({
  limits: [-1.5, -0.5, 4, 3], color: [0.5, 0.5, 0.5, 1],
});

const x = Fig.tools.math.range(0, 3, 0.01);
const points = x.map(xx => [xx, 4 * xx ** 4 - 10 * xx ** 3 - 2 * xx ** 2 + 1]);

const [plot, annotation] = figure.add([
  {
    name: 'plot',
    method: 'collections.plot',
    options: {
      trace: {
        name: 'trace',
        points,
      },
    },
  },
  {
    name: 'annotation',
    method: 'polygon',
    options: {
      radius: 0.01,
      sides: 10,
    },
  },
]);


plot.setTouchable();
const [xAxis, yAxis, trace] = plot.getElements(['x', 'y', 'trace']);
plot.onClick = (p) => {
  const offset = plot.getPosition();
  const xValue = xAxis.drawToValue(p.x);
  const yValue = yAxis.drawToValue(p.y);
  if (xAxis.inAxis(xValue) && yAxis.inAxis(yValue)) {
    const [y] = trace.getY(xValue);
    annotation.setPosition(offset.add(
      p.x,
      yAxis.valueToDraw(y),
    ));
  }
};
