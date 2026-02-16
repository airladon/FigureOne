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

<div class="fo-prop"><span class="fo-prop-name">name</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>)</span><span class="fo-prop-desc">: reference name of element</span></div>
<div class="fo-prop"><span class="fo-prop-name">isShown</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>)</span><span class="fo-prop-desc">: if <code>false</code> then element will not be processed on
next draw</span></div>
<div class="fo-prop"><span class="fo-prop-name">transform</span> <span class="fo-prop-type">(<a href="../classes/geometry_Transform.Transform.html">Transform</a>)</span><span class="fo-prop-desc">: transform to apply element</span></div>
<div class="fo-prop"><span class="fo-prop-name">lastDrawTransform</span> <span class="fo-prop-type">(<a href="../classes/geometry_Transform.Transform.html">Transform</a>)</span><span class="fo-prop-desc">: transform last used for drawing -
includes cascade or all parent transforms</span></div>
<div class="fo-prop"><span class="fo-prop-name">parent</span> <span class="fo-prop-type">(<a href="../classes/Element.FigureElement.html">FigureElement</a> | null)</span><span class="fo-prop-desc">: parent figure element - <code>null</code> if
at top level of figure</span></div>
<div class="fo-prop"><span class="fo-prop-name">isTouchable</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>)</span><span class="fo-prop-desc">: must be <code>true</code> to move or execute <code>onClick</code></span></div>
<div class="fo-prop"><span class="fo-prop-name">isMovable</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>)</span><span class="fo-prop-desc">: must be <code>true</code> to move</span></div>
<div class="fo-prop"><span class="fo-prop-name">onClick</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | () => void)</span><span class="fo-prop-desc">: callback if touched or clicked</span></div>
<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">([<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>])</span><span class="fo-prop-desc">: element's current
color defined as red, green, blue, alpha with range 0 to 1</span></div>
<div class="fo-prop"><span class="fo-prop-name">dimColor</span> <span class="fo-prop-type">([<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>])</span><span class="fo-prop-desc">: color to use when
dimming element</span></div>
<div class="fo-prop"><span class="fo-prop-name">defaultColor</span> <span class="fo-prop-type">([<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>])</span><span class="fo-prop-desc">: color to go to
when undimming element</span></div>
<div class="fo-prop"><span class="fo-prop-name">opacity</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>)</span><span class="fo-prop-desc">: number between 0 and 1 that is multiplied with
<code>color</code> alpha channel to get final opacity</span></div>
<div class="fo-prop"><span class="fo-prop-name">move</span> <span class="fo-prop-type">(<a href="../interfaces/Element.OBJ_ElementMove.html">OBJ_ElementMove</a>)</span><span class="fo-prop-desc">: movement parameters</span></div>
<div class="fo-prop"><span class="fo-prop-name">scenarios</span> <span class="fo-prop-type">(<a href="../interfaces/Element.OBJ_Scenarios.html">OBJ_Scenarios</a>)</span><span class="fo-prop-desc">: scenario presets</span></div>
<div class="fo-prop"><span class="fo-prop-name">state</span> <span class="fo-prop-type">(ElementState)</span><span class="fo-prop-desc">: current state of element</span></div>
<div class="fo-prop"><span class="fo-prop-name">animations</span> <span class="fo-prop-type">(AnimationManager)</span><span class="fo-prop-desc">: element animation manager</span></div>
<div class="fo-prop"><span class="fo-prop-name">notifications</span> <span class="fo-prop-type">(<a href="../classes/tools.NotificationManager.html">NotificationManager</a>)</span><span class="fo-prop-desc">: notification manager for
element</span></div>
<div class="fo-prop"><span class="fo-prop-name">fnMap</span> <span class="fo-prop-type">(<a href="../classes/FunctionMap.FunctionMap.html">FunctionMap</a>)</span><span class="fo-prop-desc">: function map for use with {@link Recorder}</span></div>
<div class="fo-prop"><span class="fo-prop-name">customState</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object">Object</a>)</span><span class="fo-prop-desc">: put any custom state information that needs
to be captured with recorder here - only stringify-able values can go in this
object like strings, numbers, booleans and nested arrays or objects
containing these. Functions should not be put in here - use string
identifiers to <code>fnMap</code> if functions are needed.</span></div>

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

