// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure();


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
// const plane = figure.add({
//   make: 'gl',
//   vertices: createGrid(0.001),
//   position: [0, 0],
//   dimension: 2,
//   color: [0.3, 0, 0, 1],
//   glPrimitive: 'TRIANGLE_STRIP',
//   vertexShader: {
//     src: `
//       varying vec4 v_color;
//       uniform mat4 u_worldViewProjectionMatrix;
//       uniform float u_zoom;
//       uniform vec2 u_offset;
//       attribute vec2 aVertex;

//       vec3 hsv2rgb(vec3 c) {
//         vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
//         vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
//         return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
//       }

//       void main() {
//         gl_Position = u_worldViewProjectionMatrix * vec4(aVertex.xy, 0, 1);
//         vec2 p = aVertex / u_zoom + u_offset;
//         int iteration = 0;
//         float x = 0.0;
//         float y = 0.0;
//         float x0 = p.x / 0.5;
//         float y0 = p.y / 0.5;
//         float xTemp;
//         int maxIterations = 1000;
//         for (int i = 0; i < 100000; i++) {
//           float x2 = x * x;
//           float y2 = y * y;
//           xTemp = x2 - y2 + x0;
//           y = 2.0 * x * y + y0;
//           x = xTemp;
//           if (x2 + y2 > 4.0 || i > maxIterations - 1) {
//             break;
//           }
//           iteration = i;
//         }
//         float z = sqrt(x * x + y * y);
//         float n = float(iteration) + 1.0 - log(log2(z));
//         float hue = n / float(maxIterations) / 0.05;
//         float rotHue = 0.0;
//         if (hue > rotHue) {
//           hue -= rotHue;
//         } else {
//           hue = (1.0 - rotHue) + hue;
//         }
//         float value = 1.0;
//         if (iteration == maxIterations - 1) {
//           value = 0.0;
//         }
//         v_color = vec4(hsv2rgb(vec3(hue, 1.0, value)).rgb, 1.0);
//       }`,
//     vars: ['aVertex', 'u_worldViewProjectionMatrix', 'u_zoom', 'u_offset'],
//   },
//   fragmentShader: { color: 'vertex' },
//   uniforms: [
//     { name: 'u_zoom', length: 1, value: [1], type: 'FLOAT' },
//     { name: 'u_offset', length: 2, value: [0, 0], type: 'FLOAT_VECTOR' },
//   ],
// });
// R
// t {_type: "point", x: -1, y: -1, z: 0}
// t {_type: "point", x: -1, y: 1, z: 0}
// t {_type: "point", x: 1, y: 1, z: 0}
// t {_type: "point", x: 1, y: -1, z: 0}
// P
// 0 t {_type: "point", x: 4, y: 0, z: 0}
// 1 t {_type: "point", x: 0, y: 0, z: 0}
// 2 t {_type: "point", x: 0, y: 0, z: 0}
// 3 t {_type: "point", x: 0, y: 0, z: 0}
// 4 t {_type: "point", x: 1, y: 0, z: 0}
// 5 t {_type: "point", x: 0, y: 0, z: 0}
// Pd
// 0 t {_type: "point", x: 0, y: 0, z: 0}
// 1 t {_type: "point", x: 0, y: 0, z: 0}
// 2 t {_type: "point", x: 0, y: 0, z: 0}
// 3 t {_type: "point", x: 4, y: 0, z: 0}
// 4 t {_type: "point", x: 0, y: 0, z: 0}
const { round } = Fig;
const colors = [
  [round(78 / 255, 3), round(15 / 255, 3), round(98 / 255, 3), 1],
  [round(100 / 255, 3), round(157 / 255, 3), round(97 / 255, 3), 1],
  [round(81 / 255, 3), round(167 / 255, 3), round(208 / 255, 3), 1],
  [round(70 / 255, 3), round(89 / 255, 3), round(137 / 255, 3), 1],
  [round(68 / 255, 3), round(142 / 255, 3), round(153 / 255, 3), 1],
];
const plane = figure.add({
  make: 'gl',
  vertices: createGrid(0.001),
  dimension: 2,
  color: [0.3, 0, 0, 1],
  glPrimitive: 'TRIANGLE_STRIP',
  vertexShader: {
    src: `
      #define mul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
      varying vec4 v_color;
      uniform mat4 u_worldViewProjectionMatrix;

      uniform vec2 u_offset;
      uniform float u_zoom;
      uniform float u_convergenceSpeed;

      attribute vec2 aVertex;

      // Complex division
      vec2 div(vec2 a, vec2 b) {
        float den = b.x * b.x + b.y * b.y;
        return vec2((a.x * b.x + a.y * b.y) / den, (-a.x * b.y + a.y * b.x) / den);
      }
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      vec2 square(vec2 a) { return mul(a, a); }
      vec2 cube(vec2 a) { return mul(a, square(a)); }

      void main() {
        gl_Position = u_worldViewProjectionMatrix * vec4(aVertex.xy, 0, 1);

        vec2 p0 = vec2(4, 0);
        vec2 p4 = vec2(1, 0);

        vec2 pd3 = vec2(4, 0);

        vec2 p = aVertex / u_zoom + u_offset;
        vec2 lastP = vec2(p.x + 1.0, p.y + 1.0);
        float k = 0.0;
        for(int i = 0; i < 30; i++) {
          k = k + 1.0 / 30.0;
          if (distance(lastP, p) > 0.1) {
            vec2 squareP = square(p);
            vec2 cubeP = mul(p, squareP);
            vec2 quadP = mul(p, cubeP);
            lastP = p;
            vec2 Px = mul(p4, quadP) + p0;
            vec2 Pdx = mul(pd3, cubeP);
            p = p - div(Px, Pdx);
          } else {
            break;
          }
        }
        if (u_convergenceSpeed > 0.5) {
          v_color = vec4(k, k / 5.0, k / 2.0, 1);
        }
      }`,
    vars: ['aVertex', 'u_worldViewProjectionMatrix', 'u_offset', 'u_zoom', 'u_convergenceSpeed'],
  },
  fragmentShader: {
    src: `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }`,
  },
  uniforms: [
    { name: 'u_offset', length: 2, value: [0, 0], type: 'FLOAT_VECTOR' },
    { name: 'u_zoom', length: 1, value: [1], type: 'FLOAT' },
    { name: 'u_convergenceSpeed', length: 1, value: [1], type: 'FLOAT' },
  ],
});
// const plane = figure.add({
//   make: 'gl',
//   vertices: createGrid(0.001),
//   dimension: 2,
//   color: [0.3, 0, 0, 1],
//   glPrimitive: 'TRIANGLE_STRIP',
//   vertexShader: {
//     src: `
//       #define mul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
//       varying vec4 v_color;
//       uniform mat4 u_worldViewProjectionMatrix;

