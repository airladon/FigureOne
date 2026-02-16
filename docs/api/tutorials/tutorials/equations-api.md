---
title: Equations API
group: Equations
---

# Equations API Reference

## Contents

- [EQN_TextElement](#eqn_textelement)
- [TypeEquationElement](#typeequationelement)
- [EQN_EquationElements](#eqn_equationelements)
- [EQN_FormAlignment](#eqn_formalignment)
- [EQN_TranslationStyle](#eqn_translationstyle)
- [EQN_FromForm](#eqn_fromform)
- [EQN_FromForms](#eqn_fromforms)
- [EQN_FormObjectDefinition](#eqn_formobjectdefinition)
- [TypeEquationForm](#typeequationform)
- [EQN_Forms](#eqn_forms)
- [EQN_FormRestart](#eqn_formrestart)
- [EQN_FormDefaults](#eqn_formdefaults)
- [EQN_Equation](#eqn_equation)
- [Equation](#equation)
- [TypeEquationPhrase](#typeequationphrase)

---

## EQN_TextElement

Definition of a text or equation element.

The properties 'color', 'isTouchable', 'onClick' and `touchBorder`
modify the corresponding properties on the {@link FigureElementPrimitive}
itself, and so could equally be set in `mods`. They are provided in the
root object for convenience as they are commonly used.

### Properties

<div class="fo-prop"><span class="fo-prop-name">text</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>?)</span><span class="fo-prop-desc">: - Text element only</span></div>
<div class="fo-prop"><span class="fo-prop-name">font</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_Font.html">OBJ_Font</a>?)</span><span class="fo-prop-desc">: - Text element only</span></div>
<div class="fo-prop"><span class="fo-prop-name">style</span> <span class="fo-prop-type">('italic' | 'normal'?)</span><span class="fo-prop-desc">: - Text element only</span></div>
<div class="fo-prop"><span class="fo-prop-name">mods</span> <span class="fo-prop-type">(object?)</span><span class="fo-prop-desc">: - Properties to set on instantiated element</span></div>
<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: - Color to set the element</span></div>
<div class="fo-prop"><span class="fo-prop-name">isTouchable</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: - make the element touchable</span></div>
<div class="fo-prop"><span class="fo-prop-name">onClick</span> <span class="fo-prop-type">(() => void | '<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>' | null?)</span><span class="fo-prop-desc">: - called when touched</span></div>
<div class="fo-prop"><span class="fo-prop-name">touchBorder</span> <span class="fo-prop-type">(<a href="../types/g2.TypeBorder.html">TypeBorder</a> | 'border' | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'rect' | 'draw' | 'buffer'?)</span><span class="fo-prop-desc">: set the element's touch border</span></div>
<div class="fo-prop"><span class="fo-prop-name">mods</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.OBJ_ElementMods.html">OBJ_ElementMods</a>?)</span></div>

---

## TypeEquationElement

An equation element can be any of the below. If `string`, then a
{@link EQN_TextElement} will be used where the `text` property is the
`string`.

- `string`
- {@link FigureElementPrimitive}
- {@link FigureElementCollection}
- {@link EQN_TextElement}
- {@link EQN_VinculumSymbol}
- {@link EQN_BoxSymbol}
- {@link EQN_ArrowSymbol}
- {@link EQN_SumSymbol}
- {@link EQN_ProdSymbol}
- {@link EQN_IntegralSymbol}
- {@link EQN_StrikeSymbol}
- {@link EQN_BracketSymbol}
- {@link EQN_AngleBracketSymbol}
- {@link EQN_BraceSymbol}
- {@link EQN_BarSymbol}
- {@link EQN_SquareBracketSymbol}
- {@link EQN_LineSymbol}
- {@link EQN_RadicalSymbol}

---

## EQN_EquationElements

Object where keys are element names, and values are the element definitions

### Properties

<div class="fo-prop"><span class="fo-prop-name">_elementName</span> <span class="fo-prop-type">(<a href="../types/Equation_Equation.TypeEquationElement.html">TypeEquationElement</a>?)</span></div>

> {@link Equation}


---

## EQN_FormAlignment

Form alignment object definition.

![](../apiassets/eqn_formalignment_1.png)

![](../apiassets/eqn_formalignment_2.png)

![](../apiassets/eqn_formalignment_3.png)

![](../apiassets/eqn_formalignment_4.png)

Each equation form is positioned within the {@link Equation}
{@link FigureElementCollection} draw space (0, 0) point. This object
defines how the form is aligned with this (0, 0) point.

Using the `fixTo` property forms can either be aligned relative to the
bounds of the form itself, or to an element within the form, or to a
position other than the (0, 0) in in the equation's collection draw space.

If `fixTo` is an element in the equation:
   - the `fixTo` element is positioned at (0, 0), and all other elements
     repositioned relative to that.
   - The equation collection setPosition (or translation transform) can
     then be used to position the equation in the figure (or relative
     collection space)
   - if `xAlign` is:
       - `'center'`: the `fixTo` element is centered in x around (0, 0)
       - `'right'`: the `fixTo` element right most point is at x = 0
       - `'left'`: default - the `fixTo` element x position at 0
   - if `yAlign` is:
       - `'middle'`: the `fixTo` element is centered in y around (0, 0)
       - `'bottom'`: the `fixTo` element bottom most point is at y = 0
       - `'top'`: the `fixTo` element top most point is at y = 0
       - `'baseline'`: default - the `fixTo` element y position at 0

If `fixTo` is a Point, the equation is positioned at that point in the
equation's draw space.
 - xAlign:
   - `'left'`: The equation's left most element's left most point is at
             Point.x
   - `'right'`: The equation's right most element's right most point is at
             Point.x
   - `'center'`: The equation is centered horizontally around Point.x
 - `yAlign`:
   - `'baseline'`: The equation's baseline is at Point.y
   - `'top'`: The equation's top most element's top most point is at Point.y
   - `'bottom'`: The equation's top most element's top most point is at
               Point.y
   - `'middle'`: The equation is centered vertically around Point.y

### Properties

<div class="fo-prop"><span class="fo-prop-name">fixTo</span> <span class="fo-prop-type">(<a href="../classes/Element.FigureElement.html">FigureElement</a> | <a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> ?)</span><span class="fo-prop-desc"> (<code>[0, 0]</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">xAlign</span> <span class="fo-prop-type">(<a href="../types/Equation_EquationForm.TypeHAlign.html">TypeHAlign</a>?)</span><span class="fo-prop-desc"> (<code>'left'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">yAlign</span> <span class="fo-prop-type">(<a href="../types/Equation_EquationForm.TypeVAlign.html">TypeVAlign</a>?)</span><span class="fo-prop-desc"> (<code>'baseline'</code>)</span></div>

#### Note - the points are drawn in the figure's draw space, but as the

```js
// equation collection is at (0, 0) and it has not scaling applied, then
// the equation's draw space is the same as the figure's draw space.

// Draw (0, 0) point in equation collection
figure.add({
  make: 'polygon', options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 },
});
// Default alignment is left, baseline
figure.add([
  {
    make: 'equation',
    forms: { 0: ['a', '_ = ', 'bg'] },
  },
]);
```

#### Draw (0, 0) point in equation collection

```js
figure.add({
  make: 'polygon', options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 },
});
// Align with right, middle
figure.add([
  {
    make: 'equation',
    forms: { 0: ['a', '_ = ', 'bg'] },
    formDefaults: {
      alignment: {
        xAlign: 'right',
        yAlign: 'middle',
      },
    },
  },
]);
```

#### Draw (0, 0) point in equation collection

```js
figure.add({
  make: 'polygon', options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 },
});
// Align with center of equals sign
figure.add([
  {
    make: 'equation',
    forms: { 0: ['a', '_ = ', 'bg'] },
    formDefaults: {
      alignment: {
        fixTo: '_ = ',
        xAlign: 'center',
        yAlign: 'baseline',
      },
    },
  },
]);
```

#### Draw (0, 0) and (0.2, 0.1) points

```js
figure.add([
  {
    make: 'polygon',
    options: { radius: 0.01, color: [0, 0, 1, 1], sides: 9 }
  },
  {
    make: 'polygon',
    options: {
      radius: 0.01, color: [0, 0.8, 0, 1], sides: 9, position: [0.2, 0.1],
    },
  },
]);
// Align with point (0.2, 0.1) in the equation collection
figure.add([
  {
    make: 'equation',
    forms: { 0: ['a', '_ = ', 'bg'] },
    formDefaults: {
      alignment: {
        fixTo: [0.2, 0.1],
        xAlign: 'right',
        yAlign: 'baseline',
      },
    },
  },
]);
```

> To test examples, append them to the
<a href="#drawing-boilerplate">boilerplate</a>


---

## EQN_TranslationStyle

Form translation properties

### Properties

<div class="fo-prop"><span class="fo-prop-name">style</span> <span class="fo-prop-type">('curved' | 'linear')</span><span class="fo-prop-desc">: - element should move in a straight
line, or through a curve. Default: <code>"linear"</code></span></div>
<div class="fo-prop"><span class="fo-prop-name">direction</span> <span class="fo-prop-type">('up' | 'down'?)</span><span class="fo-prop-desc">: - curve only - element should move
through an up or down curve</span></div>
<div class="fo-prop"><span class="fo-prop-name">mag</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: - the magnitude of the curve</span></div>

---

## EQN_FromForm

From form options object.

Any defined properties will override the corrsponding properties of the form
if it being animated to from a specific form.

### Properties

<div class="fo-prop"><span class="fo-prop-name">duration</span> <span class="fo-prop-type">(?<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: duration if animating to this form, use
<code>null</code> for velocity based duration</span></div>
<div class="fo-prop"><span class="fo-prop-name">translation</span> <span class="fo-prop-type">(EQN_TranslationStyle?)</span><span class="fo-prop-desc">: translation style
when animating to this form</span></div>
<div class="fo-prop"><span class="fo-prop-name">onTransition</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | (() => void)?)</span><span class="fo-prop-desc">: called at the start of
animating to this form, or when <code>showForm</code> is used.</span></div>
<div class="fo-prop"><span class="fo-prop-name">onShow</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | (() => void)?)</span><span class="fo-prop-desc">: called after animation is finished
or when <code>showForm</code> is used</span></div>
<div class="fo-prop"><span class="fo-prop-name">elementMods</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.OBJ_ElementMods.html">OBJ_ElementMods</a>?)</span><span class="fo-prop-desc">: properties to set in the equation element
(@FigureElementPrimitive) when this form is shown</span></div>

---

## EQN_FromForms

Equation form FromForm definition.

When animating from a specific form, it can be useful to customize some of
the form properties specific to that transition.

To do so, use this options object where each key is the specific form from
which the equation is animating from, and the value is the specific
properties.

### Properties

<div class="fo-prop"><span class="fo-prop-name">_formName</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.EQN_FromForm.html">EQN_FromForm</a>?)</span></div>

> {@link EQN_FromForm}, {@link EQN_FormObjectDefinition}

---

## EQN_FormObjectDefinition

In mathematics, an equation form is a specific arrangement of an equation's
terms and operators. Different forms will have different
arrangements, that can be achieved by performing a series of operations to
both sides of the equation.

For instance, the equation:

a + b = c

can be rearranged to a different form:

a = c - b

From a FigureOne figure's perspective, a form is a specific layout of
equation elements.

This object defines a how the elements are laid out, what properties the
elements have, and some animation properties for when animating to this form.

### Properties

<div class="fo-prop"><span class="fo-prop-name">content</span> <span class="fo-prop-type">(<a href="../types/Equation_EquationFunctions.TypeEquationPhrase.html">TypeEquationPhrase</a>)</span><span class="fo-prop-desc">: The equation phrase of the form
defines how the elements are laid out</span></div>
<div class="fo-prop"><span class="fo-prop-name">scale</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: scaling factor for this form</span></div>
<div class="fo-prop"><span class="fo-prop-name">alignment</span> <span class="fo-prop-type">(EQN_FormAlignment?)</span><span class="fo-prop-desc">: how the equation's position
is aligned with this form</span></div>
<div class="fo-prop"><span class="fo-prop-name">description</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>?)</span><span class="fo-prop-desc">: description of this form</span></div>
<div class="fo-prop">{{}} [modifiers] description modifiers</div>
<div class="fo-prop"><span class="fo-prop-name">duration</span> <span class="fo-prop-type">(?<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: duration if animating to this form, use
<code>null</code> for velocity based duration</span></div>
<div class="fo-prop"><span class="fo-prop-name">translation</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.EQN_TranslationStyles.html">EQN_TranslationStyles</a>?)</span><span class="fo-prop-desc">: translation style
when animating to this form</span></div>
<div class="fo-prop"><span class="fo-prop-name">onTransition</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | (() => void)?)</span><span class="fo-prop-desc">: called at the start of
animating to this form, or when <code>showForm</code> is used.</span></div>
<div class="fo-prop"><span class="fo-prop-name">onShow</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | (() => void)?)</span><span class="fo-prop-desc">: called after animation is finished
or when <code>showForm</code> is used</span></div>
<div class="fo-prop"><span class="fo-prop-name">elementMods</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.OBJ_ElementMods.html">OBJ_ElementMods</a>?)</span><span class="fo-prop-desc">: properties to set in the equation element
(@FigureElementPrimitive) when this form is shown</span></div>
<div class="fo-prop"><span class="fo-prop-name">fromForm</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.EQN_FromForms.html">EQN_FromForms</a>?)</span><span class="fo-prop-desc">: override <code>duration</code>, <code>translation</code>
<code>onTransition</code> and/or <code>onShow</code> with this if coming from specific forms</span></div>
<div class="fo-prop"><span class="fo-prop-name">ignoreColor</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: when <code>false</code>, color will be set
automatically in the equation based on EQN_Color equation functions. In such
cases, colors that are set external to the equation will be overridden. Use
<code>true</code> to allow setting of colors externally only. (<code>false</code>)</span></div>

#### Simple form definition of two different forms of the same equation and one

```js
// of the elements is colored blue in one form and red in the other
figure.add({
  name: 'eqn',
  make: 'equation',
  elements: { equals: ' = ', plus: ' + ', minus: ' \u2212 ' },
  forms: {
    form1: {
      content: ['a', 'plus', 'b', 'equals', 'c'],
      elementMods: {
        a: { color: [0, 0, 1, 1] },
      },
    },
    form2: {
      content: ['a', 'equals', 'c', 'minus', 'b'],
      elementMods: {
        a: { color: [1, 0, 0, 1] },
      },
    },
  },
});
```

#### Example showing all form options

```js
figure.add({
  name: 'eqn',
  make: 'equation',
  forms: {
    form1: {
      content: ['a', 'b', 'c'],
      subForm: 'deg',
      scale: 1.2,
      alignment: {
        fixTo: 'b',
        xAlign: 'center',
        yAlign: 'bottom',
      },
      description: '|Form| 1 |description|',
      modifiers: {
        Form: { font: { color: [0, 0, 1, 0] } },
      },
      elementMods: {
        a: {
          color: [0, 0, 1, 1],
          isTouchable: true,
        },
      },
      duration: 1,
      translation: {
        a: {
          style: 'curved',
          direction: 'up',
          mag: 0.95,
        },
        b: ['curved', 'down', 0.45],
      },
      fromPrev: {
        duration: null,
        translation: {
          a: ['curved', 'down', 0.2],
          b: ['curved', 'down', 0.2],
        },
      },
      fromNext: {
        duration: 2,
        translation: {
          a: ['curved', 'down', 0.2],
          b: ['curved', 'down', 0.2],
        },
      },
    },
  },
});
```

> {@link Equation}


---

## TypeEquationForm

A form definition can either be:

* an equation form object {@link EQN_FormObjectDefinition}
* an equation phrase {@link TypeEquationPhrase}

@type {TypeEquationPhrase | EQN_FormObjectDefinition}

---

## EQN_Forms

An object of equation forms where each key is the form name and each value
is a form defintion {@link TypeEquationForm}

### Properties

<div class="fo-prop"><span class="fo-prop-name">_formName</span> <span class="fo-prop-type">(TypeEquationForm?)</span></div>

---

## EQN_FormRestart

When an equation form series is restarted, or cycled back to the first form
in the series, then two special animations can be defined with this object:
* `moveFrom`: the equation will move from a location (usually another equation of the same form)
* `pulse`: An element will be pulsed when the animation is finished.

The default values in the pulse object are are:
* `duration`: 1s
* `scale`: 1.1

---

## EQN_FormDefaults

Default form values applied to all forms

> {@link EQN_FormObjectDefinition}

---

## EQN_Equation

Options objects to construct an {@link Equation} class.

All properties are optional.

### Properties

<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: default equation color</span></div>
<div class="fo-prop"><span class="fo-prop-name">dimColor</span> <span class="fo-prop-type">(<a href="../types/types.TypeColor.html">TypeColor</a>?)</span><span class="fo-prop-desc">: default equation dim color</span></div>
<div class="fo-prop"><span class="fo-prop-name">font</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_Font.html">OBJ_Font</a>?)</span><span class="fo-prop-desc">: default {@link FigureFont} for math elements in
the equation</span></div>
<div class="fo-prop"><span class="fo-prop-name">textFont</span> <span class="fo-prop-type">(<a href="../interfaces/types.OBJ_Font.html">OBJ_Font</a>?)</span><span class="fo-prop-desc">: default {@link FigureFont} for text elements
in the equation (<code>defaults to font</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">scale</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: equation scale (<code>0.7</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">elements</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.EQN_EquationElements.html">EQN_EquationElements</a>?)</span><span class="fo-prop-desc">: equation element definitions</span></div>
<div class="fo-prop"><span class="fo-prop-name">forms</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.EQN_Forms.html">EQN_Forms</a>?)</span><span class="fo-prop-desc">: form definitions</span></div>
<div class="fo-prop"><span class="fo-prop-name">initialForm</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>?)</span><span class="fo-prop-desc">: form to show when first added to a figure</span></div>
<div class="fo-prop"><span class="fo-prop-name">formDefaults</span> <span class="fo-prop-type">(<a href="../interfaces/Equation_Equation.EQN_FormDefaults.html">EQN_FormDefaults</a>?)</span><span class="fo-prop-desc">: default form options applied to
all forms</span></div>
<div class="fo-prop"><span class="fo-prop-name">formSeries</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object">Object</a>.<<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>>>?)</span><span class="fo-prop-desc">: an object
with each key being a form series name, and each value an array for form
names. If defined as an array, then a form series object is created where
the form series name is 'base'. Default: {}</span></div>
<div class="fo-prop"><span class="fo-prop-name">defaultFormSeries</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>?)</span><span class="fo-prop-desc">: If more than one form series is
defined, then a default must be chosen to be the first current one. Default:
first form defined</span></div>
<div class="fo-prop"><span class="fo-prop-name">formRestart</span> <span class="fo-prop-type">(?EQN_FormRestart?)</span><span class="fo-prop-desc">: behavior when form transitions
from last in form series back to first</span></div>
<div class="fo-prop"><span class="fo-prop-name">position</span> <span class="fo-prop-type">(<a href="../types/geometry_Point.TypeParsablePoint.html">TypeParsablePoint</a>?)</span><span class="fo-prop-desc">: position will override first
translation element of transform</span></div>
<div class="fo-prop"><span class="fo-prop-name">transform</span> <span class="fo-prop-type">(<a href="../classes/geometry_Transform.Transform.html">Transform</a>?)</span></div>

---

## Equation

*Extends {@link FigureElementCollection}*

An Equation is a collection of elements that can be arranged into different
forms.

`Equation` should be instantiated from an *object definition*, or from
the `figure.collections.equation` method.

Equation includes two additional animation steps in {@link Equation.animations}:
* {@link GoToFormAnimationStep}
* {@link NextFormAnimationStep}

#### Create with options definition

```js
figure.add({
  name: 'eqn',
  make: 'equation',
  elements: {
    a: 'a',
    b: { color: [0, 0, 1, 1] },
    c: 'c',
    equals: ' = ',
    plus: ' + ',
  },
  forms: {
    1: ['a', 'equals', 'b', 'plus', 'c'],
  },
});
```

#### Create with methods

```js
const eqn = figure.collections.equation();
eqn.addElements({
  a: 'a',
  b: { color: [0, 0, 1, 1] },
  c: 'c',
  equals: ' = ',
  plus: ' + ',
});
eqn.addForms({
  1: ['a', 'equals', 'b', 'plus', 'c'],
});
figure.add('eqn', eqn);
eqn.showForm('1');
```

> To test examples, append them to the
<a href="#drawing-boilerplate">boilerplate</a>

@param {EQN_Equation} options

---

## TypeEquationPhrase

An equation phrase is used to define an equation form and can be any of the
below:

 - `string` (which represents the unique identifier of an equation element)
 - `{ frac: `{@link EQN_Fraction} `}`
 - `{ strike: `{@link EQN_Strike} `}`
 - `{ box: `{@link EQN_Box} `}`
 - `{ tBox: `{@link EQN_TouchBox} `}`
 - `{ root: `{@link EQN_Root} `}`
 - `{ brac: `{@link EQN_Bracket} `}`
 - `{ sub: `{@link EQN_Subscript} `}`
 - `{ sup: `{@link EQN_Superscript} `}`
 - `{ supSub: `{@link EQN_SuperscriptSubscript} `}`
 - `{ topBar: `{@link EQN_Bar} `}`
 - `{ bottomBar: `{@link EQN_Bar} `}`
 - `{ annotate: `{@link EQN_Annotate} `}`
 - `{ topComment: `{@link EQN_Comment} `}`
 - `{ bottomComment: `{@link EQN_Comment} `}`
 - `{ pad: `{@link EQN_Pad} `}`
 - `{ bar: `{@link EQN_Bar} `}`
 - `{ scale: `{@link EQN_Scale} `}`
 - `{ container: `{@link EQN_Container} `}`
 - `{ offset: `{@link EQN_Offset} `}`
 - `{ matrix: `{@link EQN_Matrix} `}
 - `{ lines: `{@link EQN_Lines} `}`
 - `{ int: `{@link EQN_Integral} `}`
 - `{ sumOf: `{@link EQN_SumOf} `}`
 - `{ prodOf: `{@link EQN_ProdOf} `}`
 - `{ topStrike: `{@link EQN_StrikeComment} `}`
 - `{ bottomStrike: `{@link EQN_StrikeComment} `}`
 - `Array<TypeEquationPhrase>`

#### Example 1

```js
figure.add({
  name: 'eqn',
  make: 'equation',
  elements: { equals: ' = ' },
  forms: {
    form1: 'a',
    form2: ['a', 'equals', 'b'],
    form3: [{
      frac: {
        numerator: 'a',
        symbol: 'vinculum',
        denominator: 'c',
      },
    }, 'equals', 'b'],
    form4: { frac: ['a', 'vinculum', 'c'] },
  },
});

figure.getElement('eqn').animations.new()
  .goToForm({ target: 'form2', animate: 'move', delay: 1 })
  .goToForm({ target: 'form3', animate: 'move', delay: 1 })
  .goToForm({ target: 'form4', animate: 'move', delay: 1 })
  .start();
```

---

