/* globals Fig, vertexShader */

const { getPoint, Figure, getPlane } = Fig;

const figure = new Figure({
  // scene: [-3, -3, 3, 3],
  backgroundColor: [0, 0, 0, 1],
  scene: {
    style: 'orthographic',
    left: -3,
    bottom: -3,
    top: 3,
    right: 3,
    near: 0.1,
    far: 10,
    camera: { up: [0, 0, 1], position: [3, 3, 1] },
  },
});

const scene2D = new Fig.Scene({
  style: '2D',
  left: -3,
  bottom: -3,
  top: 3,
  right: 3,
  // near: 0.1,
  // far: 10,
  // camera: { up: [0, 0, 1], position: [3, 2, 1] },
});

/*
.########.####.########.##.......########.
.##........##..##.......##.......##.....##
.##........##..##.......##.......##.....##
.######....##..######...##.......##.....##
.##........##..##.......##.......##.....##
.##........##..##.......##.......##.....##
.##.......####.########.########.########.
*/
const points = [];
const centers = [];

// Arrow properties
const tWidth = 0.01;  // tail width
const tLength = 0.12; // tail length
const hLength = 0.06; // head length
const step = 0.2;

const [conePoints, coneNormals] = Fig.cone({
  length: tLength + hLength,
  radius: tWidth * 2,
  sides: 4,
  transform: ['t', -(tLength + hLength) / 2, 0, 0],
});
const normals = [];
// Make a grid of arrows
for (let x = -3; x < 3 + step / 2; x += step) {
  for (let y = -3; y < 3 + step / 2; y += step) {
    // Each arrow is made of 3 triangles
    points.push(...Fig.toNumbers(conePoints.map(p => p._dup())));
    normals.push(...Fig.toNumbers(coneNormals.map(p => p._dup())));
    // Each vertex is paired with the center coordinate of the arrow so
    // each vertex can be scaled and rotated relative to the center
    centers.push(
      x, y, 0, x, y, 0, x, y, 0,
      x, y, 0, x, y, 0, x, y, 0,
      x, y, 0, x, y, 0, x, y, 0,
      x, y, 0, x, y, 0, x, y, 0,
      x, y, 0, x, y, 0, x, y, 0,
      x, y, 0, x, y, 0, x, y, 0,
      x, y, 0, x, y, 0, x, y, 0,
      x, y, 0, x, y, 0, x, y, 0,
    );
  }
}

// Add camera control
figure.add({
  make: 'cameraControl',
  axis: [0, 0, 1],
  // controlScene: scene2D,
  back: true,
});

// Add axes
const axes = figure.add({
  make: 'collections.axis3',
  // arrow: true,
  width: 0.01,
  length: 6,
  start: -3,
  color: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 1, 1, 1]],
});

// The `field` FigureElement has the arrow grid within it.
// The vertex shader will orient and scale the arrows based on the
// superposition of charge contributions from each charge at the vertex the
// shader is operating on.
const field = figure.add({
  make: 'gl',
  vertexShader: {
    src: vertexShader,
    vars: [
      'a_vertex', 'a_center', 'u_worldViewProjectionMatrix',
      'u_worldInverseTranspose', 'a_normal',
      'u_vertexTransform',
      'u_norm',
      'u_scaleArrow',
      'u_charge1', 'u_charge2', 'u_charge3', 'u_charge4',
      'u_charge5', 'u_charge6', 'u_charge7', 'u_charge8',
      'u_charge9', 'u_charge10', 'u_charge11', 'u_charge12',
      'u_charge13', 'u_charge14', 'u_charge15', 'u_charge16',
      'u_charge17', 'u_charge18', 'u_charge19', 'u_charge20',
    ],
  },
  fragmentShader: { color: 'vertex', dimension: 3, light: null },
  vertices: { data: points, size: 3 },
  normals: { data: normals, size: 3 },
  attributes: [
    { name: 'a_center', data: centers, size: 3 },
  ],
  uniforms: [
    { name: 'u_vertexTransform', length: 16, type: 'FLOAT_VECTOR' },
    { name: 'u_norm', length: 1 },
    { name: 'u_scaleArrow', length: 1 },
    { name: 'u_charge1', length: 4 },
    { name: 'u_charge2', length: 4 },
    { name: 'u_charge3', length: 4 },
    { name: 'u_charge4', length: 4 },
    { name: 'u_charge5', length: 4 },
    { name: 'u_charge6', length: 4 },
    { name: 'u_charge7', length: 4 },
    { name: 'u_charge8', length: 4 },
    { name: 'u_charge9', length: 4 },
    { name: 'u_charge10', length: 4 },
    { name: 'u_charge11', length: 4 },
    { name: 'u_charge12', length: 4 },
    { name: 'u_charge13', length: 4 },
    { name: 'u_charge14', length: 4 },
    { name: 'u_charge15', length: 4 },
    { name: 'u_charge16', length: 4 },
    { name: 'u_charge17', length: 4 },
    { name: 'u_charge18', length: 4 },
    { name: 'u_charge19', length: 4 },
    { name: 'u_charge20', length: 4 },
  ],
});

