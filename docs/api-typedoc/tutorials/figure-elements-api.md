---
title: Figure Elements API
group: Figure Elements
---

# Figure Elements API Reference

## Contents

- [FigureElement](#figureelement)
- [FigureElementPrimitive](#figureelementprimitive)
- [FigureElementCollection](#figureelementcollection)

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

