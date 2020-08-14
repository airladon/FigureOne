const diagram = new Fig.Diagram();
const { Point, Rect } = Fig;

const angle = Math.PI / 5 + Math.PI / 25;
diagram.addElements([
  // Add equation element
  {
    name: 'primitive',
    method: 'polygon',
  },
  {
    name: 'polyline',
    method: 'polyline',
    options: {
      points: [
        [0, 0],
        [0.5, 0.5],
        [0, 0.5],
      ],
    },
  },
  {
    name: 'line',
    method: 'line',
  },
  {
    name: 'angle',
    method: 'angle',
  },
]);

diagram.initialize();
console.log(diagram.elements._dup());
// const line = diagram.elements._line;
// line.setMovable(true, 'rotation');
// line.subscriptions.subscribe('setTransform', () => {
//   const r = line.getRotation();
//   diagram.elements._angle.setAngle({ angle: r });
// });

