const figure = new Fig.Figure({ limits: [-2, -1.5, 4, 3], color: [1, 0, 0, 1] });

// Movable angle
figure.add({
  name: 'a',
  make: 'collections.angle',
  options: {
    angle: Math.PI / 4 * 3,
    label: {
      location: 'outside',
      orientation: 'horizontal',  // Label should be horizontal
      offset: 0.1,    // Offset of label from curve
      update: true,   // Auto update angle to be horizontal as rotation changes
      sides: 200,     // Curve is a polygon with 200 sides, so looks circular
    },
    curve: {          // Curve of angle
      radius: 0.3,
      width: 0.005,
    },
    corner: {         // Straight lines of angle
      width: 0.01,
      length: 1,
      color: [0, 0.5, 1, 1],
    },
  },
  mods: {
    move: { bounds: 'figure' },
  },
});

// Angle collection has a specific setMovable function that allows for
// customizing how each arm of the angle changes the angle
figure.elements._a.setMovable({
  startArm: 'rotation',
  endArm: 'angle',
  movePadRadius: 0.3,
});
