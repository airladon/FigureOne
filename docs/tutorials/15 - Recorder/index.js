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
const makePolygon = (name, radius, color, sides, startPosition, solPosition, solRotation) => ({
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
        radius, sides, line: { width: 0.003 }, color: [1, 1, 1, 0.5],
      },
    },
  ],
  mods: {
    scenarios: {
      start: { position: startPosition, rotation: 0 },
      solution: { position: solPosition, rotation: solRotation },
    },
  },
});


// Calculate the apothems of the shapes
const sideLength = 0.14;
const a6 = sideLength / 2 / Math.tan(Math.PI / 6);
const a12 = sideLength / 2 / Math.tan(Math.PI / 12);
const a4 = sideLength / 2 / Math.tan(Math.PI / 4);
const halfAng = Math.PI * 2 / 12 / 2;

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

figure.setScenarios('start');

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
    .scenarios({ target: 'start', duration: 2 })
    .start();
});

solution.hide();
figure.shortCuts['1'] = () => {
  figure.elements.animations.new()
    .dissolveIn({ element: solution })
    .start();
};

// // Playback only
// figure.recorder.fetchAndLoad('./ivid_data.json');
// figure.recorder.loadAudio(new Audio('./audio.mp3'));

