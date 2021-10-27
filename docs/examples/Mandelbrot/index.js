/* globals Fig */
/* eslint-disable object-property-newline, object-curly-newline */

const figure = new Fig.Figure({ color: [1, 1, 1, 1], font: { size: 0.07 } });

// Create a triangle strip grid
const width = 2;
const height = 2;
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

// Shader that calculates color of image, and handles zoom/pan
const mandelbrot = figure.add({
  make: 'gl',
  vertices: createGrid(0.002),
  glPrimitive: 'TRIANGLE_STRIP',
  vertexShader: {
    src: `
      varying vec4 v_color;
      uniform mat4 u_worldViewProjectionMatrix;
      uniform float u_zoom;
      uniform int u_iterations;
      uniform vec2 u_offset;
      attribute vec2 aVertex;

      // hsv to rgb conversion
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
        for (int i = 0; i < 10000; i++) {
          xTemp = x * x - y * y + x0;
          y = 2.0 * x * y + y0;
          x = xTemp;
          iteration = i;
          if (x * x + y * y > 4.0 || i > u_iterations - 1) {
            break;
          }
        }
        float n = float(iteration) + 1.0 - log(log2(sqrt(x * x + y * y)));
        float hue = n / float(10000) / 0.05;
        float value = 1.0;
        if (iteration == u_iterations || iteration == 9999) {
          value = 0.0;
        }
        v_color = vec4(hsv2rgb(vec3(hue, 1.0, value)).rgb, 1.0);
      }`,
    vars: ['aVertex', 'u_worldViewProjectionMatrix', 'u_zoom', 'u_offset', 'u_iterations'],
  },
  fragmentShader: { color: 'vertex' },
  uniforms: [
    { name: 'u_zoom', length: 1, value: [1], type: 'FLOAT' },
    { name: 'u_offset', length: 2, value: [0, 0], type: 'FLOAT_VECTOR' },
    { name: 'u_iterations', length: 1, value: [300], type: 'INT' },
  ],
});

// Zoom label
const zoomLabel = figure.add({
  make: 'collections.rectangle',
  label: 'x1',
  position: [-0.845, 0.9],
  width: 0.25,
  height: 0.15,
  fill: [0, 0, 0, 0.4],
});

// Gesture rectangle that detects pan and zoom over the entire figure
const gesture = figure.add({
  make: 'gesture',
  width: 2,
  height: 2,
  pan: { left: -1, right: 1, bottom: -1, top: 1, wheel: false },
  zoom: { max: 200000, min: 1, pinchSensitivity: 10 },
});

gesture.notifications.add('zoom', (mag, offset) => {
  mandelbrot.drawingObject.uniforms.u_zoom.value = [mag];
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
  const z = Fig.round(mag, mag > 10 ? 0 : 1).toFixed(mag > 10 ? 0 : 1);
  zoomLabel.setLabel(`x${z}`);
});
gesture.notifications.add('pan', (offset) => {
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
});

// Slider that changes interation count
const slider = figure.add({
  make: 'collection',
  elements: [
    {
      make: 'rectangle',
      width: 1.1,
      height: 0.2,
      color: [0, 0, 0, 0.4],
    },
    {
      name: 'label',
      make: 'text',
      text: 'Max Iterations: 100',
      xAlign: 'center',
      font: { size: 0.07 },
    },
    {
      make: 'collections.slider',
      name: 'slider',
      width: 1,
      position: [0, -0.05],
      touchBorder: 0.1,
    },
  ],
  position: [-0.42, -0.87],
});

slider._slider.notifications.add('changed', (v) => {
  const iterations = Math.max(Math.floor(Fig.tools.math.easein(v) * 10000), 1);
  mandelbrot.drawingObject.uniforms.u_iterations.value = [iterations];
  slider._label.custom.updateText({ text: `Max Iterations ${iterations}` });
});

// Initial positions
slider._slider.setValue(0.22);
gesture.setZoom({ mag: 1.8, offset: [-0.3, 0] });
