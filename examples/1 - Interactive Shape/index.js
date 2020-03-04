const diagram = new Fig.Diagram({ htmlId: 'figureOneContainer' });

// Step 1 - Add interactive shape
diagram.addElements(diagram.elements, [
  {
    name: 'circle',
    method: 'polygon',
    options: {
      sides: 4,
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
diagram.setFirstTransform();
diagram.animateNextFrame();
