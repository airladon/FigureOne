---
title: Figure API
group: Figure
---

# Figure API Reference

## Contents

- [FigureElement](#figureelement)
- [FigureElementPrimitive](#figureelementprimitive)
- [FigureElementCollection](#figureelementcollection)
- [OBJ_Figure](#obj_figure)
- [Figure](#figure)

---

## FigureElement

Figure Element base class

The set of properties and methods shared by all figure elements

A figure element has several color related properties. Color is
defined as an RGBA array with values between 0 and 1. The alpha
channel defines the transparency or opacity of the color where
1 is fully opaque and 0 is fully transparent.

The `color` property stores the element's current color, while the
`defaultColor` property stores the element's color when not dimmed or
dissolving. Color should only be set using the `setColor` method.

An element can be "dimmed" or "undimmed". For instance,
a red element might turn grey when dimmed. The property
`dimColor` stores the desired color to dim to and should be set with
`setDimColor()`

An element can be dissolved in or out with animation. Dissolving
an element out transitions its opacity from its current value to 0.
The `opacity` property is used when dissolving. The opacity is multiplied by
the alpha channel of `color` to net a final opacity. Opacity should not be
set directly as it will be overwritten by dissolve animations.

Notifications - The notification manager property `notifications` will
publish the following events:
- `beforeSetTransform`: published just before the `transform` property is
changed
- `setTransform`: published whenever the `transform` property is changed
- `startBeingMoved`: published when the element starts being moved by touch
- `stopBeingMoved`: published when the element stops being moved by touch
- `startMovingFreely`
- `stopMovingFreely`
- `show`: published when element is shown
- `hide`: published when element is hidden
- `visibility`: published when element element is shown or hidden
- `onClick`: published when element is clicked on
- `color`: published whenever color is set
- `beforeDraw`
- `afterDraw`
- `setState`: state of element has been set

@class

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">name</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a></span></span><div class="tsd-comment tsd-typography"><p>reference name of element</p></div></li>
<li><span><span class="tsd-kind-parameter">isShown</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a></span></span><div class="tsd-comment tsd-typography"><p>if <code>false</code> then element will not be processed on
next draw</p></div></li>
<li><span><span class="tsd-kind-parameter">transform</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Transform.Transform.html" class="tsd-signature-type">Transform</a></span></span><div class="tsd-comment tsd-typography"><p>transform to apply element</p></div></li>
<li><span><span class="tsd-kind-parameter">lastDrawTransform</span>: <span class="tsd-signature-type"><a href="../classes/geometry_Transform.Transform.html" class="tsd-signature-type">Transform</a></span></span><div class="tsd-comment tsd-typography"><p>transform last used for drawing -
includes cascade or all parent transforms</p></div></li>
<li><span><span class="tsd-kind-parameter">parent</span>: <span class="tsd-signature-type"><a href="../classes/Element.FigureElement.html" class="tsd-signature-type">FigureElement</a> | null</span></span><div class="tsd-comment tsd-typography"><p>parent figure element - <code>null</code> if
at top level of figure</p></div></li>
<li><span><span class="tsd-kind-parameter">isTouchable</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a></span></span><div class="tsd-comment tsd-typography"><p>must be <code>true</code> to move or execute <code>onClick</code></p></div></li>
<li><span><span class="tsd-kind-parameter">isMovable</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a></span></span><div class="tsd-comment tsd-typography"><p>must be <code>true</code> to move</p></div></li>
<li><span><span class="tsd-kind-parameter">onClick</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a> | () => void</span></span><div class="tsd-comment tsd-typography"><p>callback if touched or clicked</p></div></li>
<li><span><span class="tsd-kind-parameter">color</span>: <span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>]</span></span><div class="tsd-comment tsd-typography"><p>element's current
color defined as red, green, blue, alpha with range 0 to 1</p></div></li>
<li><span><span class="tsd-kind-parameter">dimColor</span>: <span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>]</span></span><div class="tsd-comment tsd-typography"><p>color to use when
dimming element</p></div></li>
<li><span><span class="tsd-kind-parameter">defaultColor</span>: <span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>]</span></span><div class="tsd-comment tsd-typography"><p>color to go to
when undimming element</p></div></li>
<li><span><span class="tsd-kind-parameter">opacity</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span><div class="tsd-comment tsd-typography"><p>number between 0 and 1 that is multiplied with
<code>color</code> alpha channel to get final opacity</p></div></li>
<li><span><span class="tsd-kind-parameter">move</span>: <span class="tsd-signature-type"><a href="../interfaces/Element.OBJ_ElementMove.html" class="tsd-signature-type">OBJ_ElementMove</a></span></span><div class="tsd-comment tsd-typography"><p>movement parameters</p></div></li>
<li><span><span class="tsd-kind-parameter">scenarios</span>: <span class="tsd-signature-type"><a href="../interfaces/Element.OBJ_Scenarios.html" class="tsd-signature-type">OBJ_Scenarios</a></span></span><div class="tsd-comment tsd-typography"><p>scenario presets</p></div></li>
<li><span><span class="tsd-kind-parameter">state</span>: <span class="tsd-signature-type">ElementState</span></span><div class="tsd-comment tsd-typography"><p>current state of element</p></div></li>
<li><span><span class="tsd-kind-parameter">animations</span>: <span class="tsd-signature-type">AnimationManager</span></span><div class="tsd-comment tsd-typography"><p>element animation manager</p></div></li>
<li><span><span class="tsd-kind-parameter">notifications</span>: <span class="tsd-signature-type"><a href="../classes/tools.NotificationManager.html" class="tsd-signature-type">NotificationManager</a></span></span><div class="tsd-comment tsd-typography"><p>notification manager for
element</p></div></li>
<li><span><span class="tsd-kind-parameter">fnMap</span>: <span class="tsd-signature-type"><a href="../classes/FunctionMap.FunctionMap.html" class="tsd-signature-type">FunctionMap</a></span></span><div class="tsd-comment tsd-typography"><p>function map for use with {@link Recorder}</p></div></li>
<li><span><span class="tsd-kind-parameter">customState</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object" class="tsd-signature-type">Object</a></span></span><div class="tsd-comment tsd-typography"><p>put any custom state information that needs
to be captured with recorder here - only stringify-able values can go in this
object like strings, numbers, booleans and nested arrays or objects
containing these. Functions should not be put in here - use string
identifiers to <code>fnMap</code> if functions are needed.</p></div></li>
</ul>

---

## FigureElementPrimitive

*Extends {@link FigureElement}*

Primitive figure element

A primitive figure element is one that handles an object (`drawingObject`)
that draws to the screen. This object may be a {@link GLObject}, a
{@link TextObject} or a {@link HTMLObject}.

@class

---

## FigureElementCollection

*Extends {@link FigureElement}*

Collection figure element

A collection manages a number of children {@link FigureElements}, be they
primitives or collections.

A collection's transform will be passed onto all the children elements.

@class

---

## OBJ_Figure

Figure options object

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">htmlId</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a> | undefined</span> <span class="tsd-signature-symbol">= "figureOneContainer"</span></span><div class="tsd-comment tsd-typography"><p>HTML <code>div</code> tag <code>id</code> to tie figure to</p></div></li>
<li><span><span class="tsd-kind-parameter">scene</span>: <span class="tsd-signature-type"><a href="../interfaces/geometry_scene.OBJ_Scene.html" class="tsd-signature-type">OBJ_Scene</a> | <a href="../types/geometry_Rect.TypeParsableRect.html" class="tsd-signature-type">TypeParsableRect</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>define 2D or 3D scene. 3D
can be orthographic or perspective projection, and include camera position
and lighting definition. A 2D scene can be defined using <code>left</code>, <code>right</code>,
<code>bottom</code> and <code>top</code>, or the short hand rectangle definition.</p></div></li>
<li><span><span class="tsd-kind-parameter">color</span>: <span class="tsd-signature-type"><a href="../types/types.TypeColor.html" class="tsd-signature-type">TypeColor</a> | undefined</span> <span class="tsd-signature-symbol">= [0, 0, 0, 1]</span></span><div class="tsd-comment tsd-typography"><p>default shape color</p></div></li>
<li><span><span class="tsd-kind-parameter">font</span>: <span class="tsd-signature-type"><a href="../interfaces/types.OBJ_Font.html" class="tsd-signature-type">OBJ_Font</a> | undefined</span> <span class="tsd-signature-symbol">= { family: 'Helvetica,
size: 0.2, style: 'normal', weight: 'normal' }</span></span><div class="tsd-comment tsd-typography"><p>default shape font</p></div></li>
<li><span><span class="tsd-kind-parameter">lineWidth</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>default shape line width</p></div></li>
<li><span><span class="tsd-kind-parameter">length</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>default shape primary dimension</p></div></li>
<li><span><span class="tsd-kind-parameter">backgroundColor</span>: <span class="tsd-signature-type"><a href="../types/types.TypeColor.html" class="tsd-signature-type">TypeColor</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>background color for the figure.
Use [r, g, b, 1] for opaque and [0, 0, 0, 0] for transparent.</p></div></li>
</ul>

---

## Figure

Primary Figure class.

A figure will attach a WebGL canvas and 2D canvas
to the html `div` element with id `"figureOneContainer"`.

The figure creates and manages all drawing elements, renders the drawing
elements on a browser's animation frames and listens for guestures from the
user.

The figure also has a recorder, allowing it to record and playback states,
and gestures.

To attach to a different `div`, use the `htmlId` property in the class
constructor.

If a figure is paused, then all drawing element animations will
also be paused.

`Figure` has a number of convenience methods for creating drawing elements
and useful transforms for converting between the different spaces (e.g.
pixel, GL, figure).

Notifications - The notification manager property `notifications` will
publish the following events:
- `beforeDraw`: published before a frame is drawn
- `afterDraw`: published after a frame is drawn
- `resize`: published after a resize event, but before frame drawing

@class
@param {OBJ_Figure} options

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">primitives</span>: <span class="tsd-signature-type">FigurePrimitives</span></span><div class="tsd-comment tsd-typography"><p>create figure primitives such
as shapes, lines and grids</p></div></li>
<li><span><span class="tsd-kind-parameter">collections</span>: <span class="tsd-signature-type">FigureCollections</span></span><div class="tsd-comment tsd-typography"><p>create figure collections such
as advanced lines, shapes, equations and plots</p></div></li>
<li><span><span class="tsd-kind-parameter">notifications</span>: <span class="tsd-signature-type"><a href="../classes/tools.NotificationManager.html" class="tsd-signature-type">NotificationManager</a></span></span><div class="tsd-comment tsd-typography"><p>notification manager for
element</p></div></li>
<li><span><span class="tsd-kind-parameter">fonts</span>: <span class="tsd-signature-type">FontManager</span></span><div class="tsd-comment tsd-typography"><p>watches and reports on font availability</p></div></li>
</ul>

#### Simple html and javascript example to create a figure, and add a

```js
// hexagon.
//
// For additional examples, see https://github.com/airladon/FigureOne
//
// Two files `index.html` and `index.js` in the same directory

// index.html
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 800px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm figureone@0.15.10/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>

// index.js
const figure = new Fig.Figure({ scene: [-1, -1, 1, 1 ]});
figure.add(
  {
    name: 'p',
    make: 'polygon',
    radius: 0.5,
    sides: 6,
  },
);
```

#### Alternately, an element can be added programatically

```js
// index.js
const figure = new Fig.Figure({ scene: [-1, -1, 1, 1 ]});
const hex = figure.shapes.polygon({
  radius: 0.5,
  sides: 6,
});
figure.add('hexagon', hex);
```

---

