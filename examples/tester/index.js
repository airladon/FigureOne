const figure = new Fig.Figure({ limits: [-4.5, -4.5, 9, 9], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });
// const figure = new Fig.Figure({ limits: [-3, -2.25, 6, 4.5], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

// // const figure = new Fig.Figure({ limits: [-8, -8, 16, 16], color: [1, 0, 0, 1]});
// figure.add([
//   {
//     name: 'origin',
//     method: 'polygon',
//     options: {
//       radius: 0.01,
//       line: { width: 0.01 },
//       sides: 10,
//       color: [0.7, 0.7, 0.7, 1]
//     },
//   },
//   {
//     name: 'grid',
//     method: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.1,
//       xStep: 0.1,
//       color: [0.9, 0.9, 0.9, 1],
//       line: { width: 0.004 },
//     },
//   },
//   {
//     name: 'gridMajor',
//     method: 'grid',
//     options: {
//       bounds: [-4.5, -4.5, 9, 9],
//       yStep: 0.5,
//       xStep: 0.5,
//       color: [0.7, 0.7, 0.7, 1],
//       line: { width: 0.004 }
//     },
//   },
// ]);
// const figure = new Fig.Figure();

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

// figure.add({
//   name: 'g',
//   method: 'generic',
//   options: {
//     points: [[0, 0], [1, 0], [1, 1]],
//     drawBorder: [[0, 0], [1, 0], [1, 1]],
//   },
//   mods: {
//     isTouchable: true,
//     onClick: () => console.log('touched'),
//     touchBorder: 'buffer',
//   },
// });
// const g = figure.getElement('g');
// console.log(g)
// console.log(figure.getElement('g'))
// figure.getElement('g').custom.updatePoints({
//   points: [[0, -1], [1, -1], [1, 0], [2, 0]],
//   drawBorder: [[0, -1], [1, -1], [2, 0], [1, 0]],
//   // copy: { along: 'x', num: 2, step: 0.5 },
//   drawType: 'strip',
// });


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = Fig.tools.math.range(-4, 4, 0.7);
const yValues = Fig.tools.math.range(4, -4, -0.7);
let index = 0;
const makeShape = (method, options) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  index += 1;
  return {
    name,
    method,
    options: Fig.tools.misc.joinObjects({}, {
      position: [x, y],
    }, options),
  };
}

const makeArrow = (...options) => {
  return makeShape(
    'primitives.arrow',
    Fig.tools.misc.joinObjects({}, {
      width: 0.35,
      length: 0.35,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
      tailWidth: 0.15,
    }, ...options),
  );
}

const triArrow = (options = {}) => {
  return makeArrow({ head: 'triangle' }, options);
};
const revtriArrow = (options = {}) => {
  return makeArrow({ head: 'reverseTriangle' }, options);
};
const barbArrow = (options = {}) => {
  return makeArrow({ head: 'barb' }, options);
};
const polygonArrow = (options = {}) => {
  return makeArrow({ head: 'polygon', sides: 6, radius: 0.2 }, options);
};
const barArrow = (options = {}) => {
  return makeArrow({ head: 'bar', length: 0.1 }, options);
};
const lineArrow = (options = {}) => {
  return makeArrow({ head: 'line', tailWidth: 0.05 }, options);
};