//       uniform vec2 u_offset;
//       uniform float u_zoom;
//       uniform float u_convergenceSpeed;

//       attribute vec2 aVertex;

//       // Complex division
//       vec2 div(vec2 a, vec2 b) {
//         float den = b.x * b.x + b.y * b.y;
//         return vec2((a.x * b.x + a.y * b.y) / den, (-a.x * b.y + a.y * b.x) / den);
//       }
//       vec3 hsv2rgb(vec3 c) {
//         vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
//         vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
//         return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
//       }

//       vec2 square(vec2 a) { return mul(a, a); }
//       vec2 cube(vec2 a) { return mul(a, square(a)); }

//       void main() {
//         gl_Position = u_worldViewProjectionMatrix * vec4(aVertex.xy, 0, 1);

//         vec2 p0 = vec2(4, 0);
//         vec2 p1 = vec2(0, 0);
//         vec2 p2 = vec2(0, 0);
//         vec2 p3 = vec2(0, 0);
//         vec2 p4 = vec2(1, 0);

//         vec2 pd0 = vec2(0, 0);
//         vec2 pd1 = vec2(0, 0);
//         vec2 pd2 = vec2(0, 0);
//         vec2 pd3 = vec2(4, 0);

//         vec2 r0 = vec2(-1, -1);
//         vec2 r1 = vec2(-1, 1);
//         vec2 r2 = vec2(1, 1);
//         vec2 r3 = vec2(1, -1);

//         vec2 p = aVertex / u_zoom + u_offset;
//         vec2 lastP = vec2(p.x + 1.0, p.y + 1.0);
//         float k = 0.0;
//         for(int i = 0; i < 500; i++) {
//           k = k + 1.0 / 500.0;
//           if (distance(lastP, p) > 0.00001) {
//             vec2 squareP = square(p);
//             vec2 cubeP = mul(p, squareP);
//             vec2 quadP = mul(p, cubeP);
//             lastP = p;
//             vec2 Px = mul(p4, quadP) + mul(p3, cubeP) + mul(p2, squareP) + mul(p1, p) + p0;
//             vec2 Pdx = mul(pd3, cubeP) + mul(pd2, squareP) + mul(pd1, p) + pd0;
//             p = p - div(Px, Pdx);
//           } else {
//             break;
//           }
//         }
//         if (u_convergenceSpeed > 0.5) {
//           // v_color = vec4(1.0 - k, 0, 0, 1);
//           v_color = vec4(k * 5.0, k * 5.0, k * 10.0, 1);
//           // v_color = vec4(hsv2rgb(vec3(k / 0.8 + 0.5, 1.0, 1.0)).rgb, 1.0);
//         } else {
//           k = k * 10.0;
//           float a = 10.0;
//           float b = 0.4;
//           float c = 0.2;
//           float hue = k / a + b + c;
//           float minDistance = distance(r0, p);
//           float r1Distance = distance(r1, p);
//           float r2Distance = distance(r2, p);
//           float r3Distance = distance(r3, p);
//           // v_color = vec4(${colors[0]});
//           v_color = vec4(0, k, k / 0.5, 1);
//           if (r1Distance < minDistance) {
//             minDistance = r1Distance;
//             hue = k / a + b + c * 2.0;
//             // v_color = vec4(${colors[1]});
//             v_color = vec4(0, 0, k / 0.5, 1);
//           }
//           if (r2Distance < minDistance) {
//             minDistance = r2Distance;
//             hue = k / a + b + c * 3.0;
//             // v_color = vec4(${colors[2]});
//             v_color = vec4(0, k / 2.0, k, 1);
//           }
//           if (r3Distance < minDistance) {
//             minDistance = r3Distance;
//             hue = k / a + b + c * 4.0;
//             // v_color = vec4(${colors[3]});
//             v_color = vec4(0, k, k, 1);
//           }
//           // v_color = vec4(hsv2rgb(vec3(hue, 1.0, 1.0)).rgb, 1.0);
//         }
//         // v_color = vec4(1, 0, 1, 1);
//       }`,
//     vars: ['aVertex', 'u_worldViewProjectionMatrix', 'u_offset', 'u_zoom', 'u_convergenceSpeed'],
//   },
//   fragmentShader: {
//     src: `
//       precision mediump float;
//       varying vec4 v_color;
//       void main() {
//         gl_FragColor = v_color;
//       }`,
//   },
//   uniforms: [
//     { name: 'u_offset', length: 2, value: [0, 0], type: 'FLOAT_VECTOR' },
//     { name: 'u_zoom', length: 1, value: [1], type: 'FLOAT' },
//     { name: 'u_convergenceSpeed', length: 1, value: [1], type: 'FLOAT' },
//   ],
// });

