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
// console.log(new Fig.Transform().scale(2, 2).translate(0.5, 0).matrix())
// console.log(new Fig.Transform().translate(0.5, 0).scale(2, 2).matrix())
diagram.addElements([
  // {
  //   name: 'tester',
  //   method: 'shapes.lines',
  //   // options: {
  //   //   text: [
  //   //     'hello',
  //   //     ['MM', { font: f2 }],
  //   //     ['2', { offset: [0, -0.02], font: f3 }],
  //   //     ['2', { offset: [-0.02, 0.1], font: f3 }],
  //   //     ' M',
  //   //     ['dg', { font: { weight: 'bolder' }, location: [0, -0.2] }],
  //   //   ],
  //   //   font: f1,
  //   //   position: [-0.5, -0.5],
  //   //   xAlign: 'left',
  //   //   yAlign: 'baseline',
  //   //   color: [0, 0, 1, 1],
  //   // },
  //   options: {
  //     font: {
  //       family: 'Times New Roman',
  //       color: [1, 0, 0, 1],
  //       style: 'normal',
  //       size: 0.1,
  //       weight: '200',
  //     },
  //     // justification: 'center',
  //     lines: [
  //       'This is a |formatted| string',
  //       [
  //         {
  //           font: {},
  //           justification: 'left',
  //           location: [],
  //           lineSpace: 0.2,
  //         },
  //         'This is a |sup| string',
  //       ],
  //       'This is a simple string'
  //     ],
  //     modifiers: {
  //       formatted: {
  //         text: 'asdfasdf',
  //         location: [0, 0],
  //         offset: [0, 0],
  //         // font: {},
  //       },
  //     },
  //     // lines: [
  //     //   {
  //     //     text: 'asdf',
  //     //     justification: 'right'
  //     //   },
  //     //   'this is standard',
  //     //   ['This is a ', { location: [0, -0.2] }],
  //     //   [
  //     //     'This is a ',
  //     //     ['formated', { font: { style: 'italic', color: [1, 0, 1, 1], weight: 'bolder' } }],
  //     //     ' string.',
  //     //   ],
  //     // ],
  //     // lineSpace: 0.2,
  //     // justification: 'left',
  //     // text: [
  //     //   'This is a ',
  //     //   ['formated', { font: { style: 'italic', color: [1, 0, 1, 1], weight: 'bolder' } }],
  //     //   ' string.',
  //     //   ['This is a ', { location: [0, -0.2] }],
  //     //   ['superscript', { offset: [0, 0.05], font: { size: 0.05 } }],
  //     //   'and',
  //     //   ['below string', { offset: [-0.02, -0.06], font: { size: 0.05 } }],
  //     //   [' example on a new line.', { location: -2 }],
  //     // ],
  //     position: [-0.8, 0],
  //     xAlign: 'left',
  //     yAlign: 'middle',
  //     color: [0.5, 0.5, 1, 1],
  //   },
  // },
  // {
  //   name: 'tester',
  //   method: 'shapes.textLines',
  //   options: {
  //     font: {
  //       family: 'Times New Roman',
  //       color: [1, 0, 0, 1],
  //       style: 'normal',
  //       size: 0.1,
  //       weight: '200',
  //     },
  //     text: [
  //       'This is a |formatted| string',
  //       [
  //         {
  //           font: { size: 0.05},
  //           lineSpace: 0.1,
  //           justification: 'right',
  //           location: [-0.2, 0.3]
  //         },
  //         'This is a |sup| string',
  //       ],
  //       'This is a simple string also |formatted|.'
  //     ],
  //     lineSpace: 0.2,
  //     modifiers: {
  //       formatted: {
  //         offset: [0.01, 0],
  //         font: { color: [1, 1, 0, 1], style: 'italic' },
  //       },
  //     },
  //     position: [0, 0],
  //     xAlign: 'center',
  //     yAlign: 'bottom',
  //     color: [0.5, 0.5, 1, 1],
  //     justification: 'left',
  //   },
  // },
  // {
  //   name: 'tester',
  //   method: 'shapes.textLine',
  //   options: {
  //     text: [
  //       'hello', [{ font: { size: 0.1 }, offset: [-0.3, 0.1], inLine: false }, ' there'], 'great',
  //     ],
  //     xAlign: 'center',
  //     yAlign: 'middle',
  //     color: [0, 1, 0, 1],
  //     font: {
  //       family: 'Helvetica',
  //       color: [0, 1, 1, 1],
  //     }
  //   },
  // },
  // {
  //   name: 't',
  //   method: 'text',
  //   options: {
  //     text: 'hello',
  //     xAlign: 'center',
  //     yAlign: 'middle',
  //     position: [-0.5, 0],
  //   }
  //   //   text: [
  //   //   { text: 'b', location: [-0.1, -0.2] },
  //   //   {
  //   //     xAlign: 'left',
  //   //     yAlign: 'bottom',
  //   //     location: [-0.5, -0.5],
  //   //     font: {
  //   //       family: 'Helvetica',
  //   //       weight: 'bold',
  //   //       style: 'italic',
  //   //       size: 0.5,
  //   //       color: [1, 1, 0, 1],
  //   //     },
  //   //     text: 'g',
  //   //   },
  //   // ],
  //   // xAlign: 'center',
  //   // yAlign: 'baseline',
  //   // font: {
  //   //   family: 'Helvetica Neue',
  //   //   weight: '300',
  //   //   style: 'normal',
  //   //   size: 0.2,
  //   // },
  //   // color: [1, 0, 0, 1],
  //   // position: [0, 0],
  //   // },
  // },
  // {
  //   name: 't',
  //   method: 'textLine',
  //   options: {
  //     line: [
  //       'Hello ',
  //       {
  //         text: 'to the',
  //         font: {
  //           style: 'italic',
  //           color: [1, 1, 0, 1],
  //         },
  //       },
  //       ' world',
  //       {
  //         text: '1',
  //         offset: [0, 0.05],
  //         font: { size: 0.05, color: [0, 1, 0, 1] },
  //       },
  //     ],
  //     xAlign: 'center',
  //     yAlign: 'bottom',
  //     font: {
  //     //   family: 'Helvetica Neue',
  //     //   weight: '200',
  //       style: 'normal',
  //       size: 0.1,
  //     },
  //     color: [1, 0, 0, 1],
  //     position: [0, 0],
  //     transform: [['s', 1, 1], ['r', 0], ['t', 0, 0]],
  //   },
  // },
  // {
  //   name: 'allOptions',
  //   method: 'shapes.textLine',
  //   options: {
  //     font: {
  //       family: 'Times New Roman',
  //       color: [1, 0, 0, 1],
  //       style: 'normal',
  //       size: 0.1,
  //       weight: '200',
  //     },
  //     text: [
  //       // 'This is the ',
  //       // [{ font: { style: 'italic', color: [0, 0, 1] } }, 'first'],
  //       // ' line',
  //       'This is a ',
  //       [{ font: { size: 0.05 }, offset: [0, 0.1], inLine: false }, 'superscript'],
  //       'example on a new line.',
  //     ],
  //     xAlign: 'center',
  //     yAlign: 'middle',
  //     color: [0.5, 0.5, 1, 1],
  //   },
  // },
  // {
  //   name: 'tester',
  //   method: 'textLines',
  //   options: {
  //     text: [
  //       'This is the first line',
  //       'Second line has a |superscript| modifier that isn\'t inline',
  //       [
  //         {
  //           font: {
  //             family: 'Times New Roman',
  //             weight: 'bold',
  //             style: 'italic',
  //             size: 0.15,
  //             color: [1, 1, 0, 1],
  //           },
  //           lineSpace: -0.3,
  //           justification: 'center',
  //         },
  //         'A line with new defaults',
  //       ],
  //       'A spaced |line| with two |line| mods',
  //       'An escaped special char: /|',
  //     ],
  //     modifiers: {
  //       superscript: {
  //         text: 'superscript!!',
  //         offset: [-0.1, 0.1],
  //         inLine: false,
  //         font: {
  //           family: 'Times New Roman',
  //           weight: 'bold',
  //           style: 'italic',
  //           size: 0.05,
  //           color: [1, 0, 1, 1],
  //         },
  //       },
  //       line: {
  //         font: {
  //           color: [0, 1, 1, 1],
  //           style: 'italic',
  //         },
  //       },
  //     },
  //     xAlign: 'left',
  //     yAlign: 'baseline',
  //     font: {
  //       family: 'Helvetica Neue',
  //       weight: '200',
  //       style: 'normal',
  //       size: 0.1,
  //     },
  //     justification: 'left',
  //     lineSpace: -0.2,
  //     color: [1, 0, 0, 1],
  //     position: [-0.8, 0],
  //     transform: [['s', 1, 1], ['r', 0], ['t', 0, 0]],
  //   },
  // },
  {
    name: 'te',
    method: 'textLines',
    options: {
      lines: [
        'This is the first line',
        'Second line has a |superscript| modifier that isn\'t inline',
        {
          font: {
            family: 'Times New Roman',
            weight: 'bold',
            style: 'italic',
            size: 0.15,
            color: [1, 1, 0, 1],
          },
          lineSpace: -0.3,
          justification: 'center',
          line: 'A line with new defaults',
        },
        'A spaced |line| with two |line| mods',
        'An escaped special char: /|',
      ],
      modifiers: {
        superscript: {
          text: 'superscript!!',
          offset: [-0.1, 0.1],
          inLine: false,
          font: {
            family: 'Times New Roman',
            weight: 'bold',
            style: 'italic',
            size: 0.05,
            color: [1, 0, 1, 1],
          },
        },
        line: {
          font: {
            color: [0, 1, 1, 1],
            style: 'italic',
          },
        },
      },
      xAlign: 'left',
      yAlign: 'baseline',
      font: {
        family: 'Helvetica Neue',
        weight: '200',
        style: 'normal',
        size: 0.1,
      },
      justification: 'left',
      lineSpace: -0.2,
      color: [1, 0, 0, 1],
      position: [-0.8, 0],
      transform: [['s', 1, 1], ['r', 0], ['t', 0, 0]],
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
  // {
  //   name: 'eqn',
  //   method: 'equation',
  //   options: {
  //     color: [1, 1, 0, 1],
  //     // position: [1, 1],           // Points can be defined as arrays
  //     elements: {
  //       a: 'a',
  //       b: 'b',
  //       c: 'c',
  //       _2: '2',
  //       v: { symbol: 'vinculum' },
  //     },
  //     formDefaults: {
  //       alignment: {
  //         // fixTo: { x: 0.2, y: 0.2 },    // Points can also be defined as objects
  //         xAlign: 'right',
  //         yAlign: 'top',
  //       },
  //     },
  //     scale: 0.45,
  //     forms: {
  //       0: ['a', 'b', 'c'],
  //       1: [{ frac: ['a', 'v', '_2'] }, 'c'],
  //     },
  //     formSeries: ['0', '1'],
  //   }
  // }
  // {
  //   name: 'eqn',
  //   method: 'equation',
  //   options: {
  //     font: {
  //       size: 0.2,
  //       color: [1, 1, 0, 1],
  //       family: 'Helvetica',
  //     },
  //     elements: {
  //       equals: { text: ' = ', color: [1, 1, 0, 1], },
  //       v: { symbol: 'vinculum', color: [1, 1, 0, 1], },
  //     },
  //     forms: {
  //       0: ['a', 'equals', { frac: {
  //         numerator: 'b',
  //         symbol: 'v',
  //         denominator: 'c',
  //         offsetY: 0.05,
  //         denominatorSpace: 0.08,
  //        } }],
  //     },
  //     // position: [0, -0.5],
  //   },
  // },
]);
diagram.initialize();

// diagram.elements._tester.animations.new()
//   .translation({ target: [-0.5, 0], duration: 1 })
//   .start();

// diagram.elements._tester.animations.new()
//   .translation({ target: [-0.5, -0.5 ], duration: 2 })
//   .start();
// console.log(diagram.elements._eqn._a.drawingObject.text[0].font.definition());
// diagram.elements._tester.onClick = () => { console.log(1) };
// diagram.elements._tester.makeTouchable();
// console.log(diagram.elements._tester.drawingObject)
// diagram.elements._eqn.showForm('1')

diagram.animateNextFrame();
// console.log(diagram.elements._tester)
// diagram.elements._tester.setColor([0, 1, 1, 1]);
// console.log(diagram.elements._eqn._a.drawingObject.border)
// console.log(diagram.elements._eqn._equals.drawingObject.border)
// console.log(diagram.elements._eqn._b.drawingObject.border)
// console.log(diagram.elements._eqn._c.drawingObject.border)
