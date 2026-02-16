---
title: Geometry API
group: Geometry
---

# Geometry API Reference

## Contents

- [polygon](#polygon)
- [polygonLine](#polygonline)
- [cone](#cone)
- [CubeOptionsDefined](#cubeoptionsdefined)
- [Line3OptionsDefined](#line3optionsdefined)
- [prism](#prism)
- [revolve](#revolve)
- [SphereOptionsDefined](#sphereoptionsdefined)
- [SurfaceOptionsDefined](#surfaceoptionsdefined)
- [TypeParsableLine](#typeparsableline)
- [Line](#line)
- [TypeParsablePlane](#typeparsableplane)
- [Plane](#plane)
- [TypeParsablePoint](#typeparsablepoint)
- [Point](#point)
- [Rect](#rect)
- [TypeParsableRect](#typeparsablerect)
- [TypeParsableTransform](#typeparsabletransform)
- [Transform](#transform)

---

## polygon

Create points a regular polygon.

Can return either:
- Array<{@link Point}> - corners of a polygon
- Array<`number`> - interlaced points of triangles used to a polygon fill

---

## polygonLine

Create a solid regular polygon line.

Can return either:
- Array<{@link Point}> - [inner corner 0, outer corner 0, inner corner 1,
  outer corner 1, inner corner 2...]
- Array<`number`> - interlaced points of triangles used to draw a polygon line

---

## cone

Return points of a cone.

The points can either represent the triangles that make up each face, or
represent the start and end points lines that are the edges of each face of
the cone.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<div class="fo-prop"><span class="fo-prop-name">options</span> <span class="fo-prop-type">(<a href="../interfaces/d3_cube.OBJ_CubePoints.html">OBJ_CubePoints</a>)</span><span class="fo-prop-desc">: cone options
@return {[Array&lt;Point&gt;, Array&lt;Point&gt;]} an array of points and normals. If
the points represent lines, then the array of normals will be empty.</span></div>

---

## CubeOptionsDefined

Return points of a cube.

The points can either represent the triangles that make up each face, or
represent the start and end points lines that are the edges of the cube.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<div class="fo-prop"><span class="fo-prop-name">options</span> <span class="fo-prop-type">(<a href="../interfaces/d3_cube.OBJ_CubePoints.html">OBJ_CubePoints</a>)</span><span class="fo-prop-desc">: cube options
@return {[Array&lt;Point&gt;, Array&lt;Point&gt;]} an array of points and normals. If
the points represent lines, then the array of normals will be empty.</span></div>

---

## Line3OptionsDefined

Return points of a 3D line with optional arrows.

The points can either represent the triangles that make up each face, or
represent the start and end points of lines that are the edges of each face
of the shape.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<div class="fo-prop"><span class="fo-prop-name">options</span> <span class="fo-prop-type">(<a href="../interfaces/d3_line3.OBJ_Line3Points.html">OBJ_Line3Points</a>)</span><span class="fo-prop-desc">: line options
@return {[Array&lt;Point&gt;, Array&lt;Point&gt;]} an array of points and normals. If
the points represent lines, then the array of normals will be empty.</span></div>

---

## prism

Return points of a prism.

The points can either represent the triangles that make up each base, or
represent the start and end points lines that are the edges of the prism.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<div class="fo-prop"><span class="fo-prop-name">options</span> <span class="fo-prop-type">(<a href="../interfaces/d3_prism.OBJ_PrismPoints.html">OBJ_PrismPoints</a>)</span><span class="fo-prop-desc">: cube options
@return {[Array&lt;Point&gt;, Array&lt;Point&gt;]} an array of points and normals. If
the points represent lines, then the array of normals will be empty.</span></div>

---

## revolve

Return points of a 3D surface created by revolving (or radially sweeping) a
2D profile around an axis.

The points can either represent the triangles that make up each face, or
represent the start and end points lines that are the edges of each face of
the cone.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

A profile is defined in the XY plane, and then revolved around the x axis.

The resulting points can oriented and positioned by defining a axis and
position. The axis directs the x axis (around which the profile was
rotated) to any direction. The position then offsets the transformed points
in 3D space, there the original (0, 0, [0]) point is translated to
(position.x, position.y, position.z)

All profile points must have a y value that is not 0, with the exceptions of
the ends which can be 0.

@param {OBJ_Revolve} options
@return {[Array<Point>, Array<Point>]} an array of points and normals. If
the points represent lines, then the array of normals will be empty.

---

## SphereOptionsDefined

Return points of a sphere.

The points can either represent the triangles that make up each face, or
represent the start and end points lines that are the edges of each face of
the sphere.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<div class="fo-prop"><span class="fo-prop-name">options</span> <span class="fo-prop-type">(<a href="../interfaces/d3_cube.OBJ_CubePoints.html">OBJ_CubePoints</a>)</span><span class="fo-prop-desc">: sphere options
@return {[Array&lt;Point&gt;, Array&lt;Point&gt;]} an array of points and normals. If
the points represent lines, then the array of normals will be empty.</span></div>

---

## SurfaceOptionsDefined

Return points of a 3D surface. A 3D surface is defined by a 2D matrix of
points (a grid).

The points can either represent the triangles that make up each face, or
represent the start and end points lines that are the edges of each face of
the cone.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

---

## TypeParsableLine

A {@link Line} is defined with either:
- an instantiated {@link Line}
- two points [{@link TypeParsablePoint}, {@link TypeParsablePoint}]
- two points and the number of ends
  [{@link TypeParsablePoint}, {@link TypeParsablePoint}, `1 | 2 | 0`]
- a line definition object {@link OBJ_LineDefinition}
- A recorder state definition {@link TypeF1DefLine}
- A string representation of all options except the first

The `ends` defines whether a line is finite (a line segment between two
points - `ends = 2`), a ray (a line extending to infinity in one direction
from a point - `ends = 1`), or a infinite line (a line extending to infinity
in both directions - `ends = 0`).

#### l1, l2, l3, l4, l5, and l6 are all the same

```js
l1 = new Fig.Line([0, 0], [2, 0]);
l2 = Fig.getLine([[0, 0], [2, 0]]);
l3 = Fig.getLine({ p1: [0, 0], length: 2, direction: [1, 0] });
l4 = Fig.getLine({ p1: [0, 0], length: 2, angle: 0 });
l5 = Fig.getLine({ p1: [0, 0], length: 2, theta: Math.PI / 2, phi: 0 });
l6 = Fig.getLine({ p1: [0, 0], p2: [2, 0] });
```

---

## Line

Object representing a Line.

Contains methods that makes it conventient to use lines in calculations.

#### get Line from Fig

```js
const { Line } = Fig;

// define a line from [0, 0] to [1, 0]
const l = new Line([0, 0], [1, 0]);

// find the length of the line
const len = l.length();

// get the point at length 0.2 along the line
const p = l.pointAtLength(0.2);

// find the intersect with another line
const i = l.intersectsWith([[0.5, 0.5], [0.5, -0.5]]);
```

---

## TypeParsablePlane

A {@link Plane} is defined with either:
- an instantiated {@link Plane}
- a position and normal vector
  [{@link TypeParsablePoint}, {@link TypeParsablePoint}]
- three points [{@link TypeParsablePoint}, {@link TypeParsablePoint},
  {@link TypeParsablePoint}]
- A recorder state definition {@link TypeF1DefPlane}
- A string representation of all options except the first

When defining 3 points p1, p2 and p3, the normal will be in the direction of
the cross product of p12 with p13.

#### p1, p2, and p3 are all equal planes

```js
p1 = new Fig.Plane([0, 0, 0], [0, 1, 0]);
p2 = Fig.getPlane([[0, 0, 0], [0, 1, 0]]);
p3 = Fig.getPlane([[0, 0, 0], [1, 0, 0], [0, 0, 1]]);
```

---

## Plane

Object representing a plane.

Contains methods that makes it convenient to operate on planes,
points and lines.

A plane can either be created with:
- a point on the plane and a normal
- 3 points on the plane

If defined with 3 points P1, P2, and P3, then the normal will be in the
direction of the cross product of vectors P1P2 and P1P3.

#### define a plane at the origin in the XZ plane

```js
const p = new Plane([0, 0, 0], [0, 1, 0]);

// see if a point is on the plane
const result = p.hasPointOn([1, 0, 1]);

// find the intersect with a line
const i = lineIntersect([[0, -0.5, 0], [0, 0.5, 0]])
```

---

## TypeParsablePoint

A {@link Point} can be defined in several ways
- As an instantiated {@link Point}
- As an x, y tuple: [number, number]
- As an x, y, z tuple: [number, number, number]
- As an x, y string: '[number, number]'
- As an x, y, z string: '[number, number, number]'
- As a recorder state definition: { f1Type: 'p', state: [number, number, number] }
}
- A string representation of all options except the first

If points are defined with only a `x` and `y` component, then `z` will be
set to 0 automatically.

#### p1, p2, p3 and p4 are all the same when parsed by `getPoint`

```js
p1 = new Fig.Point(2, 3);
p2 = [2, 3];
p3 = '[2, 3]';
p4 = { f1Type: 'p', state: [2, 3] };
p5 = [2, 3, 0];
```

---

## Point

Object representing a point or vector.

Contains methods that makes it convenient to work with points and vectors.

#### get Point from Fig

```js
const { Point } = Fig;

// define a point at (0, 2)
const p = new Point(0, 2);

// find the distance to another point (0, 1) which will be 1
const d = p.distance([0, 1]);

// add to another point (3, 1) which will result in (3, 3)
const q = p.add(3, 1);
```

> {@link TypeParsablePoint}, {@link isParsablePoint}


---

## Rect

An object representing a rectangle.

#### get Rect from Fig

```js
const { Rect } = Fig;

// define a rect centered at origin with width 4 and height 2
const r = new Rect(-2, -1, 4, 2);
```

---

## TypeParsableRect

A {@link Rect} can be defined with either
- an instantiated {@link Rect}
- an array of left, bottom, width, height values
 `[number, number, number, number]`
- a recorder state definition {@link TypeF1DefRect}
- a string representation of all options except the first

#### All rectangles are the same when parsed by `getRect` and have a lower

```js
left corner of `(-2, -1)`, a width of `4`, and a height of `2`
const r1 = Fig.getRect([-2, -1, 4, 2]);
const r2 = new Fig.Rect(-2, -1, 4, 2);
const r3 = Fig.getRect('[-2, -1, 4, 2]');
```

---

## TypeParsableTransform

A transform is defined with either:
- an instantiated {@link Transform}
- an array of transform components {@link TypeTransformUserDefinition}
- a single transform component {@link TypeTransformComponentUserDefinition}
- a recorder state definition {@link TypeF1DefTransform}
- A string representation of all options except the first

#### t1, t2 and t3 are all equal transforms

```js
const t1 = new Fig.Transform().scale(2).rotate(Math.PI / 2).translate(1, 1);
const t2 = new Fig.Transform([['s', 2], ['r', Math.PI / 2], ['t', 1, 1]]);
const t3 = Fig.getTransform([['s', 2], ['r', Math.PI / 2], ['t', 1, 1]]);
```

> See {@link Transform} for a summary of transfom components available.

---

## Transform

A Transform is a chain or cascade of transform components, such as rotations
and translations.

The transform components cascade to form a single 3D transform matrix in
homogenous coordinates - meaning the result is a 4x4 matrix. This matrix can
be used to transform a point in space.

There are several built in transform components:

- Translation
- Scale
- Rotation
- Direction transform
- Custom (where a specific matrix can be defined)
- Change of basis from standard basis
- Change of basis from an initial basis

Matrix multiplication is not commutative, and so chaining transforms is not
commutative. This means the order of components is important.

For example, if a point (1, 0) is first translated by (1, 0) and then
rotated by π / 2, then it will start at (1, 0), then move to (2, 0), then
rotate to (0, 2).

In comparison if the same point is first rotated by π / 2 then translated by
(1, 0) it will start at (1, 0), then rotate to (0, 1), then move to (1, 1).

In this Transform object, the order that components are defined, is the order
the resulting transform will represent.

A transform can be created by either chaining transform component methods on
an instantiated Transform object, or using an array definition of
components. For example the following two transforms are the same:
```
const t1 = new Transform().scale(1).translate(1, 0);
const t2 = new Transform([['s', 1], ['t', 1, 0]]);
```

> See {@link TypeParsableTransform} for the different ways to define a transform.

---

