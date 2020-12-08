// eslint-disable-next-line no-undef
const { Figure, tools } = Fig;

const figure = new Figure({
  limits: [-4.5, -9, 9, 18],
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
      bounds: [-4.5, -9, 9, 18],
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
      bounds: [-4.5, -9, 9, 18],
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
const yValues = tools.math.range(8.5, -8.5, -1);
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

const makeArrow = (options, lineOptions = null) => makeShape(
  'primitives.arrow',
  tools.misc.joinObjects({}, {
    width: 0.4,
    length: 0.4,
    sides: 6,
    radius: 0.2,
    drawBorderBuffer: 0.1,
    color: [1, 0, 0, 0.6],
    tailWidth: 0.15,
  }, options),
  lineOptions,
);

// const makeArrow = (...options) => {
//   return makeShape(
//     'primitives.arrow',
//     Fig.tools.misc.joinObjects({}, {
//       width: 0.35,
//       length: 0.35,
//       drawBorderBuffer: 0.1,
//       color: [1, 0, 0, 0.6],
//       tailWidth: 0.15,
//     }, ...options),
//   );
// }

const triArrow = (options = {}, lineOptions = null) => makeArrow(
  tools.misc.joinObjects({}, { head: 'triangle' }, options), lineOptions,
);
const revtriArrow = (options = {}, lineOptions = null) => makeArrow(
  tools.misc.joinObjects({}, { head: 'reverseTriangle' }, options), lineOptions,
);
const barbArrow = (options = {}, lineOptions = null) => makeArrow(
  tools.misc.joinObjects({}, { head: 'barb' }, options), lineOptions,
);
const polygonArrow = (options = {}, lineOptions = null) => makeArrow(
  tools.misc.joinObjects({}, { head: 'polygon' }, options), lineOptions,
);
const barArrow = (options = {}, lineOptions = null) => makeArrow(
  tools.misc.joinObjects({}, { head: 'bar', length: 0.1 }, options), lineOptions,
);
const lineArrow = (options = {}, lineOptions = null) => makeArrow(
  tools.misc.joinObjects({}, { head: 'line', tailWidth: 0.05 }, options), lineOptions,
);

/* eslint-disable object-curly-newline */
const arrows = [
  // Triangle Arrow
  triArrow(),
  triArrow({ length: 0.6, width: 0.2 }),
  triArrow({ tail: -0.1 }),
  triArrow({ tail: 0 }),
  triArrow({ tail: 0.1 }),
  triArrow({}, { width: 0.05 }),
  triArrow({ tail: -0.1 }, { width: 0.05 }),
  triArrow({ tail: 0 }, { width: 0.05 }),
  triArrow({ tail: 0.1 }, { width: 0.05 }),
  triArrow({}, { width: 0.02, dash: [0.03, 0.01] }),
  triArrow({ tail: -0.1 }, { width: 0.02, dash: [0.03, 0.01] }),
  triArrow({ tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
  triArrow({ tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

  triArrow({ align: 'start', tail: 0.1 }),
  triArrow({ align: 'tail', tail: 0.1 }),
  triArrow({ align: 'mid', tail: 0.1 }),
  triArrow({ align: 'tip', tail: 0.1 }),

  triArrow({ angle: Math.PI / 2, align: 'mid', tail: 0.1 }),
  triArrow({ angle: Math.PI / 2, align: 'tip', tail: 0.1 }),

  triArrow({ tail: 0 }, { widthIs: 'inside' }),
  triArrow({ tail: 0 }, { widthIs: 'outside' }),
  triArrow({ tail: 0.1 }, { widthIs: 'inside' }),
  triArrow({ tail: 0.1 }, { widthIs: 'outside' }),
  triArrow({ tail: 0 }, { widthIs: 'inside', dash: [0.03, 0.02] }),
  triArrow({ tail: 0 }, { widthIs: 'outside', dash: [0.03, 0.02] }),
  triArrow({ tail: 0.1 }, { widthIs: 'inside', dash: [0.03, 0.02] }),
  triArrow({ tail: 0.1 }, { widthIs: 'outside', dash: [0.03, 0.02] }),

  // Barb Arrow
  barbArrow(),
  barbArrow({ length: 0.6, width: 0.2 }),
  barbArrow({ tail: -0.05 }),
  barbArrow({ tail: 0 }),
  barbArrow({ tail: 0.1 }),
  barbArrow({}, { width: 0.05 }),
  barbArrow({ tail: -0.05 }, { width: 0.05 }),
  barbArrow({ tail: 0 }, { width: 0.05 }),
  barbArrow({ tail: 0.1 }, { width: 0.05 }),
  barbArrow({}, { width: 0.02, dash: [0.03, 0.01] }),
  barbArrow({ tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
  barbArrow({ tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
  barbArrow({ tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

  barbArrow({ align: 'start', tail: -0.05 }),
  barbArrow({ align: 'tail', tail: -0.05 }),
  barbArrow({ align: 'mid', tail: -0.05 }),
  barbArrow({ align: 'tip', tail: -0.05 }),

  barbArrow({ tail: 0 }, { widthIs: 'inside' }),
  barbArrow({ tail: 0, align: 'mid' }, { widthIs: 'outside' }),
  barbArrow({ tail: 0.1 }, { widthIs: 'inside' }),
  barbArrow({ tail: 0.1 }, { widthIs: 'outside' }),

  // Reverse Triangle Arrow
  revtriArrow(),
  revtriArrow({ tail: -0.05 }),
  revtriArrow({ tail: 0 }),
  revtriArrow({ tail: 0.1 }),
  revtriArrow({}, {}),
  revtriArrow({ tail: -0.05 }, {}),
  revtriArrow({ tail: 0 }, {}),
  revtriArrow({ tail: 0.1 }, {}),
  revtriArrow({}, { width: 0.02, dash: [0.03, 0.01] }),
  revtriArrow({ tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
  revtriArrow({ tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
  revtriArrow({ tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

  revtriArrow({ align: 'start', tail: -0.05 }),
  revtriArrow({ align: 'tail', tail: -0.05 }),
  revtriArrow({ align: 'mid', tail: -0.05 }),
  revtriArrow({ align: 'tip', tail: -0.05 }),

  revtriArrow({}, { widthIs: 'inside' }),
  revtriArrow({}, { widthIs: 'outside' }),
  revtriArrow({ tail: 0.1 }, { widthIs: 'inside' }),
  revtriArrow({ tail: 0.1 }, { widthIs: 'outside' }),

  // Line Arrow
  lineArrow(),
  lineArrow({ tail: -0.05 }),
  lineArrow({ tail: 0 }),
  lineArrow({ tail: 0.1 }),
  lineArrow({ tailWidth: 0.1 }, {}),
  lineArrow({ tailWidth: 0.1, tail: -0.05 }, {}),
  lineArrow({ tailWidth: 0.1, tail: 0 }, {}),
  lineArrow({ tailWidth: 0.1, tail: 0.1 }, {}),
  lineArrow({ tailWidth: 0.1 }, { width: 0.02, dash: [0.03, 0.02] }),
  lineArrow({ tailWidth: 0.1, tail: -0.05 }, { width: 0.02, dash: [0.03, 0.02] }),
  lineArrow({ tailWidth: 0.1, tail: 0 }, { width: 0.02, dash: [0.03, 0.02] }),
  lineArrow({ tailWidth: 0.1, tail: 0.1 }, { width: 0.02, dash: [0.03, 0.02] }),

  lineArrow({ align: 'start', tail: -0.05 }),
  lineArrow({ align: 'tail', tail: -0.05 }),
  lineArrow({ align: 'mid', tail: -0.05 }),
  lineArrow({ align: 'tip', tail: -0.05 }),

  lineArrow({ tailWidth: 0.1, tail: -0.05 }, { width: 0.04, widthIs: 'inside' }),
  lineArrow({ tailWidth: 0.1, tail: -0.05 }, { width: 0.04, widthIs: 'outside' }),
  lineArrow({ tailWidth: 0.1, tail: 0 }, { width: 0.04, widthIs: 'inside' }),
  lineArrow({ tailWidth: 0.1, tail: 0 }, { width: 0.04, widthIs: 'outside' }),

  // Polygon Arrow
  polygonArrow({ radius: 0.3, sides: 4 }),
  polygonArrow(),
  polygonArrow({ tail: -0.05 }),
  polygonArrow({ tail: 0 }),
  polygonArrow({ tail: 0.1 }),
  polygonArrow({}, {}),
  polygonArrow({ tail: -0.05 }, {}),
  polygonArrow({ tail: 0 }, {}),
  polygonArrow({ tail: 0.1 }, {}),
  polygonArrow({}, { width: 0.02, dash: [0.03, 0.01] }),
  polygonArrow({ tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
  polygonArrow({ tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
  polygonArrow({ tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

  polygonArrow({ align: 'start', tail: -0.05 }),
  polygonArrow({ align: 'tail', tail: -0.05 }),
  polygonArrow({ align: 'mid', tail: -0.05 }),
  polygonArrow({ align: 'tip', tail: -0.05 }),

  polygonArrow({}, { widthIs: 'inside' }),
  polygonArrow({}, { widthIs: 'outside' }),
  polygonArrow({ tail: 0.1 }, { widthIs: 'inside' }),
  polygonArrow({ tail: 0.1 }, { widthIs: 'outside' }),

  // Bar Arrow
  barArrow({ radius: 0.3, sides: 4 }),
  barArrow(),
  barArrow({ tail: -0.05 }),
  barArrow({ tail: 0 }),
  barArrow({ tail: 0.05 }),
  barArrow({}, { width: 0.02, dash: [0.03, 0.01] }),
  barArrow({ tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
  barArrow({ tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
  barArrow({ tail: 0.05 }, { width: 0.02, dash: [0.03, 0.01] }),

  barArrow({ align: 'start', tail: 0.05 }),
  barArrow({ align: 'tail', tail: 0.05 }),
  barArrow({ align: 'mid', tail: 0.05 }),
  barArrow({ align: 'tip', tail: 0.05 }),
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