// The grid will show in which plane a charge can move
const grid = figure.add({
  make: 'grid',
  step: 0.2,
  line: { width: 0.008 },
  color: [0.6, 0.6, 0.6, 0.8],
});
grid.hide();

// Create 20 charge FigureElements
// Each charge has a fill, border, sign label (plus or minus), and a custom `q`
// property which stores the current charge value.
// Each charge can be moved by the user.
const charges = [];
const chargeRadius = 0.18;
for (let i = 1; i <= 20; i += 1) {
  const charge = figure.add({
    make: 'collection',
    elements: [
      {
        name: 'fill',
        make: 'sphere',
        sides: 20,
        normals: 'curve',
        radius: chargeRadius,
        color: [1, 0, 0, 1],
      },
    ],
    move: {
      plane: getPlane([[0, 0, 0], [0, 0, 1]]),
    },
    mods: {
      simple: true,
      custom: { q: 1 },
    },
  });

  // Whenever a charge is moved, it needs to update its associated uniform with
  // the lastest position and charge value.
  // The uniform is a vector of length 3 where the first two elements are the
  // x and y coordinates, and the third element is the charge value
  charge.notifications.add('setTransform', () => {
    const p = charge.getPosition();
    field.custom.updateUniform(`u_charge${i}`, [p.x, p.y, p.z, charge.custom.q]);
  });

  charge.notifications.add('onClick', () => {
    const p = charge.getPosition();
    charge.move.plane.p = p;
    if (Math.abs(charge.move.plane.n.x) > 0.5) {
      grid.setPosition(p.x, 0, 0);
    } else if (Math.abs(charge.move.plane.n.y) > 0.5) {
      grid.setPosition(0, p.y, 0);
    } else if (Math.abs(charge.move.plane.n.z) > 0.5) {
      grid.setPosition(0, 0, p.z);
    }
    grid.show();
  });
  charge.notifications.add('touchUp', () => {
    grid.hide();
  });

  // A function that will animate a charge's position, color, label and charge
  // value. If the charge sign changes, then the charge color and label will is
  // animated. If the charge goes to 0 value, then the charge will become
  // transparent.
  charge.custom.animateTo = (position, q, duration) => {
    let targetColor = [0, 0, 0, 0];
    if (q > 0) {
      targetColor = [q, 0, 0, 1];
    } else if (q < 0) {
      targetColor = [0, -q, 0, 1];
    }

    // If duration is 0, then immediately set all parameters
    if (duration === 0) {
      charge.custom.q = q;
      charge.setPosition(position);
      charge._fill.setColor(targetColor);
      return;
    }

    const startCharge = charge.custom.q;
    const deltaCharge = q - startCharge;
    const chargeDuration = Math.min(duration, 1);
    let fillColorAnimationStep = null;
    fillColorAnimationStep = charge._fill.animations.color({
      target: targetColor, duration: chargeDuration,
    });
    let opacityAnimationStep = null;
    opacityAnimationStep = charge.animations.opacity({
      target: targetColor[3], duration: chargeDuration,
    });
    charge.animations.new()
      .inParallel([
        fillColorAnimationStep,
        opacityAnimationStep,
        charge.animations.position({ target: position, duration }),
        charge.animations.custom({
          callback: (p) => {
            charge.custom.q = p * deltaCharge + startCharge;
          },
          duration: chargeDuration,
        }),
      ])
      .start();
  };
  charges.push(charge);
}

// Function that will animate the normalization uniform so it can gradually
// change
const animateNorm = (target, duration = 4) => {
  const [start] = field.custom.getUniform('u_norm');
  const delta = target - start;
  figure.animations.new()
    .custom({
      callback: (p) => {
        field.custom.updateUniform('u_norm', delta * p + start);
      },
      duration,
    })
    .start();
};

const measurementPlane = figure.add({
  make: 'cylinder',
  line: [[0, 0, -12], [0, 0, 0]],
  radius: 0.015,
  color: [0, 0, 0, 0.8],
});


