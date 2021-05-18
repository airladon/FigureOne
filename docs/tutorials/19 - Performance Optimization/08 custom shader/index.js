// const figure = new Fig.Figure();

const figure = new Fig.Figure({
  limits: [-3, -3, 6, 6],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig.tools.math;

const vertexShader = `
attribute vec2 a_position;
attribute vec4 a_col;
attribute vec2 a_vel;
attribute vec2 a_center;
attribute float a_radius;
varying vec4 v_col;
uniform mat3 u_matrix;
uniform float u_z;
uniform float u_time;
float calc(float limit, float pos, float center, float vel) {
  float xDirection = vel / abs(vel);
  float xOffset = abs(center - xDirection * limit);
  float xTotalDistance = abs(vel * u_time);
  float xNumBounces = 0.0;
  if (xTotalDistance > xOffset) {
    xNumBounces = 1.0;
  }
  xNumBounces = xNumBounces + floor(abs((xTotalDistance - xOffset)) / (2.0 * limit));
  float xLastDirection = (mod(xNumBounces, 2.0) == 0.0) ? xDirection : -xDirection;
  float xLastWall = center;
  float xRemainderDistance = xTotalDistance;
  if (xNumBounces > 0.0) {
    xLastWall = (mod(xNumBounces, 2.0) == 0.0) ? -xDirection * limit : xDirection * limit;
    xRemainderDistance = mod(xTotalDistance - xOffset, 2.0 * limit);
  }
  float x = xLastWall + xRemainderDistance * xLastDirection + pos - center;
  return x;
}
void main() {
  float x = calc(3.0 - a_radius, a_position.x, a_center.x, a_vel.x);
  float y = calc(3.0 - a_radius, a_position.y, a_center.y, a_vel.y);
  gl_Position = vec4((u_matrix * vec3(x, y, 1)).xy, u_z, 1);
  v_col = a_col;
}`;

const points = [];
const velocities = [];
const colors = [];
const centers = [];
const radii = [];
const sides = 20;
const step = Math.PI * 2 / (sides);
for (let i = 0; i < 1000; i += 1) {
  const r = rand(0.02, 0.04);
  const p = [rand(-3 + r, 3 - r), rand(-3 + r, 3 - r)];
  const v = [rand(-0.15, 0.15), rand(-0.15, 0.15)];
  const color = [rand(0, 255), rand(0, 255), rand(0, 255), rand(0, 255)];
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
  vertexShader: {
    src: vertexShader,
    vars: ['a_position', 'a_col', 'a_vel', 'a_center', 'a_radius', 'u_matrix', 'u_z', 'u_time'],
  },
  vertices: { data: points },
  buffers: [
    {
      name: 'a_col', size: 4, data: colors, type: 'UNSIGNED_BYTE', normalize: true,
    },
    { name: 'a_vel', data: velocities },
    { name: 'a_center', data: centers },
    { name: 'a_radius', data: radii, size: 1 },
  ],
  uniforms: [
    { name: 'u_time' },
  ],
  mods: { state: { isChanging: true } },
});

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
