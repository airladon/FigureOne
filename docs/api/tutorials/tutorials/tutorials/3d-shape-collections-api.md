---
title: 3D Shape Collections API
group: 3D Shape Collections
---

# 3D Shape Collections API Reference

## Contents

- [COL_Axis3](#col_axis3)
- [CollectionsAxis3](#collectionsaxis3)

---

## COL_Axis3

*Extends {@link OBJ_Collection}*

{@link CollectionsAxis3} options object that extends {@link OBJ_Collection}
options object (without `parent`).

Each option can either be singular and applied to all axes, or in a 3 element
tuple where the first, second and third elements apply to the x, y, and z
axes respectively.

To not create an axis, use a width of exactly 0.

### Properties

<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>]?)</span><span class="fo-prop-desc">: width of axis</span></div>
<div class="fo-prop"><span class="fo-prop-name">start</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>]?)</span><span class="fo-prop-desc">: start value of axis (<code>0</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">length</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>]?)</span><span class="fo-prop-desc">: length of axis</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>]?)</span><span class="fo-prop-desc">: number of sides in
cross section of axis (<code>10</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lines</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>]?)</span><span class="fo-prop-desc">: <code>true</code> if to draw as
lines instead of a solid (<code>false</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">arrow</span> <span class="fo-prop-type">(<a href="../interfaces/d3_line3.OBJ_Line3Arrow.html">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a> | [<a href="../interfaces/d3_line3.OBJ_Line3Arrow.html">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>, <a href="../interfaces/d3_line3.OBJ_Line3Arrow.html">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>, <a href="../interfaces/d3_line3.OBJ_Line3Arrow.html">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>]?)</span><span class="fo-prop-desc">: arrow options
for axes</span></div>
<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a> | [<a href="../types/types.TypeColor.html">TypeColor</a>, <a href="../types/types.TypeColor.html">TypeColor</a>, <a href="../types/types.TypeColor.html">TypeColor</a>]?)</span><span class="fo-prop-desc">: axes color - default is x: red, y: green, z: blue.</span></div>

---

## CollectionsAxis3

{@link FigureElementCollection} representing x, y, z axes.

![](../apiassets/axis3.png)

This object creates an x, y, and z axes.

The axes can be created uniformly, or customized individually.

See {@link COL_Axis3} for setup options.

To test examples below, append them to the
<a href="#shapes3d-boilerplate">boilerplate</a>

#### Create positive x, y, and z axes

```js
figure.add(
  {
    make: 'collections.axis3',
    arrow: true,
    length: 0.5,
  },
);
```

#### Create full x, y, and z axes with arrows

```js
figure.add(
  {
    make: 'collections.axis3',
    arrow: { ends: 'all' },
    start: -0.5,
    length: 1,
  },
);
```

#### Customize each axis

```js
figure.add(
  {
    make: 'collections.axis3',
    arrow: [{ ends: 'end' }, false, { ends: 'all', width: 0.02 }],
    width: 0.02,
    start: [0, 0, -0.5],
    length: [0.5, 0.5, 1],
  },
);
```

#### Lines axes all the same color

```js
figure.add(
  {
    make: 'collections.axis3',
    arrow: { ends: 'all' },
    start: -0.5,
    length: 1,
    lines: true,
    color: [1, 0, 0, 1],
  },
);
```

---

