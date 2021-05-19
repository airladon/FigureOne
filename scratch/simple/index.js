// const figure = new Fig.Figure();

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [0, 0, 0, 1],
});

/*
.##.....##.....######..##.....##....###....########..########.########.
.##.....##....##....##.##.....##...##.##...##.....##.##.......##.....##
.##.....##....##.......##.....##..##...##..##.....##.##.......##.....##
.##.....##.....######..#########.##.....##.##.....##.######...########.
..##...##...........##.##.....##.#########.##.....##.##.......##...##..
...##.##......##....##.##.....##.##.....##.##.....##.##.......##....##.
....###........######..##.....##.##.....##.########..########.##.....##
*/
// Each charge position and value is a uniform. There are 20 charges, and so
// there are 20 uniforms
const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_center;
uniform mat3 u_matrix;
uniform float u_norm;
uniform float u_scaleArrow;
uniform vec3 u_charge1;
uniform vec3 u_charge2;
uniform vec3 u_charge3;
uniform vec3 u_charge4;
uniform vec3 u_charge5;
uniform vec3 u_charge6;
uniform vec3 u_charge7;
uniform vec3 u_charge8;
uniform vec3 u_charge9;
uniform vec3 u_charge10;
uniform vec3 u_charge11;
uniform vec3 u_charge12;
uniform vec3 u_charge13;
uniform vec3 u_charge14;
uniform vec3 u_charge15;
uniform vec3 u_charge16;
uniform vec3 u_charge17;
uniform vec3 u_charge18;
uniform vec3 u_charge19;
uniform vec3 u_charge20;
varying vec4 v_col;

vec2 polarToRect(float mag, float angle) {
  return vec2(mag * cos(angle), mag * sin(angle));
}

vec2 rectToPolar(float x, float y) {
  return vec2(sqrt(x * x + y * y), atan(y, x));
}

// Calculate the x/y charge magnitude at this vertex for a single charge
// The absolute value of the charge doesn't matter for this visualization so the
// dielectric constant is left out of the charge calculation
vec2 fromCharge(vec3 charge) {
  float angle = atan(charge.y - a_center.y, charge.x - a_center.x);
  float dist = distance(charge.xy, a_center.xy);
  float q = -charge.z / pow(dist, 2.0);
  return polarToRect(q, angle);
}

