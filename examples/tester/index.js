const figure = new Fig.Figure({ limits: [-4.5, -4.5, 9, 9], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
// const figure = new Fig.Figure({ limits: [-3, -2.25, 6, 4.5], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// // const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
figure.add([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1]
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.004 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.004 }
    },
  },
]);


// ***************************************************
// ***************************************************
// ***************************************************

/*
....########.##.....##....###....##.....##.########..##.......########
....##........##...##....##.##...###...###.##.....##.##.......##......
....##.........##.##....##...##..####.####.##.....##.##.......##......
....######......###....##.....##.##.###.##.########..##.......######..
....##.........##.##...#########.##.....##.##........##.......##......
....##........##...##..##.....##.##.....##.##........##.......##......
....########.##.....##.##.....##.##.....##.##........########.########
*/

// const p = [[1.2, 0.3], [1, 1], [0.2, 1], [0.6, 0.5], [0, 0], [1, 0]];
// const angleCurve = (p1, p2, p3, name, label, alpha = 1, fill = false) => ({
//   name,
//   method: 'collections.angle',
//   options: {
//     p1,
//     p2,
//     p3,
//     label: {
//       offset: 0.01,
//       text: label,
//     },
//     curve: {
//       width: 0.01,
//       radius: 0.2,
//       fill,
//     },
//     color: [1, 0, 0, alpha],
//   },
// });
// // const angleFill = (p1, p2, p3, name, label) => ({
// //   name,
// //   method: 'collections.angle',
// //   options: {
// //     p1,
// //     p2,
// //     p3,
// //     label: {
// //       offset: 0.01,
// //       text: label,
// //     },
// //     curve: {
// //       width: 0.01,
// //       radius: 0.2,
// //     },
// //   },
// // })
// figure.add([
//   {
//     name: 'shape',
//     method: 'collections.collection',
//     elements: [
//       {
//         name: 'newShapeFill',
//         method: 'generic',
//         options: {
//           points: p,
//           drawType: 'fan',
//           color: [1, 0, 0, 0.5],
//         },
//         mods: { isShown: false },
//       },
//       {
//         name: 'oldShapeFill',
//         method: 'generic',
//         options: {
//           points: [p[0], p[1], p[2], p[4], p[5]],
//           drawType: 'fan',
//           color: [0, 0, 1, 0.5],
//         },
//         mods: { isShown: false },
//       },
//       angleCurve(p[4], p[2], p[1], 'angleAf', '', 0.7, true),
//       angleCurve(p[5], p[4], p[2], 'angleBf', '', 0.7, true),
//       angleCurve(p[4], p[3], p[2], 'angleCf', '', 0.7, true),
//       angleCurve(p[4], p[2], p[3], 'angleA', 'a'),
//       angleCurve(p[3], p[4], p[2], 'angleB', 'b'),
//       angleCurve(p[2], p[3], p[4], 'angleC', 'c'),
//       {
//         name: 'newShape',
//         method: 'primitives.polyline',
//         options: {
//           points: p,
//           close: true,
//           width: 0.015,
//           cornerStyle: 'fill',
//         },
//       },
//       {
//         name: 'line',
//         method: 'primitives.line',
//         options: {
//           p1: p[2],
//           p2: p[4],
//           dash: [0.05, 0.02],
//         },
//       },
//     ],
//     options: {
//       position: [-0.5, -0.5],
//     },
//   },
//   {
//     name: 'eqn',
//     method: 'collections.equation',
//     options: {
//       elements: {
//         // old: 'old shape',
//         // new: 'new shape',
//         // totAngle_1: 'total angle',
//         // totAngle_2: 'total angle',
//         a: { mods: { touchBorder: 0.2, isTouchable: true } },
//         b: { mods: { touchBorder: 0.2, isTouchable: true } },
//         c: { mods: { touchBorder: 0.2, isTouchable: true } },
//         equals: '  =  ',
//         _360: '360\u00b0',
//         minus1: '  \u2212  ',
//         minus2: '  \u2212  ',
//         minus3: '  \u2212  ',
//         plus: '  +  ',
//         box1: {
//           symbol: 'box',
//           fill: true,
//           color: [0.5, 0.5, 0.5, 0.7],
//           mods: { isTouchable: true },
//         },
//         box2: { symbol: 'box', fill: true, color: [0.5, 0.5, 0.5, 0.7] },
//       },
//       phrases: {
//         ta_old: { box: [{ bottomComment: ['total angle_1', 'old shape'] }, 'box1', false, 0.1] },
//         ta_new: { box: [{ bottomComment: ['total angle_2', 'new shape'] }, 'box2', false, 0.1] },
//       },
//       forms: {
//         0: ['ta_new', 'equals', 'ta_old', 'minus1', 'a', 'minus2', 'b', 'minus3', 'c', 'plus', '_360'],
//       },
//       position: [-1, -1],
//     },
//   },
// ]);

