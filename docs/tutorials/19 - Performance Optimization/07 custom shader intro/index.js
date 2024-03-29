/* globals Fig */

const figure = new Fig.Figure({
  scene: [-3, -3, 3, 3],
  backgroundColor: [1, 1, 0.9, 1],
});
const { rand } = Fig;

// Vertex shader
// Input attributes:
//    - 'a_vertex' (vertex position)
//    - 'a_velocity: (vertex velocity)
// Input uniforms:
//    - u_time: time from start of animation
const vertexShader = `
attribute vec2 a_vertex;
attribute vec2 a_velocity;
uniform mat4 u_worldViewProjectionMatrix;
uniform float u_time;
void main() {
  float x = a_vertex.x + a_velocity.x * u_time;
  float y = a_vertex.y + a_velocity.y * u_time;
  gl_Position = u_worldViewProjectionMatrix * vec4(x, y, 0, 1);
}`;

// Create vertices for 10,000 polygons. Each polygon is 20 triangles.
// Each triangle has vertices of the polygon center and the two corners of one
// side.
// Each vertex will need an associated velocity where the velocity should be the
// same for all vertices in a polygon
const points = [];
const velocities = [];
const sides = 20;
const step = Math.PI * 2 / (sides);
for (let i = 0; i < 10000; i += 1) {
  const r = rand(0.02, 0.05);
  const p = [rand(-1, 1), rand(-1, 1)];
  const v = [rand(-0.15, 0.15) * r * 50, rand(-0.15, 0.15) * r * 50];
  for (let j = 0; j < sides; j += 1) {
    points.push(p[0], p[1]);
    points.push(r * Math.cos(step * j) + p[0], r * Math.sin(step * j) + p[1]);
    points.push(r * Math.cos(step * (j + 1)) + p[0], r * Math.sin(step * (j + 1)) + p[1]);
    velocities.push(v[0], v[1], v[0], v[1], v[0], v[1]);
  }
}

const element = figure.add({
  make: 'gl',
  // Define the custom shader and variables. u_worldViewProjectionMatrix is the
  // element transform combined with the scene (projection and camera)
  // matrix.
  vertexShader: {
    src: vertexShader,
    vars: ['a_vertex', 'a_velocity', 'u_worldViewProjectionMatrix', 'u_time'],
  },
  // Built in shader with one color for all vertices
  fragmentShader: 'simple',
  // Define buffers and uniforms
  vertices: { data: points },
  attributes: [{ name: 'a_velocity', data: velocities }],
  uniforms: [{ name: 'u_time' }],
  // Element color and mods
  color: [1, 0, 1, 0.5],
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
  element.drawingObject.uniforms.u_time.value = [deltaTime];
});
figure.addFrameRate();
figure.animateNextFrame();
