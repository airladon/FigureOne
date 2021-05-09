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

const makeEllipse = (options, lineOptions = null) => makeShape(
  'primitives.ellipse',
  tools.misc.joinObjects({}, {
    width: 0.6,
    height: 0.4,
    sides: 20,
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.6],
  }, options),
  lineOptions,
);

/* eslint-disable object-curly-newline */
const arrows = [
  // Definitions
  makeEllipse({ height: 0.3, width: 0.2 }),
  makeEllipse({ height: 0.3, width: 0.2, sides: 4 }),
  makeEllipse({ height: 0.1, width: 0.6 }),

  // Line specific
  makeEllipse({}, { widthIs: 'inside' }),
  makeEllipse({}, { widthIs: 'mid' }),
  makeEllipse({}, { widthIs: 'outside' }),
  makeEllipse({ height: 0.1, width: 0.6 }, {}),

  // Alignment
  makeEllipse({ xAlign: 'left', yAlign: 'bottom' }),
  makeEllipse({ xAlign: 'center', yAlign: 'middle' }),
  makeEllipse({ xAlign: 'right', yAlign: 'top' }),
  makeEllipse({ xAlign: 0.2, yAlign: 0.2 }),

  // Alignment line
  makeEllipse({ xAlign: 'left', yAlign: 'bottom' }, { widthIs: 'mid' }),
  makeEllipse({ xAlign: 'center', yAlign: 'middle' }, { widthIs: 'mid' }),
  makeEllipse({ xAlign: 0.2, yAlign: 0.2 }, { widthIs: 'mid' }),
  makeEllipse({ xAlign: 'right', yAlign: 'top' }, { widthIs: 'mid' }),
  makeEllipse({ xAlign: 'right', yAlign: 'top' }, { widthIs: 'inside' }),
  makeEllipse({ xAlign: 'right', yAlign: 'top' }, { widthIs: 'outside' }),


  // Corner
  makeEllipse({}, { cornerStyle: 'none' }),
  makeEllipse({}, { cornerStyle: 'fill' }),


  // dash
  makeEllipse({}, { dash: [0.03, 0.02], widthIs: 'inside' }),
  makeEllipse({}, { dash: [0.03, 0.02], widthIs: 'mid' }),
  makeEllipse({}, { dash: [0.03, 0.02], widthIs: 'outside' }),

  // Line Primitives
  makeEllipse({}, { linePrimitives: true, lineNum: 5, widthIs: 'inside' }),
  makeEllipse({}, { linePrimitives: true, lineNum: 5, widthIs: 'mid' }),
  makeEllipse({}, { linePrimitives: true, lineNum: 5, widthIs: 'outside' }),
  makeEllipse({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'none' }),
  makeEllipse({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'fill' }),
  makeEllipse({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'auto' }),
];
figure.add(arrows);

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
