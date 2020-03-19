const diagram = new Fig.Diagram();
const { Point, Rect } = Fig;

const line = [
    new Point(0.5, 0),
    // new Point(0, 0.5),
    new Point(-0.5, 0),
    // new Point(0, 1),
    // new Point(-1, -1),
    // new Point(-1, 1),
    // new Point(1, 1),
    // new Point(1, -1),
];

diagram.addElement(
  // {
  //   name: 'p',
  //   method: 'polygon',
  //   options: {
  //     sides: 8,
  //     width: 0.05,
  //     radius: 0.9,
  //     fill: true,
  //     position: [0, 0],
  //     textureLocation: 'http://localhost:8000/texture.jpg',
  //   },
  // },
  {
    name: 'p1',
    method: 'shapes.polyline',
    options: {
      points: line,
      width: 0.667,
      pointsAt: 'mid',
      // close: true,
      // textureLocation: 'http://localhost:8000/texture-rect.jpg',
      // // textureMapTo: new Rect(-0.1, -0.1, 0.2, 0.2),
      // textureMapTo: new Rect(-0.5, -0.333, 1, 0.667),
      // // textureMapTo: new Rect(-1, -0.667, 2, 1.222),
      // // textureMapFrom: new Rect(0.25, 0.333, 0.5, 0.333),
      // textureRepeat: true,
      texture: {
        src: 'http://localhost:8000/texture-rect.jpg',
        // mapTo: new Rect(-0.5, -0.333, 1, 0.667),
        repeat: true,
      },
    },
  },
);