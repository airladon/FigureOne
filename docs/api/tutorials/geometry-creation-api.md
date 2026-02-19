---
title: Geometry Creation API
group: Geometry Creation
---

# Geometry Creation API Reference

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

---

## polygon

Create points a regular polygon.

Can return either:
- Array<{@link Point}> - corners of a polygon
- Array<`number`> - interlaced points of triangles used to a polygon fill

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d2_polygon.OBJ_PolygonPoints.html" class="tsd-signature-type">OBJ_PolygonPoints</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>[] | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>[]</span>

---

## polygonLine

Create a solid regular polygon line.

Can return either:
- Array<{@link Point}> - [inner corner 0, outer corner 0, inner corner 1,
  outer corner 1, inner corner 2...]
- Array<`number`> - interlaced points of triangles used to draw a polygon line

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d2_polygon.OBJ_PolygonLinePoints.html" class="tsd-signature-type">OBJ_PolygonLinePoints</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>[] | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>[]</span>

---

## cone

Return points of a cone.

The points can either represent the triangles that make up each face, or
represent the start and end points lines that are the edges of each face of
the cone.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_cube.OBJ_CubePoints.html" class="tsd-signature-type">OBJ_CubePoints</a></span></span><div class="tsd-comment tsd-typography"><p>cone options</p></div></li>
</ul>

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_cone.OBJ_ConePoints.html" class="tsd-signature-type">OBJ_ConePoints</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>]</span> — an array of points and normals. If
the points represent lines, then the array of normals will be empty.

---

## CubeOptionsDefined

Return points of a cube.

The points can either represent the triangles that make up each face, or
represent the start and end points lines that are the edges of the cube.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_cube.OBJ_CubePoints.html" class="tsd-signature-type">OBJ_CubePoints</a></span></span><div class="tsd-comment tsd-typography"><p>cube options</p></div></li>
</ul>

### Returns

<span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>]</span> — an array of points and normals. If
the points represent lines, then the array of normals will be empty.

---

## Line3OptionsDefined

Return points of a 3D line with optional arrows.

The points can either represent the triangles that make up each face, or
represent the start and end points of lines that are the edges of each face
of the shape.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_line3.OBJ_Line3Points.html" class="tsd-signature-type">OBJ_Line3Points</a></span></span><div class="tsd-comment tsd-typography"><p>line options</p></div></li>
</ul>

### Returns

<span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>]</span> — an array of points and normals. If
the points represent lines, then the array of normals will be empty.

---

## prism

Return points of a prism.

The points can either represent the triangles that make up each base, or
represent the start and end points lines that are the edges of the prism.

If the points represent triangles, then a second array of normal vectors
for each point will be available.

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_prism.OBJ_PrismPoints.html" class="tsd-signature-type">OBJ_PrismPoints</a></span></span><div class="tsd-comment tsd-typography"><p>cube options</p></div></li>
</ul>

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_prism.OBJ_PrismPoints.html" class="tsd-signature-type">OBJ_PrismPoints</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>]</span> — an array of points and normals. If
the points represent lines, then the array of normals will be empty.

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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes3D.OBJ_Revolve.html" class="tsd-signature-type">OBJ_Revolve</a></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>]</span> — an array of points and normals. If
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

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">options</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_cube.OBJ_CubePoints.html" class="tsd-signature-type">OBJ_CubePoints</a></span></span><div class="tsd-comment tsd-typography"><p>sphere options</p></div></li>
</ul>

### Returns

<span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="../classes/geometry_Point.Point.html" class="tsd-signature-type">Point</a>>]</span> — an array of points and normals. If
the points represent lines, then the array of normals will be empty.

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