// figure.getElement('eqn').showForm('0');
// figure.getElement('eqn.a').onClick = () => console.log('a');
// figure.getElement('eqn.b').onClick = () => console.log('b');
// figure.getElement('eqn.c').onClick = () => console.log('c');
// figure.getElement('eqn.box1').onClick = () => console.log('box1');
// console.log(figure.getElement('eqn.box1'))


figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      s: {
        symbol: 'sum',
        // lineWidth: 0.1,
        // side: 'left',
        // color: [1, 0, 0, 1],
        // fill: true, 
        // lineWidth: 0.1,
        // arrowWidth: 0.2,
        // arrowHeight: 0.2,
        // drawBorderBuffer: 0.1,
        // touchBorder: [0, 0.1],
        touchBorder: 'border',
        draw: 'dynamic',
        // mods: {
          isTouchable: true,
          onClick: () => console.log('asdfasdf')
        // }
      },
      c: {
        touchBorder: [0, 0.1], // touchBorder: 'buffer',
        isTouchable: true,
        onClick: () => console.log('c'),
        mods: {
          isTouchable: true,
          onClick: () => console.log('d'),
        },
        size: 3,
      }
    },
    forms: {
      0: { sumOf: ['s', 'c']}
      // 0: { root: ['s', 'c'] },
      // 0: { sumOf: ['s', 'c', 'a', 'b'] },
      // 0: { sumOf: ['s', {
      //   frac: {
      //     numerator: 'c',
      //     symbol: 'vinculum',
      //     denominator: 'd',
      //     scale: 4,
      //   },
      // }, 'a', 'b' ] },
    },
  },
});
console.log(figure.elements._eqn)
console.log(figure.elements._eqn._s.getBorder('diagram', 'touchBorder'))
figure.elements._eqn.touchBorder = 'children';
// figure.elements._eqn.animations.new()
//   .goToForm({ start: '0', target: '1', duration: 2, animate: 'move' })
//   .start();

figure.elements._eqn.showForm('1')

