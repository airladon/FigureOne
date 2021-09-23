/* globals Fig */

const figure = new Fig.Figure({
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
attribute vec3 a_vertex;
attribute vec3 a_center;
attribute vec3 a_normal;
varying vec3 v_normal;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_vertexTransform;
uniform mat4 u_worldViewProjectionMatrix;
uniform float u_norm;
uniform float u_scaleArrow;
uniform vec4 u_charge1;
uniform vec4 u_charge2;
uniform vec4 u_charge3;
uniform vec4 u_charge4;
uniform vec4 u_charge5;
uniform vec4 u_charge6;
uniform vec4 u_charge7;
uniform vec4 u_charge8;
uniform vec4 u_charge9;
uniform vec4 u_charge10;
uniform vec4 u_charge11;
uniform vec4 u_charge12;
uniform vec4 u_charge13;
uniform vec4 u_charge14;
uniform vec4 u_charge15;
uniform vec4 u_charge16;
uniform vec4 u_charge17;
uniform vec4 u_charge18;
uniform vec4 u_charge19;
uniform vec4 u_charge20;
varying vec4 v_color;


vec4 directionToAxisAngle(vec3 vector) {
  if (abs(vector.x) / length(vector) > 0.999999) {
    if (vector.x > 0.0) {
      return vec4(0, 0, 1, 0);
    }
    return vec4(0, 0, 1, 3.141592);
  }
  vec3 axis = normalize(cross(vec3(1.0, 0.0, 0.0), vector));
  float d = dot(vec3(1.0, 0.0, 0.0), vector);
  float angle = acos(d / length(vector));
  return vec4(axis.xyz, angle);
}

mat4 rotationMatrixAngleAxis(float angle, vec3 axis) {
  float c = cos(angle);
  float s = sin(angle);
  float x = axis.x;
  float y = axis.y;
  float z = axis.z;
  float C = 1.0 - c;
  return mat4(x * x * C + c, y * x * C + z * s, z * x * C - y * s, 0, x * y * C - z * s, y * y * C + c, z * y * C + x * s, 0, x * z * C + y * s, y * z * C - x * s, z * z * C + c, 0, 0, 0, 0, 1);
}

vec3 fromCharge(vec4 charge, vec4 center) {
  vec3 direction = normalize(charge.xyz - center.xyz);
  float dist = distance(charge, center);
  float q1 = -charge.w / pow(dist, 2.0);
  return q1 * direction;
}

void main() {
  vec4 center = u_vertexTransform * vec4(a_center.xyz, 1.0);
  mat4 originToCenter = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, center.x, center.y, center.z, 1);

  // Calculate the x and y charge magnitude from each charge at this vertex
  vec3 c1 = fromCharge(u_charge1, center);
  vec3 c2 = fromCharge(u_charge2, center);
  vec3 c3 = fromCharge(u_charge3, center);
  vec3 c4 = fromCharge(u_charge4, center);
  vec3 c5 = fromCharge(u_charge5, center);
  vec3 c6 = fromCharge(u_charge6, center);
  vec3 c7 = fromCharge(u_charge7, center);
  vec3 c8 = fromCharge(u_charge8, center);
  vec3 c9 = fromCharge(u_charge9, center);
  vec3 c10 = fromCharge(u_charge10, center);
  vec3 c11 = fromCharge(u_charge11, center);
  vec3 c12 = fromCharge(u_charge12, center);
  vec3 c13 = fromCharge(u_charge13, center);
  vec3 c14 = fromCharge(u_charge14, center);
  vec3 c15 = fromCharge(u_charge15, center);
  vec3 c16 = fromCharge(u_charge16, center);
  vec3 c17 = fromCharge(u_charge17, center);
  vec3 c18 = fromCharge(u_charge18, center);
  vec3 c19 = fromCharge(u_charge19, center);
  vec3 c20 = fromCharge(u_charge20, center);

  // Total x and y charge magnitude
  vec3 sum = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9 + c10 + c11 + c12 + c13 + c14 + c15 + c16 + c17 + c18 + c19 + c20;

  // Total charge magnitude and direction
  float mag = length(sum);

  // Normalize the charge magnitude for visualization
  float normCharge = min(sqrt(mag), u_norm)/ u_norm;

  // Arrow scaling factor - will only be scaled if uniform u_scaleArrow is 1
  float scale = 1.0;
  if (u_scaleArrow == 1.0) {
    scale = min(normCharge * 1.5 + 0.25, 1.0);
  }

  // Calculate the scale and rotation matrix for the arrow
  mat4 scaleMatrix = mat4(min(scale, 1.0), 0, 0, 0, 0, min(scale, 1.0), 0, 0, 0, 0,min(scale, 1.0), 0, 0, 0, 0, 1.0);
  vec4 axisAngle = directionToAxisAngle(normalize(sum));
  mat4 rotationMatrix = rotationMatrixAngleAxis(axisAngle.w, axisAngle.xyz);
  mat4 scaleRotation = rotationMatrix * scaleMatrix;

  // Offset the vertex relative to the center, scale and rotate, then reverse
  // the offset
  vec4 final = originToCenter * scaleRotation * vec4(a_vertex.xyz, 1);

  // Final position
  gl_Position = u_worldViewProjectionMatrix * final;

  // Set the color based on the normalized charge between red (high charge
  // magnitude) and blue (low charge magnitude)
  v_color = vec4(normCharge, normCharge, 1.0 - normCharge, 1);
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
}`;

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

figure.add({
  make: 'cameraControl', axis: [0, 0, 1], // controlScene: scene2D,
});
figure.add({ make: 'collections.axis3', arrow: true, width: 0.01, length: 1, color: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 1, 1, 1]] });
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
        radius: chargeRadius,
        color: [1, 0, 0, 1],
      },
      // {
      //   name: 'border',
      //   make: 'polygon',
      //   sides: 20,
      //   radius: chargeRadius,
      //   color: [0, 0, 0, 0.5],
      //   line: { width: 0.005 },
      // },
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
    field.custom.updateUniform(`u_charge${i}`, [p.x, p.y, 0, charge.custom.q]);
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
// const makeButton = (text, width, position) => figure.add({
//   make: 'collections.rectangle',
//   button: true,
//   fill: [0.4, 0.4, 0.4, 0.7],
//   label: {
//     text,
//     font: { color: [1, 1, 1, 1] },
//   },
//   corner: { radius: 0.1, sides: 5 },
//   width,
//   height: 0.5,
//   position,
//   mods: {
//     isTouchable: true,
//   },
//   scene: scene2D,
// });
// const nextButton = makeButton('Next', 1, [2.3, 2.5]);
const nextButton = figure.add({
  make: 'collections.button',
  label: 'Next',
  width: 0.8,
  height: 0.4,
  scene: scene2D,
  touchDown: { colorFill: [0.2, 0.2, 0.2, 1] },
  color: [0.8, 0.8, 0.8, 1],
  position: [2.3, 2.5],
});

const makeButton = (text, position, color) => figure.add({
  make: 'collections.button',
  position,
  label: {
    text,
    font: {
      family: 'Times New Roman',
      style: 'italic',
      color,
    },
  },
  color: [0.8, 0.8, 0.8, 1],
  width: 0.3,
  height: 0.3,
  line: { width: 0.015 },
  corner: { radius: 0.15, sides: 20 },
  states: [{ colorLine: [0, 0, 0, 0] }, { colorLine: [0.8, 0.8, 0.8, 1] }],
  scene: scene2D,
});

figure.add({
  make: 'collections.rectangle',
  width: 0.915,
  height: 0.315,
  corner: { radius: 0.15, sides: 20 },
  line: { width: 0.015 },
  color: [0.8, 0.8, 0.8, 1],
  scene: scene2D,
  position: [-2.3, -2.5],
});

const slider = figure.add({
  make: 'collections.slider',
  scene: scene2D,
  position: [0, -2.5],
  width: 2.5,
  colorOn: [0.6, 0.6, 0.6, 1],
  colorOff: [0.6, 0.6, 0.6, 1],
  theme: 'light',
});

let plane = 'xy';
const update = () => {
  const transform = [];
  const offset = slider.getValue() * 4 - 2;
  if (plane === 'xz') {
    transform.push(['r', Math.PI / 2, 1, 0, 0]);
    transform.push(['t', 0, offset, 0]);
  } else if (plane === 'yz') {
    transform.push(['r', Math.PI / 2, 0, 1, 0]);
    transform.push(['t', offset, 0, 0]);
  } else {
    transform.push(['t', 0, 0, offset]);
  }
  field.custom.updateUniform('u_vertexTransform', Fig.getTransform(transform).matrix());
  figure.animateNextFrame();
};

const xButton = makeButton('x', [-2.6, -2.5], [1, 0, 0, 1]);
const yButton = makeButton('y', [-2.3, -2.5], [0, 1, 0, 1]);
const zButton = makeButton('z', [-2.0, -2.5], [0, 1, 1, 1]);
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

// const prevButton = makeButton('Prev', 1, [-2.3, -2.5]);
// const scaleButton = makeButton('Scale', 1, [2.3, 2.5]);
const scaleButton = figure.add({
  make: 'collections.toggle',
  label: { text: 'Scale', location: 'bottom' },
  scene: scene2D,
  position: [2.3, -2.5],
  theme: 'light',
  touchBorder: 0.2,
});

scaleButton.notifications.add('onClick', () => {
  const [scaleArrow] = field.custom.getUniform('u_scaleArrow');
  if (scaleArrow === 1) {
    field.custom.updateUniform('u_scaleArrow', 0);
  } else {
    field.custom.updateUniform('u_scaleArrow', 1);
  }
});

slider.notifications.add('changed', (value) => {
  // const transform = [];
  // const offset = value * 4 - 2;
  // if (plane === 'xz') {
  //   transform.push(['r', Math.PI / 2, 1, 0, 0]);
  //   transform.push(['t', 0, offset, 0]);
  // } else if (plane === 'yz') {
  //   transform.push(['r', Math.PI / 2, 0, 1, 0]);
  //   transform.push(['t', offset, 0, 0]);
  // } else {
  //   transform.push(['t', 0, 0, offset]);
  // }
  // field.custom.updateUniform('u_vertexTransform', Fig.getTransform(transform).matrix());
  // figure.animateNextFrame();
  update();
});
slider.setValue(0.5);

nextButton.onClick = () => {
  figure.stop();
  cycleIndex = (cycleIndex + 1) % cycle.length;
  cycle[cycleIndex]();
};

// prevButton.onClick = () => {
//   figure.stop();
//   let prevIndex = cycleIndex - 1;
//   if (prevIndex < 0) {
//     prevIndex = cycle.length - 1;
//   }
//   cycleIndex = cycleIndex - 1 < 0 ? cycle.length - 1 : cycleIndex - 1;
//   cycle[cycleIndex]();
// };

// const makeAxisButton = (p, text) => figure.add({
//   make: 'collections.toggle',
//   label: { text, location: 'bottom' },
//   scene: scene2D,
//   position: p,
//   theme: 'light',
//   touchBorder: 0.2,
// });

// const xButton = makeAxisButton([-2.7, -2.5], 'x');
// const yButton = makeAxisButton([-2.3, -2.5], 'y');
// const zButton = makeAxisButton([-1.9, -2.5], 'z');
// xButton.notifications.add('on', () => {})
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

