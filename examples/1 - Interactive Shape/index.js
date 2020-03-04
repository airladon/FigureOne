// Create diagram
const diagram = new Fig.Diagram({ htmlId: 'figureOneContainer' });

// Add circle to diagram
diagram.addElements(diagram.elements, [
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 100,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
    mods: {
      isMovable: true,
      isTouchable: true,
      move: {
        canBeMovedAfterLosingTouch: true,
        boundary: 'diagram',
      },
    },
  },
]);
diagram.elements.hasTouchableElements = true;

// Initialize diagram
diagram.setFirstTransform();
diagram.animateNextFrame();
