// const figure = new Fig.Figure();

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

const vertexShader = `
attribute vec2 a_position;
attribute vec4 a_color;
attribute vec2 a_velocity;
attribute vec2 a_center;
attribute float a_radius;
varying vec4 v_col;
uniform mat3 u_matrix;
uniform float u_time;

float calc(float limit, float pos, float center, float vel) {
  float vDirection = vel / abs(vel);
  float offset = abs(center - vDirection * limit);
  float totalDistance = abs(vel * u_time);
  float numBounces = 0.0;
  if (totalDistance > offset) {
    numBounces = 1.0;
  }
  numBounces = numBounces + floor(abs((totalDistance - offset)) / (2.0 * limit));
  float xLastDirection = (mod(numBounces, 2.0) == 0.0) ? vDirection : -vDirection;
  float xLastWall = center;
  float xRemainderDistance = totalDistance;
  if (numBounces > 0.0) {
    xLastWall = (mod(numBounces, 2.0) == 0.0) ? -vDirection * limit : vDirection * limit;
    xRemainderDistance = mod(totalDistance - offset, 2.0 * limit);
  }
  float x = xLastWall + xRemainderDistance * xLastDirection + pos - center;
  return x;
}
void main() {
  float x = calc(3.0 - a_radius, a_position.x, a_center.x, a_velocity.x);
  float y = calc(3.0 - a_radius, a_position.y, a_center.y, a_velocity.y);
  gl_Position = vec4((u_matrix * vec3(x, y, 1)).xy, 0, 1);
  v_col = a_color;
}`;

const points = [];
const velocities = [];
const colors = [];
const centers = [];
const radii = [];
const sides = 20;
const step = Math.PI * 2 / (sides);
for (let i = 0; i < 10000; i += 1) {
  // Each shape gets a random radius, initial position, initial velocity and
  // color
  const r = rand(0.05, 0.1);
  const p = [rand(-3 + r, 3 - r), rand(-3 + r, 3 - r)];
  const v = [rand(-0.15, 0.15), rand(-0.15, 0.15)];
  const color = [rand(0, 255), rand(0, 255), rand(0, 255), rand(0, 255)];

  // Define all the vertices of the shape. Each side will have an associated
  // triangle formed with the center of the polygon. Thus, each side of the
  // shape will have three associated vertices. Each vertex will then have an
  // associated radius, center point, velocity and color.
  for (let j = 0; j < sides; j += 1) {
    points.push(p[0], p[1]);
    points.push(r * Math.cos(step * j) + p[0], r * Math.sin(step * j) + p[1]);
    points.push(r * Math.cos(step * (j + 1)) + p[0], r * Math.sin(step * (j + 1)) + p[1]);
    velocities.push(v[0], v[1], v[0], v[1], v[0], v[1]);
    centers.push(p[0], p[1], p[0], p[1], p[0], p[1]);
    radii.push(r, r, r);
    colors.push(...color, ...color, ...color);
  }
}

const element = figure.add({
  make: 'gl',
  // Define the custom shader and variables (u_matrix is the element transform
  // matrix)
  vertexShader: {
    src: vertexShader,
    vars: ['a_position', 'a_color', 'a_velocity', 'a_center', 'a_radius', 'u_matrix', 'u_time'],
  },
  // Built in shader that allows for colored vertices
  fragShader: 'gradient',
  // Define buffers and uniforms
  vertices: { data: points },
  buffers: [
    {
      name: 'a_color', size: 4, data: colors, type: 'UNSIGNED_BYTE', normalize: true,
    },
    { name: 'a_velocity', data: velocities },
    { name: 'a_center', data: centers },
    { name: 'a_radius', data: radii, size: 1 },
  ],
  uniforms: [
    { name: 'u_time' },
  ],
  // The animation will continue forever
  mods: { state: { isChanging: true } },
});

// Before each draw, we want to update the u_time value with the time
// delta between this frame and the start of the animation - it will
// then be passed to the vertex shader by FigureOne
let startTime = null;
figure.notifications.add('beforeDraw', () => {
  if (startTime == null) {
    startTime = figure.timeKeeper.now();
  }
  const deltaTime = (figure.timeKeeper.now() - startTime) / 1000;
  element.drawingObject.uniforms['u_time'].value = [deltaTime];
});
figure.addFrameRate();
figure.animateNextFrame();