const makePolygon = (options) => {
  return makeShape(
    'primitives.polygon',
    Fig.tools.misc.joinObjects({}, {
      radius: 0.2,
      sides: 6,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeEllipse = (options) => {
  return makeShape(
    'primitives.ellipse',
    Fig.tools.misc.joinObjects({}, {
      width: 0.5,
      height: 0.4,
      sides: 20,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeRectangle = (options) => {
  return makeShape(
    'primitives.rectangle',
    Fig.tools.misc.joinObjects({}, {
      width: 0.5,
      height: 0.4,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeTriangle = (options) => {
  return makeShape(
    'primitives.triangle',
    Fig.tools.misc.joinObjects({}, {
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeStar = (options) => {
  return makeShape(
    'primitives.star',
    Fig.tools.misc.joinObjects({}, {
      radius: 0.2,
      innerRadius: 0.1,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeLine = (options) => {
  return makeShape(
    'primitives.line',
    Fig.tools.misc.joinObjects({}, {
      p1: [-0.4, 0],
      p2: [0, 0],
      width: 0.05,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makePolyline = (options) => {
  return makeShape(
    'primitives.polyline',
    Fig.tools.misc.joinObjects({}, {
      points: [[-0.4, 0], [0, 0], [-0.4, -0.4]],
      width: 0.05,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const makeGrid = (options) => {
  return makeShape(
    'primitives.grid',
    Fig.tools.misc.joinObjects({}, {
      bounds: [-0.4, -0.4, 0.4, 0.4],
      xStep: 0.1,
      yStep: 0.1,
      line: { width: 0.02 },
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
    }, options),
  );
};

const arrows = [
  // triArrow(),
  // triArrow({ tail: -0.1 }),
  // triArrow({ tail: 0 }),
  // triArrow({ tail: 0.1 }),
  // triArrow({ line: { width: 0.05 } }),
  // triArrow({ line: { width: 0.05 }, tail: -0.1 }),
  // triArrow({ line: { width: 0.05 }, tail: 0 }),
  // triArrow({ line: { width: 0.05 }, tail: 0.1 }),
  // triArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // triArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.1 }),
  // triArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  // triArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.1 }),
  // revtriArrow(),
  // revtriArrow({ tail: -0.05 }),
  // revtriArrow({ tail: 0 }),
  // revtriArrow({ tail: 0.1 }),
  // revtriArrow({ line: { width: 0.05 } }),
  // revtriArrow({ line: { width: 0.05 }, tail: -0.05 }),
  // revtriArrow({ line: { width: 0.05 }, tail: 0 }),
  // revtriArrow({ line: { width: 0.05 }, tail: 0.1 }),
  // revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  // revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  // revtriArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.1 }),
  // barbArrow({ barb: 0.05 }),
  // barbArrow({ barb: 0.05, tail: -0.02 }),
  // barbArrow({ barb: 0.05, tail: 0 }),
  // barbArrow({ barb: 0.05, tail: 0.05 }),
  // barbArrow({ barb: 0.05, line: { width: 0.05 } }),
  // barbArrow({ barb: 0.05, line: { width: 0.05 }, tail: -0.02 }),
  // barbArrow({ barb: 0.05, line: { width: 0.05 }, tail: 0 }),
  // barbArrow({ barb: 0.05, line: { width: 0.05 }, tail: 0.05 }),
  // barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] } }),
  // barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.02 }),
  // barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  // barbArrow({ barb: 0.05, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  // barbArrow({ barb: 0.15 }),
  // barbArrow({ barb: 0.15, tail: -0.02 }),
  // barbArrow({ barb: 0.15, tail: 0 }),
  // barbArrow({ barb: 0.15, tail: 0.05 }),
  // barbArrow({ barb: 0.15, line: { width: 0.05 } }),
  // barbArrow({ barb: 0.15, line: { width: 0.05 }, tail: -0.02 }),
  // barbArrow({ barb: 0.15, line: { width: 0.05 }, tail: 0 }),
  // barbArrow({ barb: 0.15, line: { width: 0.05 }, tail: 0.05 }),
  // barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] } }),
  // barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.02 }),
  // barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  // barbArrow({ barb: 0.15, line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  // polygonArrow(),
  // polygonArrow({ tail: -0.05 }),
  // polygonArrow({ tail: 0 }),
  // polygonArrow({ tail: 0.05 }),
  // polygonArrow({ line: { width: 0.05 } }),
  // polygonArrow({ line: { width: 0.05 }, tail: -0.05 }),
  // polygonArrow({ line: { width: 0.05 }, tail: 0 }),
  // polygonArrow({ line: { width: 0.05 }, tail: 0.05 }),
  // polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  // polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  // polygonArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  // barArrow(),
  // barArrow({ tail: -0.05 }),
  // barArrow({ tail: 0 }),
  // barArrow({ tail: 0.05 }),
  // barArrow({ line: { width: 0.05 } }),
  // barArrow({ line: { width: 0.05 }, tail: -0.05 }),
  // barArrow({ line: { width: 0.05 }, tail: 0 }),
  // barArrow({ line: { width: 0.05 }, tail: 0.05 }),
  // barArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // barArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  // barArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  // barArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  // lineArrow(),
  // lineArrow({ tail: -0.2 }),
  // lineArrow({ tail: -0.05 }),
  // lineArrow({ tail: 0 }),
  // lineArrow({ tail: 0.05 }),
  // lineArrow({ line: { width: 0.05 } }),
  // lineArrow({ line: { width: 0.05 }, tail: -0.2 }),
  // lineArrow({ line: { width: 0.05 }, tail: -0.05 }),
  // lineArrow({ line: { width: 0.05 }, tail: 0 }),
  // lineArrow({ line: { width: 0.05 }, tail: 0.05 }),
  // lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.2 }),
  // lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: -0.05 }),
  // lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0 }),
  // lineArrow({ line: { width: 0.02, dash: [0.03, 0.01] }, tail: 0.05 }),
  // makePolygon(),
  // makePolygon({ sides: 3 }),
  // makePolygon({ line: { width: 0.05 } }),
  // makePolygon({ line: { width: 0.05, widthIs: 'inside' } }),
  // makePolygon({ line: { width: 0.05 }, sides: 3 }),
  // makePolygon({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // makePolygon({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 3 }),
  // makeRectangle(),
  // makeRectangle({ corner: { radius: 0.1, sides: 3 }}),
  // makeRectangle({ line: { width: 0.05 } }),
  // makeRectangle({ line: { width: 0.05 }, corner: { radius: 0.1, sides: 3 }}),
  // makeRectangle({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // makeRectangle({ line: { width: 0.02, dash: [0.03, 0.01] }, corner: { radius: 0.1, sides: 3 }}),
  // makeTriangle({ width: 0.4, height: 0.3, top: 'left' }),
  // makeTriangle({ width: 0.4, height: 0.1, top: 'left' }),
  // makeTriangle({ width: 0.4, height: 0.3, top: 'left', line: { width: 0.05 } }),
  // makeTriangle({ width: 0.4, height: 0.1, top: 'left', line: { width: 0.05 } }),
  // makeTriangle({ width: 0.4, height: 0.3, top: 'left', line: { width: 0.02, dash: [0.03, 0.01] } }),
  // makeTriangle({ width: 0.4, height: 0.1, top: 'left', line: { width: 0.02, dash: [0.03, 0.01] } }),
  // makeStar(),
  // makeStar({ line: { width: 0.05 } }),
  // makeStar({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // makeStar({ sides: 10 }),
  // makeStar({ line: { width: 0.05 }, sides: 10 }),
  // makeStar({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 10 }),
  // makeStar({ sides: 15 }),
  // makeStar({ line: { width: 0.05 }, sides: 15 }),
  // makeStar({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 15 }),
  // makeEllipse(),
  // makeEllipse({ height: 0.1 }),
  // makeEllipse({ sides: 4 }),
  // makeEllipse({ height: 0.1, sides: 4 }),
  // makeEllipse({ line: { width: 0.05 } }),
  // makeEllipse({ line: { width: 0.05 }, height: 0.1 }),
  // makeEllipse({ line: { width: 0.05 }, sides: 4 }),
  // makeEllipse({ line: { width: 0.05 }, height: 0.1, sides: 4 }),
  // makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] } }),
  // makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] }, height: 0.1 }),
  // makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] }, sides: 4 }),
  // makeEllipse({ line: { width: 0.02, dash: [0.03, 0.01] }, height: 0.1, sides: 4 }),
  // makeLine(),
  // makeLine({
  //   arrow: {
  //     head: 'triangle',
  //     length: 0.1,
  //     width: 0.1,
  //   },
  //   widthIs: 'outside',
  // }),
  // makeLine({
  //   arrow: {
  //     head: 'triangle',
  //     length: 0.1,
  //     width: 0.1,
  //     tail: 0.05,
  //   },
  // }),
  // makePolyline(),
  // makePolyline({
  //   widthIs: 'outside',
  //   width: 0.07,
  //   arrow: {
  //     head: 'triangle',
  //     length: 0.1,
  //     width: 0.1,
  //   },
  //   cornerStyle: 'fill',
  //   // linePrimitives: true,
  //   // lineNum: 5,
  // }),
  // makePolyline({
  //   widthIs: 'outside',
  //   arrow: {
  //     head: 'triangle',
  //     length: 0.1,
  //     width: 0.1,
  //     tail: 0.05,
  //   },
  // }),
  // makePolyline({
  //   points: [[-0.4, 0], [0, 0], [-0.2, -0.1], [0.2, -0.1]],
  //   widthIs: 'mid',
  //   arrow: {
  //     head: 'triangle',
  //     length: 0.1,
  //     width: 0.1,
  //     tail: 0.05,
  //   },
  // }),
  // makeGrid(),
];
figure.add(arrows);

console.log(figure)
for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[`_${i}`];
  for (let j = 0; j < element.drawBorder.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      method: 'polyline',
      options: {
        points: element.drawBorder[j],
        width: 0.01,
        color: [0, 0.7, 0, 0.8],
        close: true,
        position: element.getPosition(),
      }, 
    })
  }
  for (let j = 0; j < element.drawBorderBuffer.length; j += 1) {
    figure.add({
      name: `buffer${i}${j}`,
      method: 'polyline',
      options: {
        points: element.drawBorderBuffer[j],
        width: 0.01,
        color: [0, 0, 1, 0.5],
        close: true,
        position: element.getPosition(),
      }, 
    })
  }
  // figure.add([
  //   {
  //     name: `buffer${i}`,
  //     method: 'polyline',
  //     options: {
  //       points: element.drawBorderBuffer[0],
  //       width: 0.01,
  //       color: [0, 0, 1, 0.5],
  //       close: true,
  //       position: element.getPosition(),
  //     },
  //   },
  //   {
  //     name: `border${i}`,
  //     method: 'polyline',
  //     options: {
  //       points: element.drawBorder[0],
  //       width: 0.01,
  //       color: [0, 0.7, 0, 0.8],
  //       close: true,
  //       position: element.getPosition(),
  //     },
  //   },
  // ]);
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
//       points: [[0, 0], [1, 0], [0.5, 0.02]],
//       width: 0.1,
//       widthIs: 'mid',
//       color: [1, 0, 0, 0.6],
//       cornerStyle: 'none',
//     },
//   },
//   {
//     name: 'border',
//     method: 'polyline',
//     options: {
//       width: 0.01,
//       color: [0, 0.6, 0, 1],
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
//         ppp.custom.updatePoints({ points: [[0, 0], [1, 0], t.t()] });
//         figure.getElement('border').custom.updatePoints({
//           points: ppp.drawBorder[0],
//         });
//       },
//     },
//   },
// ]);

figure.add({
  name: 'r',
  method: 'star',
  options: {
    // width: 1,
    // length: 1,
    drawBorderBuffer: 0.4,
    color: [1, 0, 0, 0.6],
    // tailWidth: 0.15,
    // head: 'barb',
    line: { width: 0.1, widthIs: 'mid' },
    // tail: -0.11,
    radius: 1,
    sides: 15,
  },
  mods: {
    isTouchable: true,
    onClick: () => console.log('touched'),
    touchBorder: 'buffer',
  },
});


// // console.log(Fig.round(figure.getElement('r').drawBorderBuffer, 3))
// // console.log(Fig.round(figure.getElement('r').drawBorder, 3))
// // console.log(Fig.round(figure.getElement('r').drawingObject.points))
// // console.log(Fig.round(figure.getElement('r').getBorder('draw', 'border')))
// console.log(figure.getElement('r'))
// // figure.getElement('r').custom.updatePoints({ width: 1.5, line: { width: 0.01 },height: 0.5, xAlign: 'left' });
// // console.log(Fig.round(figure.getElement('star').drawBorder))

const points = figure.getElement('r').drawBorderBuffer;
// // console.log(points)
// // // console.log(points[0])
figure.add([
  {
    name: 'buffer',
    method: 'polyline',
    options: {
      points: points[0],
      width: 0.01,
      color: [0, 0, 1, 1],
      close: true,
    },
  },
  {
    name: 'border',
    method: 'polyline',
    options: {
      points: figure.getElement('r').drawBorder[0],
      width: 0.01,
      color: [0, 1, 0, 1],
      close: true,
    },
  },
]);

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