/*
.########..########..########..######..########.########..######.
.##.....##.##.....##.##.......##....##.##..........##....##....##
.##.....##.##.....##.##.......##.......##..........##....##......
.########..########..######....######..######......##.....######.
.##........##...##...##.............##.##..........##..........##
.##........##....##..##.......##....##.##..........##....##....##
.##........##.....##.########..######..########....##.....######.
*/
// Charge position preset animations
const singleCharge = (q, duration = 4) => {
  figure.stop();
  charges[0].custom.animateTo([0, 0], q, duration);
  animateNorm(2, duration);
  for (let i = 1; i < charges.length; i += 1) {
    charges[i].custom.animateTo([-5, 0], 0, duration);
  }
};

const twoCharges = (q1, q2, duration = 4) => {
  figure.stop();
  charges[0].custom.animateTo([1, 0], q1, duration);
  charges[1].custom.animateTo([-1, 0], q2, duration);
  animateNorm(2, duration);
  for (let i = 2; i < charges.length; i += 1) {
    charges[i].custom.animateTo([-5, 0], 0, duration);
  }
};

const capacitor = (q, separation, duration = 4) => {
  figure.stop();
  const length = 2 + step;
  const lenStep = length / charges.length * 2;
  const start = -length / 2;
  const y = -separation / 2 - step * 1.5;
  animateNorm(7, duration);
  for (let i = 0; i < charges.length; i += 1) {
    const charge = charges[i];
    if (i >= charges.length / 2) {
      charge.custom.animateTo([start + (i - charges.length / 2) * lenStep, y], 1, duration);
    } else {
      charge.custom.animateTo([-start - i * lenStep, -y], q, duration);
    }
  }
};

const circle = (radius, duration = 4) => {
  figure.stop();
  const center = [0, 0];
  const angleStep = Math.PI * 2 / charges.length;
  animateNorm(4, duration);
  for (let i = 0; i < charges.length; i += 1) {
    const x = radius * Math.cos(angleStep * i) + center[0];
    const y = radius * Math.sin(angleStep * i) + center[1];
    charges[i].custom.animateTo([x, y], 1, duration);
  }
};

/*
.########..##.....##.########.########..#######..##....##..######.
.##.....##.##.....##....##.......##....##.....##.###...##.##....##
.##.....##.##.....##....##.......##....##.....##.####..##.##......
.########..##.....##....##.......##....##.....##.##.##.##..######.
.##.....##.##.....##....##.......##....##.....##.##..####.......##
.##.....##.##.....##....##.......##....##.....##.##...###.##....##
.########...#######.....##.......##.....#######..##....##..######.
*/
const makeButton = (label, position, small = false, onClick = null) => {
  const button = figure.add({
    make: 'collections.button',
    label,
    width: small ? 0.3 : 0.7,
    height: 0.3,
    scene: scene2D,
    touchDown: { colorFill: [0.2, 0.2, 0.2, 1] },
    color: [0.8, 0.8, 0.8, 1],
    position,
    touchBorder: 0.1,
  });
  if (onClick) {
    button.notifications.add('onClick', onClick);
  }
  return button;
};
makeButton('1', [0.8, 2.5], true, () => singleCharge(1));
makeButton('2', [1.2, 2.5], true, () => twoCharges(-1, 1));
makeButton('3', [1.6, 2.5], true, () => twoCharges(1, 1, 2));
makeButton('4', [2, 2.5], true, () => capacitor(-1, 1));
makeButton('5', [2.4, 2.5], true, () => circle(1.5));
// const nextButton = makeButton('Next', [2.3, 2.5]);
const resetButton = makeButton('Reset', [-2.3, 2.5]);

// XYZ selector
figure.add({
  make: 'collections.rectangle',
  width: 0.915,
  height: 0.315,
  corner: { radius: 0.15, sides: 20 },
  line: { width: 0.01 },
  color: [0.8, 0.8, 0.8, 1],
  scene: scene2D,
  position: [-2.3, -2.5],
});
const makeXYZButton = (text, position, color) => figure.add({
  make: 'collections.button',
  position,
  label: {
    text,
    font: { family: 'Times New Roman', style: 'italic', color },
  },
  color: [0.8, 0.8, 0.8, 1],
  width: 0.3,
  height: 0.3,
  line: { width: 0.01 },
  corner: { radius: 0.15, sides: 20 },
  states: [
    { colorLine: [0, 0, 0, 0], colorFill: [0.2, 0.2, 0.2, 0] },
    { colorLine: [0.8, 0.8, 0.8, 1], colorFill: [0.2, 0.2, 0.2, 1] },
  ],
  scene: scene2D,
  touchBorder: [0, 0.1, 0, 0.1],
});
const xButton = makeXYZButton('x', [-2.6, -2.5], [1, 0, 0, 1]);
const yButton = makeXYZButton('y', [-2.3, -2.5], [0, 1, 0, 1]);
const zButton = makeXYZButton('z', [-2.0, -2.5], [0, 1, 1, 1]);

