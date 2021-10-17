// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure();


const width = 1;
const height = 1;
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
const plane = figure.add({
  make: 'gl',
  vertices: createGrid(0.001),
  position: [0, 0],
  dimension: 2,
  color: [0.3, 0, 0, 1],
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
        int maxIterations = 1000;
        int iteration = 0;
        float x = 0.0;
        float y = 0.0;
        float x0 = p.x / 0.5;
        float y0 = p.y / 0.5;
        float xTemp;
        for (int i = 0; i < 1000; i++) {
          xTemp = x*x - y*y + x0;
          y = 2.0 * x * y + y0;
          x = xTemp;
          if (x * x + y * y > 4.0) {
            break;
          }
          iteration = i;
        }
        float z = sqrt(x * x + y * y);
        float n = float(iteration) + 1.0 - log(log2(z));
        float hue = n / float(maxIterations) / 0.05;
        float rotHue = 0.0;
        if (hue > rotHue) {
          hue -= rotHue;
        } else {
          hue = (1.0 - rotHue) + hue;
        }
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

const s = new Fig.Scene({
  left: -1, right: 1, bottom: -1, top: 1,
});
const polygon = figure.add({
  make: 'polygon',
  sides: 10,
  color: [1, 0, 0, 0.5],
  radius: 0.3,
  position: [0, -0.2],
  scene: s,
  move: true,
});

figure.setZoomOptions({ scale: 5, max: 1000000, min: 0.5 });
figure.notifications.add('zoom', (zoom) => {
  const z = figure.getZoom();
  // console.log(z.mag, z.offset.round(4).toArray(2), z.current.position.round(2).toArray(2));
  figure.zoom2DScene(s, [-1, -1, 2, 2]);
  // figure.zoomElement(polygon, [0, -0.2], false);
  plane.drawingObject.uniforms.u_zoom.value = [z.mag];
  plane.drawingObject.uniforms.u_offset.value = [-z.offset.x, -z.offset.y];
});

// const zoomPad = figure.add({
//   make: 'rectangle',
//   color: [1, 0, 0, 0.5],
//   width: 1,
//   height: 1,
// });

// figure.notifications.add('zoom', ([zoom, position]) => {

// });