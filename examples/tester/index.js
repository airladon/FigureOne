const diagram = new Fig.Diagram();
const { Point, Rect } = Fig;

const angle = Math.PI / 5 + Math.PI / 25;
diagram.addElements([
  // Add equation element
  {
    name: 'background',
    method: 'polygon',
    options: {
      radius: 0.5,
      width: 0.1,
      sides: 10,
      color: [1, 0, 0, 0.5],
    },
  },
  {
    name: 'p',
    method: 'polyline',
    options: {
      points: [
        [0, 0],
        [0.5, 0.5],
        [0, 0.5],
      ],
      width: 0.1,
      // widthIs: 'inside',
      color: [1, 0, 0, 0.5],
    },
  },
  {
    name: 'angle',
    method: 'angle',
    options: {
      angle,
      curve: {
        radius: 1,
        width: 0.2,
        sides: 20,
      },
      color: [0, 1, 1, 0.5],
      sides: {
        width: 0.01,
        length: 1,
        color: [0.2, 0.5, 1, 1],
      }
    },
  },
  {
    name: 'line',
    method: 'line',
    options: {
      length: 0.5,
      angle,
      color: [0, 1, 0, 1],
    },
  },
]);

diagram.initialize();
const line = diagram.elements._line;
line.setMovable(true, 'rotation');
line.subscriptions.subscribe('setTransform', () => {
  const r = line.getRotation();
  diagram.elements._angle.setAngle({ angle: r });
});