const slider = figure.add({
  make: 'collections.slider',
  scene: scene2D,
  position: [0, -2.5],
  width: 2.5,
  colorOn: [0.6, 0.6, 0.6, 1],
  colorOff: [0.6, 0.6, 0.6, 1],
  theme: 'light',
  touchBorder: 0.1,
});

const makeToggle = (label, position) => figure.add({
  make: 'collections.toggle',
  label: { text: label, location: 'bottom' },
  scene: scene2D,
  position,
  theme: 'light',
  touchBorder: 0.2,
});

const scaleButton = makeToggle('Scale', [2.5, -2.5]);
const axisButton = makeToggle('Axes', [1.8, -2.5]);

/*
.##........#######...######...####..######.
.##.......##.....##.##....##...##..##....##
.##.......##.....##.##.........##..##......
.##.......##.....##.##...####..##..##......
.##.......##.....##.##....##...##..##......
.##.......##.....##.##....##...##..##....##
.########..#######...######...####..######.
*/
let plane = 'xy';
const updateMovementPlanes = (position = null, normal = null) => {
  for (let i = 0; i < charges.length; i += 1) {
    if (position != null) {
      charges[i].move.plane.p = getPoint(position);
    }
    if (normal != null) {
      charges[i].move.plane.n = getPoint(normal);
    }
  }
};
const update = () => {
  const transform = [];
  const offset = slider.getValue() * 4 - 2;
  if (plane === 'xz') {
    transform.push(['r', -Math.PI / 2, 1, 0, 0]);
    transform.push(['t', 0, offset, 0]);
    updateMovementPlanes(null, [0, 1, 0]);
    grid.transform.updateRotation(-Math.PI / 2, [1, 0, 0]);
  } else if (plane === 'yz') {
    transform.push(['r', Math.PI / 2, 0, 1, 0]);
    transform.push(['t', offset, 0, 0]);
    updateMovementPlanes(null, [1, 0, 0]);
    grid.transform.updateRotation(Math.PI / 2, [0, 1, 0]);
  } else {
    transform.push(['t', 0, 0, offset]);
    updateMovementPlanes(null, [0, 0, 1]);
    grid.transform.updateRotation(0, [0, 0, 1]);
  }
  field.custom.updateUniform('u_vertexTransform', Fig.getTransform(transform).matrix());
  measurementPlane.transform = transform;
  figure.animateNextFrame();
};

xButton.notifications.add('touch', () => {
  xButton.setStateIndex(1);
  yButton.setStateIndex(0);
  zButton.setStateIndex(0);
  plane = 'yz';
  slider.setValue(0.5);
  update();
});
yButton.notifications.add('touch', () => {
  yButton.setStateIndex(1);
  xButton.setStateIndex(0);
  zButton.setStateIndex(0);
  plane = 'xz';
  slider.setValue(0.5);
  update();
});
zButton.notifications.add('touch', () => {
  zButton.setStateIndex(1);
  xButton.setStateIndex(0);
  yButton.setStateIndex(0);
  plane = 'xy';
  slider.setValue(0.5);
  update();
});
zButton.click();

scaleButton.notifications.add('onClick', () => {
  const [scaleArrow] = field.custom.getUniform('u_scaleArrow');
  if (scaleArrow === 1) {
    field.custom.updateUniform('u_scaleArrow', 0);
  } else {
    field.custom.updateUniform('u_scaleArrow', 1);
  }
});

axisButton.notifications.add('toggle', (on) => {
  if (on) {
    axes.show();
    measurementPlane.show();
  } else {
    axes.hide();
    measurementPlane.hide();
  }
});

const reset = () => {
  figure.scene.setCamera({ position: [3, 3, 2] });
  zButton.click();
};
resetButton.notifications.add('onClick', () => reset());

slider.notifications.add('changed', () => update());

axisButton.off();
slider.setValue(0.5);
reset();

/*
..######..########.########.##.....##.########.
.##....##.##..........##....##.....##.##.....##
.##.......##..........##....##.....##.##.....##
..######..######......##....##.....##.########.
.......##.##..........##....##.....##.##.......
.##....##.##..........##....##.....##.##.......
..######..########....##.....#######..##.......
*/
field.custom.updateUniform('u_scaleArrow', 1);
singleCharge(1, 0);
// figure.addFrameRate(10, { font: { color: [1, 1, 1, 0]}});
figure.animateNextFrame();

