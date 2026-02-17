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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">p1</span>: <span class="tsd-signature-type"><a href="../types/geometry_Point.TypeParsablePoint.html" class="tsd-signature-type">TypeParsablePoint</a></span></span></li>
<li><span><span class="tsd-kind-parameter">p2</span>: <span class="tsd-signature-type"><a href="../types/geometry_Point.TypeParsablePoint.html" class="tsd-signature-type">TypeParsablePoint</a></span></span></li>
<li><span><span class="tsd-kind-parameter">p3</span>: <span class="tsd-signature-type"><a href="../types/geometry_Point.TypeParsablePoint.html" class="tsd-signature-type">TypeParsablePoint</a></span></span></li>
</ul>

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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">angle1</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">angle2</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span>

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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">angleToClip</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">clipTo</span>: <span class="tsd-signature-type">'0to360' | '-180to180' | null | '-360to360' | '-360to0'</span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span>

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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">angle</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span>

---

## getDeltaAngle

Get angle delta based on direction

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">startAngle</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">targetAngle</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">rotDirection</span>: <span class="tsd-signature-type"><a href="../types/geometry_angle.TypeRotationDirection.html" class="tsd-signature-type">TypeRotationDirection</a></span> <span class="tsd-signature-symbol">= 0</span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span>

---

## getDeltaAngle3D

Get delta angle of a Point where the x, y, z components are rotations
around the x, y, and z axes.

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">startAngle</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
<li><span><span class="tsd-kind-parameter">targetAngle</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
<li><span><span class="tsd-kind-parameter">rotDirection</span>: <span class="tsd-signature-type"><a href="../types/geometry_angle.TypeRotationDirection.html" class="tsd-signature-type">TypeRotationDirection</a> | [<a href="../types/geometry_angle.TypeRotationDirection.html" class="tsd-signature-type">TypeRotationDirection</a>, <a href="../types/geometry_angle.TypeRotationDirection.html" class="tsd-signature-type">TypeRotationDirection</a>, <a href="../types/geometry_angle.TypeRotationDirection.html" class="tsd-signature-type">TypeRotationDirection</a>]</span> <span class="tsd-signature-symbol">= 0</span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span>

---

## threePointAngle

Returns the angle from the line (p1, p2) to the line (p1, p3) in the positive
rotation direction and normalized from 0 to Math.PI * 2.

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">p2</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
<li><span><span class="tsd-kind-parameter">p1</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
<li><span><span class="tsd-kind-parameter">p3</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span>

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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">p2</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
<li><span><span class="tsd-kind-parameter">p1</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
<li><span><span class="tsd-kind-parameter">p3</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span>

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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">mag</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">angle</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">theta</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | null</span> <span class="tsd-signature-symbol">= null</span></span></li>
</ul>

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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">x</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | <a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a></span></span></li>
<li><span><span class="tsd-kind-parameter">y</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span> <span class="tsd-signature-symbol">= 0</span></span></li>
<li><span><span class="tsd-kind-parameter">z</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span> <span class="tsd-signature-symbol">= 0</span></span></li>
</ul>

### Returns

<span class="tsd-signature-type">{ angle: <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, mag: <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, phi: <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, r: <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, theta: <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, }</span>

#### Example 1

```js
const rectToPolar = Fig.rectToPolar;
const p = rectToPolar(0, 1);
console.log(p);
// {mag: 1, angle: 1.5707963267948966}
```

---

