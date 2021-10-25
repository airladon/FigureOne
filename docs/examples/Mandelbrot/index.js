/* globals Fig */
const figure = new Fig.Figure();


// Create a triangle strip grid
const width = 1.5;
const height = 1.5;
function createGrid(spacing) {
  const x = Fig.range(-width / 2, width / 2, spacing);
  const y = Fig.range(-height / 2, height / 2, spacing);
  const points = [];
  for (let j = 0; j < y.length - 1; j += 1) {
    for (let i = 0; i < x.length; i += 1) {
      points.push(x[i], y[j], x[i], y[j + 1]);
    }
    points.push(x[x.length - 1], y[j + 1], x[0], y[j + 1]);
  }
  return points;
}

const mandelbrot = figure.add({
  make: 'gl',
  vertices: createGrid(0.002),
  glPrimitive: 'TRIANGLE_STRIP',
  vertexShader: {
    src: `
      varying vec4 v_color;
      uniform mat4 u_worldViewProjectionMatrix;
      uniform float u_zoom;
      uniform vec2 u_offset;
      attribute vec2 aVertex;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        gl_Position = u_worldViewProjectionMatrix * vec4(aVertex.xy, 0, 1);
        vec2 p = aVertex / u_zoom + u_offset;
        int iteration = 0;
        float x = 0.0;
        float y = 0.0;
        float x0 = p.x / 0.5;
        float y0 = p.y / 0.5;
        float xTemp;
        int maxIterations = 1000;
        for (int i = 0; i < 1000; i++) {
          xTemp = x * x - y * y + x0;
          y = 2.0 * x * y + y0;
          x = xTemp;
          if (x * x + y * y > 4.0 || i > maxIterations - 1) {
            break;
          }
          iteration = i;
        }
        float n = float(iteration) + 1.0 - log(log2(sqrt(x * x + y * y)));
        float hue = n / float(maxIterations) / 0.05;
        float value = 1.0;
        if (iteration == maxIterations - 1) {
          value = 0.0;
        }
        v_color = vec4(hsv2rgb(vec3(hue, 1.0, value)).rgb, 1.0);
      }`,
    vars: ['aVertex', 'u_worldViewProjectionMatrix', 'u_zoom', 'u_offset'],
  },
  fragmentShader: { color: 'vertex' },
  uniforms: [
    { name: 'u_zoom', length: 1, value: [1], type: 'FLOAT' },
    { name: 'u_offset', length: 2, value: [0, 0], type: 'FLOAT_VECTOR' },
  ],
});

const gesture = figure.add({
  make: 'gesture',
  width: 1.5,
  height: 1.5,
  pan: { left: -1, right: 1, bottom: -1, top: 1 },
  zoom: { max: 100000, min: 1 },
});

gesture.notifications.add('zoom', (mag, offset) => {
  // figure.stop();
  mandelbrot.drawingObject.uniforms.u_zoom.value = [mag];
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
  // console.log(mag, offset)
});
gesture.notifications.add('pan', (offset) => {
  // figure.stop();
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
});


gesture.setPan([-0.3, 0]);
figure.animateNextFrame();
const pointsOfInterest = [
  [0.220677388, -0.181429276],
  [-0.1087904219498018, -0.5572250906987657],
  [-0.18698705526012077, -0.32988490477339766],
  [-0.18852968586608368, -0.31940789492436533],
  [-0.18260290646676458, -0.31595987852468016],
  [0.15156397638681676, -0.010705604655830618],
  [-0.6729668656682573, 0.03210886294562362],
  [0.20775963562485703, 0.07976980492224645],
  [0.18951239418578564, 0.09750453318803581],
  [-0.30301456294395923, 0.2317992449718462],
  [0.00028311531629309866, 0.3757324669471037],
  [0.004502135535009389, 0.4109531577163531],
  [-0.08210208202343242, 0.5155483482293634],
  [-0.7422312214460767, 0.000005415584647713078], // 8800
];

const button = figure.add({
  make: 'collections.button',
  label: { text: 'Explore', font: { size: 0.1 } },
  position: [-1, 0.5],
  color: [0, 0, 0, 1],
  width: 0.4,
  height: 0.2,
});

let index = 1;
button.notifications.add('touch', () => {
  figure.stop();
  const z = gesture.getZoom();
  const l = new Fig.Line(z.offset, pointsOfInterest[index]);
  const newZ = 100000;
  index = (index + 1) % pointsOfInterest.length;
  figure.animations.new()
    .custom({
      callback: (p) => {
        const easeOut = (1 - p) ** ((p) * 10);
        const mag = z.mag * easeOut + 2;
        gesture.setZoom({ mag, offset: z.offset });
      },
      duration: z.mag / newZ * 20,
    })
    .custom({
      callback: (p) => {
        const easeIn = p ** 8;
        const mag = newZ * easeIn + 2;
        const offset = l.pointAtPercent(Math.min(p * 10, 1));
        gesture.setZoom({ mag, offset });
      },
      duration: 20,
    })
    .start();
});

gesture.setZoom({ mag: 100000, offset: [0.220677388, -0.181429276] });
figure.addFrameRate();

