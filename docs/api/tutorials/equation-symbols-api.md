---
title: Equation Symbols API
group: Equations
---

# Equation Symbols API Reference

## Contents

- [EQN_Symbol](#eqn_symbol)
- [EQN_VinculumSymbol](#eqn_vinculumsymbol)
- [EQN_BoxSymbol](#eqn_boxsymbol)
- [EQN_ArrowSymbol](#eqn_arrowsymbol)
- [EQN_SumSymbol](#eqn_sumsymbol)
- [EQN_ProdSymbol](#eqn_prodsymbol)
- [EQN_IntegralSymbol](#eqn_integralsymbol)
- [EQN_RadicalSymbol](#eqn_radicalsymbol)
- [EQN_DivisionSymbol](#eqn_divisionsymbol)
- [EQN_StrikeSymbol](#eqn_strikesymbol)
- [EQN_BracketSymbol](#eqn_bracketsymbol)
- [EQN_AngleBracketSymbol](#eqn_anglebracketsymbol)
- [EQN_BraceSymbol](#eqn_bracesymbol)
- [EQN_BarSymbol](#eqn_barsymbol)
- [EQN_SquareBracketSymbol](#eqn_squarebracketsymbol)
- [EQN_LineSymbol](#eqn_linesymbol)

---

## EQN_Symbol

Base object options for all equation symbols

`isTouchable`, `touchBorder`, `color` and `onClick` change the corresponding
properties on the {@link FigureElementPrimitive}, and could therefore also
be set in `mods`. However, as these are commonly used, they are included in
the root object for convenience.

---

## EQN_VinculumSymbol

*Extends {@link EQN_Symbol}*

Vinculum symbol used in fractions ({@link EQN_Fraction} equation function).

![](../apiassets/eqn_symbol_vinculum.png)

<pre>
                         width
      |<---------------------------------------->|
      |                                          |
      |                                          | ____
      00000000000000000000000000000000000000000000   A
      00000000000000000000000000000000000000000000   |  lineWidth
      00000000000000000000000000000000000000000000 __V_

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('vinculum')</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'dynamic'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>'dynamic'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets width of static symbol - <code>'first'</code> calculates and sets width
based on first use (<code>'first'</code>)</span></div>

#### Define as element

```js
figure.add({
  make: 'equation',
  elements: {
    v: { symbol: 'vinculum' },
  },
  forms: {
    form1: { frac: ['a', 'v', 'b'] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { frac: ['a', 'vinculum', 'b'] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { frac: ['a', 'v1_vinculum', { frac: ['c', 'v2_vinculum', 'b'] }] },
    form2: { frac: [['a', 'ef'], 'v1', { frac: ['c', 'v2', 'd'] }] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
      form1: { frac: ['a', { vinculum: { lineWidth: 0.004 } }, 'b'] },
  },
});
```

---

## EQN_BoxSymbol

*Extends {@link EQN_Symbol}*

Box equation symbol used in {@link EQN_Box} and as a
{@link EQN_EncompassGlyph}.

![](../apiassets/eqn_symbol_box.png)


<pre>
                                         width
                |<--------------------------------------------------->|
                |                                                     |
                |                                                     |

        ------- 0000000000000000000000000000000000000000000000000000000
        A       0000000000000000000000000000000000000000000000000000000
        |       0000                                               0000
        |       0000                                               0000
        |       0000                                               0000
 height |       0000                                               0000
        |       0000                                               0000
        |       0000                                               0000
        |       0000                                               0000
        |       0000                                               0000
        |       0000000000000000000000000000000000000000000000000000000
        V______ 0000000000000000000000000000000000000000000000000000000

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('box')</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">fill</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc"> (<code>false</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force width instead of auto calculation</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force height instead of auto calculation</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'dynamic'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets width of static symbol - <code>'first'</code> calculates and sets width
based on first use</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    b: { symbol: 'box', lineWidth: 0.008 },
  },
  forms: {
    form1: { box: ['a', 'b', true, 0.1] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { box: ['a', 'box', true, 0.1] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { box: ['a', 'b_box', false, 0.1] },
    form2: { box: ['a', 'b', false, 0.2] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { box: ['a', { box: { lineWidth: 0.004 } }, true, 0.1] },
  },
});
```

---

## EQN_ArrowSymbol

*Extends {@link EQN_Symbol}*

Arrow equation symbol.

The arrow direction defines where it can be used:
- `'left'`, `'right'`: {@link EQN_Bar} (top and bottom sides),
  {@link EQN_Comment}, and {@link EQN_LeftRightGlyph}
- `'up'`, `'down'`: {@link EQN_Bracket}, {@link EQN_Bar} (left and right
  sides), and {@link EQN_TopBottomGlyph}

Note, as the default direciton is `'right'`, using the inline definition of
arrow will only work with {@link EQN_Bar} (top and bottom sides),
{@link EQN_Comment}, and {@link EQN_LeftRightGlyph}.

![](../apiassets/eqn_symbol_arrow.png)

<pre>
                            arrowWidth
                        |<--------------->|
                        |                 |
                        |                 |
                 -------|------- 0        |
                 A      |      00000      |
   arrowHeight   |      |     0000000     |
                 |      |   00000000000   |
                 V      | 000000000000000 |
                 ------ 0000000000000000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              0000000
                              |     |
                              |     |
                              |<--->|
                             lineWidth
</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('arrow')</span></div>
<div class="fo-prop"><span class="fo-prop-name">direction</span> <span class="fo-prop-type">('up' | 'down' | 'left' | 'right'?)</span><span class="fo-prop-desc"> (<code>'right'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">arrowWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">arrowHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.04</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'dynamic'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    rightArrow: { symbol: 'arrow', direction: 'right' },
  },
  forms: {
    form1: { bar: ['a', 'rightArrow', false, 0.05, 0.03] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { bar: ['a', 'arrow', false, 0.05, 0.03] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { bar: ['a', 'ar_arrow', false, 0.05, 0] },
    form2: { bar: ['a', 'ar', false, 0.05, 0.1] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: {
      bar: {
        content: 'a',
        side: 'left',
        symbol: { arrow: { direction: 'up' } },
        overhang: 0.1,
      },
    },
  },
});
```

---

## EQN_SumSymbol

*Extends {@link EQN_Symbol}*

Sum equation symbol used with the {@link EQN_SumOf} equation function.

![](../apiassets/eqn_symbol_sum.png)

<pre>
         ---------- 00000000000000000000000000000000000
         A            0000000                     000000
         |              0000000                      000
         |                0000000                      00
         |                  0000000
         |                    0000000
         |                      0000000
         |                        0000000
         |                          0000000
         |                            0000000
         |                              0000000
         |                                000000
         |                                  000
         |                                0000
  height |                              0000
         |                            0000   \
         |                          0000      \
         |                        0000         lineWidth
         |                      0000
         |                    0000
         |                  0000
         |                0000                          00
         |              0000                          000|
         |            0000                         000000|
         V          000000000000000000000000000000000000 |
         --------  000000000000000000000000000000000000  |
                  |                                      |
                  |                                      |
                  |                 width                |
                  |<------------------------------------>|
</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('sum')</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: (<code>height * 0.88 / (25 * height + 15)</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides that make up serif curve (<code>5</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    sigma: { symbol: 'sum' },
  },
  forms: {
    form1: { sumOf: ['sigma', 'a', 'a = 0', 'n'] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { sumOf: ['sum', 'a', 'a = 0', 'n'] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { sumOf: ['s1_sum', 'a', 'a = 0', 'n'] },
    form2: { sumOf: ['s1', 'a', 'a = 0', 'm'] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { sumOf: [{ sum: { lineWidth: 0.01 } }, 'a', 'a = 0', 'n'] },
  },
});
```

---

## EQN_ProdSymbol

*Extends {@link EQN_Symbol}*

Product equation symbol used with the {@link EQN_ProdOf} equation function.

![](../apiassets/eqn_symbol_prod.png)


<pre>
                                         width
               |<--------------------------------------------------------->|
               |                                                           |
               |                                                           |
               |                                                           |
               |                          lineWidth                        |
               |                            /                              |
               |                           /                               |
         ---- 00000000000000000000000000000000000000000000000000000000000000
         A         000000000000000000000000000000000000000000000000000000
         |           00000000000000000000000000000000000000000000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
 height  |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |            00000000000                         00000000000
         |           0000000000000                       00000000000000
         V         00000000000000000                   000000000000000000
         ----- 0000000000000000000000000           00000000000000000000000000
</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('prod')</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>related to height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides that make up serif curve (<code>5</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    sigma: { symbol: 'prod' },
  },
  forms: {
    form1: { prodOf: ['sigma', 'a', 'a = 0', 'n'] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { prodOf: ['prod', 'a', 'a = 0', 'n'] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { prodOf: ['p1_prod', 'a', 'a = 0', 'n'] },
    form2: { prodOf: ['p1', 'a', 'a = 0', 'm'] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { prodOf: [{ prod: { lineWidth: 0.01 } }, 'a', 'a = 0', 'n'] },
  },
});
```

---

## EQN_IntegralSymbol

*Extends {@link EQN_Symbol}*

Integral equation symbol used with the {@link EQN_Integral} equation
function.

![](../apiassets/eqn_symbol_int1.png)

![](../apiassets/eqn_symbol_int2.png)

![](../apiassets/eqn_symbol_int3.png)


<pre>
     --------------------------------------------------   0000000
    A                                              000000011111111
    |                                         0000000   111111111111
    |                                       0000000    11111111111111
    |                                      0000000     11111111111111
    |                                     0000000       111111111111
    |                                   000000000         11111111
    |                                  000000000
    |                                 0000000000
    |                                 000000000
    |                                0000000000
    |                                0000000000
    |                               00000000000
    |                              00000000000
    |                              000000000000
    |                             000000000000      lineWidth
    | height              ------->000000000000<----------
    |                             000000000000
    |                             000000000000
    |                            000000000000
    |                             00000000000
    |                            00000000000
    |                            0000000000
    |                            0000000000
    |     Serif                  000000000
    |       \                   000000000
    |        \                 0000000000
    |      11111111           000000000
    |    111111111111       00000000
    |   11111111111111     0000000
    |   11111111111111   0000000
    |    111111111111   0000000
    V      111111110000000
    -------  0000000
</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('int')</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>related to height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides that make up s curve (<code>30</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">num</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of integral symbols (<code>1</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">type</span> <span class="fo-prop-type">('line' | 'generic'?)</span><span class="fo-prop-desc">: <code>line</code> draws a circle through the
 symbols denoting a line integral (<code>generic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">tipWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: width of s curve tip (<code>related to lineWidth</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">serif</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: <code>false</code> to remove serifs (<code>true</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">serifSides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides in serif circles (<code>10</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineIntegralSides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides in line integral circle (<code>20</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    int: { symbol: 'int' },
  },
  forms: {
    form1: { int: ['int', 'x dx', 'a', 'b'] },
  },
});
```

#### Triple Integral

```js
figure.add({
  make: 'equation',
  elements: {
    int: { symbol: 'int', num: 3 },
  },
  forms: {
    form1: { int: ['int', 'dx dy dz'] },
  },
});
```

#### Line Integral

```js
figure.add({
  make: 'equation',
  elements: {
    int: { symbol: 'int', type: 'line' },
  },
  forms: {
    form1: { int: ['int', 'r dr'] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { int: ['int', 'x dx', 'a', 'b'] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { int: ['i1_int', 'x dx', 'a', 'b'] },
    form2: { int: ['i1', 'y dy', 'a', 'b'] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { int: [{ int: { serif: false } }, 'x dx', 'a', 'b'] },
  },
});
```

---

## EQN_RadicalSymbol

*Extends {@link EQN_Symbol}*

Radical equation symbol used in {@link EQN_Root}.

The radical symbol allows customization on how to draw the radical. Mostly
it will not be needed, but for edge case equation layouts it may be useful.

![](../apiassets/eqn_symbol_radical.png)

<pre>

  height
  |
  |
  |_____________________________ XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  A                             X|
  |   startHeight              X |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |                       X  |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |    tickHeight        X   |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |    |                X    |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |____V____           X     |   CCCCCCCCCCCCCCCCCCCCCCC
  |   A    |    X         X      |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |    |__X |X       X       |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |    A |  | X     X        |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |      |  |  X   X         |   CCCCCCCCCCCCCCCCCCCCCCC
  |   |      |  |   X X          |   CCCCCCCCCCCCCCCCCCCCCCC
  V___V______|__|____X           |
             |  |    |           |
             |  |    |           |
  tickWidth >|--|<   |           |
             |  |    |           |
             |  |<-->|downWidth  |
             |                   |
             |<----------------->|
                    startWidth
</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('radical')</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force width of content area (<code>normally defined by content size</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force height of content area (<code>normally defined by content size</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">startWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.5</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">startHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.5</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">maxStartWidth</span> <span class="fo-prop-type">(?<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.15</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">maxStartHeight</span> <span class="fo-prop-type">(?<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.15</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">tickHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">tickWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">downWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">proportionalToHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: <code>true</code> makes <code>startHeight</code>,
<code>startWidth</code>, <code>tickHeight</code>, <code>tickWidth</code>, and <code>downWidth</code> a percentage of
height instead of absolute (<code>true</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth2</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: lineWidth of down stroke (<code>2 x lineWidth</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets width of static symbol - <code>'first'</code> calculates and sets width
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    r: { symbol: 'radical' },
  },
  forms: {
    form1: { root: ['r', 'a', false, 0.05] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { root: ['radical', 'a', false, 0.05] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { root: ['r1_radical', 'a', false, 0.05] },
    form2: { root: ['r1', ['a', 'b'], false, 0.05] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { root: [{ radical: { lineWidth: 0.005 } }, 'a', false, 0.05] },
  },
});
```

---

## EQN_DivisionSymbol

*Extends {@link EQN_Symbol}*

Division equation symbol used in {@link EQN_Root}.

The division symbol allows customization on how to draw the long form and
short form division symbol. Mostly it will not be needed, but for edge case
equation layouts it may be useful.

![](../apiassets/eqn_symbol_division.png)

<pre>

                           left space                right space
             bend width |<->|<---->|                     >|--|<
                        |   |      |                      |  |
                        |   |      |                      |  |
                ------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX____V
                A        X  |      |                      |_______|
                |         X |       CCCCCCCCCCCCCCCCCCCCCCC       A
                |          X        CCCCCCCCCCCCCCCCCCCCCCC    top space
                |           X       CCCCCCCCCCCCCCCCCCCCCCC
         height |           X       CCCCCCCCCCCCCCCCCCCCCCC
                |           X       CCCCCCCCCCCCCCCCCCCCCCC
                |           X       CCCCCCCCCCCCCCCCCCCCCCC
                |          X        CCCCCCCCCCCCCCCCCCCCCCC
                |         X         CCCCCCCCCCCCCCCCCCCCCCC
                |        X          CCCCCCCCCCCCCCCCCCCCCCC   bottom space
                V       X           CCCCCCCCCCCCCCCCCCCCCCC_______V
                ------ X _________________________________________|
                       |                                          A
                       |                                          |
                       |                  width                   |
                       |<----------------------------------------->

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('division')</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force width of content area (<code>normally defined by content size</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force height of content area (<code>normally defined by content size</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">bendWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>10</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets width of static symbol - <code>'first'</code> calculates and sets width
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    d: { symbol: 'division', bendWidth: 0.05 },
  },
  forms: {
    form1: { box: ['abc', 'd'] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { box: ['abc', 'division'] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { box: ['abc', 'd1_division'] },
    form2: { box: ['abc', 'd1'] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { box: ['abc', { division: { lineWidth: 0.005 } }] },
  },
});
```

---

## EQN_StrikeSymbol

*Extends {@link EQN_Symbol}*

Strike equation symbol used in {@link EQN_Strike}.

Integral equation symbol used with the {@link EQN_Strike} and
{@link EQN_StrikeComment} equation functions.

![](../apiassets/eqn_symbol_strike1.png)

![](../apiassets/eqn_symbol_strike2.png)

![](../apiassets/eqn_symbol_strike3.png)

![](../apiassets/eqn_symbol_strike4.png)

Four styles of strike symbol are available:
<pre>


         000         000
           000     000
             000 000
               000                       0000000000000000
             000 000
           000     000
         000         000
              cross                         horizontal


                     000                 000
                   000                     000
                 000                         000
               000                             000
             000                                 000
           000                                     000
         000                                         000
            forward                        back

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('strike')</span></div>
<div class="fo-prop"><span class="fo-prop-name">style</span> <span class="fo-prop-type">('cross' | 'forward' | 'back' | 'horizontal'?)</span><span class="fo-prop-desc"> (<code>'cross'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.015</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force width of strike (<code>normally defined by
content size</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">height</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force height of strike (<code>normally defined by
content size</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets width of static symbol - <code>'first'</code> calculates and sets width
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    s: { symbol: 'strike', style: 'cross', lineWidth: 0.01 },
  },
  forms: {
    form1: { strike: ['ABC', 's'] },
  },
});
```

#### Forward Strike

```js
figure.add({
  make: 'equation',
  elements: {
    s: { symbol: 'strike', style: 'forward', lineWidth: 0.01 },
  },
  forms: {
    form1: { strike: ['ABC', 's'] },
  },
});
```

#### Back Strike

```js
figure.add({
  make: 'equation',
  elements: {
    s: { symbol: 'strike', style: 'back', lineWidth: 0.01 },
  },
  forms: {
    form1: { strike: ['ABC', 's'] },
  },
});
```

#### Horizontal Slash

```js
figure.add({
  make: 'equation',
  elements: {
    s: { symbol: 'strike', style: 'horizontal', lineWidth: 0.01 },
  },
  forms: {
    form1: { strike: ['ABC', 's'] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { strike: ['ABC', 'strike'] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { strike: ['ABC', 's1_strike'] },
    form2: { strike: ['DEFGH', 's1'] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { strike: ['ABC', { strike: { style: 'forward' } }] },
  },
});
```

---

## EQN_BracketSymbol

*Extends {@link EQN_Symbol}*

Bracket equation symbol used in {@link EQN_Bracket}, {@link EQN_Bar},
{@link EQN_Matrix}, and {@link EQN_Comment}.


![](../apiassets/eqn_symbol_bracket.png)

<pre>
                   tipWidth
                     ----->| |<---
                           | |
                           | |
                           000
                         0000
                       00000
                     000000
                    000000
                    000000
       lineWidth   000000
            ------>000000<---
                   000000
                   |000000
                   |000000
                   | 000000
                   |   00000
                   |     0000
                   |       000
                   |         |
                   |         |
                   |<------->|
                      width
</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('bracket')</span></div>
<div class="fo-prop"><span class="fo-prop-name">side</span> <span class="fo-prop-type">('left' | 'right' | 'top' | 'bottom'?)</span><span class="fo-prop-desc">: how to orient the
bracket (<code>'left'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides in bracket curve (<code>10</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>depends on height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">tipWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>depends on lineWidth</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force width bracket (<code>normally depends on height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    lb: { symbol: 'bracket', side: 'left' },
    rb: { symbol: 'bracket', side: 'right' },
  },
  forms: {
    form1: { brac: ['lb', 'a', 'rb'] },
  },
});
```

#### Define inline

```js
figure.add({
  make: 'equation',
  forms: {
    form1: {
      brac: [
        { lb_bracket: { side: 'left' } },
        'a',
        { rb_bracket: { side: 'right' } },
      ],
    },
  },
});
```

---

## EQN_AngleBracketSymbol

*Extends {@link EQN_Symbol}*

Angle bracket equation symbol used in {@link EQN_Bracket}, {@link EQN_Bar},
{@link EQN_Matrix}, and {@link EQN_Comment}.


![](../apiassets/eqn_symbol_angleBracket.png)

<pre>
                     width
                  |<------->|
                  |         |
          --------|----- 0000
          A       |     0000
          |       |    0000
          |       |   0000
          |       |  0000
          |         0000
   height |        0000
          |        0000
          |         0000
          |          0000
          |           0000
          |            0000
          |             0000
          V_____________ 0000

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('angleBracket')</span></div>
<div class="fo-prop"><span class="fo-prop-name">side</span> <span class="fo-prop-type">('left' | 'right' | 'top' | 'bottom'?)</span><span class="fo-prop-desc">: how to orient the
angle bracket (<code>'left'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>depends on height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force width bracket (<code>normally depends on height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    lb: { symbol: 'angleBracket', side: 'left' },
    rb: { symbol: 'angleBracket', side: 'right' },
  },
  forms: {
    form1: { brac: ['lb', 'a', 'rb'] },
  },
});
```

#### Define inline

```js
figure.add({
  make: 'equation',
  forms: {
    form1: {
      brac: [
        { lb_angleBracket: { side: 'left' } },
        'a',
        { rb_angleBracket: { side: 'right' } },
      ],
    },
  },
});
```

---

## EQN_BraceSymbol

*Extends {@link EQN_Symbol}*

Brace equation symbol used in {@link EQN_Bracket}, {@link EQN_Bar},
{@link EQN_Matrix}, and {@link EQN_Comment}.


![](../apiassets/eqn_symbol_brace.png)

<pre>
               width
            |<------>|
            |        |
            |        |
            |      000
            |    000
            |   000
            |  0000
            |  0000
            |  0000
            |  0000
            |  000
            | 000
            000
              000
               000
               0000
               0000
               0000
               0000
          - - -0000 - - - -
         |      000        |
         |       000       |
         |         000     |
          - - - - - - - - -
                       \
                        \
                         \
     - - - - - - - - - - - - - - - - - - - - - - - - -
    |       00000000000000                            |
    |        00000000000000                           |
    |          000000000000                 tipWidth  |
    |            000000000000               |         |
    |              000000000000             |         |
    |                 0000000000000  _______V_        |
    |                     00000000000                 |
    |                         0000000_________        |
    |                                       A         |
     - - - - - - - - - - - - - - - - - - - - - - - - -

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('brace')</span></div>
<div class="fo-prop"><span class="fo-prop-name">side</span> <span class="fo-prop-type">('left' | 'right' | 'top' | 'bottom'?)</span><span class="fo-prop-desc">: how to orient the
brace (<code>'left'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>depends on height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">tipWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>depends on lineWidth</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: force width bracket (<code>normally depends on height</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides in curved sections (<code>10</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    lb: { symbol: 'brace', side: 'left' },
    rb: { symbol: 'brace', side: 'right' },
  },
  forms: {
    form1: { brac: ['lb', 'a', 'rb'] },
  },
});
```

#### Define inline

```js
figure.add({
  make: 'equation',
  forms: {
    form1: {
      brac: [
        { lb_brace: { side: 'left' } },
        'a',
        { rb_brace: { side: 'right' } },
      ],
    },
  },
});
```

---

## EQN_BarSymbol

*Extends {@link EQN_Symbol}*

Bar equation symbol.

The bar side defines where it can be used:
- `'top'`, `'bottom'`: {@link EQN_Bar} (top and bottom sides),
  {@link EQN_Comment}, and {@link EQN_LeftRightGlyph}
- `'left'`, `'right'`: {@link EQN_Bracket}, {@link EQN_Bar} (left and right
  sides), {@link EQN_Matrix} and {@link EQN_TopBottomGlyph}

Note, as the default direciton is `'right'`, using the inline definition of
arrow will only work with {@link EQN_Bar} (top and bottom sides),
{@link EQN_Comment}, and {@link EQN_LeftRightGlyph}.

![](../apiassets/eqn_symbol_bar1.png)

![](../apiassets/eqn_symbol_bar2.png)

<pre>

       >| |<---- lineWidth
        | |
        | |
        000
        000
        000
        000
        000
        000
        000
        000
        000
        000
        000

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('bar')</span></div>
<div class="fo-prop"><span class="fo-prop-name">side</span> <span class="fo-prop-type">('left' | 'right' | 'top' | 'bottom'?)</span><span class="fo-prop-desc">: how to orient the
bar (<code>'left'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    b: { symbol: 'bar', side: 'top' },
  },
  forms: {
    form1: { bar: ['a', 'b', false, 0.05, 0.03] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: {
      bar: {
        content: 'a',
        symbol: 'bar',
        side: 'left',
        overhang: 0.1,
      },
    },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { bar: ['a', { bar: { side: 'top' } }, false, 0.05, 0.03] },
    form2: { bar: [['a', 'bc'], { bar: { side: 'top' } }, false, 0.05, 0.03] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { bar: ['a', { bar: { side: 'top' } }, false, 0.05, 0.03] },
  },
});
```

---

## EQN_SquareBracketSymbol

*Extends {@link EQN_Symbol}*

Square bracket equation symbol used in {@link EQN_Bracket}, {@link EQN_Bar},
{@link EQN_Matrix}, and {@link EQN_Comment}.


![](../apiassets/eqn_symbol_squarebracket.png)

<pre>

                           width
                 |<--------------------->|
                 |                       |
           ___                              ____
          A      0000000000000000000000000     A
          |      0000000000000000000000000     | tipWidth
          |      0000000000000000000000000  ___V
          |      00000000
          |      00000000
          |      00000000
          |      00000000
 height   |      00000000
          |      00000000
          |      00000000
          |      00000000
          |      00000000
          |      00000000
          |      0000000000000000000000000
          |      0000000000000000000000000
          V___   0000000000000000000000000

                 |      |
                 |      |
                 |<---->|
                line width

</pre>

### Properties

<div class="fo-prop"><span class="fo-prop-name">symbol</span> <span class="fo-prop-type">('squareBracket')</span></div>
<div class="fo-prop"><span class="fo-prop-name">side</span> <span class="fo-prop-type">('left' | 'right' | 'top' | 'bottom'?)</span><span class="fo-prop-desc">: how to orient the
square bracket (<code>'left'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">lineWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">tipWidth</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0.01</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>depends on lineWidth</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">radius</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: optional curved corner radius (<code>0</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">sides</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of sides in curve (<code>5</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">draw</span> <span class="fo-prop-type">('static' | 'dynamic'?)</span><span class="fo-prop-desc">: <code>'static'</code> updates vertices on
resize, <code>'static'</code> only changes scale transform (<code>dynamic</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">staticHeight</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a> | 'first'?)</span><span class="fo-prop-desc">: used when <code>draw</code>=<code>static</code>.
<code>number</code> sets height of static symbol - <code>'first'</code> calculates and sets height
based on first use (<code>'first'</code>)</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    lb: { symbol: 'squareBracket', side: 'left' },
    rb: { symbol: 'squareBracket', side: 'right' },
  },
  forms: {
    form1: { brac: ['lb', 'a', 'rb'] },
  },
});
```

#### Define inline

```js
figure.add({
  make: 'equation',
  forms: {
    form1: {
      brac: [
        { lb_squareBracket: { side: 'left' } },
        'a',
        { rb_squareBracket: { side: 'right' } },
      ],
    },
  },
});
```

---

## EQN_LineSymbol

*Extends {@link EQN_Symbol}*

A line symbol to be used in {@link EQN_Annotate} and {@link EQN_Comment} as
an {@link EQN_LineGlyph} to draw a line between the content and an
annotation.

The line can be solid or dashed, and have arrows on either or both ends.

![](../apiassets/eqn_symbol_line1.png)

![](../apiassets/eqn_symbol_line2.png)

### Properties

<div class="fo-prop"><span class="fo-prop-name">width</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: line width</span></div>
<div class="fo-prop"><span class="fo-prop-name">dash</span> <span class="fo-prop-type">(<a href="../types/types.TypeDash.html">TypeDash</a>?)</span><span class="fo-prop-desc">: dash style of line</span></div>
<div class="fo-prop"><span class="fo-prop-name">arrow</span> <span class="fo-prop-type">(<a href="../interfaces/geometries_arrow.OBJ_LineArrows.html">OBJ_LineArrows</a>?)</span><span class="fo-prop-desc">: arrow styles of line where start is
toward the content</span></div>

#### Define in element

```js
figure.add({
  make: 'equation',
  elements: {
    l: { symbol: 'line', arrow: 'barb', width: 0.005 },
  },
  forms: {
    form1: { topComment: ['a', 'b', 'l', 0.2, 0.2] },
  },
});
```

#### Dashed line

```js
figure.add({
  make: 'equation',
  elements: {
    l: { symbol: 'line', dash: [0.01, 0.01], width: 0.005 },
  },
  forms: {
    form1: { topComment: ['a', 'b', 'l', 0.2, 0.2] },
  },
});
```

#### Define inline simple one use

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { topComment: ['a', 'b', 'line', 0.2, 0.2] },
  },
});
```

#### Define inline with reuse

```js
const eqn = figure.add({
  make: 'equation',
  forms: {
    form1: { topComment: ['a', 'b', 'l1_line', 0.2, 0.2] },
    form2: { topComment: ['c', 'd', 'l1', 0.2, 0.2] },
  },
});
eqn.animations.new()
  .goToForm({ delay: 1, target: 'form2', animate: 'move' })
  .start();
```

#### Define inline with customization

```js
figure.add({
  make: 'equation',
  forms: {
    form1: { topComment: ['a', 'b', { line: { arrow: 'barb' } }, 0.2, 0.2] },
  },
});
```

---

