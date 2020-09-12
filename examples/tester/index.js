const diagram = new Fig.Diagram({ limits: [-1, -1, 2, 2 ]});

const f1 = {
  family: 'Times New Roman',
  color: [1, 0, 0, 1],
  style: 'normal',
  size: 0.2,
};
const f2 = {
  family: 'Times New Roman',
  color: [0, 1, 0, 1],
  style: 'italic',
  size: 0.2,
  weight: 'bold',
}
const f3 = {
  family: 'Times New Roman',
  color: [0, 1, 0, 1],
  style: 'italic',
  size: 0.08,
  weight: 'bold',
}
console.log(new Fig.Transform().scale(2, 2).translate(0.5, 0).matrix())
console.log(new Fig.Transform().translate(0.5, 0).scale(2, 2).matrix())
diagram.addElements([
  {
    name: 'tester',
    method: 'text',
    // options: {
    //   text: [
    //     'hello',
    //     ['MM', { font: f2 }],
    //     ['2', { offset: [0, -0.02], font: f3 }],
    //     ['2', { offset: [-0.02, 0.1], font: f3 }],
    //     ' M',
    //     ['dg', { font: { weight: 'bolder' }, location: [0, -0.2] }],
    //   ],
    //   font: f1,
    //   position: [-0.5, -0.5],
    //   xAlign: 'left',
    //   yAlign: 'baseline',
    //   color: [0, 0, 1, 1],
    // },
    options: {
      font: {
        family: 'Times New Roman',
        color: [1, 0, 0, 1],
        style: 'normal',
        size: 0.1,
        weight: '200',
      },
      text: [
        'This is the ',
        ['first', { font: { style: 'italic', color: [1, 0, 1, 1] } }],
        ' line.',
        ['This is a ', { location: [0, -0.2] }],
        ['superscript', { offset: [-0.4, 0.45], font: { size: 0.05 } }],
        ' example on a new line.',
      ],
      // text: [
      //   'This is the ',
      //   ['first', { font: { style: 'italic', color: [0, 1, 1, 1] } }],
      //   ['2', { offset: [0, -0.02], font: f3 }],
      //   ['2', { offset: [-0.02, 0.1], font: f3 }],
      //   ' M',
      //   ['dg', { font: { weight: 'bolder' }, location: [0, -0.2] }],
      // ],
      position: [-0.8, 0],
      xAlign: 'left',
      yAlign: 'middle',
      color: [0.5, 0.5, 1, 1],
    },
  },
  {
    name: 'a',
    method: 'polygon',
    options: {
      radius: 0.01,
      width: 0.01,
      sides: 10,
      // transform: new Fig.Transform().scale(2, 2).translate(0.5, 0),
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-1, -1, 2, 2],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.2, 0.2, 0.2, 1],
      width: 0.002,
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-1, -1, 2, 2],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.5, 0.5, 0.5, 1],
      width: 0.002,
    },
  },
]);
diagram.initialize();

// diagram.elements._tester.animations.new()
//   .translation({ target: [-0.5, 0], duration: 1 })
//   .start();

// diagram.elements._tester.animations.new()
//   .translation({ target: [-0.5, -0.5 ], duration: 2 })
//   .start();

diagram.elements._tester.onClick = () => { console.log(1) };
diagram.elements._tester.makeTouchable();
// diagram.elements._tester.setColor([0, 1, 1, 1]);

