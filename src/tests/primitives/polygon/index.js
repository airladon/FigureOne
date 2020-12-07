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


// ***************************************************
// ***************************************************
// ***************************************************
const xValues = tools.math.range(-4, 4, 1);
const yValues = tools.math.range(4, -4, -1);
let index = 0;
const makeShape = (method, options, lineOptions = null) => {
  const x = xValues[index % xValues.length];
  const y = yValues[Math.floor(index / xValues.length)];
  const name = `_${index}`;
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
    method,
    options: tools.misc.joinObjects({}, {
      position: [x, y],
      line,
    }, options),
  };
};


const makePolygon = (options, lineOptions = null) => makeShape(
  'primitives.polygon',
  tools.misc.joinObjects({}, {
    radius: 0.2,
    sides: 3,
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.6],
  }, options),
  lineOptions,
);


const arrows = [
  makePolygon({ radius: 0.3 }),
  makePolygon({ radius: 0.3 }, {}),
  makePolygon({ rotation: Math.PI / 2 }),
  makePolygon({ rotation: Math.PI / 2 }, {}),
  makePolygon({ offset: [0.1, 0.1] }),
  makePolygon({ offset: [0.1, 0.1] }, {}),

  // line specific
  makePolygon({}, { widthIs: 'inside' }),
  makePolygon({}, { widthIs: 'mid' }),
  makePolygon({}, { widthIs: 'outside' }),
  makePolygon({}, { cornerStyle: 'none' }),
  makePolygon({}, { cornerStyle: 'fill' }),
  makePolygon({}, { cornerStyle: 'radius', cornerSides: 2, cornerSize: 0.05 }),

  // dash
  makePolygon({}, { widthIs: 'inside', dash: [0.03, 0.02] }),
  makePolygon({}, { widthIs: 'mid', dash: [0.03, 0.02] }),
  makePolygon({}, { widthIs: 'outside', dash: [0.03, 0.02] }),
  makePolygon({}, { cornerStyle: 'none', dash: [0.03, 0.02] }),
  makePolygon({}, { cornerStyle: 'fill', dash: [0.03, 0.02] }),
  makePolygon({}, {
    cornerStyle: 'radius', cornerSides: 2, dash: [0.03, 0.02], cornerSize: 0.05,
  }),

  // Angle to draws
  makePolygon({ sides: 40, sidesToDraw: 10 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 0.5 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 1 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 1.5 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 2 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 2.5 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 3 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 3.5 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 4 }),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 0.5 }, {}),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 1 }, {}),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 1.5 }, {}),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 2 }, {}),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 2.5 }, {}),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 3 }, {}),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 3.5 }, {}),
  makePolygon({ sides: 40, angleToDraw: Math.PI / 2 * 4 }, {}),

  // Line Primitives
  makePolygon({}, { linePrimitives: true, lineNum: 5 }),
  makePolygon({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'none' }),
  makePolygon({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'fill' }),

  // Corners Only
  makePolygon({}, { cornersOnly: true, cornerLength: 0.1 }),
];
figure.add(arrows);

for (let i = 0; i < index; i += 1) {
  const element = figure.elements.elements[`_${i}`];
  for (let j = 0; j < element.drawBorder.length; j += 1) {
    figure.add({
      name: `border${i}${j}`,
      method: 'polyline',
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
      method: 'polyline',
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
