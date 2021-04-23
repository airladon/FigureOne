/* globals Fig */
const figure = new Fig.Figure();

// Helper function to make buttons
function button(name, text, position) {
  return {
    name,
    method: 'primitives.text',
    options: {
      text, position, xAlign: 'center', font: { size: 0.1 },
    },
    mods: { isTouchable: true, touchBorder: 0.1 },
  };
}

// Helper function to make polygons
function makePolygon(
  name, radius, color, sides, resetPosition, solutionPosition, solutionRotation,
) {
  return {
    name,
    method: 'collection',
    elements: [
      {
        name: 'fill',
        method: 'primitives.polygon',
        options: { radius, color, sides },
        mods: {
          isMovable: true,
          move: { element: name, type: 'rotation' },
        },
      },
      {
        name: 'movePad',
        method: 'primitives.polygon',
        options: { radius: radius * 0.7, sides },
        mods: {
          isMovable: true,
          opacity: 0,
          move: { element: name },
        },
      },
      {
        name: 'border',
        method: 'primitives.polygon',
        options: {
          radius: radius - 0.0015, sides, line: { width: 0.003 }, color: [1, 1, 1, 1],
        },
      },
    ],
    mods: {
      scenarios: {
        start: { position: [resetPosition[0], 0], rotation: 0 },
        reset: { position: resetPosition, rotation: 0 },
        solution: { position: solutionPosition, rotation: solutionRotation },
      },
    },
  };
}


// Calculate the apothems of the shapes
// The apothem (a) is related to side length (s) and number of sides (n) by:
// s = 2*a*tan(180/n)
const sideLength = 0.14;
const a6 = sideLength / 2 / Math.tan(Math.PI / 6);   // apothem of hexagon
const a12 = sideLength / 2 / Math.tan(Math.PI / 12); // apothem of dodecagon
const a4 = sideLength / 2 / Math.tan(Math.PI / 4);   // apothem of square
const halfAng = Math.PI * 2 / 12 / 2;

// Helper function that greates a group of shapes within a common hexagon layout
function polygons(
  prefix, sides, color, count, startPosition, startRadius, startAngle, startRotation,
) {
  // Calculate polygon radius from side length
  const radius = sideLength / 2 / Math.sin(Math.PI / sides);
  // Create the polygons
  const shapes = [];
  for (let i = 0; i < count; i += 1) {
    const sAng = (startAngle - 1) * halfAng * 2 + halfAng + i * Math.PI * 2 / 6;
    const solutionPosition = [
      startRadius * Math.cos(sAng), startRadius * Math.sin(sAng),
    ];
    const solutionRotation = startRotation + i * Math.PI * 2 / 6;
    shapes.push(makePolygon(`polygon${prefix}${sides}_${i}`, radius, color, sides, startPosition, solutionPosition, solutionRotation));
  }
  return shapes;
}

const red = [1, 0, 0, 0.8];
const blue = [0, 0, 1, 0.8];
const green = [0, 0.8, 0, 0.8];
const pi = Math.PI;

figure.add([
  ...polygons('a', 12, red, 1, [0.35, 0.7], 0, 0, 0),
  ...polygons('b', 12, red, 6, [0.35, 0.7], a12 * 2 + a4 * 2, 2, 0),
  ...polygons('c', 6, green, 6, [-0.15, 0.7], a12 + a6, 1, pi / 4),
  ...polygons('d', 6, green, 6, [-0.15, 0.7], a12 + a6 * 3 + a4 * 2, 1, -pi / 12.5),
  ...polygons('e', 4, blue, 6, [-0.45, 0.7], a12 + a4, 2, 0),
  ...polygons('f', 4, blue, 6, [-0.45, 0.7], a12 + a6 * 2 + a4, 1, -pi / 6),
  button('solutionButton', 'Solution', [0.75, -0.9]),
  button('resetButton', 'Reset', [-0.8, -0.9]),
]);
figure.addCursor();

// Add animations for reset and solution
const solution = figure.getElement('solutionButton');
const reset = figure.getElement('resetButton');

solution.subscriptions.add('onClick', () => {
  figure.elements.stop();
  figure.elements.animations.new()
    .scenarios({ target: 'solution', duration: 2 })
    .start();
});

reset.subscriptions.add('onClick', () => {
  figure.elements.stop();
  figure.elements.animations.new()
    .scenarios({ target: 'reset', duration: 2 })
    .start();
});

// Animation to show solution button
figure.fnMap.add('showSolutionButton', () => {
  solution.show();
  solution.animations.new()
    .dissolveIn(0.8)
    .start();
});

figure.shortcuts = { 1: 'showSolutionButton' };

// First positions
figure.setScenarios('start');
solution.hide();


// Load audio, states and events data
figure.recorder.loadAudioTrack(new Audio(window.location.href.replace(/\/tests.index.html|\/index.html|\/tests\/$|\/$/, '/audio-track.mp3')));
figure.recorder.loadVideoTrack('./video-track.json');
