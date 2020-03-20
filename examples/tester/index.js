const diagram = new Fig.Diagram();
const { Point } = Fig;

const line = [
    new Point(0.5, 0),
    new Point(0, 0.5),
    new Point(-0.5, 0),
    // new Point(0, 1),
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
//       width: 0.04,
//       close: true,
//       // fill: false,
//       // cornersOnly: true,
//       // cornerLength: 0.1,
//       // forceCornerLength: true,
//       // asdfasdf: false,
//       widthIs: 'negative',
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
// ]);

// const pad = diagram.getElement('pad');
// pad.setMovable();
// pad.setTransformCallback = () => {
//   line[1] = pad.getPosition();
//   const r = diagram.getElement('r');
//   r.custom.updatePoints(line);
//   diagram.animateNextFrame();
// }
// diagram.initialize();
// pad.setPosition(0, 0.5);

// const img = new Image();
// img.crossOrigin = "anonymous";
// img.src = 'http://localhost:8000/example.png';
// img.src = 'https://www.cut-the-knot.org/gifs/ctklogo.png'
// console.log(img)
// img.src = 'https://thisiget-dev.herokuapp.com/static/dist/content/common/images/textureMaps/circles.png';
// img.width = 256;
// img.height = 224;
// const img = document.getElementById('img1')
// const img = new Image();
// img.src = document.getElementById('img1').src;
// console.log(img)
// console.log(img.src)
// diagram.initialize();
// pad.setPosition(0, 0.5);
diagram.addElements([
  {
    name: 'p1',
    method: 'shapes.polygon',
    options: {
      sides: 6,
      width: 0.05,
      line: {
        widthIs: 'mid',
      },
      // angleToDraw: 3,
      sidesToDraw: 3,
      // line: {
      //   cornersOnly: true,
      // },
      // line: {
      //   widthIs: 'mid',
      //   cornerStyle: 'fill',
      //   // dash: [0.1, 0.04],
      //   // cornerSize: 0.2,
      //   // cornerStyle: 'radius',
      // },
      // angle: Math.PI / 3,
      // sidesToDraw: 4,
      // direction: -1,
      radius: 0.9,
      // fill: true,
      position: [0, 0],
      // textureLocation: 'example.png',
    },
  },
  {
    name: 'p',
    method: 'polygon',
    options: {
      sides: 8,
      width: 0.005,
      radius: 0.9,
      // fill: true,
      color: [0, 1, 1, 1],
      position: [0, 0],
      // textureLocation: 'example.png',
    },
  },
]);
diagram.getElement('p1').angleToDraw = Math.PI;
diagram.initialize();