const s = new Fig.Scene({
  left: -1, right: 1, bottom: -1, top: 1,
});

const gesture = figure.add({
  make: 'gesture',
  // color: [0, 0, 1, 0.2],
  width: 2,
  height: 2,
  // position: [0.5, 0.5],
  onlyWhenTouched: false,
  zoom: true,
  pan: true,
  // pan: {
  //   left: -0.2,
  //   right: 0,
  // },
});
// figure.addZoomPanControl({ color: [1, 0, 0, 0.4]});

const axis = figure.add({
  name: 'axis',
  make: 'collections.zoomAxis',
  axis: 'x',
  length: 1,
  position: [-0.5, -0.8],
  ticks: { length: 0.03 },
  // grid: { length: 0.1, color: [1, 0, 0, 1], offset: 0 },
  labels: { precision: 2, fix: false },
  start: 0,
  stop: 2,
  step: 0.5,
  font: { size: 0.05 },
  title: 'hellow',
});

axis.pan(2, 0.5);
// axis.addTicks({ length: 0.05, offset: -0.05, step: 0.05 }, 'ticks');


const polygon = figure.add({
  make: 'polygon',
  sides: 10,
  color: [1, 0, 0, 0.5],
  radius: 0.3,
  position: [0, -0.2],
  scene: s,
  move: true,
});

const ps = new Fig.Scene({ style: 'orthographic', light: { directional: [0.2, 0.3, 0.9] }, camera: { position: [0.2, 0.5, 1] } });
figure.add({
  make: 'cube',
  side: 0.2,
  scene: ps,
  color: [0, 1, 0, 1],
});

figure.add({
  make: 'cube',
  side: 0.2,
  scene: ps,
  color: [0, 1, 0, 1],
  position: [0.3, 0],
  move: true,
});

gesture.setZoomOptions({ scale: 5, max: 100000, min: 0.25 });

gesture.notifications.add('zoom', () => {
  const z = gesture.getZoom();
  // console.log(z.mag, z.offset.round(4).toArray(2), z.current.position.round(2).toArray(2));
  // console.log(z.mag, z.offset)
  gesture.zoomScene(s);
  gesture.zoomScene(ps);
  // figure.zoomElement(polygon, [0, -0.2], false);
  plane.drawingObject.uniforms.u_zoom.value = [z.mag];
  plane.drawingObject.uniforms.u_offset.value = [-z.offset.x, -z.offset.y];
});

gesture.notifications.add('pan', (pan) => {
  // const z = gesture.getZoom();
  // console.log(z.mag, z.offset.round(4).toArray(2), z.current.position.round(2).toArray(2));
  // console.log(z.mag, z.offset)
  // console.log(pan)
  gesture.panScene(s);
  gesture.panScene(ps);
  axis.pan(-pan.x, 0.5);
  // figure.zoomElement(polygon, [0, -0.2], false);
  // plane.drawingObject.uniforms.u_zoom.value = [z.mag];
  plane.drawingObject.uniforms.u_offset.value = [-pan.x, -pan.y];
});


// const zoomPad = figure.add({
//   make: 'rectangle',
//   color: [1, 0, 0, 0.5],
//   width: 1,
//   height: 1,
// });

// figure.notifications.add('zoom', ([zoom, position]) => {

// });
figure.addFrameRate(10, { color: [1, 0, 0, 1] });