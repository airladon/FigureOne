figure.add([
  {
    name: '__minorGrid',
    method: 'primitives.grid',
    options: {
      position: [0, 0],
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.002 },
      xStep: 0.1,
      yStep: 0.1,
      bounds: figure.limits._dup()
    },
  },
  {
    name: '__majorGrid',
    method: 'primitives.grid',
    options: {
      position: [0, 0],
      color: [0.9, 0.9, 0.9, 1],
      line: { width: 0.005 },
      xStep: 0.5,
      yStep: 0.5,
      bounds: figure.limits._dup()
    },
  },
]);
figure.elements.toBack(['__majorGrid', '__minorGrid'])
