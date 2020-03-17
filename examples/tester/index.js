const diagram = new Fig.Diagram();
const { Point } = Fig;

const line = [
    new Point(0.5, 0),
    new Point(0, 0.024286),
    new Point(-0.5, 0),
    // new Point(0, 1),
];

diagram.addElements([
  {
    name: 'pad',
    method: 'polygon',
    options: {
      radius: 0.2,
      color: [0.5, 0.5, 0.5, 0.5],
      sides: 100,
      fill: true,
    },
  },
  {
    name: 'r',
    method: 'polyline',
    options: {
      points: line,
      width: 0.03,
      close: true,
      pointsAt: 'inside',
      dash: [0.1, 0.03],
    },
  },
  {
    name: 'x2',
    method: 'line',
    options: {
      p1: [-1, 0],
      p2: [1, 0],
      width: 0.005,
      color: [0.5, 0.5, 0.5, 0.5],
    }
  },
]);

const pad = diagram.getElement('pad');
pad.setMovable();
pad.setTransformCallback = () => {
  line[1] = pad.getPosition();
  const r = diagram.getElement('r');
  r.updatePoints(line);
  diagram.animateNextFrame();
}
diagram.initialize();
pad.setPosition(0, 0.5);
