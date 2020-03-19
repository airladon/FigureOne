const diagram = new Fig.Diagram();
const { Point } = Fig;

const line = [
    new Point(0.5, 0),
    new Point(0, 0.5),
    new Point(-0.5, 0),
    // new Point(0, 1),
];

diagram.addElement(
  {
    name: 'p',
    method: 'polygon',
    options: {
      sides: 8,
      width: 0.05,
      radius: 0.9,
      fill: true,
      position: [0, 0],
      textureLocation: 'http://localhost:8000/texture.jpg',
    },
  },
);