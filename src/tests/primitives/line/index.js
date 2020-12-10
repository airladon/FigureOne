// eslint-disable-next-line no-undef
const { Figure } = Fig;

const figure = new Figure({
  limits: [-4.5, -4.5, 9, 9],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
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
      line: { width: 0.004 },
    },
  },
]);


// // ***************************************************
// // ***************************************************
// // ***************************************************
// const xValues = tools.math.range(-4, 3.5, 1);
// const yValues = tools.math.range(3.5, -3.5, -1);
// let index = 0;
// const makeShape = (method, options, mods) => {
//   const x = xValues[index % xValues.length];
//   const y = yValues[Math.floor(index / xValues.length)];
//   const name = `_${index}`;
//   index += 1;
//   return {
//     name,
//     method,
//     options: tools.misc.joinObjects({}, {
//       position: [x, y],
//     }, options),
//     mods: tools.misc.joinObjects({}, {
//       isTouchable: true,
//       onClick: () => tools.misc.Console(name),
//     }, mods),
//   };
// };

// const makeLine = (options, mods = {}) => makeShape(
//   'primitives.line',
//   tools.misc.joinObjects({}, {
//     p1: [0, 0],
//     p2: [0.3, 0],
//     width: 0.05,
//     drawBorderBuffer: 0.05,
//     color: [1, 0, 0, 0.6],
//     touchBorder: 'buffer',
//   }, options),
//   mods,
// );

// /* eslint-disable object-curly-newline */
// const shapes = [
//   // Updater
//   makeLine(),

//   // Definitions
//   makeLine({ p1: [0, 0], p2: [0.3, 0.3] }),
//   makeLine({ p1: [0, 0], length: 0.3, angle: Math.PI / 4 }),
//   makeLine({ p1: [0, 0], p2: [0.3, 0], length: 0.3, angle: Math.PI / 4 }),

//   // DrawBorder
//   makeLine({ drawBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.2], [-0.1, 0.2]] }),

//   // DrawBorderBuffer
//   makeLine({ drawBorderBuffer: 0.2 }),
//   makeLine({ drawBorderBuffer: 0 }),
//   makeLine({ drawBorderBuffer: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.2], [-0.1, 0.2]] }),

//   // border
//   makeLine({ border: 'draw' }),
//   makeLine({ border: 'buffer', touchBorder: 0.1 }),
//   makeLine({ border: 'rect' }),
//   makeLine({ border: 0.1 }),
//   makeLine({ border: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
//   makeLine({
//     border: [
//       [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
//       [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
//     ],
//   }),

//   // touchBorder
//   makeLine({ touchBorder: 'draw', border: 0.1 }),
//   makeLine({ touchBorder: 'buffer' }),
//   makeLine({ touchBorder: 'rect' }),
//   makeLine({ touchBorder: 0.1 }),
//   makeLine({ touchBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
//   makeLine({
//     touchBorder: [
//       [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
//       [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
//     ],
//   }),
//   makeLine({ touchBorder: 'border', border: 0.1 }),

//   // Dash
//   makeLine({ dash: [0.05, 0.02] }),
//   makeLine({ dash: [0.025, 0.05, 0.02] }),
//   makeLine({ dash: [0.05, 0.02], widthIs: 'negative' }),
//   makeLine({ dash: [0.05, 0.02], widthIs: 'positive' }),
//   makeLine({ dash: [0.05, 0.02], widthIs: 0.3 }),

//   // WidthIs
//   makeLine({ widthIs: 'mid' }),
//   makeLine({ widthIs: 'positive' }),
//   makeLine({ widthIs: 'negative' }),
//   makeLine({ widthIs: 0.3 }),

//   // // // Arrow
//   makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'triangle' }),
//   makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'barb' }),
//   makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'reverseTriangle' }),
//   makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'polygon' }),
//   makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'circle' }),
//   makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'bar' }),
//   makeLine({ p2: [0.6, 0], width: 0.025, arrow: 'line' }),

//   // Line Primitives
//   makeLine({ linePrimitives: true, lineNum: 5 }),
//   makeLine({ linePrimitives: true, lineNum: 5, close: true }),
// ];
figure.add(shapes);
figure.getElement('_0').custom.updatePoints({ p2: [0, 0.3] });

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

