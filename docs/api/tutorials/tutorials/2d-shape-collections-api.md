---
title: 2D Shape Collections API
group: 2D Shape Collections
---

# 2D Shape Collections API Reference

## Contents

- [COL_Angle](#col_angle)
- [CollectionsAngle](#collectionsangle)
- [COL_Axis](#col_axis)
- [CollectionsAxis](#collectionsaxis)
- [COL_Button](#col_button)
- [CollectionsButton](#collectionsbutton)
- [COL_Line](#col_line)
- [CollectionsLine](#collectionsline)
- [COL_Plot](#col_plot)
- [CollectionsPlot](#collectionsplot)
- [COL_Polyline](#col_polyline)
- [CollectionsPolyline](#collectionspolyline)
- [COL_Rectangle](#col_rectangle)
- [CollectionsRectangle](#collectionsrectangle)
- [COL_Slider](#col_slider)
- [CollectionsSlider](#collectionsslider)
- [COL_Toggle](#col_toggle)
- [CollectionsToggle](#collectionstoggle)
- [OBJ_Collection](#obj_collection)

---

## COL_Angle

*Extends {@link OBJ_Collection}*

{@link CollectionsAngle} options object that extends {@link OBJ_Collection}
options object (without `parent`).

The Collections Angle is a convient and powerful angle
{@link FigureElementCollection} that can draw one or several arcs of an
angle annotation, a label, arrows, and the corner of an angle. It also
includes some methods to make it convient to use dynamically.

There are two ways to define an angle. With a `position`, `startAngle` and
`angle`, or with three points. The angle can then be annotated with a curve
and a label on either side of the corner using the `direction` property.

The first way to define an angle is with `position`, `startAngle` and
`angle`. `position` is the location of the vertex of the corner.
Two lines join to make a corner, from which an angle annotation can be
superimposed. The first line is defined with `startAngle` and the second
line defined by `angle` relative to the first line. `angle` can either be
positive or negative to define the second line.

The second way to define an angle is with three points `p1`, `p2` and `p3`.
`p2` is the vertex position of the corner. Line21 is first line of the
corner and Line23 is the second.

An angle can be annotated with a `curve` (or many multiple curves) and a
`label`. `direction` defines which side of the corner the annotations will
be drawn. `direction` can either be positive or negative (`1` or `-1`).

A positive direction will place the annotations:
- on the angle formed between `startAngle` and `angle`
- *OR* the angle formed between Line21 and Line23 in the positive rotation
direction

A negative direction will place the annotations on the other side of the
corner.

A curve with multiple lines and/or arrows can be defined with `curve`.

A label that can be the real angle in degrees or radians, text or an
equation can be defined with `label`.

The annotations will be placed at some radius from the corner vertex.
`offset` can be used to draw the line some offset away from the line
definition where a positive offset is on the side of the line that the line
rotates toward when rotating in the positive direction.

Pulsing this collection normally would pulse the scale of everything.
If it often desirable to pulse only parts of the angle in special ways.
Therefore this collection provides a method `pulseAngle` to allow this.
This options object can define the default values for pulseAngle if desired.

### Properties

<div class="fo-prop"><span class="fo-prop-name">position</span> <span class="fo-prop-type">(<a href="../classes/geometry_Point.Point.html">Point</a>?)</span><span class="fo-prop-desc">: position of the angle vertex</span></div>
<div class="fo-prop"><span class="fo-prop-name">startAngle</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: rotation where the angle should start</span></div>
<div class="fo-prop"><span class="fo-prop-name">angle</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: size of the angle</span></div>
<div class="fo-prop"><span class="fo-prop-name">p1</span> <span class="fo-prop-type">(<a href="../classes/geometry_Point.Point.html">Point</a>?)</span><span class="fo-prop-desc">: alternate way to define startAngle with <code>p2</code> and <code>p3</code></span></div>
<div class="fo-prop"><span class="fo-prop-name">p2</span> <span class="fo-prop-type">(<a href="../classes/geometry_Point.Point.html">Point</a>?)</span><span class="fo-prop-desc">: alternate way to define position of the angle vertex
with <code>p2</code> and <code>p3</code></span></div>
<div class="fo-prop"><span class="fo-prop-name">p3</span> <span class="fo-prop-type">(<a href="../classes/geometry_Point.Point.html">Point</a>?)</span><span class="fo-prop-desc">: alternate way to define size of angle with <code>p2</code> and
<code>p3</code></span></div>
<div class="fo-prop"><span class="fo-prop-name">direction</span> <span class="fo-prop-type">(1 | -1?)</span><span class="fo-prop-desc">: side of the corner the angle annotations
reside</span></div>
<div class="fo-prop"><span class="fo-prop-name">curve</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Angle.OBJ_AngleCurve.html">OBJ_AngleCurve</a>?)</span><span class="fo-prop-desc">: options for a curve annotation</span></div>
<div class="fo-prop"><span class="fo-prop-name">arrow</span> <span class="fo-prop-type">(<a href="../types/FigureCollections_Angle.TypeAngleArrows.html">TypeAngleArrows</a>?)</span><span class="fo-prop-desc">: options for arrow annotations</span></div>
<div class="fo-prop"><span class="fo-prop-name">corner</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Angle.OBJ_AngleCorner.html">OBJ_AngleCorner</a>?)</span><span class="fo-prop-desc">: options for drawing a corner</span></div>
<div class="fo-prop"><span class="fo-prop-name">label</span> <span class="fo-prop-type">(<a href="../types/FigureCollections_Angle.TypeAngleLabelOptions.html">TypeAngleLabelOptions</a>?)</span><span class="fo-prop-desc">: options for label annotations</span></div>
<div class="fo-prop"><span class="fo-prop-name">pulseAngle</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Angle.OBJ_PulseAngle.html">OBJ_PulseAngle</a>?)</span><span class="fo-prop-desc">: default pulseAngle options</span></div>

---

## CollectionsAngle

{@link FigureElementCollection} representing an angle.

![](../apiassets/advangle_examples.png)

<p class="inline_gif"><img src="../apiassets/advangle_grow.gif" class="inline_gif_image"></p>

<p class="inline_gif"><img src="../apiassets/advangle_move.gif" class="inline_gif_image"></p>

This object defines a convient and powerful angle
{@link FigureElementCollection} that includes one or more curve annotations,
arrows, a label annotation that can self align and
some methods to make it convient to use dynamically.

See {@link COL_Angle} for the options that can be used when creating the
angle.

The object contains two additional animation steps `angle` and `pulseAngle`
that animate a change in angle, and animate a pulsing of the angle
respectively. The animation steps are available in
the animation manager ({@link FigureElement}.animations),
and in the animation builder
(<a href="#animationmanagernew">animations.new</a>
and <a href="#animationmanagerbuilder">animations.builder</a>).

Some of the useful methods included in an collections angle are:
- <a href="#collectionsanglepulseangle">pulseAngle</a> - customize pulsing the
  angle without
- <a href="#collectionsanglesetmovable">setMovable</a> - overrides
   <a href="#figureelementsetmovable">FigureElement.setMovable</a> and
   allowing for more complex move options.

#### Angle with size label

```js
figure.add({
  name: 'a',
  make: 'collections.angle',
  angle: Math.PI / 4,
  label: null,
  curve: {
    radius: 0.5,
    width: 0.01,
  },
  corner: {
    width: 0.01,
    length: 1,
  },
});
```

#### Right angle, created from figure.collections

```js
const a = figure.collections.angle({
  angle: Math.PI / 2,
  curve: {
    autoRightAngle: true,
    width: 0.01,
  },
  corner: {
    width: 0.01,
    length: 1,
  },
});
figure.add('a', a);
```

#### Multi colored angle with arrows and an equation label

```js
figure.add({
  name: 'a',
  make: 'collections.angle',
  angle: Math.PI / 4 * 3,
  label: {
    text: {
      elements: {
        theta: { text: '\u03b8', color: [1, 0, 1, 1] },
      },
      forms: {
        0: { frac: ['theta', 'vinculum', '2']},
      },
    },
    offset: 0.05,
    location: 'inside',
    color: [0, 0, 1, 1],
  },
  curve: {
    radius: 0.5,
    width: 0.01,
  },
  arrow: 'barb',
  corner: {
    width: 0.01,
    length: 1,
    color: [0, 0.5, 0, 1],
  },
});
```

#### Multiple curve angle, without corner

```js
const a = figure.collections.angle({
  angle: Math.PI / 4,
  curve: {
    num: 3,
    step: -0.03,
    radius: 0.5,
    width: 0.01,
  },
  label: {
    text: 'a',
    offset: 0.05,
  },
});
figure.add('a', a);
```

#### Change angle animation

```js
figure.add({
  name: 'a',
  make: 'collections.angle',
  angle: Math.PI / 4,
  label: null,
  curve: {
    radius: 0.5,
    width: 0.01,
  },
  corner: {
    width: 0.01,
    length: 1,
  },
});
figure.elements._a.animations.new()
  .angle({ start: Math.PI / 4, target: Math.PI / 4 * 3, duration: 3 })
  .start();
```

#### Movable angle

```js
figure.add({
  name: 'a',
  make: 'collections.angle',
  angle: Math.PI / 4 * 3,
  label: {
    text: null,
    location: 'outside',
    orientation: 'horizontal',
    offset: 0.1,
    update: true,
    sides: 200,
  },
  curve: {
    radius: 0.3,
    fill: true,
  },
  corner: {
    width: 0.02,
    length: 1,
    color: [0.4, 0.4, 0.4, 1],
  },
});
figure.elements._a.setMovable({
  startArm: 'rotation',
  endArm: 'angle',
  movePadRadius: 0.3,
});
```

> See {@link OBJ_AngleAnimationStep} for angle animation step options.

See {@link OBJ_PulseAngleAnimationStep} for pulse angle animation step
options.

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>.


---

## COL_Axis

*Extends {@link OBJ_Collection}*

{@link CollectionsAxis} options object that extends {@link OBJ_Collection}
options object (without `parent`).

A zoom axis can be used to create a number line, used as an axis in
{@link COL_Plot} and/or used to plot a {@link COL_Trace} against.

An axis is a line that may have
- tick marks
- labels
- grid lines
- a title

An axis is drawn to a `length`. It will have values along its length
from `start` to `stop`. Ticks, grid lines and labels are all drawn
at axis value positions. All other dimensions, such as line lengths,
widths, positions, spaces and offsets are defined in draw space, or in the
same space as the `length` of the axis.

### Properties

<div class="fo-prop"><span class="fo-prop-name">axis</span> <span class="fo-prop-type">('x' | 'y'?)</span><span class="fo-prop-desc">: <code>'x'</code> axes are horizontal, <code>'y'</code> axes are
vertical (<code>'x'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">length</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: length of the axis in draw space</span></div>
<div class="fo-prop"><span class="fo-prop-name">line</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Axis.OBJ_AxisLineStyle.html">OBJ_AxisLineStyle</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: line style of the axis -
<code>false</code> will draw no line. By default, a solid line will be drawn if not
defined.</span></div>
<div class="fo-prop"><span class="fo-prop-name">start</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: start value of axis (<code>0</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">stop</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: stop value of axis. <code>stop</code> must be larger than
<code>start</code> (<code>start + 1</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">ticks</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Axis.OBJ_AxisTicks.html">OBJ_AxisTicks</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_Axis.OBJ_AxisTicks.html">OBJ_AxisTicks</a>> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: tick
options. Use an Array to setup multiple sets/styles of ticks. Use a boolean
value to turn ticks on or off. Use a {@link TypeTickLocation} to only set
tick location property (<code>false</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">labels</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Axis.OBJ_AxisLabels.html">OBJ_AxisLabels</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | () => <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>>?)</span><span class="fo-prop-desc">: label options. Use <code>false</code> to turn labels off, or a string or function as
a callback to define custom labels for a set of values. Use
{@link TypeLabelLocation} to only set the label location property.</span></div>
<div class="fo-prop"><span class="fo-prop-name">grid</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Axis.OBJ_AxisTicks.html">OBJ_AxisTicks</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_Axis.OBJ_AxisTicks.html">OBJ_AxisTicks</a>> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: grid
options. Use an array for multiple sets of grids, and use a boolean to
turn grids on and off (<code>false</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">title</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Axis.OBJ_AxisTitle.html">OBJ_AxisTitle</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>?)</span><span class="fo-prop-desc">: axis title</span></div>
<div class="fo-prop"><span class="fo-prop-name">font</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_Font.html">OBJ_Font</a>?)</span><span class="fo-prop-desc">: default font of axis (<code>used by title and labels</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">show</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: <code>false</code> hides the axis. Two axes are needed
to plot an {@link CollectionsTrace} on a {@link CollectionsPlot}, but if either or
both axes aren't to be drawn, then use <code>false</code> to hide each axis (<code>true</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">auto</span> <span class="fo-prop-type">([<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>]?)</span><span class="fo-prop-desc">: Will select automatic values for
<code>start</code>, <code>stop</code>, and <code>step</code> that cover the range [min, max]</span></div>
<div class="fo-prop"><span class="fo-prop-name">autoStep</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a> | 'decimal'?)</span><span class="fo-prop-desc">: If <code>true</code> then start, stop and
step tick, grid and label values will be automatically calculated such that
they land on 0 and either double/half the original step (<code>true</code>) or ensure
the steps land on factors of 10 (<code>'decimal'</code>). This needs to be not <code>false</code>
if panning or zooming. If <code>false</code>, then the tick, grid and label values will
be from the <code>start</code>, <code>stop</code> and <code>step</code> properties. (<code>false</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">min</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | null)</span><span class="fo-prop-desc">: minimum value axis can be zoomed or panned to
where <code>null</code> no limit (<code>null</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">max</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | null)</span><span class="fo-prop-desc">: maximum value axis can be zoomed or panned to
where <code>null</code> no limit (<code>null</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">position</span> <span class="fo-prop-type">(<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>?)</span><span class="fo-prop-desc">: axis position (<code>[0, 0]</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">values</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>>?)</span><span class="fo-prop-desc">: custom values for labels, ticks and grid.
Only works for one level of ticks and grid, and doesn't not accomodate
zooming or panning.</span></div>

---

## CollectionsAxis

{@link FigureElementCollection} representing an Axis.

![](../apiassets/advaxis_ex1.png)

![](../apiassets/advaxis_ex2.png)

![](../apiassets/advaxis_ex3.png)

![](../apiassets/advaxis_ex4.png)

![](../apiassets/advaxis_ex5.png)

This object defines an axis with an axis line, tick marks, labels,
grid lines and a title.

See {@link COL_Axis} for the options that can be used when creating
the axis.

An axis is drawn to a `length`. It will have values along its length
from `start` to `stop`. Ticks, grid lines and labels are all drawn
at axis value positions. All other dimensions, such as line lengths,
widths, positions, spaces and offsets are defined in draw space, or in the
same space as the `length` of the axis.

The object contains additional methods that convert between axis values
and draw space positions, as well as a convenience method to report if a
value is within an axis.
- <a href="#collectionsaxisvaluetodraw">valueToDraw</a>
- <a href="#collectionsaxisdrawtovalue">drawToValue</a>
- <a href="#collectionsaxisinaxis">inAxis</a>

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>.

For more examples of axis labels and axis ticks, see {@link OBJ_AxisLabels}
and {@link OBJ_AxisTicks}.

#### By default an axis is an 'x' axis

```js
figure.add({
  make: 'collections.axis',
});
```

#### An axis can also be created and then added to a figure

```js
// An axis can have specific start and stop values
// An axis can be a y axis
const axis = figure.collections.axis({
  axis: 'y',
  start: -10,
  stop: 10,
  step: 5,
});
figure.add('axis', axis);
```

#### An axis can have multiple sets of ticks and a title

```js
figure.add({
  make: 'collections.axis',
  step: [0.2, 0.05],
  ticks: [
    true,
    { length: 0.04, location: 'bottom' },
  ],
  title: 'time (s)',
});
```

#### An axis line and ticks can be customized to be dashed

```js
// and have arrows
figure.add({
  make: 'collections.axis',
  length: 2.5,
  start: -100,
  stop: 100,
  step: 25,
  line: {
    dash: [0.01, 0.01],
    arrow: 'barb',
  },
  ticks: { dash: [0.01, 0.01] },
  title: {
    font: { style: 'italic', family: 'Times New Roman' },
    text: 'x',
    location: 'right',
  },
});
```

#### An axis can have grid lines extend from it, and

```js
// multi-line, formatted titles
figure.add({
  make: 'collections.axis',
  stop: 2,
  step: [0.5, 0.1],
  grid: [
    { length: 1, color: [0.5, 0.5, 0.5, 1] },
    { length: 1, dash: [0.01, 0.01], color: [0.7, 0.7, 0.7, 1] },
  ],
  title: {
    font: { color: [0.4, 0.4, 0.4, 1] },
    text: [
      'Total Time',
      {
        text: 'in seconds',
        font: { size: 0.1 },
        lineSpace: 0.12,
      },
    ],
  },
});
```

> {@link COL_Axis} for parameter descriptions


---

## COL_Button

*Extends {@link OBJ_Collection}*

{@link CollectionsButton} options object that extends {@link OBJ_Collection}
options object (without `parent`).

### Properties

<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: button width</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: button height</span></div>
<div class="fo-prop"><span class="fo-prop-name">corner</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_CurvedCorner.html">OBJ_CurvedCorner</a>?)</span><span class="fo-prop-desc">: button corner</span></div>
<div class="fo-prop"><span class="fo-prop-name">line</span> <span class="fo-prop-type">(null | <a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_LineStyleSimple.html">OBJ_LineStyleSimple</a>?)</span><span class="fo-prop-desc">: button outline - use <code>null</code> to
remove the default line</span></div>
<div class="fo-prop"><span class="fo-prop-name">label</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Button.OBJ_ButtonLabel.html">OBJ_ButtonLabel</a>?)</span><span class="fo-prop-desc">: button label</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorLine</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorFill</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorLabel</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">touchDown</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Button.OBJ_ButtonColorState.html">OBJ_ButtonColorState</a>>?)</span><span class="fo-prop-desc">: set colors between a touch
down and touch up</span></div>
<div class="fo-prop"><span class="fo-prop-name">states</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_Button.OBJ_ButtonState.html">OBJ_ButtonState</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>>?)</span></div>

---

## CollectionsButton

{@link FigureElementCollection} representing a button.

![](../apiassets/button.png)

![](../apiassets/button1.gif)

A button can be simple, or it can change state with each press.

Notifications - The notification manager property `notifications` will
publish the following events:
- `touch`: button is pressed - the current state index is passed to the
  subscriber

See {@link COL_Button} for setup options.

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>

#### Simple button

```js
figure.add({
  make: 'collections.button',
  label: 'Start',
});
```

#### Borderless button

```js
figure.add({
  make: 'collections.button',
  label: 'Start',
  colorFill: [0.8, 0.8, 0.8, 1],
  line: null,
});
```

#### Button that changes state and has a touch buffer of 0.1 around it

```js
const button = figure.add({
  make: 'collections.button',
  states: ['Slow', 'Medium', 'Fast'],
  width: 0.7,
  height: 0.3,
  touchBorder: 0.1,
});

button.notifications.add('touch', (index) => {
  console.log(index);
});
```

---

## COL_Line

*Extends {@link OBJ_Collection}*

{@link CollectionsLine} options object that extends {@link OBJ_Collection}
options object (without `parent`).


The Collections Line is a convient and powerful line
{@link FigureElementCollection} that includes the line, arrows, a label
annotation and some methods to make it convient to use dynamically.

A line can either be defined by its two end points (`p1`, `p2`), or a
point (`p1`), `length` and `angle`.

`offset` can be used to draw the line some offset away from the line
definition where a positive offset is on the side of the line that the line
rotates toward when rotating in the positive direction. This is especially
useful for creating lines that show dimensions of shapes.

The line also has a control point which is positioned on the line with the
`align` property. The control point is the line's center of rotation, and
fixes the point from which the line changes length. This is also the point
where the line collection position will be if `getPosition` is called on the
element.

For instance, setting the control point at `align: 'start'` will mean that
if the line can rotate, it will rotate around `p1`, and if the length is
changed, then `p1` will remain fixed while `p2` changes.

`width` sets the width of the line. Setting the width to 0 will hide the
line itself, but if arrows or a label are defined they will still be
displayed.

Use the `label` property to define and position a label relative to the line.
The label can be any string, equation or the actual length of the line and
be oriented relative to the line or always be horizontal.

Use the `arrow` and `dash` properties to define arrows and the line style.

Pulsing this collection normally would pulse both the length and width of
the line. If it often desirable to pulse a line without changing its length,
and so this collection provides a method `pulseWidth` to allow this. This
options object can define the default values for pulseWidth if desired.

Default pulse values can then be specified with the `pulse` property.

### Properties

<div class="fo-prop"><span class="fo-prop-name">p1</span> <span class="fo-prop-type">(<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>?)</span><span class="fo-prop-desc">: First point of line</span></div>
<div class="fo-prop"><span class="fo-prop-name">p2</span> <span class="fo-prop-type">(<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>?)</span><span class="fo-prop-desc">: Will override <code>length</code>/<code>angle</code> definition</span></div>
<div class="fo-prop"><span class="fo-prop-name">angle</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: line angle</span></div>
<div class="fo-prop"><span class="fo-prop-name">length</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: line length</span></div>
<div class="fo-prop"><span class="fo-prop-name">offset</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: line offset</span></div>
<div class="fo-prop"><span class="fo-prop-name">align</span> <span class="fo-prop-type">('start' | 'end' | 'center' | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: rotation center of
line (<code>only needed if rotating line</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: line width</span></div>
<div class="fo-prop"><span class="fo-prop-name">label</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Line.OBJ_LineLabel.html">OBJ_LineLabel</a>?)</span><span class="fo-prop-desc">: label annotation</span></div>
<div class="fo-prop"><span class="fo-prop-name">arrow</span> <span class="fo-prop-type">(<a href="../interfaces/geometries_arrow.OBJ_LineArrows.html">OBJ_LineArrows</a> | <a href="../types/geometries_arrow.TypeArrowHead.html">TypeArrowHead</a>?)</span><span class="fo-prop-desc">: line arrow (<code>s</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">dash</span> <span class="fo-prop-type">(<a href="../types/types.TypeDash.html">TypeDash</a>?)</span><span class="fo-prop-desc">: make the line dashed</span></div>
<div class="fo-prop"><span class="fo-prop-name">pulseWidth</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Line.OBJ_PulseWidth.html">OBJ_PulseWidth</a>?)</span><span class="fo-prop-desc">: default options for pulseWidth pulse</span></div>
<div class="fo-prop"><span class="fo-prop-name">pulse</span> <span class="fo-prop-type">(<a href="../interfaces/Element.OBJ_Pulse.html">OBJ_Pulse</a>?)</span><span class="fo-prop-desc">: default options for normal pulse</span></div>
<div class="fo-prop"><span class="fo-prop-name">move</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Line.OBJ_LineMove.html">OBJ_LineMove</a>?)</span><span class="fo-prop-desc">: line move options</span></div>

---

## CollectionsLine

{@link FigureElementCollection} representing a line.

<p class="inline_gif"><img src="../apiassets/advline_pulse.gif" class="inline_gif_image"></p>

<p class="inline_gif"><img src="../apiassets/advline_grow.gif" class="inline_gif_image"></p>

<p class="inline_gif"><img src="../apiassets/advline_multimove.gif" class="inline_gif_image"></p>

This object defines a convient and powerful line
{@link FigureElementCollection} that includes a solid or dashed line,
arrows, a label annotation that can self align with line orientation, and
some methods to make it convient to use dynamically.

See {@link COL_Line} for the options that can be used when creating the line.

The object contains a two additional animation steps. `length`
animates changing the line length, and `pulseWidth` animates the
`pulseWidth` method. The animation steps are available in
the animation manager ({@link FigureElement}.animations),
and in the animation builder
(<a href="#animationmanagernew">animations.new</a>
and <a href="#animationmanagerbuilder">animations.builder</a>).

Some of the useful methods included in an collections line are:
- <a href="#collectionslinepulsewidth">pulseWidth</a> - pulses the line without
  changing its length
- <a href="#collectionslinegrow">grow</a> - starts and animation that executes
  a single `length` animation
   step
- <a href="#collectionslinesetmovable">grow</a> - overrides
   <a href="#figureelementsetmovable">FigureElement.setMovable</a> and
   allowing for more complex move options.

#### Pulse an annotated line

```js
figure.add({
  name: 'l',
  make: 'collections.line',
  p1: [-1, 0],
  p2: [1, 0],
  arrow: 'triangle',
  label: {
    text: 'length',
    offset: 0.04,
  },
});

figure.elements._l.pulseWidth({ duration: 2 });
```

#### Animate growing a line while showing it's length

```js
figure.add({
  name: 'l',
  make: 'collections.line',
  p1: [-1, 0],
  p2: [-0.5, 0],
  align: 'start',
  arrow: { end: { head: 'barb', scale: 2 } },
  label: {
    text: null,
    offset: 0.03,
    precision: 2,
    location: 'start'
  },
});

const l = figure.elements._l;
l.animations.new()
  .length({ start: 0.5, target: 2, duration: 2 })
  .start();
```

#### Example showing dashed line with an equation label that stays horizontal

```js
const l = figure.collections.line({
  p1: [0, 0],
  p2: [1.4, 0],
  align: 'start',
  label: {
    text: {                             // label text is an equation
      elements: {
        twopi: '2\u03C0',
      },
      forms: {
        base: ['twopi', ' ', { frac: ['a', 'vinculum', 'b'] } ]
      },
    },
    offset: 0.03,
    orientation: 'horizontal',          // keep label horizontal
    location: 'top',                    // keep label on top of line
  },
  dash: [0.08, 0.02, 0.02, 0.02],
});
figure.add('l', l);
l.setMovable({ type: 'centerTranslateEndRotation'})
l.setAutoUpdate();
```

> See {@link OBJ_LengthAnimationStep} for angle animation step options.

See {@link OBJ_PulseWidthAnimationStep} for pulse angle animation step
options.

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>.



---

## COL_Plot

*Extends {@link OBJ_Collection}*

{@link CollectionsPlot} options object that extends {@link OBJ_Collection}
options object (without `parent`).

A plot is a collection of axes and traces, and may include a title, legend
and bounding frame.

Use `width`, `height` and `position` to define the size of the plot area
(area where the traces are drawn) and where it is in the figure.

### Properties

<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: width of the plot area</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: height of the plot area</span></div>
<div class="fo-prop"><span class="fo-prop-name">x</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Plot.OBJ_PlotAxis.html">OBJ_PlotAxis</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: customize the x axis, or use <code>false</code>
to hide it</span></div>
<div class="fo-prop"><span class="fo-prop-name">y</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Plot.OBJ_PlotAxis.html">OBJ_PlotAxis</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: customize the y axis, or use <code>false</code>
to hide it</span></div>
<div class="fo-prop"><span class="fo-prop-name">axes</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_Plot.OBJ_PlotAxis.html">OBJ_PlotAxis</a>>?)</span><span class="fo-prop-desc">: add axes additional to x and y</span></div>
<div class="fo-prop"><span class="fo-prop-name">grid</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: turn on and off the grid - use the grid options
in x axis, y axis or axes for finer customization</span></div>
<div class="fo-prop"><span class="fo-prop-name">title</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Plot.OBJ_PlotTitle.html">OBJ_PlotTitle</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>?)</span><span class="fo-prop-desc">: plot title can be simply a
<code>string</code> or fully customized with OBJ_PlotTitle</span></div>
<div class="fo-prop"><span class="fo-prop-name">trace</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_Trace.COL_Trace.html">COL_Trace</a> | <a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>> | <a href="../interfaces/FigureCollections_Trace.COL_Trace.html">COL_Trace</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>>?)</span><span class="fo-prop-desc">: Use array if plotting more than one trace. Use COL_Trace to customize the
 trace.</span></div>
<div class="fo-prop"><span class="fo-prop-name">legend</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Legend.COL_PlotLegend.html">COL_PlotLegend</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: <code>true</code> to turn the legend on,
or use COL_PlotLegend to customize it's location and layout</span></div>
<div class="fo-prop"><span class="fo-prop-name">frame</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a> | <a href="../types/types.TypeColor.html">TypeColor</a> | <a href="../interfaces/FigureCollections_Plot.OBJ_PlotFrame.html">OBJ_PlotFrame</a>?)</span><span class="fo-prop-desc">: frame around the
plot can be turned on with <code>true</code>, can be a simple color fill using
<code>Array&lt;number&gt;</code> as a color, or can be fully customized with OBJ_PlotFrame</span></div>
<div class="fo-prop"><span class="fo-prop-name">plotArea</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a> | <a href="../interfaces/FigureCollections_Rectangle.COL_Rectangle.html">COL_Rectangle</a>?)</span><span class="fo-prop-desc">: plot area can be a
color fill with <code>TypeColor</code> as a color, or be fully customized with
COL_Rectangle</span></div>
<div class="fo-prop"><span class="fo-prop-name">font</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_Font.html">OBJ_Font</a>?)</span><span class="fo-prop-desc">: Default font for plot (<code>title, axes, labels, etc.</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: Default color</span></div>
<div class="fo-prop"><span class="fo-prop-name">position</span> <span class="fo-prop-type">(<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>?)</span><span class="fo-prop-desc">: Position of the plot</span></div>
<div class="fo-prop"><span class="fo-prop-name">zoom</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Plot.OBJ_PlotZoomOptions.html">OBJ_PlotZoomOptions</a> | 'x' | 'y' | 'xy'?)</span><span class="fo-prop-desc">: options for
interactive zooming</span></div>
<div class="fo-prop"><span class="fo-prop-name">pan</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Plot.OBJ_PlotPanOptions.html">OBJ_PlotPanOptions</a> | 'x' | 'y' | 'xy'?)</span><span class="fo-prop-desc">: options for
interactive panning</span></div>
<div class="fo-prop"><span class="fo-prop-name">cross</span> <span class="fo-prop-type">(<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>?)</span><span class="fo-prop-desc">: value where the default x and y
axes should cross. If defined, each <code>axis.position</code> will be overridden. If
the cross point is outside of the plot area, then the axes will be drawn on
the border of the plot area. (<code>undefined</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">plotAreaLabels</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a> | <a href="../interfaces/FigureCollections_Plot.OBJ_PlotAreaLabelBuffer.html">OBJ_PlotAreaLabelBuffer</a>?)</span><span class="fo-prop-desc">: if <code>true</code>
then axes with a cross point
will be drawn such that the labels stay within the plot area. So, if the
labels are on the left side of a y axis, and the cross point is out of the
plot area to the left, then instead of the axis being drawn on the left edge
of the plot area, it will be drawn within the plot area such that its labels
are within the plot area (<code>false</code>).</span></div>
<div class="fo-prop"><span class="fo-prop-name">autoGrid</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: if <code>true</code> sets the grid for an axes to expand
accross the entire plot area. Set to <code>false</code> if only a partial length grid
is needed (<code>true</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">styleTheme</span> <span class="fo-prop-type">('box' | 'numberLine' | 'positiveNumberLine'?)</span><span class="fo-prop-desc">: defines
default values for tick, label, axis locations and cross points. (<code>'box'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorTheme</span> <span class="fo-prop-type">('light' | 'dark'?)</span><span class="fo-prop-desc">: defines defaul colors. <code>'dark'</code>
theme is better on light backgrounds while '<code>light'</code> theme is better on dark
backgrounds (<code>'dark'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">gestureArea</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Plot.OBJ_GestureArea.html">OBJ_GestureArea</a>?)</span><span class="fo-prop-desc">: the gesture area is the plot area
by default. Use this property to extend the gesture area beyond the plot
area. This is useful for the user to zoom in on areas on the edge of the
plot area.</span></div>

---

## CollectionsPlot

{@link FigureElementCollection} representing a plot including axes, traces,
labels and titles.

![](../apiassets/advplot_ex1.png)

![](../apiassets/advplot_ex2.png)

![](../apiassets/advplot_ex3.png)

![](../apiassets/advplot_ex4.png)

![](../apiassets/advplot_ex5.png)

![](../apiassets/advplot_ex6.png)

![](../apiassets/advplot_zoom.gif)

This object provides convient and customizable plot functionality.

At its simplist, just the points of the trace to be plotted need to be
passed in to get a plot with automatically generated axes, tick marks,
labels and grid lines.

Additional options can be used to finely customize each of these, as well
as add and customize plot and axis titles, a legend, and a frame around the
entire plot.

Plots can also be interactive, with both zoom and pan functionality from
mouse, mouse wheel, touch and pinch gestures.

#### Plot of single trace with auto axis scaling

```js
figure.add({
  make: 'collections.plot',
  trace: pow(),
});
```

#### Multiple traces with a legend

```js
// Some traces are customized beyond the default color to include dashes and
// markers
figure.add({
  make: 'collections.plot',
  width: 2,                                    // Plot width in figure
  height: 2,                                   // Plot height in figure
  y: { start: 0, stop: 50 },                   // Customize y axis limits
  trace: [
    { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
    {                                          // Trace with only markers
      points: pow(2, 0, 10, 0.5),
      name: 'Power 2',
      markers: { sides: 4, radius: 0.03 },
    },
    {                                          // Trace with markers and
      points: pow(3, 0, 10, 0.5),              // dashed line
      name: 'Power 3',
      markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
      line: { dash: [0.04, 0.01] },
    },
  ],
  legend: true,
});
```

#### Multiple grids and simple titles

```js
figure.add({
  make: 'collections.plot',
  y: {
    start: -50,
    stop: 50,
    step: [25, 5],
    grid: [
      true,
      { width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
    ],
    title: 'velocity (m/s)',
  },
  x: {
    start: -5,
    stop: 5,
    step: [2.5, 0.5, 0.1],
    grid: [
      true,
      { width: 0.005, dash: [0.01, 0.01], color: [1, 0.7, 0.7, 1] },
    ],
    title: 'time (s)',
  },
  trace: pow(3, -10, 10),
  title: 'Velocity over Time',
});
```

#### Hide axes

```js
// Use plot frame and plot area
// Title has a subtitle
figure.add({
  make: 'collections.plot',
  trace: pow(3),
  x: { show: false },
  y: { show: false },
  plotArea: [0.93, 0.93, 0.93, 1],
  frame: {
    line: { width: 0.005, color: [0.5, 0.5, 0.5, 1] },
    corner: { radius: 0.1, sides: 10 },
    space: 0.15,
  },
  title: {
    text: [
      'Velocity over Time',
      { text: 'For object A', lineSpace: 0.13, font: { size: 0.08 } },
    ],
    offset: [0, 0],
  },
});
```

#### Secondary y axis

```js
figure.add({
  make: 'collections.plot',
  trace: pow(2),
  y: {
    title: {
      text: 'velocity (m/s)',
      rotation: 0,
      xAlign: 'right',
    },
  },
  x: { title: 'time (s)' },
  axes: [
    {
      axis: 'y',
      start: 0,
      stop: 900,
      step: 300,
      color: [1, 0, 0, 1],
      location: 'right',
      title: {
        offset: [0.6, 0.1],
        text: 'displacment (m)',
        rotation: 0,
      },
    },
  ],
  position: [-1, -1],
});
```

#### Cartesian axes crossing at the zero point

```js
// Automatic layout doesn't support this, but axes, ticks, labels and titles
// can all be customized to create it.
figure.add({
  make: 'collections.plot',
  trace: pow(3, -10, 10),
  font: { size: 0.1 },
  styleTheme: 'numberLine',
  x: {
    title: {
      text: 'x',
      font: { style: 'italic', family: 'Times New Roman', size: 0.15 },
    },
  },
  y: {
    step: 500,
    title: {
      text: 'y',
      font: { style: 'italic', family: 'Times New Roman', size: 0.15 },
    },
  },
  grid: false,
});
```

#### Zoomable and Pannable plot

```js
// Create the points for the plot
const points = Array(3000).fill(0).map(() => {
  const x = Math.random() * 8 - 4;
  const y = Math.random() / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * x ** 2);
  return [x, y];
});

// Make a zoomable and pannable plot
const plot = figure.add({
  make: 'collections.plot',
  trace: { points, markers: { sides: 6, radius: 0.01 } },
  zoom: { axis: 'xy', min: 0.5, max: 16 },
  pan: true,
});

// Initialize by zooming in by a magnification factor of 10
plot.zoomValue([1.8333, 0.06672], 10);
```

> See {@link COL_Axis}, {@link OBJ_AxisLabels}, {@link OBJ_AxisTicks},
{@link COL_Trace} and {@link COL_PlotLegend} for more examples of customizing
specific parts of the plot.

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>.

All examples below also use this power function to generate the traces:
```javascript
const pow = (pow = 2, start = 0, stop = 10, step = 0.05) => {
  const xValues = Fig.range(start, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
}
```

---

## COL_Polyline

*Extends {@link OBJ_Collection}*

{@link CollectionsPolyline} options object that extends
{@link OBJ_Polyline} and {@link OBJ_Collection}
options object (without `parent`).

The Collections Polyline is a convient and powerful polyline
{@link FigureElementCollection} that includes the polyline,
angle annotations, side label and arrow annotations, and movable
pads on each polyline point for the user to adjust dynamically.

The polyline itself is defined with an {@link OBJ_Polyline} options Object.

Angle and side annotations can be defined as {@link COL_Angle} and
{@link COL_Line}, and movable pads defined with
({@link OBJ_Polygon} & {@link OBJ_PolylinePad}).

Angles, sides and pads can all be defined either as an options object
or an array of options objects. If an array, then each element in the
array will correspond with a pad on the polyline. If there are less
elements in the array than pads on the polyline, then the elements
will recycle from the start.

Using object definitions allows for a definition of all angles, sides and
pads. To customize for specific side, angle or pad indexes use =
{@link OBJ_PolylineCustomization}.

### Properties

<div class="fo-prop"><span class="fo-prop-name">showLine</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: <code>false</code> will hide the polyline's line (<code>true</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">angle</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_PolyLine.OBJ_PolylineAngle.html">OBJ_PolylineAngle</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_Angle.COL_Angle.html">COL_Angle</a>>?)</span><span class="fo-prop-desc">: angle annotations - leave undefined for no angle annotations</span></div>
<div class="fo-prop"><span class="fo-prop-name">side</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_PolyLine.OBJ_PolylineSide.html">OBJ_PolylineSide</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_Line.COL_Line.html">COL_Line</a>>?)</span><span class="fo-prop-desc">: side annotations - leave undefined for no side annotations</span></div>
<div class="fo-prop"><span class="fo-prop-name">pad</span> <span class="fo-prop-type">(<a href="../types/FigureCollections_PolyLine.OBJ_PolylinePad.html">OBJ_PolylinePad</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigureCollections_PolyLine.OBJ_PolylinePadSingle.html">OBJ_PolylinePadSingle</a>>?)</span><span class="fo-prop-desc">: move pad - leave undefined for no move pads</span></div>
<div class="fo-prop"><span class="fo-prop-name">makeValid</span> <span class="fo-prop-type">(null | <a href="../interfaces/FigureCollections_PolyLine.OBJ_ValidShape.html">OBJ_ValidShape</a>?)</span><span class="fo-prop-desc">: if defined, whenever
points are updated the shape will be checked to ensure consistency with
displayed labels of angles and sides.</span></div>
<div class="fo-prop"><span class="fo-prop-name">font</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_Font.html">OBJ_Font</a>?)</span><span class="fo-prop-desc">: default font to use for labels</span></div>

---

## CollectionsPolyline

{@link FigureElementCollection} representing a polyline.

![](../apiassets/advpolyline_examples.png)

<p class="inline_gif"><img src="../apiassets/advpolyline_movepolyline.gif" class="inline_gif_image"></p>

<p class="inline_gif"><img src="../apiassets/advpolyline_movetri.gif" class="inline_gif_image"></p>

This object defines a convient and powerful polyline
{@link FigureElementCollection} that includes a solid or dashed,
open or closed polyline, arrows, angle annotations for polyline corners,
side annotations for straight lines between points and move pads at polyline
points to dynamically adjust the polyline.

See {@link COL_Polyline} for the options that can be used when creating the
line.

Available notifications:
  - `'updatePoints'`: {@link SUB_PolylineUpdatePoints}

#### Polyline with angle annotations

```js
figure.add({
  name: 'p',
  make: 'collections.polyline',
  points: [[1, 0], [0, 0], [0.5, 1], [1.5, 1]],
  arrow: 'triangle',
  angle: {
    label: null,
    curve: {
      radius: 0.3,
    },
  }
});
```

#### Triangle with unknown angle

```js
figure.add({
  name: 'p',
  make: 'collections.polyline',
  points: [[1, 1], [1, 0], [0, 0]],
  close: true,
  side: {
    label: null,
  },
  angle: {
    label: {
      text: '?',
      offset: 0.05,
    },
    curve: {
      radius: 0.4,
    },
    show: [1],
  },
});
```

#### Dimensioned square

```js
figure.add({
  name: 'p',
  make: 'collections.polyline',
  points: [[0, 1], [1, 1], [1, 0], [0, 0]],
  close: true,
  side: {
    showLine: true,
    offset: 0.2,
    color: [0, 0, 1, 1],
    arrow: 'barb',
    width: 0.01,
    label: null,
    dash: [0.05, 0.02],
    0: { label: { text: 'a' } },    // Customize side 0
  },
  angle: {
    curve: {
      autoRightAngle: true,
      radius: 0.3,
    },
  },
});
```

#### User adjustable polyline

```js
figure.add({
  name: 'p',
  make: 'collections.polyline',
  points: [[-0.5, 1], [1, 1], [0, 0], [1, -0.5]],
  dash: [0.05, 0.02],
  pad: {
    radius: 0.2,
    color: [1, 0, 0, 0.5],    // make alpha 0 to hide pad
    isMovable: true,
  },
});
```

#### Annotations that automatically updates as user changes triangle

```js
figure.add({
  name: 'p',
  make: 'collections.polyline',
  points: [[-1, 1], [1, 1], [0, 0]],
  close: true,
  makeValid: {
    shape: 'triangle',
    hide: {
      minAngle: Math.PI / 8,
    },
  },
  side: {
    showLine: true,
    offset: 0.2,
    color: [0.3, 0.6, 1, 1],
    arrow: 'barb',
    width: 0.01,
    label: {
      text: null,
    },
  },
  angle: {
    label: null,
    curve: { radius: 0.25 },
  },
  pad: {
    radius: 0.4,
    color: [1, 0, 0, 0.005],
    isMovable: true,
  },
});
```

> To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>.



---

## COL_Rectangle

*Extends {@link OBJ_Collection}*

{@link CollectionsRectangle} options object that extends {@link OBJ_Collection}
options object (without `parent`).

This rectangle is similar to {@link OBJ_Rectangle}, except it can accomodate
both a fill and a border or line simultaneously with different colors.

### Properties

<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: rectangle width</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: rectangle height</span></div>
<div class="fo-prop"><span class="fo-prop-name">xAlign</span> <span class="fo-prop-type">('left' | 'center' | 'right' | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: horiztonal
alignment of the rectangle</span></div>
<div class="fo-prop"><span class="fo-prop-name">yAlign</span> <span class="fo-prop-type">('bottom' | 'middle' | 'top' | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: vertical alignment
of the rectangle</span></div>
<div class="fo-prop"><span class="fo-prop-name">line</span> <span class="fo-prop-type">(<a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_LineStyleSimple.html">OBJ_LineStyleSimple</a>?)</span><span class="fo-prop-desc">: lines style - leave empty if only
want fill</span></div>
<div class="fo-prop"><span class="fo-prop-name">fill</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a> | <a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_Texture.html">OBJ_Texture</a>?)</span><span class="fo-prop-desc">: fill color or texture</span></div>
<div class="fo-prop"><span class="fo-prop-name">corner</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_CurvedCorner.html">OBJ_CurvedCorner</a>?)</span><span class="fo-prop-desc">: corner style of rectangle</span></div>
<div class="fo-prop"><span class="fo-prop-name">label</span> <span class="fo-prop-type">(OBJ_TextLines?)</span><span class="fo-prop-desc">: Rectangle label</span></div>
<div class="fo-prop"><span class="fo-prop-name">button</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a> | <a href="../types/types.TypeColor.html">TypeColor</a> | <a href="../interfaces/FigureCollections_Rectangle.OBJ_ButtonColor.html">OBJ_ButtonColor</a>?)</span><span class="fo-prop-desc">: <code>true</code> to
make the rectangle behave like a button when clicked. <code>TypeColor</code> to
make fill, line and label the same color when clicked or <code>OBJ_ButtonColor</code>
to specify click colors for each (<code>false</code>)</span></div>

---

## CollectionsRectangle

{@link FigureElementCollection} representing a rectangle.

![](../apiassets/advrectangle_ex1.png)
![](../apiassets/advrectangle_ex2.png)

<p class="inline_gif"><img src="../apiassets/advrectangle.gif" class="inline_gif_image"></p>

<p class="inline_gif"><img src="../apiassets/advrectangle_button.gif" class="inline_gif_image"></p>

This object defines a rectangle
{@link FigureElementCollection} that may include:
- border (line)
- fill
- label
- ability to surround another {@link FigureElement} with some space
- button behavior when clicked

Surrounding another element can be executed through either the
<a href="#collectionsrectanglesurround">surround</a> method
or the {@link OBJ_SurroundAnimationStep} found in the in
the animation manager ({@link FigureElement}.animations),
and in the animation builder
(<a href="#animationmanagernew">animations.new</a>
and <a href="#animationmanagerbuilder">animations.builder</a>).

Button behavior means the button will temporarily change a different color
when it is clicked. By default, the button will become a little more
transparent, but colors for the fill, label and border can also be
specified.

#### Simple rectangle

```js
figure.add({
  name: 'rect',
  make: 'collections.rectangle',
  width: 2,
  height: 1,
});
```

#### Round corner rectangle with fill and outside line

```js
const rect = figure.collections.rectangle({
  width: 2,
  height: 1,
  line: {
    width: 0.02,
    widthIs: 'outside',
    dash: [0.1, 0.02],
  },
  corner: {
    radius: 0.2,
    sides: 10,
  },
  fill: [0.7, 0.7, 1, 1],
});
figure.add('rect', rect);
```

#### Rectangle surrounds elements of an equation

```js
figure.add([
  {
    name: 'rect',
    make: 'collections.rectangle',
    color: [0.3, 0.3, 1, 1],
    line: { width: 0.01 },
  },
  {
    name: 'eqn',
    make: 'equation',
    forms: { 0: [{ frac: ['a', 'vinculum', 'b'] }, ' ', 'c'] },
    position: [1, 0],
    scale: 1.5,
  }
]);

const rect = figure.getElement('rect');
const eqn = figure.getElement('eqn');

rect.surround(eqn._a, 0.03);
rect.animations.new()
  .pulse({ delay: 1, scale: 1.5 })
  .surround({ target: eqn._b, space: 0.03, duration: 1 })
  .pulse({ delay: 1, scale: 1.5 })
  .surround({ target: eqn._c, space: 0.03, duration: 1 })
  .pulse({ delay: 1, scale: 1.5 })
  .start();
```

#### Make a rectangle that behaves like a button

```js
figure.add([
  {
    name: 'rect',
    make: 'collections.rectangle',
    width: 0.5,
    height: 0.3,
    color: [0.3, 0.3, 0.3, 1],
    label: 'Save',
    corner: { radius: 0.05, sides: 10 },
    fill: [0.9, 0.9, 0.9, 1],
    button: {
      fill: [0.95, 0.95, 0.95, 1],
    },
    mods: {
      isTouchable: true,
      onClick: () => console.log('clicked'),
    },
  },
]);
```

> 
See {@link COL_Rectangle} for setup options.

See {@link OBJ_SurroundAnimationStep} for surround animation step options.

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>.


---

## COL_Slider

*Extends {@link OBJ_Collection}*

{@link CollectionsSlider} options object that extends {@link OBJ_Collection}
options object (without `parent`).

### Properties

<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: slider width</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: slider height</span></div>
<div class="fo-prop"><span class="fo-prop-name">barHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: height of slider bar bar</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides in curves (<code>20</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">marker</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Slider.OBJ_SliderMarker.html">OBJ_SliderMarker</a> | 'polygon' | 'rectangle' | 'none'?)</span><span class="fo-prop-desc">: marker style (<code>'polygon'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">theme</span> <span class="fo-prop-type">('dark' | 'light'?)</span><span class="fo-prop-desc">: selects default colors for a light or
dark switch (<code>dark</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorOff</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: slider off color (<code>bar color from slider
value to 1</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorOn</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: slider on color (bar color from 0 to slider
value (<code>[0, 1, 0, 1]</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">markerBorder</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Slider.OBJ_SliderBorder.html">OBJ_SliderBorder</a>?)</span><span class="fo-prop-desc">: border around circle (<code>defaults to on
where width is half the figure's default line width</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">barBorder</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Slider.OBJ_SliderBorder.html">OBJ_SliderBorder</a>?)</span><span class="fo-prop-desc">: border around bar (<code>defaults to off - width = 0</code>)</span></div>

---

## CollectionsSlider

{@link FigureElementCollection} representing a slider control.

![](../apiassets/slider.png)

![](../apiassets/slider.gif)

Notifications - The notification manager property `notifications` will
publish the following events:
- `changed`: slider value is changed - slider position in percent is passed
  as parameter to callback.

See {@link COL_Slider} for setup options.

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>

#### Simple slider with notification causing a console statement

```js
const slider = figure.add({
  make: 'collections.slider',
  barHeight: 0.02,
  height: 0.1,
  width: 1,
  color: [0.5, 0.5, 0.5, 1],
  touchBorder: 0.2,
});

slider.notifications.add('changed', (position) => {
  console.log(position)
});
```

#### Slider without a marker and red fill for on

```js
figure.add({
  make: 'collections.slider',
  barHeight: 0.1,
  colorOn: [1, 0, 0, 1],
  width: 1,
  touchBorder: 0.2,
  marker: 'none',
});
```

#### Slider with rectangle marker and multi-colors

```js
const slider = figure.add({
  make: 'collections.slider',
  barHeight: 0.02,
  height: 0.1,
  width: 1,
  marker: 'rectangle',
  colorOff: [1, 0, 0, 1],
  colorOn: [0, 0.8, 0, 1],
  color: [0, 0, 0, 1],
});
```

---

## COL_Toggle

*Extends {@link OBJ_Collection}*

{@link CollectionsToggle} options object that extends {@link OBJ_Collection}
options object (without `parent`).

### Properties

<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: toggle width</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: toggle height</span></div>
<div class="fo-prop"><span class="fo-prop-name">barHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: height of toggle bar showing on
or off</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides in curves (<code>20</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">theme</span> <span class="fo-prop-type">('dark' | 'light'?)</span><span class="fo-prop-desc">: selects default colors for a light or
dark switch (<code>dark</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorOff</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: toggle off color</span></div>
<div class="fo-prop"><span class="fo-prop-name">colorOn</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: toggle on color (<code>[0, 1, 0, 1]</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">circleBorder</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Toggle.OBJ_ToggleBorder.html">OBJ_ToggleBorder</a>?)</span><span class="fo-prop-desc">: border around circle (<code>defaults to on
where width is half the figure's default line width</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">barBorder</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Toggle.OBJ_ToggleBorder.html">OBJ_ToggleBorder</a>?)</span><span class="fo-prop-desc">: border around bar (<code>defaults to off - width = 0</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">label</span> <span class="fo-prop-type">(<a href="../interfaces/FigureCollections_Toggle.OBJ_ToggleLabel.html">OBJ_ToggleLabel</a>?)</span></div>

---

## CollectionsToggle

{@link FigureElementCollection} representing a toggle switch.

![](../apiassets/toggle.gif)

The toggle switch can be turned on or off.

Notifications - The notification manager property `notifications` will
publish the following events:
- `toggle`: switch is changed - `true` will be passed if the switch is
   changed to on, and `false` will be passed if the switch is changed to off
- `on`: switch is changed to on
- `off`: switch is changed to off

See {@link COL_Toggle} for setup options.

To test examples below, append them to the
<a href="#drawing-boilerplate">boilerplate</a>

#### Simple toggle switch with notification causing a console statement

```js
const toggle = figure.add({
  make: 'collections.toggle',
  label: {
    text: 'Control',
    location: 'bottom',
    scale: 0.6,
  },
});

toggle.notifications.add('toggle', (state) => {
  state ? console.log('on') : console.log('off');
});
```

---

## OBJ_Collection

{@link FigureElementCollection} options object.

<p class="inline_gif"><img src="../apiassets/collection.gif" class="inline_gif_image"></p>

A collection is a group of other {@link FigureElement}s that will all
inherit the parent collections transform.

### Properties

<div class="fo-prop"><span class="fo-prop-name">transform</span> <span class="fo-prop-type">(<a href="../types/geometry_Transform.TypeParsableTransform.html">TypeParsableTransform</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">position</span> <span class="fo-prop-type">(<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>?)</span><span class="fo-prop-desc">: if defined, will overwrite first
translation of <code>transform</code></span></div>
<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: default color</span></div>
<div class="fo-prop"><span class="fo-prop-name">parent</span> <span class="fo-prop-type">(<a href="../classes/Element.FigureElement.html">FigureElement</a> | null?)</span><span class="fo-prop-desc">: parent of collection</span></div>
<div class="fo-prop"><span class="fo-prop-name">border</span> <span class="fo-prop-type">(<a href="../types/g2.TypeParsableBuffer.html">TypeParsableBuffer</a> | <a href="../types/g2.TypeParsableBorder.html">TypeParsableBorder</a> | 'children' | 'rect'?)</span><span class="fo-prop-desc">: defines border of collection. Use <code>children</code> to use the borders of
the children. Use <code>'rect'</code> for the bounding rectangle of the borders
of the children. Use <code>TypeParsableBuffer</code> for the bounding rectangle of the
borders of the children with some buffer. Use <code>TypeParsableBorder</code> for
a custom border. (<code>'children'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">touchBorder</span> <span class="fo-prop-type">(<a href="../types/g2.TypeParsableBuffer.html">TypeParsableBuffer</a> | <a href="../types/g2.TypeParsableBorder.html">TypeParsableBorder</a> | 'border' | 'rect'?)</span><span class="fo-prop-desc">: defines the touch border of the collection. Use <code>'border'</code> to use the same
as the border of the collection. Use <code>children</code> to use the touch borders of
the children. Use <code>'rect'</code> for the bounding rectangle of the touch borders
of the children. Use <code>TypeParsableBuffer</code> for the bounding rectangle of the
touch borders of the children with some buffer. Use <code>TypeParsableBorder</code> for
a custom touch border. (<code>'children'</code>)</span></div>

#### Example 1

```js
figure.add(
  {
    name: 'c',
    make: 'collection',
    elements: [         // add two elements to the collection
      {
        name: 'hex',
        make: 'polygon',
        sides: 6,
        radius: 0.5,
      },
      {
        name: 'text',
        make: 'text',
        text: 'hexagon',
        position: [0, -0.8],
        xAlign: 'center',
        font: { size: 0.3 },
      },
    ],
  },
);

// When a collection rotates, then so does all its elements
figure.getElement('c').animations.new()
  .rotation({ target: Math.PI * 1.999, direction: 1, duration: 5 })
  .start();
```

#### Collections and primitives can also be created from `figure.collections`

```js
// and `figure.primitives`.
const c = figure.collections.collection();
const hex = figure.primitives.polygon({
  sides: 6,
  radius: 0.5,
});
const text = figure.primitives.text({
  text: 'hexagon',
  position: [0, -0.8],
  xAlign: 'center',
  font: { size: 0.3 },
});
c.add('hex', hex);
c.add('text', text);
figure.add('c', c);

// When a collection rotates, then so does all its elements
c.animations.new()
  .delay(1)
  .rotation({ target: Math.PI * 1.999, direction: 1, duration: 5 })
  .start();
```

---

