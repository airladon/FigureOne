const diagram = new Fig.Diagram();
const { Point, Rect } = Fig;

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
    name: 'g',
    method: 'shapes.grid',
    options: {
      // start: [-0.8, -0.8],
      bounds: new Rect(-0.8, -0.8, 0.4, 0.4),
      xNum: 5,
      // xStep: 0.1,
      yNum: 5,
      // yStep: 0.1,
      width: 0.002,
      color: [1, 0.5, 0.5, 1],
      // linePrimitives: true,
      // lineNum: 1,
      copy: [
        { along: 'x', num: 2, step: 0.5, },
        { along: 'y', num: 2, step: 0.5, },
      ],
      dash: [0.02, 0.003, 0.003, 0.003],
    },
  },
  {
    name: 'b',
    method: 'polygon',
    options: {
      sides: 6,
      color: [0, 1, 0, 1],
      radius: 0.1,
    },
  },
  {
    name: 'p',
    method: 'shapes.polygon',
    options: {
      sides: 4,
      width: 0.004,
      radius: 0.05,
      rotation: Math.PI / 4,
      fill: true,
      // line: {
      //   widthIs: 'mid',
      //   cornerStyle: 'radius',
      //   cornerSize: 0.02,
      //   cornerSides: 5,
      //   dash: [0.02, 0.005, 0.005, 0.005],
      // },
      offset: [-0.5, -0.5],
      // copy: [
      //   { along: 'y', num: 4, step: 0.1 },
      //   { along: 'rotation', num: 5, step: 1, center: [-0.5, -0.5], start: 1 },
      // ],
    },
  },
  {
    name: 'pointer',
    method: 'collection',
    addElements: [
      {
        name: 'up',
        method: 'polygon',
        options: {
          // fill: true,
          width: 0.01,
          color: [1, 1, 0, 1],
          sides: 50,
          radius: 0.05,
        },
      },
      {
        name: 'down',
        method: 'polygon',
        options: {
          fill: true,
          color: [1, 1, 0, 1],
          sides: 50,
          radius: 0.05,
        },
      },
    ]
  }
]);

// diagram.addElement(
//   // Add equation element
//   {
//     name: 'eqn',
//     method: 'equation',
//     options: {
//       color: [0.95, 0.95, 0.6, 1],
//       position: [-0.2, 0],
//       // Equation elements are the individual terms in the equation
//       elements: {
//         a: 'a',
//         b: 'b',
//         c: 'c',
//         v: { symbol: 'vinculum'},
//         equals: ' = ',
//       },
//       // An equation form is how those terms are arranged
//       forms: {
//         base: ['a', 'equals', { frac: ['b', 'vinculum', 'c'] }],
//       },
//     },
//   },
// );

// Show the equation form
// diagram.getElement('eqn').showForm('base');
diagram.getElement('b').setMovable();

// diagram.recorder.start();
// const p = diagram.getElement('p');
// p.makeTouchable();
// diagram.getElement('p').onClick = () => { diagram.recorder.show() }
diagram.initialize();
diagram.getElement('pointer').animations.new()
  .position({ target: [0.5, 0], duration: 4 })
  .start();
// const state = diagram.getState();
let state;
console.log(diagram)

setTimeout(() => {
  state = diagram.getState();
  console.log(state);
}, 1000)
setTimeout(() => {
  console.log('1')
  // console.log(diagram)
  diagram.setState(state);
  // console.log(performance.now() - diagram.stateTime)
  // console.log(diagram.elements._pointer.animations.animations[0])
  // console.log(state)
  console.log(diagram);
  diagram.animateNextFrame();
}, 3000);
// const data = [
// ];

// diagram.recorder.events = data;
// diagram.recorder.startPlayback(1.5);