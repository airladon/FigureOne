const figure = new Fig.Figure({ limits: [-2, -2, 4, 4] });
const { imageToShapes } = Fig.tools.morph;

const micImage = new Image();
micImage.src = './mic.png';
const headphonesImage = new Image();
headphonesImage.src = './headphones.png';

let index = 0;
const loaded = () => {
  index += 1;
  if (index < 2) {
    return;
  }

  const [mic, micColors] = imageToShapes({
    image: micImage,
    width: 0.7,
    filter: c => c[3] > 0,
  });

  const [headphones, headphoneColors] = imageToShapes({
    image: headphonesImage,
    width: 0.7,
    filter: c => c[3] > 0,
    num: mic.length / 6 / 2,
  });

  const m = figure.add({
    make: 'morph',
    points: [mic, headphones],
    color: [micColors, headphoneColors],
  });

  // const a = figure.add({
  //   make: 'polygon',
  //   sides: 5,
  //   radius: 0.5,
  //   position: [0, 0, 0.5],
  //   color: [0.7, 0.7, 0.7, 1],
  // });
  figure.add({
    make: 'text',
    text: 'a',
    position: [0.5, 0, -0.2],
  });
  const v = 0.5;
  const h = 0.05;
  const col = (c, numVertices) => {
    let out = [];
    for (let i = 0; i < numVertices; i += 1) {
      out = [...out, ...c];
    }
    return out;
  };

  const makeRod = (length, radius, sides, rx, ry, rz) => {
    const corners = Fig.tools.morph.getPolygonCorners({ radius, sides });
    const cornersZ = corners.map(c => c.add(0, 0, length));
    const t = new Fig.Transform().rotate(rx, ry, rz);
    const tc = corners.map(c => c.transformBy(t.mat));
    const tcZ = cornersZ.map(c => c.transformBy(t.mat));
    const frontNormal = new Fig.Point(0, 0, -1).transformBy(t.mat);
    const backNormal = new Fig.Point(0, 0, 1).transformBy(t.mat);
    const sideNormals = [];
    const delta = Math.PI * 2 / sides / 2;
    for (let i = 0; i < sides; i += 1) {
      const angle = delta + i * delta * 2;
      const normal = Fig.tools.g2.polarToRect(1, angle);
      sideNormals.push(normal.transformBy(t.mat));
    }
    const points = [];
    const normals = [];
    for (let i = 0; i < sides; i += 1) {
      const next = i === corners.length - 1 ? 0 : i + 1;
      points.push(new Fig.Point(0, 0, 0).transformBy(t.mat));
      points.push(tc[i]._dup());
      points.push(tc[next]._dup());
      normals.push(frontNormal._dup());
      normals.push(frontNormal._dup());
      normals.push(frontNormal._dup());
    }
    for (let i = 0; i < corners.length; i += 1) {
      const next = i === corners.length - 1 ? 0 : i + 1;
      points.push(tc[i]._dup(), tcZ[i]._dup(), tcZ[next]._dup());
      points.push(tc[i]._dup(), tcZ[next]._dup(), tc[next]._dup());
      normals.push(sideNormals[i]._dup());
      normals.push(sideNormals[i]._dup());
      normals.push(sideNormals[i]._dup());
      normals.push(sideNormals[i]._dup());
      normals.push(sideNormals[i]._dup());
      normals.push(sideNormals[i]._dup());
    }
    for (let i = 0; i < sides; i += 1) {
      const next = i === corners.length - 1 ? 0 : i + 1;
      points.push(new Fig.Point(0, 0, length).transformBy(t.mat));
      points.push(tcZ[i]);
      points.push(tcZ[next]);
      normals.push(backNormal._dup());
      normals.push(backNormal._dup());
      normals.push(backNormal._dup());
    }
    const vertices = [];
    const norms = [];
    for (let i = 0; i < points.length; i += 1) {
      vertices.push(points[i].x);
      vertices.push(points[i].y);
      vertices.push(points[i].z);
      norms.push(normals[i].x);
      norms.push(normals[i].y);
      norms.push(normals[i].z);
    }
    return [vertices, norms];
  };
  const [rx, nx] = makeRod(0.5, 0.01, 10, 0, Math.PI / 2, 0);
  const [ry, ny] = makeRod(0.5, 0.01, 10, -Math.PI / 2, 0, 0);
  const [rz, nz] = makeRod(0.5, 0.01, 10, 0, 0, 0);
  // const [ry, ny] = makeRod(0.5, 0.03, 10, Math.PI / 2, Math.PI / 2);
  // const [rz, nz] = makeRod(0.5, 0.03, 10, 0, 0);
  const b = figure.add({
    make: 'gl',
    color: [1, 0, 0, 1],
    vertexShader: 'simple3DLight',
    fragShader: 'simpleLight',
    vertices3: {
      // data: [
      //   0, 0, 0, v, 0, 0, v, h, 0,
      //   0, 0, 0, v, h, 0, 0, h, 0,
      //   0, 0, 0, 0, h, 0, 0, h, v,
      //   0, 0, 0, 0, h, v, 0, 0, v,
      //   0, 0, 0, h, 0, 0, h, v, 0,
      //   0, 0, 0, h, v, 0, 0, v, 0,
      //   // v, 0, 0, v, v, 0, v, v, v,
      //   // v, 0, 0, v, v, v, v, 0, v,
      //   // 0, 0, 0, 0, v, 0, 0, v, v,
      //   // 0, 0, 0, 0, v, v, 0, 0, v,
      // ],
      data: [
        ...rx,
        ...ry,
        ...rz,
      ],
    },
    buffers: [
      // {
      //   name: 'a_col',
      //   size: 4,
      //   data: [
      //     ...col([1, 0, 0, 1], 6 * 4),
      //     // ...col([0, 0.5, 0, 1], 6),
      //     // ...col([0, 0, 1, 1], 6),
      //     // ...col([0.6, 0, 0, 1]),
      //   ],
      // },
      {
        name: 'a_norm',
        size: 3,
        data: [
          ...nx,
            ...ny,
            ...nz,
        ],
      },
    ],
    uniforms: [
      {
        name: 'u_reverseLightDirection',
        length: 3,
        type: 'FLOAT_VECTOR',
      },
      {
        name: 'u_diffuseLight',
        length: 1,
        type: 'FLOAT',
      },
    ],
    transform: [['t', 0, 0, 0.1]],
  });

  const l = new Fig.Point(-1, 0, 0).normalize();
  b.custom.updateUniform('u_reverseLightDirection', [l.x, l.y, l.z]);
  b.custom.updateUniform('u_diffuseLight', 0.4);
  // b.drawingObject.uniforms.u_reverseLightDirection.value = [0, 0, 1];
  m.animations.new()
    .delay(1)
    .morph({ start: 0, target: 1, duration: 2 })
    .start();

  figure.camera = new Fig.Transform([['r', -0.2, 0, 0]]);
  figure.animations.new()
    .camera({ target: [['r', -0.2, -Math.PI * 2, 0]], duration: 5 })
    .start();
  // m.animations.new()
  //   .rotation({ target: [Math.PI / 3, Math.PI / 3, 0], duration: 2 })
  //   .start();
};

micImage.onload = loaded.bind(this);
headphonesImage.onload = loaded.bind(this);
