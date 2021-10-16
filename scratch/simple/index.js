// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure();


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
const plane = figure.add({
  make: 'gl',
  vertices: createGrid(0.005),
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

      void main() {
        gl_Position = u_worldViewProjectionMatrix * vec4(aVertex.xy, 0, 1);
        vec2 p = aVertex / u_zoom + u_offset;
        v_color = vec4((p.x + 2.0) / 4.0, 0, 1.0 - (p.y + 2.0) / 4.0, 1);
        if (mod(p.x, 0.2) < 0.1 && mod(p.y, 0.2) < 0.1) {
          v_color = vec4(0, 1, 0, 1);
        }
        // } else {
        //   v_color = vec4(0, 1, 0, 1);
        // }
      }`,
    vars: ['aVertex', 'u_worldViewProjectionMatrix', 'u_zoom', 'u_offset'],
  },
  fragmentShader: { color: 'vertex' },
  uniforms: [
    { name: 'u_zoom', length: 1, value: [1], type: 'FLOAT' },
    { name: 'u_offset', length: 2, value: [0, 0], type: 'FLOAT_VECTOR' },
  ],
});

const polygon = figure.add({
  make: 'polygon',
  sides: 10,
  color: [1, 0, 0, 0.5],
  radius: 0.3,
  position: [0, -0.2],
});


figure.notifications.add('zoom', (zoom) => {
  const z = figure.getZoom();
  console.log(z.mag, z.offset.round(4).toArray(2), z.current.position.round(2).toArray(2));
  polygon.setPosition(new Fig.Point(0, -0.2).add(z.offset).scale(z.mag));
  polygon.setScale(z.mag);
  plane.drawingObject.uniforms.u_zoom.value = [z.mag];
  plane.drawingObject.uniforms.u_offset.value = [-z.offset.x, -z.offset.y];
})

// const zoomPad = figure.add({
//   make: 'rectangle',
//   color: [1, 0, 0, 0.5],
//   width: 1,
//   height: 1,
// });

// figure.notifications.add('zoom', ([zoom, position]) => {

// });