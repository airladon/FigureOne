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

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">width</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>] | undefined</span></span><div class="tsd-comment tsd-typography"><p>width of axis</p></div></li>
<li><span><span class="tsd-kind-parameter">start</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>] | undefined</span> <span class="tsd-signature-symbol">= 0</span></span><div class="tsd-comment tsd-typography"><p>start value of axis</p></div></li>
<li><span><span class="tsd-kind-parameter">length</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>] | undefined</span></span><div class="tsd-comment tsd-typography"><p>length of axis</p></div></li>
<li><span><span class="tsd-kind-parameter">sides</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>] | undefined</span> <span class="tsd-signature-symbol">= 10</span></span><div class="tsd-comment tsd-typography"><p>number of sides in
cross section of axis</p></div></li>
<li><span><span class="tsd-kind-parameter">lines</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | [<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>] | undefined</span> <span class="tsd-signature-symbol">= false</span></span><div class="tsd-comment tsd-typography"><p><code>true</code> if to draw as
lines instead of a solid</p></div></li>
<li><span><span class="tsd-kind-parameter">arrow</span>: <span class="tsd-signature-type"><a href="../interfaces/d3_line3.OBJ_Line3Arrow.html" class="tsd-signature-type">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a> | [<a href="../interfaces/d3_line3.OBJ_Line3Arrow.html" class="tsd-signature-type">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a>, <a href="../interfaces/d3_line3.OBJ_Line3Arrow.html" class="tsd-signature-type">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a>, <a href="../interfaces/d3_line3.OBJ_Line3Arrow.html" class="tsd-signature-type">OBJ_Line3Arrow</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a>] | undefined</span></span><div class="tsd-comment tsd-typography"><p>arrow options
for axes</p></div></li>
<li><span><span class="tsd-kind-parameter">color</span>: <span class="tsd-signature-type"><a href="../types/types.TypeColor.html" class="tsd-signature-type">TypeColor</a> | [<a href="../types/types.TypeColor.html" class="tsd-signature-type">TypeColor</a>, <a href="../types/types.TypeColor.html" class="tsd-signature-type">TypeColor</a>, <a href="../types/types.TypeColor.html" class="tsd-signature-type">TypeColor</a>] | undefined</span></span><div class="tsd-comment tsd-typography"><p>axes color - default is x: red, y: green, z: blue.</p></div></li>
</ul>

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

