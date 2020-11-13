const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1]});

diagram.addElements([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1]
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.001 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.8, 0.8, 0.8, 1],
      line: { width: 0.004 }
    },
  },
]);

diagram.addElement({
  name: 'p',
  method: 'advanced.polyline',
  options: {
    points: [[0, 0], [1, 0], [1, 1]],
    width: 0.03,
    side: [{
      // color: [1, 0, 0, 1],
      offset: -0.25,
      showLine: true,
      arrows: true,
      width: 0.01,
      label: {
        text: null,
        location: 'inside',
        scale: 0.5,
        offset: 0.1,
      },
      dash: [0.1, 0.1],
      arrow: 'barb',
      mods: {
        isMovable: true,
        isTouchable: true,
      },
    }, {}],
    angle: {
      curve: { width: 0.01, radius: 0.2, },
      direction: 'negative',
    },
    close: true,
  }
})