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

const makeRectangle = (options, lineOptions = null) => makeShape(
  'primitives.rectangle',
  tools.misc.joinObjects({}, {
    width: 0.6,
    height: 0.4,
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.6],
  }, options),
  lineOptions,
);


const arrows = [
  // Width and Height
  makeRectangle({ width: 0.3, height: 0.6 }),
  makeRectangle({ width: 0.3, height: 0.6 }, {}),

  // Line specific
  makeRectangle({}, { widthIs: 'inside' }),
  makeRectangle({}, { widthIs: 'mid' }),
  makeRectangle({}, { widthIs: 'outside' }),

  // Alignment
  makeRectangle({ xAlign: 'left', width: 0.4, height: 0.2 }),
  makeRectangle({ xAlign: 0.2, width: 0.4, height: 0.2 }),
  makeRectangle({ xAlign: 'center', width: 0.4, height: 0.2 }),
  makeRectangle({ xAlign: 'right', width: 0.4, height: 0.2 }),
  makeRectangle({ yAlign: 'bottom', width: 0.4, height: 0.2 }),
  makeRectangle({ yAlign: 0.2, width: 0.4, height: 0.2 }),
  makeRectangle({ yAlign: 'middle', width: 0.4, height: 0.2 }),
  makeRectangle({ yAlign: 'top', width: 0.4, height: 0.2 }),

  // Alignment bottom, left line
  makeRectangle({
    xAlign: 'left', yAlign: 'bottom', width: 0.3, height: 0.2,
  }, { widthIs: 'inside' }),
  makeRectangle({
    xAlign: 'left', yAlign: 'bottom', width: 0.3, height: 0.2,
  }, { widthIs: 'mid' }),
  makeRectangle({
    xAlign: 'left', yAlign: 'bottom', width: 0.3, height: 0.2,
  }, { widthIs: 'outside' }),

  // Alignment top right line
  makeRectangle({
    xAlign: 'right', yAlign: 'top', width: 0.3, height: 0.2,
  }, { widthIs: 'inside' }),
  makeRectangle({
    xAlign: 'right', yAlign: 'top', width: 0.3, height: 0.2,
  }, { widthIs: 'mid' }),
  makeRectangle({
    xAlign: 'right', yAlign: 'top', width: 0.3, height: 0.2,
  }, { widthIs: 'outside' }),

  // Corner
  makeRectangle({ corner: { style: 'radius', radius: 0.1, sides: 3 } }),
  makeRectangle({ corner: { style: 'radius', radius: 0.1, sides: 3 } }, {}),

  // dash
  makeRectangle({}, { widthIs: 'inside', dash: [0.03, 0.02] }),
  makeRectangle({}, { widthIs: 'mid', dash: [0.03, 0.02] }),
  makeRectangle({}, { widthIs: 'outside', dash: [0.03, 0.02] }),
  makeRectangle({ corner: { style: 'radius', radius: 0.1, sides: 3 } }, { widthIs: 'inside', dash: [0.03, 0.02] }),
  makeRectangle({ corner: { style: 'radius', radius: 0.1, sides: 3 } }, { widthIs: 'mid', dash: [0.03, 0.02] }),
  makeRectangle({ corner: { style: 'radius', radius: 0.1, sides: 3 } }, { widthIs: 'outside', dash: [0.03, 0.02] }),

  // Line Primitives
  makeRectangle({}, { linePrimitives: true, lineNum: 5 }),
  makeRectangle({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'none' }),
  makeRectangle({}, { linePrimitives: true, lineNum: 5, cornerStyle: 'fill' }),

  // Corners Only
  makeRectangle({}, { cornersOnly: true, cornerLength: 0.1 }),
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
