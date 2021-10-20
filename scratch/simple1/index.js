// const { polygon } = Fig.tools.g2;

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
  pan: true,
  zoom: true,
});

gesture.notifications.add('zoom', (mag, offset) => {
  mandelbrot.drawingObject.uniforms.u_zoom.value = [mag];
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
});
gesture.notifications.add('pan', (offset) => {
  mandelbrot.drawingObject.uniforms.u_offset.value = [offset.x, offset.y];
  figure.animateNextFrame();
});

gesture.setPan([-0.2, 0]);
figure.addFrameRate();


// gesture.setZoom({ mag: 2, position: [0.75, 0] });

// figure.scene.setPanZoom(new Fig.Point(0.6 / 3.5 * 2.5, 0.1 / 3.5 * 2.5), 3.5);
// setPanZoom first pans, then zooms
// So to pan around a point p: p / mag - p
// figure.scene.setPanZoom(new Fig.Point(-0.6 / 3.5 - -0.6, -0.1 / 3.5 - -0.1), 3.5);
// figure.scene.setPan(new Fig.Point(0.5, 0.5));
// figure.scene.setPanZoom(new Fig.Point(-0.6 / 0.25 - -0.6, -0.1 / 0.25 - -0.1), 0.25);
// gesture.setZoom({ mag: 3, offset: [0.6 / 3 -0.6, 0.1 / 3 -0.1] });
// figure.animateNextFrame();

// const s = new Fig.Scene({
//   left: -1, right: 1, bottom: -1, top: 1,
// });

// const gesture = figure.add({
//   make: 'gesture',
//   color: [0, 0, 1, 0.2],
//   width: 1,
//   height: 2,
//   position: [0.3, 0],
//   onlyWhenTouched: false,
//   // zoom: { position: [0.5, -0.28] },
//   // pan: { wheel: true, sensitivity: 2 },
//   // pan: {
//   //   left: -0.2,
//   //   right: 0,
//   // },
// });
// // figure.addZoomPanControl({ color: [1, 0, 0, 0.4]});

// const axis = figure.add({
//   name: 'axis',
//   make: 'collections.zoomAxis',
//   axis: 'x',
//   length: 1,
//   position: [-0.2, -0.85],
//   ticks: { length: 0.03 },
//   // grid: { length: 0.1, color: [1, 0, 0, 1], offset: 0 },
//   labels: { precision: 2, fix: false },
//   start: 0,
//   stop: 2,
//   step: 0.1,
//   font: { size: 0.05 },
//   // title: 'this is an axis',
// });

// axis.pan(2, 0.5);
// // axis.addTicks({ length: 0.05, offset: -0.05, step: 0.05 }, 'ticks');


// const polygon = figure.add({
//   make: 'polygon',
//   sides: 10,
//   color: [1, 0, 0, 0.5],
//   radius: 0.3,
//   position: [0, -0.2],
//   scene: s,
//   move: true,
// });

// const ps = new Fig.Scene({ style: 'orthographic', light: { directional: [0.2, 0.3, 0.9] }, camera: { position: [0.2, 0.5, 1] } });
// figure.add({
//   make: 'cube',
//   side: 0.2,
//   scene: ps,
//   color: [0, 1, 0, 1],
// });

// figure.add({
//   make: 'cube',
//   side: 0.2,
//   scene: ps,
//   color: [0, 1, 0, 1],
//   position: [0.3, 0],
//   move: true,
// });

// const pow = (pow = 2, stop = 10, step = 0.05) => {
//   const xValues = Fig.range(0, stop, step);
//   return xValues.map(x => new Fig.Point(x, x ** pow));
// };

// const plot = figure.add({
//   name: 'plot',
//   make: 'collections.plot',
//   width: 1,                                    // Plot width in figure
//   height: 1,                                   // Plot height in figure
//   yAxis: {
//     start: 0,
//     stop: 100,
//     type: 'zoom',
//     step: 20,
//     labels: true,
//     ticks: true,
//     grid: true,
//   },              // Customize y axis limits
//   xAxis: {
//     start: 0,
//     stop: 10,
//     type: 'zoom',
//     step: 2,
//     labels: true,
//     grid: true,
//     ticks: true,
//   },              // Customize y axis limits
//   trace: [
//     { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
//     {                                          // Trace with only markers
//       points: pow(2, 10, 0.5),
//       name: 'Power 2',
//       markers: { sides: 4, radius: 0.03 },
//     },
//     {                                          // Trace with markers and
//       points: pow(3, 10, 0.5),                 // dashed line
//       name: 'Power 3',
//       markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
//       line: { dash: [0.04, 0.01] },
//     },
//   ],
//   legend: { font: { size: 0.1 } },
//   position: [-0.8, -0.8],
// });

// gesture.setZoomOptions({ scale: 5, max: 100000, min: 0.25 });

// gesture.notifications.add('zoom', () => {
//   const z = gesture.getZoom();
//   // console.log(z.mag, z.offset.round(4).toArray(2), z.current.position.round(2).toArray(2));
//   // console.log(z.mag, z.offset)
//   gesture.zoomScene(s);
//   gesture.zoomScene(ps);
//   // figure.zoomElement(polygon, [0, -0.2], false);
//   plane.drawingObject.uniforms.u_zoom.value = [z.mag];
//   plane.drawingObject.uniforms.u_offset.value = [-z.offset.x, -z.offset.y];
//   const x = axis.drawToValue(z.current.position.x);
//   axis.changeZoom(x, z.mag);
//   // console.log(plot.drawToPoint(z.current.position), z.current.position)
//   // plot.changeZoom(plot.drawToPoint(z.current.position), z.mag);
// });

// gesture.notifications.add('pan', (pan) => {
//   // const z = gesture.getZoom();
//   // console.log(z.mag, z.offset.round(4).toArray(2), z.current.position.round(2).toArray(2));
//   // console.log(z.mag, z.offset)
//   // console.log(pan)
//   gesture.panScene(s);
//   gesture.panScene(ps);
//   const p = gesture.getPan();
//   axis.panDeltaDraw(-p.delta.x);
//   plot.panDeltaDraw(p.delta.scale(-1));
//   // figure.zoomElement(polygon, [0, -0.2], false);
//   // plane.drawingObject.uniforms.u_zoom.value = [z.mag];
//   plane.drawingObject.uniforms.u_offset.value = [-pan.x, -pan.y];
// });


// // const zoomPad = figure.add({
// //   make: 'rectangle',
// //   color: [1, 0, 0, 0.5],
// //   width: 1,
// //   height: 1,
// // });

// // figure.notifications.add('zoom', ([zoom, position]) => {

// // });
// figure.addFrameRate(10, { color: [1, 0, 0, 1] });