figure.add({
  name: 'ttt',
  method: 'triangle',
  options: {
            width: 2,
            height: 1,
            top: 'left',
            line: {
              width: 0.1,
              widthIs: 'outside',
            },
            xAlign: 'left',
            yAlign: 'bottom',
            // border: 'outline',
            drawBorderBuffer: 0.1,
          },
          mods: {
            touchBorder: 'buffer',
          },
})
console.log(figure.getElement('ttt'));
const len = figure.elements.drawOrder.length;
for (let i = 3; i < len; i += 1) {
  const name = figure.elements.drawOrder[i];
  const element = figure.elements.elements[name];
  const border = element.getBorder('draw', 'border');
  for (let j = 0; j < border.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      method: 'polyline',
      options: {
        points: border[j],
        width: 0.01,
        color: [0, 0.7, 0, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
  const touchBorder = element.getBorder('draw', 'touchBorder');
  for (let j = 0; j < touchBorder.length; j += 1) {
    figure.add({
      name: `buffer${i}${j}`,
      method: 'polyline',
      options: {
        points: touchBorder[j],
        width: 0.01,
        dash: [0.05, 0.03],
        color: [0, 0, 1, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
}


// ***************************************************
// ***************************************************
// ***************************************************

// figure.add({
//   name: 'asdf',
//   method: 'arrow',
//   options: {
//     length: 1,
//     width: 1,
//     head: 'barb',
//     tail: 0.2,
//     color: [0, 0, 1, 0.5],
//     align: 'mid',
//   }
// })

// figure.add([
//   {
//     name: 'ppp',
//     method: 'polyline',
//     options: {
//       points: [[0, 0], [1, 0], [0, 0.05]],
//       width: 0.08,
//       widthIs: 'mid',
//       color: [1, 0, 0, 0.6],
//       cornerStyle: 'auto',
//       // linePrimitives: true,
//       // lineNum: 3,
//       // dash: [0.02, 0.02],
//     },
//   },
//   {
//     name: 'border',
//     method: 'polyline',
//     options: {
//       width: 0.01,
//       color: [0, 0.6, 0, 0],
//     },
//   },
//   {
//     name: 'pad',
//     method: 'polygon',
//     options: {
//       radius: 0.5,
//       sides: 20,
//       // line: { width: 0.004 },
//       color: [0, 0, 1, 0.4],
//     },
//     mods: {
//       isMovable: true,
//       setTransformCallback: (t) => {
//         const ppp = figure.getElement('ppp');
//         ppp.custom.updatePoints({ points: [[0, 0], [1, 0], t.t(),] });
//         figure.getElement('border').custom.updatePoints({
//           points: ppp.drawBorder[0],
//         });
//         // console.log(t.t())
//       },
//     },
//   },
// ]);

// figure.add({
//   name: 'r',
//   method: 'star',
//   options: {
//     // points: [[0, 0], [1, 0], [1, 0.3]],
//     // close: true,
//     // width: 1,
//     // height: 0.2,
//     // border: 'negative',
//     // width: 1,
//     // length: 1,
//     drawBorderBuffer: 0.4,
//     color: [1, 0, 0, 0.6],
//     // tailWidth: 0.15,
//     // head: 'barb',
//     line: { width: 0.1, widthIs: 'mid', dash: [0.01, 0.01], cornerStyle: 'auto' },
//     // tail: -0.11,
//     radius: 1,
//     sides: 20,
//   },
//   mods: {
//     isTouchable: true,
//     onClick: () => console.log('touched'),
//     touchBorder: 'buffer',
//   },
// });


// const points = figure.getElement('r').drawBorderBuffer;
// figure.add([
//   {
//     name: 'buffer',
//     method: 'polyline',
//     options: {
//       points: points[0],
//       width: 0.01,
//       color: [0, 0, 1, 1],
//       close: true,
//     },
//   },
//   {
//     name: 'border',
//     method: 'polyline',
//     options: {
//       points: figure.getElement('r').drawBorder[0],
//       width: 0.01,
//       color: [0, 1, 0, 1],
//       close: true,
//     },
//   },
// ]);

// // Point {x: -0.4166666666666667, y: 0, _type: "point"}
// // 1: Point {x: -0.5, y: -0.25, _type: "point"}
// // 2: Point {x: 0, y: 0, _type: "point"}
// // 3: Point {x: -0.5, y: 0.25, _type: "point"}

// console.log(Fig.tools.misc.joinObjects({}, { a: false }, { a: 1 }));
// // figure.getElement('p').angleToDraw = Math.PI * 2;
// // figure.getElement('p').angleToDraw = Math.PI * 1;
// // figure.getElement('p').custom.updatePoints({
// //   line: null,
// // })

// figure.add({
//   name: 'pp',
//   method: 'polyline',
//   options: {
//     points: [
//       [-0.3, 0],
//       [-0.5, -0.25],
//       [0, 0],
//       [-0.5, 0.25],
//     ],
//     close: true,
//     width: 0.1,
//     color: [1, 0, 0, 0.5],
//     // cornerStyle: 'fill',
//   },
// })

// figure.add({
//   name: 'pp1',
//   method: 'polyline',
//   options: {
//     points: figure.getElement('pp').getBorder('draw', 'border')[0].slice(0, 3),
//     // close: true,
//     width: 0.01,
//     color: [0, 1, 0, 1],
//     // cornerStyle: 'fill',
//   },
// })



// figure.add({
//   name: 'line',
//   method: 'line',
//   options: {
//     p1: [0, -1],
//     length: 1,
//     angle: 0,
//     width: 0.05,
//     arrow: 'barb'
//   },
// });
// figure.add({
//   name: 'tester',
//   method: 'polyline',
//   options: {
//     points: [
//       // [-0.3, -5.551115123125783e-17],
//       // [-0.5, -0.25],
//       // [-0.36723280449304485, 0.08404100561630612],
//       // [-0.36723280449304485, 0.08404100561630612],
//       // [-0.5, -0.25],
//       // [-0.5675845898851645, -0.1663987261238431],
//       // [-0.5, -0.25],
//       // [0, 0],
//       // [-0.43241541011483553, -0.3336012738761569],
//       // [-0.43241541011483553, -0.3336012738761569],
//       // [0, 0],
//       // [0.23478713763747788, 2.7755575615628914e-17],
//       // [0, 0],
//       // [-0.5, 0.2499999999999999],
//       // [0.23478713763747788, 2.7755575615628914e-17],
//       // [0.23478713763747788, 2.7755575615628914e-17],
//       // [-0.5, 0.2499999999999999],
//       // [-0.4324154101148356, 0.3336012738761567],
//       // [-0.4999999999999999, 0.25],
//       // [-0.3, 0],
//       // [-0.5675845898851644, 0.1663987261238432],
//       // [-0.5675845898851644, 0.1663987261238432],
//       // [-0.3, 0],
//       // [-0.3672328044930449, -0.08404100561630612],
//       [-0.36723280449304485, 0.08404100561630612],
//       [-0.5675845898851645, -0.1663987261238431],
//       [-0.43241541011483553, -0.3336012738761569],
//       [0.23478713763747788, 2.7755575615628914e-17],
//       [0.23478713763747788, 2.7755575615628914e-17],
//       [-0.4324154101148356, 0.3336012738761567],
//       [-0.5675845898851644, 0.1663987261238432],
//       [-0.3672328044930449, -0.08404100561630612],

//     ],
//     // drawType: 'triangles',
//     color: [0, 1, 0, 1],
//   },
// });
