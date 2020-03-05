// Create diagram and make it touchable
const diagram = new Fig.Diagram();
diagram.setTouchable();

// Add elements to the diagram
diagram.addElements([
  // Add pentagon to diagram
  {
    name: 'pentagon',
    method: 'polygon',
    options: {
      sides: 5,
      radius: 0.2,
      fill: true,
      color: [1, 0, 0, 1],
    },
  },

  // Add GO Text to diagram and make it touchable
  {
    name: 'go',
    method: 'text',
    options: {
      text: 'GO',
      size: 0.15,
      position: [0, -0.8],
      color: [0, 1, 0, 1],
    },
    mods: { isTouchable: true },
  }
]);

// Create animation function
function animatePentagon() {
  // Get the pentagon element
  const pentagon = diagram.getElement('pentagon');
  
  // Stop any current animations
  pentagon.stop();

  // Define a new animation
  pentagon.animations.new()
    .position({ target: [-0.4, -0.4], velocity: 0.3 })
    .rotation({ delta: Math.PI / 2, duration: 1 })
    .position({ target: [0, 0], velocity: 0.3 })
    .start();

  // Queue the animation to start on the next animation frame
  diagram.animateNextFrame();
}

// Assign animation function to the GO button
diagram.getElement('go').onClick = animatePentagon;

// Initialize diagram
diagram.initialize();