// eslint-disable-next-line no-undef
const { Figure, tools } = Fig;

const figure = new Figure({
  limits: [-4.5, -4.5, 9, 9],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});

figure.add([
  {
    name: 'origin',
    make: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1],
    },
  },
  {
    name: 'grid',
    make: 'grid',
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
    make: 'grid',
    options: {
      bounds: [-4.5, -4.5, 9, 9],
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
const xValues = tools.math.range(-4, 4, 1);
const yValues = tools.math.range(4, -4, -1);
let index = 0;
const makeShape = (description, make, options, lineOptions = null) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
  const indexName = `${index}`;
  index += 1;
  let line;
  if (lineOptions != null) {
    line = tools.misc.joinObjects({}, {
      width: 0.05,
      widthIs: 'mid',
    }, lineOptions);
  }
  return {
    name,
    make,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
      line,
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${description}`),
    }),
  };
};

const makeArc = (description, options, lineOptions = null) => makeShape(
  description,
  'primitives.arc',
  tools.misc.joinObjects({}, {
    radius: 0.4,
    sides: 6,
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.6],
    angle: Math.PI / 3 * 2,
  }, options),
  lineOptions,
);

/* eslint-disable object-curly-newline */
const arcs = [
  // Definitions
  makeArc('default'),
  makeArc('_1_3pi', { angle: Math.PI / 3 }),
  makeArc('_4_3pi', { angle: Math.PI / 3 * 4 }),
  makeArc('_2pi', { angle: Math.PI * 2 }),
  makeArc('sides', { angle: Math.PI / 3 * 4, sides: 10 }),
  makeArc('startAngle', { startAngle: Math.PI / 3 }),
  makeArc('fillCenter', { fillCenter: true }),
  makeArc('offset', { offset: [0.1, 0.1] }),
  makeArc('border', { drawBorderBuffer: 0.05 }),
  makeArc('negative', { angle: -1 }),

  makeArc('line 1_3pi', { angle: Math.PI / 3 }, {}),
  makeArc('line 4_3pi', { angle: Math.PI / 3 * 4 }, {}),
  makeArc('line 2pi', { angle: Math.PI * 2 }, {}),
  makeArc('line sides', { angle: Math.PI / 3 * 4, sides: 10 }, {}),
  makeArc('line startAngle', { startAngle: Math.PI / 3 }, {}),
  makeArc('line offset', { offset: [0.1, 0.1] }, {}),
  makeArc('line negative', { angle: -1 }, {}),

  makeArc('inside', {}, { widthIs: 'inside' }),
  makeArc('outside', {}, { widthIs: 'outside' }),
  makeArc('mid', {}, { widthIs: 'mid' }),
];
figure.add(arcs);

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[`_${i}`];
  for (let j = 0; j < element.drawBorder.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      make: 'polyline',
      options: {
        points: element.drawBorder[j],
        width: 0.01,
        color: [0, 0.7, 0, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
  for (let j = 0; j < element.drawBorderBuffer.length; j += 1) {
    figure.add({
      name: `buffer${i}${j}`,
      make: 'polyline',
      options: {
        points: element.drawBorderBuffer[j],
        width: 0.01,
        color: [0, 0, 1, 1],
        close: true,
        position: element.getPosition(),
      },
    });
  }
}