void main() {
  mat3 centerToOrigin = mat3(1, 0, 0, 0, 1, 0, -a_center.x, -a_center.y, 1);
  mat3 originToCenter = mat3(1, 0, 0, 0, 1, 0, a_center.x, a_center.y, 1);
  vec2 centerOffset = vec2(a_center.x - a_position.x, a_center.y - a_position.y);

  // Calculate the x and y charge magnitude from each charge at this vertex
  vec2 c1 = fromCharge(u_charge1);
  vec2 c2 = fromCharge(u_charge2);
  vec2 c3 = fromCharge(u_charge3);
  vec2 c4 = fromCharge(u_charge4);
  vec2 c5 = fromCharge(u_charge5);
  vec2 c6 = fromCharge(u_charge6);
  vec2 c7 = fromCharge(u_charge7);
  vec2 c8 = fromCharge(u_charge8);
  vec2 c9 = fromCharge(u_charge9);
  vec2 c10 = fromCharge(u_charge10);
  vec2 c11 = fromCharge(u_charge11);
  vec2 c12 = fromCharge(u_charge12);
  vec2 c13 = fromCharge(u_charge13);
  vec2 c14 = fromCharge(u_charge14);
  vec2 c15 = fromCharge(u_charge15);
  vec2 c16 = fromCharge(u_charge16);
  vec2 c17 = fromCharge(u_charge17);
  vec2 c18 = fromCharge(u_charge18);
  vec2 c19 = fromCharge(u_charge19);
  vec2 c20 = fromCharge(u_charge20);

  // Total x and y charge magnitude
  vec2 sum = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9 + c10 + c11 + c12 + c13 + c14 + c15 + c16 + c17 + c18 + c19 + c20;

  // Total charge magnitude and direction
  vec2 charge = rectToPolar(sum.x, sum.y);
  float mag = charge.x;
  float angle = charge.y;

  // Normalize the charge magnitude for visualization
  float normCharge = min(sqrt(mag), u_norm)/ u_norm;

  // Arrow scaling factor - will only be scaled if uniform u_scaleArrow is 1
  float scale = 1.0;
  if (u_scaleArrow == 1.0) {
    scale = min(normCharge * 1.5 + 0.25, 1.0);
  }

  // Calculate the scale and rotation matrix for the arrow
  float s = sin(angle);
  float c = cos(angle);
  mat3 scaleRotation = mat3(c * min(scale, 1.0), s * min(scale, 1.0), 0, -s * scale, c * scale, 0, 0, 0, 1);

  // Offset the vertex relative to the center, scale and rotate, then reverse
  // the offset
  vec3 final = originToCenter * scaleRotation * centerToOrigin * vec3(a_position.x, a_position.y, 1);

  // Final position
  gl_Position = vec4((u_matrix * final).xy, 0, 1);

  // Set the color based on the normalized charge between red (high charge
  // magnitude) and blue (low charge magnitude)
  v_col = vec4(normCharge, 0.2, 1.0 - normCharge, 1);
}`;

const points = [];
const centers = [];

// Arrow properties
const tWidth = 0.01;  // tail width
const tLength = 0.12; // tail length
const hWidth = 0.03;  // head width
const hLength = 0.06; // head length
const step = 0.2;
const halfLength = (tLength + hLength) / 2;

// Make a grid of arrows
for (let x = -3; x < 3 + step / 2; x += step) {
  for (let y = -3; y < 3 + step / 2; y += step) {
    // Each arrow is made of 3 triangles
    points.push(
      // Head triangle
      halfLength + x, y,
      halfLength + x - hLength, y + hWidth,
      halfLength + x - hLength, y - hWidth,
      // Tail triangle 1
      halfLength + x - hLength, y + tWidth,
      halfLength + x - hLength - tLength, y + tWidth,
      halfLength + x - hLength - tLength, y - tWidth,
      // Tail triangle 2
      halfLength + x - hLength, y + tWidth,
      halfLength + x - hLength - tLength, y - tWidth,
      halfLength + x - hLength, y - tWidth,
    );
    // Each vertex is paired with the center coordinate of the arrow so
    // each vertex can be scaled and rotated relative to the center
    centers.push(
      x, y, x, y, x, y,
      x, y, x, y, x, y,
      x, y, x, y, x, y,
    );
  }
}

// The `field` FigureElement has the arrow grid within it.
// The vertex shader will orient and scale the arrows based on the
// superposition of charge contributions from each charge at the vertex the
// shader is operating on.
const field = figure.add({
  make: 'gl',
  vertexShader: {
    src: vertexShader,
    vars: [
      'a_position', 'a_center', 'u_matrix',
      'u_norm',
      'u_scaleArrow',
      'u_charge1',
      'u_charge2',
      'u_charge3',
      'u_charge4',
      'u_charge5',
      'u_charge6',
      'u_charge7',
      'u_charge8',
      'u_charge9',
      'u_charge10',
      'u_charge11',
      'u_charge12',
      'u_charge13',
      'u_charge14',
      'u_charge15',
      'u_charge16',
      'u_charge17',
      'u_charge18',
      'u_charge19',
      'u_charge20',
    ],
  },
  fragShader: 'vertexColor',
  vertices: { data: points },
  buffers: [
    { name: 'a_center', data: centers },
  ],
  uniforms: [
    { name: 'u_norm', length: 1 },
    { name: 'u_scaleArrow', length: 1 },
    { name: 'u_charge1', length: 3 },
    { name: 'u_charge2', length: 3 },
    { name: 'u_charge3', length: 3 },
    { name: 'u_charge4', length: 3 },
    { name: 'u_charge5', length: 3 },
    { name: 'u_charge6', length: 3 },
    { name: 'u_charge7', length: 3 },
    { name: 'u_charge8', length: 3 },
    { name: 'u_charge9', length: 3 },
    { name: 'u_charge10', length: 3 },
    { name: 'u_charge11', length: 3 },
    { name: 'u_charge12', length: 3 },
    { name: 'u_charge13', length: 3 },
    { name: 'u_charge14', length: 3 },
    { name: 'u_charge15', length: 3 },
    { name: 'u_charge16', length: 3 },
    { name: 'u_charge17', length: 3 },
    { name: 'u_charge18', length: 3 },
    { name: 'u_charge19', length: 3 },
    { name: 'u_charge20', length: 3 },
  ],
});

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
        make: 'polygon',
        sides: 20,
        radius: chargeRadius,
        color: [1, 0, 0, 1],
      },
      {
        name: 'border',
        make: 'polygon',
        sides: 20,
        radius: chargeRadius,
        color: [0, 0, 0, 0.5],
        line: { width: 0.005 },
      },
      {
        name: 'negativeLine',
        make: 'primitives.line',
        p1: [-chargeRadius / 3, 0],
        p2: [chargeRadius / 3, 0],
        width: 0.01,
        color: [0, 0, 0, 1],
      },
      {
        name: 'positiveLine',
        make: 'primitives.line',
        p1: [0, -chargeRadius / 3],
        p2: [0, chargeRadius / 3],
        width: 0.01,
        color: [0, 0, 0, 1],
      },
    ],
    mods: {
      simple: true,
      isMovable: true,
      custom: { q: 1 },
    },
  });

  // Whenever a charge is moved, it needs to update its associated uniform with
  // the lastest position and charge value.
  // The uniform is a vector of length 3 where the first two elements are the
  // x and y coordinates, and the third element is the charge value
  charge.notifications.add('setTransform', () => {
    const p = charge.getPosition();
    field.custom.updateUniform(`u_charge${i}`, [p.x, p.y, charge.custom.q]);
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
      if (charge < 0) {
        charge._positiveLine.setOpacity(0);
      } else {
        charge._positiveLine.setOpacity(1);
      }
      return;
    }

    const startCharge = charge.custom.q;
    const deltaCharge = q - startCharge;
    const chargeDuration = Math.min(duration, 1);
    let signAnimationStep = null;
    if (startCharge < 0 && q > 0) {
      signAnimationStep = charge._positiveLine.animations.opacity({
        target: 1, duration: chargeDuration / 2,
      });
    } else if (startCharge > 0 && q < 0) {
      signAnimationStep = charge._positiveLine.animations.opacity({
        target: 0, duration: chargeDuration / 2,
      });
    } else if (q < 0) {
      charge._positiveLine.setOpacity(0);
    } else {
      charge._positiveLine.setOpacity(1);
    }
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
        signAnimationStep,
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
  charges[0].custom.animateTo([0, 0], q, duration);
  animateNorm(2, duration);
  for (let i = 1; i < charges.length; i += 1) {
    charges[i].custom.animateTo([5, 0], 0, duration);
  }
};

const twoCharges = (q1, q2, duration = 4) => {
  charges[0].custom.animateTo([-1, 0], q1, duration);
  charges[1].custom.animateTo([1, 0], q2, duration);
  animateNorm(2, duration);
  for (let i = 2; i < charges.length; i += 1) {
    charges[i].custom.animateTo([5, 0], 0, duration);
  }
};

const line = (duration = 4) => {
  const length = 3;
  const lenStep = length / charges.length;
  // field.custom.updateUniform('u_norm', 5);
  animateNorm(5, duration);
  for (let i = 0; i < charges.length; i += 1) {
    const charge = charges[i];
    charge.custom.animateTo([-length / 2 + i * lenStep, 0], 1, duration);
  }
};

const bipolarLine = (duration = 4) => {
  const length = 3;
  const lenStep = length / charges.length;
  // field.custom.updateUniform('u_norm', 4);
  animateNorm(4, duration);
  for (let i = 0; i < charges.length; i += 1) {
    const charge = charges[i];
    const x = -length / 2 + i * lenStep;
    const normX = x < 0 ? -1 : 1;
    charge.custom.animateTo([-length / 2 + i * lenStep, 0], normX, duration);
  }
};

const capacitor = (q, separation, duration = 4) => {
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
      charge.custom.animateTo([start + i * lenStep, -y], q, duration);
    }
  }
};

const linePoint = (duration = 4) => {
  const length = 3;
  const lenStep = length / charges.length;
  animateNorm(4, duration);
  charges[0].custom.animateTo([0.1, 1], -1, 4);
  charges[1].custom.animateTo([-0.1, 1], -1, 4);
  for (let i = 2; i < charges.length; i += 1) {
    const charge = charges[i];
    charge.custom.animateTo([-length / 2 + i * lenStep, -1], 1, duration);
  }
};


const circle = (radius, duration = 4) => {
  const center = [0, 0];
  const angleStep = Math.PI * 2 / charges.length;
  animateNorm(4, duration);
  for (let i = 0; i < charges.length; i += 1) {
    const x = radius * Math.cos(angleStep * i) + center[0];
    const y = radius * Math.sin(angleStep * i) + center[1];
    charges[i].custom.animateTo([x, y], 1, duration);
  }
};

const square = (radius, duration = 4) => {
  const center = [0, 0];
  const angleStep = Math.PI * 2 / charges.length;
  const hSide = 1.7;
  animateNorm(4, duration);
  for (let i = 0; i < charges.length; i += 1) {
    const angle = angleStep * i;
    let p;
    if (angle <= Math.PI / 4 || angle > Math.PI / 4 * 7) {
      p = [hSide, hSide * Math.tan(angle)];
    } else if (angle <= Math.PI / 4 * 3) {
      p = [hSide / Math.tan(angle), hSide];
    } else if (angle <= Math.PI / 4 * 5) {
      p = [-hSide, -hSide * Math.tan(angle)];
    } else {
      p = [-hSide / Math.tan(angle), -hSide];
    }
    p[0] += center[0];
    p[1] += center[1];
    charges[i].custom.animateTo(p, 1, duration);
  }
};

const cycle = [
  singleCharge.bind(this, 1),
  singleCharge.bind(this, -1, 2),
  twoCharges.bind(this, -1, 1),
  twoCharges.bind(this, 1, 1, 2),
  line.bind(this),
  bipolarLine.bind(this),
  capacitor.bind(this, -1, 1),
  capacitor.bind(this, -1, 0.15),
  capacitor.bind(this, 1, 1.5),
  linePoint.bind(this),
  circle.bind(this, 0.8),
  circle.bind(this, 2),
  square.bind(this),
];
let cycleIndex = 0;

/*
.########..##.....##.########.########..#######..##....##..######.
.##.....##.##.....##....##.......##....##.....##.###...##.##....##
.##.....##.##.....##....##.......##....##.....##.####..##.##......
.########..##.....##....##.......##....##.....##.##.##.##..######.
.##.....##.##.....##....##.......##....##.....##.##..####.......##
.##.....##.##.....##....##.......##....##.....##.##...###.##....##
.########...#######.....##.......##.....#######..##....##..######.
*/
// Helper function to make a button
const makeButton = (text, width, position) => figure.add({
  make: 'collections.rectangle',
  button: true,
  fill: [0.4, 0.4, 0.4, 0.7],
  label: {
    text,
    font: { color: [1, 1, 1, 1] },
  },
  corner: { radius: 0.1, sides: 5 },
  width,
  height: 0.5,
  position,
  mods: {
    isTouchable: true,
  },
});
const nextButton = makeButton('Next', 1, [2.3, -2.5]);
const prevButton = makeButton('Prev', 1, [-2.3, -2.5]);
const scaleButton = makeButton('Scale', 1, [2.3, 2.5]);

scaleButton.onClick = () => {
  const [scaleArrow] = field.custom.getUniform('u_scaleArrow');
  if (scaleArrow === 1) {
    field.custom.updateUniform('u_scaleArrow', 0);
  } else {
    field.custom.updateUniform('u_scaleArrow', 1);
  }
};

nextButton.onClick = () => {
  figure.stop();
  cycleIndex = (cycleIndex + 1) % cycle.length;
  cycle[cycleIndex]();
};

prevButton.onClick = () => {
  figure.stop();
  let prevIndex = cycleIndex - 1;
  if (prevIndex < 0) {
    prevIndex = cycle.length - 1;
  }
  cycleIndex = cycleIndex - 1 < 0 ? cycle.length - 1 : cycleIndex - 1;
  cycle[cycleIndex]();
};

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

