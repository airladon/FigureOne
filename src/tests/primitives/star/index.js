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

const makeStar = (options, lineOptions = null) => makeShape(
  'primitives.star',
  tools.misc.joinObjects({}, {
    radius: 0.2,
    innerRadius: 0.1,
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.6],
  }, options),
  lineOptions,
);

/* eslint-disable object-curly-newline */
const arrows = [
  // Definitions
  makeStar({ radius: 0.3, innerRadius: 0.05, sides: 3 }),
  makeStar({ radius: 0.3, innerRadius: 0.1, sides: 5 }),
  makeStar({ radius: 0.3, innerRadius: 0.2, sides: 9 }),
  makeStar({ radius: 0.3, innerRadius: 0.1, sides: 15 }),
  makeStar({ radius: 0.3, innerRadius: 0.05, sides: 3 }, {}),
  makeStar({ radius: 0.3, innerRadius: 0.1, sides: 5 }, {}),
  makeStar({ radius: 0.3, innerRadius: 0.2, sides: 9 }, {}),
  makeStar({ radius: 0.3, innerRadius: 0.1, sides: 15 }, {}),

  // Offset
  makeStar({ offset: [0.1, 0] }),

  // Line specific
  makeStar({}, { widthIs: 'inside' }),
  makeStar({}, { widthIs: 'mid' }),
  makeStar({}, { widthIs: 'outside' }),
  makeStar({}, { widthIs: 0.2 }),

  // Corner
  makeStar({}, { cornerStyle: 'none' }),
  makeStar({}, { cornerStyle: 'fill' }),


  // dash
  makeStar({}, { dash: [0.03, 0.02], widthIs: 'inside' }),
  makeStar({}, { dash: [0.03, 0.02], widthIs: 'mid' }),
  makeStar({}, { dash: [0.03, 0.02], widthIs: 'outside' }),
  makeStar({}, { dash: [0.03, 0.02], widthIs: 'outside', cornerStyle: 'fill' }),
  makeStar({}, { width: 0.02, dash: [0.03, 0.02], widthIs: 'outside' }),

  // Line Primitives
  makeStar({}, { linePrimitives: true, lineNum: 5, widthIs: 'inside' }),
  makeStar({}, { linePrimitives: true, lineNum: 5, widthIs: 'mid' }),
  makeStar({}, { linePrimitives: true, lineNum: 5, widthIs: 'outside' }),
  makeStar({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'none' }),
  makeStar({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'fill' }),
  makeStar({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'auto' }),
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
