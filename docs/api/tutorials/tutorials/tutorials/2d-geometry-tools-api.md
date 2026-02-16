---
title: 2D Geometry Tools API
group: 2D Geometry Tools
---

# 2D Geometry Tools API Reference

## Contents

- [getTriangleCenter](#gettrianglecenter)
- [minAngleDiff](#minanglediff)
- [clipAngle](#clipangle)
- [normAngle](#normangle)
- [getDeltaAngle](#getdeltaangle)
- [getDeltaAngle3D](#getdeltaangle3d)
- [threePointAngle](#threepointangle)
- [threePointAngleMin](#threepointanglemin)
- [polarToRect](#polartorect)
- [rectToPolar](#recttopolar)

---

## getTriangleCenter

Get center of a triangle

#### Example 1

```js
const getTriangleCenter = Fig.getTriangleCenter;

const center = getTriangleCenter([0, 0], [1, 0], [0, 1]);
console.log(center);
// Point {x: 0.3333333333333333, y: 0.3333333333333333}
```

---

## minAngleDiff

Get the minimum absolute angle difference between two angles

#### Example 1

```js
const minAngleDiff = Fig.minAngleDiff;
const d1 = minAngleDiff(0.1, 0.2);
console.log(d1);
// -0.1

const d2 = minAngleDiff(0.2, 0.1);
console.log(d2);
// 0.1

const d3 = minAngleDiff(0.1, -0.1);
console.log(d3);
// 0.2
```

---

## clipAngle

Clip and angle between 0 and 2π (`'0to360'`) or -π to π (`'-180to180'`).
`null` will return the angle between -2π to 2π.

#### Example 1

```js
const clipAngle = Fig.clipAngle

const a1 = clipAngle(Math.PI / 2 * 5, '0to360');
console.log(a1);
// 1.5707963267948966

const a2 = clipAngle(Math.PI / 4 * 5, '-180to180');
console.log(a2);
// -2.356194490192345

const a3 = clipAngle(-Math.PI / 4 * 10, null);
console.log(a3);
// -1.5707963267948966
```

---

## normAngle

Normalize angle to between 0 and 2π.

---

## getDeltaAngle

Get angle delta based on direction

---

## getDeltaAngle3D

Get delta angle of a Point where the x, y, z components are rotations
around the x, y, and z axes.

---

## threePointAngle

Returns the angle from the line (p1, p2) to the line (p1, p3) in the positive
rotation direction and normalized from 0 to Math.PI * 2.

#### Example 1

```js
const threePointAngle = Fig.threePointAngle;
const getPoint = Fig.getPoint;

const p1 = threePointAngle(getPoint([1, 0]), getPoint([0, 0]), getPoint([0, 1]));
console.log(p1);
// 1.5707963267948966

const p2 = threePointAngle(getPoint([0, 1]), getPoint([0, 0]), getPoint([1, 0]));
console.log(p2);
// 4.71238898038469
```

---

## threePointAngleMin

Returns the minimum angle from the line (p1, p2) to the line (p1, p3).

#### Example 1

```js
const threePointAngleMin = Fig.threePointAngleMin;
const getPoint = Fig.getPoint;

const p1 = threePointAngleMin(getPoint([1, 0]), getPoint([0, 0]), getPoint([0, 1]));
console.log(p1);
// 1.5707963267948966

const p2 = threePointAngleMin(getPoint([0, 1]), getPoint([0, 0]), getPoint([1, 0]));
console.log(p2);
// -1.5707963267948966
```

---

## polarToRect

Polar coordinates to cartesian coordinates conversion

#### Example 1

```js
const polarToRect = Fig.polarToRect;
const p = polarToRect(Math.sqrt(2), Math.PI / 4);
console.log(p);
// Point {x: 1, y: 1)
```

---

## rectToPolar

Cartesian coordinates to polar coordinates conversion

#### Example 1

```js
const rectToPolar = Fig.rectToPolar;
const p = rectToPolar(0, 1);
console.log(p);
// {mag: 1, angle: 1.5707963267948966}
```

---

