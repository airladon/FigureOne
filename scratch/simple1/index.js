/* globals Fig */
const  { Point } = Fig;
const figure = new Fig.Figure({ limits: [-1, -1, 2, 2], backgroundColor: [1, 0.9, 0.9, 1] });

const col = (c, numVertices) => {
  let out = [];
  for (let i = 0; i < numVertices; i += 1) {
    out = [...out, ...c];
  }
  return out;
};

const makeSphere = (radius, sides) => {
  const arc = [];
  const dTheta = Math.PI / sides;
  const dPhi = dTheta;
  const arcs = [];
  const points = [];
  const normals = [];
  for (let phi = 0; phi < Math.PI * 2 + 0.0001; phi += dPhi) {
    const thetaArc = [];
    for (let theta = 0; theta < Math.PI + 0.0001; theta += dTheta) {
      thetaArc.push(new Point(
        radius * Math.cos(phi) * Math.sin(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(theta),
      ));
    }
    arcs.push(thetaArc);
  }

  for (let p = 0; p < sides * 2; p += 1) {
    for (let t = 0; t < sides; t += 1) {
      points.push(arcs[p][t]);
      points.push(arcs[p + 1][t + 1]);
      points.push(arcs[p][t + 1]);
      points.push(arcs[p][t]);
      points.push(arcs[p + 1][t]);
      points.push(arcs[p + 1][t + 1]);
      const normalPhi = p * dPhi + dPhi / 2;
      const normalTheta = t * dTheta + dTheta / 2;
      const normal = new Point(
        Math.cos(normalPhi) * Math.sin(normalTheta),
        Math.sin(normalPhi) * Math.sin(normalTheta),
        Math.cos(normalTheta),
      );
      normals.push(normal._dup());
      normals.push(normal._dup());
      normals.push(normal._dup());
      normals.push(normal._dup());
      normals.push(normal._dup());
      normals.push(normal._dup());
    }
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
}
makeSphere(1, 2);
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
const vertexShader = {
  dimension: 3,
  normals: true,
  light: 'directional',
};
const fragShader = {
  light: 'directional',
};
const makeAxis = (name, color, rx, ry, rz, position) => {
  const [vertices, normals] = makeRod(1, 0.01, 20, rx, ry, rz);
  const a = figure.add({
    name,
    make: 'gl',
    vertexShader,
    fragShader,
    vertices3: { data: vertices },
    normals: { data: normals },
    color,
    position,
  });
  a.setTouchable();
};
makeAxis('x', [1, 0, 0, 1], 0, Math.PI / 2, 0, [-0.5, 0, 0]);
makeAxis('y', [0, 1, 0, 1], -Math.PI / 2, 0, 0, [0, -0.5, 0]);
makeAxis('z', [0, 0, 1, 1], 0, 0, 0, [0, 0, -0.5]);

const addSphere = (name, position, color) => {
  const [sx, sn] = makeSphere(0.05, 20);
  const s = figure.add({
    name,
    make: 'gl',
    vertexShader,
    fragShader,
    vertices3: { data: sx },
    normals: { data: sn },
    color,
    position,
  });
  s.setTouchable();
};

addSphere('xPos', [0.95, 0, 0], [1, 0.5, 0.5, 1]);
addSphere('xNeg', [-0.95, 0, 0], [1, 0, 0, 1]);
addSphere('yPos', [0, 0.95, 0], [0, 1, 0, 1]);
addSphere('yNeg', [0, -0.95, 0], [0, 0.5, 0, 1]);
addSphere('zPos', [0, 0, 0.95], [0.5, 0.5, 1, 1]);
addSphere('zNeg', [0, 0, -0.95], [0, 0, 1, 1]);

figure.add({
  make: 'text',
  text: 'a',
  position: [0.5, 0, 0],
  xAlign: 'center',
});

const k = figure.add({
  make: 'text',
  text: 'a',
  position: [0.5, 0, 0],
  xAlign: 'center',
});
k.scene = new Fig.Scene({ left: -2, right: 2, bottom: -1, top: 1 });

figure.scene.light.directional = [1, 1, 1];
figure.scene.light.min = 0;
figure.scene.light.point = [0.3, 0.1, 1];


// figure.scene.setCamera({ position: [0.2, 0.2, 2] });
// figure.scene.setProjection({ style: 'perspective', near: 1.03, far: 3, aspectRatio: 2, fieldOfView: Math.PI * 0.4 });

figure.scene.setCamera({ position: [0, 0, 1.1] });

figure.scene.setProjection({
  style: 'orthographic', near: 0.1, far: 4, left: -2, right: 2, bottom: -1, top: 1,
});
// console.log('asdf')

// figure.elements.animations.new()
//   .rotation({ target: [0.5, 0.5, 0], duration: 5 })
//   .start()
figure.animations.new()
  .camera({ target: { position: [0.5, 0.5, 1.1] }, duration: 5 })
  .camera({ target: { position: [1, 1, 1.1] }, duration: 5 })
  .start();



function Node(val) {
  this.val = val;
  this.left = null;
  this.right = null;
}

function show(n) {
  const out = [];
  if (n != null) {
    out.push(...show(n.left));
    out.push(n.val);
    out.push(...show(n.right));
  }
  return out;
}

function insert(root, val) {
  if (root == null) {
    return new Node(val);
  }
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else if (val > root.val) {
    root.right = insert(root.right, val);
  }
  return root;
}

const root = insert(null, 5);
insert(root, 2);
insert(root, 10);
insert(root, -10);
insert(root, 4);
insert(root, 8);
insert(root, 12);

function min(n) {
  if (n.left != null) {
    return min(n.left);
  }
  return n.val;
}

function max(n) {
  if (n.right != null) {
    return max(n.right);
  }
  return n.val;
}

console.log(show(root))
console.log(min(root))
console.log(max(root))