// eslint-disable-next-line no-undef
const { Figure, tools } = Fig;

const figure = new Figure({
  limits: [-4.5, -13.5 / 2, 9, 13.5],
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
      bounds: [-4.5, -13.5 / 2, 9, 13.5],
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
      bounds: [-4.5, -13.5 / 2, 9, 13.5],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.004 },
    },
  },
]);


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 3.5, 1);
const yValues = tools.math.range(5.75, -6.75, -1);
let index = 0;
const makeShape = (method, options, mods) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  index += 1;
  return {
    name,
    method,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(name),
    }, mods),
  };
};

const makePolyline = (options, mods = {}) => makeShape(
  'primitives.polyline',
  tools.misc.joinObjects({}, {
    points: [[0, 0], [0.5, 0], [0, 0.5]],
    width: 0.05,
    drawBorderBuffer: 0.05,
    color: [1, 0, 0, 0.6],
    touchBorder: 'buffer',
  }, options),
  mods,
);

/* eslint-disable object-curly-newline */
const arrows = [
  // Definitions
  makePolyline(),
  makePolyline({ close: true, drawBorder: 'line' }),
  makePolyline({ close: true, drawBorder: 'negative' }),
  makePolyline({ close: true, drawBorder: 'positive' }),

  // DrawBorder
  makePolyline({ drawBorder: 'line' }),
  makePolyline({ drawBorder: 'negative' }),
  makePolyline({ drawBorder: 'positive' }),
  makePolyline({ drawBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),

  // DrawBorderBuffer
  makePolyline({ drawBorder: 'line', drawBorderBuffer: 0.2 }),
  makePolyline({ drawBorder: 'line', drawBorderBuffer: 0 }),
  makePolyline({
    drawBorder: 'line',
    drawBorderBuffer: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
  }),
  makePolyline({
    drawBorder: 'line',
    drawBorderBuffer: [[[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]]],
  }),
  makePolyline({
    drawBorder: 'line',
    drawBorderBuffer: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),

  // border
  makePolyline({ border: 'draw' }),
  makePolyline({ border: 'buffer', touchBorder: 0.1 }),
  makePolyline({ border: 'rect' }),
  makePolyline({ border: 0.1 }),
  makePolyline({ border: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makePolyline({
    border: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),

  // touchBorder
  makePolyline({ touchBorder: 'draw', border: 0.1 }),
  makePolyline({ touchBorder: 'buffer' }),
  makePolyline({ touchBorder: 'rect' }),
  makePolyline({ touchBorder: 0.1 }),
  makePolyline({ touchBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
  makePolyline({
    touchBorder: [
      [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
      [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
    ],
  }),
  makePolyline({ touchBorder: 'border', border: 0.1 }),

  // Corner Style
  makePolyline({ cornerStyle: 'none' }),
  makePolyline({ cornerStyle: 'auto' }),
  makePolyline({ cornerStyle: 'fill' }),
  makePolyline({ cornerStyle: 'radius', cornerSize: 0.1, cornerSides: 3 }),
  makePolyline({ cornerStyle: 'none', close: true }),
  makePolyline({ cornerStyle: 'auto', close: true }),
  makePolyline({ cornerStyle: 'fill', close: true }),
  makePolyline({ cornerStyle: 'radius', cornerSize: 0.1, cornerSides: 3, close: true }),

  // Corners Only
  makePolyline({ cornersOnly: 'true', cornerLength: 0.15, close: true }),

  // Min Auto Corner Angle
  makePolyline({
    points: [[0, 0], [0.5, 0], [0, 0.5]],
    minAutoCornerAngle: Math.PI / 6,
  }),
  makePolyline({
    points: [[0, 0], [0.5, 0], [0, 0.2]],
    minAutoCornerAngle: Math.PI / 6,
  }),

  // Dash
  makePolyline({ dash: [0.05, 0.02] }),
  makePolyline({ dash: [0.05, 0.02], close: true }),
  makePolyline({
    points: [[0, 0], [0.5, 0]],
    dash: [0.05, 0.05],
  }),
  makePolyline({
    points: [[0, 0], [0.5, 0]],
    dash: [0.025, 0.05, 0.05],
  }),

  // WidthIs
  makePolyline({ widthIs: 'mid' }),
  makePolyline({ widthIs: 'positive' }),
  makePolyline({ widthIs: 'negative' }),
  makePolyline({ widthIs: 'mid', close: true }),
  makePolyline({ widthIs: 'positive', close: true }),
  makePolyline({ widthIs: 'negative', close: true }),
  makePolyline({ widthIs: 0.3 }),
  makePolyline({ widthIs: 0.3, close: true }),
  makePolyline({ points: [[0, 0], [0.5, 0], [0, 0.5]], widthIs: 'inside' }),
  makePolyline({ points: [[0, 0.5], [0.5, 0], [0, 0]], widthIs: 'inside' }),
  makePolyline({
    points: [[0, 0], [0.5, 0], [0, 0.5]],
    widthIs: 'inside',
    close: true,
  }),
  makePolyline({
    points: [[0, 0.5], [0.5, 0], [0, 0]],
    widthIs: 'inside',
    close: true,
  }),

  makePolyline({ points: [[0, 0], [0.5, 0], [0, 0.5]], widthIs: 'outside' }),
  makePolyline({ points: [[0, 0.5], [0.5, 0], [0, 0]], widthIs: 'outside' }),
  makePolyline({
    points: [[0, 0], [0.5, 0], [0, 0.5]],
    widthIs: 'outside',
    close: true,
  }),
  makePolyline({
    points: [[0, 0.5], [0.5, 0], [0, 0]],
    widthIs: 'outside',
    close: true,
  }),

  // // Arrow
  makePolyline({ width: 0.025, arrow: 'triangle' }),
  makePolyline({ width: 0.025, arrow: 'barb' }),
  makePolyline({ width: 0.025, arrow: 'reverseTriangle' }),
  makePolyline({ width: 0.025, arrow: 'polygon' }),
  makePolyline({ width: 0.025, arrow: 'circle' }),
  makePolyline({ width: 0.025, arrow: 'bar' }),
  makePolyline({ width: 0.025, arrow: 'line' }),


  makePolyline({ width: 0.025, arrow: { head: 'triangle', tail: false } }),
  makePolyline({ width: 0.025, arrow: { head: 'barb', tail: false } }),
  makePolyline({ width: 0.025, arrow: { head: 'reverseTriangle', tail: false } }),
  makePolyline({ width: 0.025, arrow: { head: 'polygon', tail: false } }),
  makePolyline({ width: 0.025, arrow: { head: 'circle', tail: false } }),
  makePolyline({ width: 0.025, arrow: { head: 'bar', tail: false } }),
  makePolyline({ width: 0.025, arrow: { head: 'line', tail: false } }),


  makePolyline({ arrow: { head: 'triangle', scale: 0.5 } }),
  makePolyline({ arrow: { head: 'barb', scale: 0.5 } }),
  makePolyline({ arrow: { head: 'reverseTriangle', scale: 0.5 } }),
  makePolyline({ arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'mid' } }),
  makePolyline({ arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'mid', tail: false } }),
  makePolyline({ arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'tip', tail: 0.1 } }),
  makePolyline({ arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'mid', tail: 0.1 } }),
  makePolyline({ arrow: { head: 'circle', scale: 0.5 } }),
  makePolyline({ arrow: { head: 'bar', align: 'tip' } }),
  makePolyline({ arrow: { head: 'bar', align: 'mid' } }),
  makePolyline({ arrow: { head: 'bar', align: 'mid', scale: 0.5 } }),
  makePolyline({ arrow: { head: 'line', scale: 0.6 } }),


  makePolyline({ arrow: { start: 'triangle', end: 'reverseTriangle', scale: 0.5 } }),

  makePolyline({ arrow: {
    start: { head: 'triangle', length: 0.2 },
    end: { head: 'reverseTriangle', length: 0.1 },
    scale: 0.5,
  } }),

  // Line Primitives
  makePolyline({ linePrimitives: true, lineNum: 5 }),
  makePolyline({ linePrimitives: true, lineNum: 5, close: true }),

  // Special case inside
  makePolyline({
    points: [[0, 0], [1, 0], [0.5, 0.1]],
    widthIs: 'inside',
    close: true,
  }),
];
figure.add(arrows);

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[`_${i}`];
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

