const diagram = new Fig.Diagram();
const { Point } = Fig;

const line = [
    new Point(0.5, 0),
    new Point(0, 0.5),
    // new Point(0.6, 0),
    new Point(-0.5, 0),
    // new Point(0, 1),
    // new Point(0, 0), new Point(0, 1), new Point(-0.1, 0)
];

// diagram.addElements([
//   {
//     name: 'pad',
//     method: 'polygon',
//     options: {
//       radius: 0.2,
//       color: [0.5, 0.5, 0.5, 0.5],
//       sides: 100,
//       fill: true,
//     },
//   },
//   {
//     name: 'r',
//     method: 'shapes.polyline',
//     options: {
//       points: line,
//       width: 0.08,
//       close: true,
//       // fill: false,
//       // cornersOnly: true,
//       // cornerLength: 0.1,
//       // forceCornerLength: true,
//       // asdfasdf: false,
//       widthIs: 'mid',
//       cornerStyle: 'radius',
//       // cornerStyle: 'none',
//       cornerSize: 0.1,
//       cornerSides: 10,
//       // linePrimitives: true,
//       // lineNum: 200,
//       // cornersOnly: true,

//       // dash: [0.1, 0.03],
//     },
//   },
//   {
//     name: 'x2',
//     method: 'line',
//     options: {
//       p1: [-1, 0],
//       p2: [1, 0],
//       width: 0.005,
//       color: [0.5, 0.5, 0.5, 0.5],
//     }
//   },
//   {
//     name: 'x3',
//     method: 'line',
//     options: {
//       p1: [0.5, -1],
//       p2: [0.5, 1],
//       width: 0.005,
//       color: [0.5, 0.5, 0.5, 0.5],
//     }
//   },
// ]);

// const pad = diagram.getElement('pad');
// pad.setMovable();
// pad.setTransformCallback = () => {
//   line[1] = pad.getPosition();
//   const r = diagram.getElement('r');
//   r.custom.updatePoints(line);
//   diagram.animateNextFrame();
//   // console.log(line[1])
// }
// diagram.initialize();
// pad.setPosition(-0.7, 0);

diagram.addElements([
  {
    name: 'p',
    method: 'shapes.polygon',
    options: {
      sides: 3,
      width: 0.004,
      radius: 0.1,
      line: {
        widthIs: 'mid',
        cornerStyle: 'radius',
        cornerSize: 0.01,
        cornerSides: 5,
        dash: [0.01, 0.01],
      },
      // copy: [
      //   { point: }
      //   { transform: }
      //   { }
      // ]
      copyChain: [
        { num: 1, step: 0.3, angle: 0 },
        { numAngle: 10, step: Math.PI * 2 / 9, skip: 1/2 }
      ],
    },
  },
]);
diagram.initialize();