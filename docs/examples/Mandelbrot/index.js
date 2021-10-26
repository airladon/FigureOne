/* globals Fig */
const figure = new Fig.Figure({ color: [1, 1, 1, 1], font: { size: 0.1 } });

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
        // int u_iterations = 1000;
        for (int i = 0; i < 10000; i++) {
          xTemp = x * x - y * y + x0;
          y = 2.0 * x * y + y0;
          x = xTemp;
          if (x * x + y * y > 4.0 || i > u_iterations - 1) {
            break;
          }
          iteration = i;
        }
        float n = float(iteration) + 1.0 - log(log2(sqrt(x * x + y * y)));
        float hue = n / float(u_iterations) / 0.05;
        float value = 1.0;
        if (iteration == u_iterations - 1) {
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

const gesture = figure.add({
  make: 'gesture',
  width: 2,
  height: 2,
  pan: { left: -1, right: 1, bottom: -1, top: 1 },
  zoom: { max: 100000, min: 1 },
});

const zoomLabel = figure.add({
  make: 'text',
  text: 'x1',
  position: [-0.95, 0.9],
});

gesture.notifications.add('zoom', (mag, offset) => {
  mandelbrot.drawingObject.uniforms.u_zoom.value = [mag];
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
  const z = Fig.round(mag, mag > 10 ? 0 : 1).toFixed(mag > 10 ? 0 : 1);
  zoomLabel.custom.updateText({ text: `x${z}` });
});
gesture.notifications.add('pan', (offset) => {
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
});


gesture.setPan([-0.3, 0]);
figure.animateNextFrame();
// const pointsOfInterest = [
//   [0.220677388, -0.181429276],
//   [-0.1087904219498018, -0.5572250906987657],
//   // [-0.18260290646676458, -0.31595987852468016],
//   [-0.18698705526012077, -0.32988490477339766],
//   [0.15156397638681676, -0.010705604655830618],
//   [-0.18852968586608368, -0.31940789492436533],
//   [-0.6729668656682573, 0.03210886294562362],
//   [0.20775963562485703, 0.07976980492224645],
//   [0.18951239418578564, 0.09750453318803581],
//   [-0.30301456294395923, 0.2317992449718462],
//   [0.00028311531629309866, 0.3757324669471037],
//   [0.004502135535009389, 0.4109531577163531],
//   [-0.08210208202343242, 0.5155483482293634],
//   [-0.7422312214460767, 0.000005415584647713078], // 8800
// ];

// const button = figure.add({
//   make: 'collections.button',
//   label: { text: 'Next' },
//   position: [0.7, -0.85],
//   colorFill: [0, 0, 0, 0.7],
//   color: [1, 1, 1, 1],
//   width: 0.3,
//   height: 0.15,
// });

figure.add({
  make: 'rectangle',
  width: 1.1,
  height: 0.2,
  position: [-0.3, -0.85],
  color: [0, 0, 0, 0.7],
});
const iterationsText = figure.add({
  make: 'text',
  text: 'Max Iterations: 100',
  position: [-0.3, -0.85],
  xAlign: 'center',
  font: { size: 0.07 },
});
const slider = figure.add({
  make: 'collections.slider',
  width: 1,
  position: [-0.3, -0.9],
});
slider.notifications.add('changed', (v) => {
  const iterations = Math.max(Math.floor(Fig.tools.math.easein(v) * 10000), 10);
  mandelbrot.drawingObject.uniforms.u_iterations.value = [iterations];
  iterationsText.custom.updateText({ text: `Max Iterations ${iterations}`})
});

// let index = 1;
// button.notifications.add('touch', () => {
//   figure.stop();
//   const z = gesture.getZoom();
//   const l = new Fig.Line(z.offset, pointsOfInterest[index]);
//   const newZ = 10000;
//   index = (index + 1) % pointsOfInterest.length;
//   const easeOut = p => (1 - p) ** ((p) * 10);
//   const easeIn = p => p ** 8;
//   const easeOut2 = p => (1 - p) ** 8;
//   slider.setValue(0.22);
//   const a = 4 / z.mag;
//   figure.animations.new()
//     .custom({
//       callback: (p) => {
//         const q = p < 0.5 ? 16 * p ** 5 : 1 - ((-2 * p + 2) ** 5) / 2;
//         pointsOfInterest.l
//       },
//     })
//     // .custom({
//     //   callback: (p) => {
//     //     let mag;
//     //     if (z.mag > 4) {
//     //       mag = z.mag * easeOut(p) + 4;
//     //     } else {
//     //       mag = z.mag * (1 + easeIn(p) * (a - 1));
//     //     }
//     //     // console.log(easeIn(p))
//     //     const offset = l.pointAtPercent((p ** 10) / 2);
//     //     gesture.setZoom({ mag, offset });
//     //   },
//     //   // duration: Math.log(z.mag) / Math.log(2),
//     //   duration: Math.max(Math.log(z.mag) / Math.log(2), l.length() / 0.5),
//     //   progression: 'linear',
//     // })
//     // .custom({
//     //   callback: (p) => {
//     //     // const mag = newZ * easeIn(p);
//     //     const b = newZ / 4;
//     //     const mag = 4 * (1 + easeIn(p) * (b - 1));
//     //     const offset = l.pointAtPercent(1 - easeOut2(Math.min(p, 1)) / 2);
//     //     gesture.setZoom({ mag, offset });
//     //   },
//     //   duration: 5,
//     //   progression: 'linear',
//     // })
//     .start();
// });

gesture.setZoom({ mag: 1.8, offset: [-0.3, 0] });

