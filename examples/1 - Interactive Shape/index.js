// Create diagram and make it able to be touched
const diagram = new Fig.Diagram();
diagram.setTouchable();

// Add circle to diagram
diagram.addElement(
  {
    name: 'circle',
    type: 'polygon',
    params: {
      sides: 100,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
    mods: {
      isTouchable: true,
      isMovable: true,
      move: {
        canBeMovedAfterLosingTouch: true,
        boundary: 'diagram',
      },
    },
  },
);

// Initialize diagram
diagram.initialize();

