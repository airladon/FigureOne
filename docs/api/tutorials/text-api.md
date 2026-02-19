---
title: Text API
group: Text
---

# Text API Reference

## Contents

- [OBJ_FormattedText](#obj_formattedtext)
- [FontManager](#fontmanager)
- [OBJ_Font](#obj_font)

---

## OBJ_FormattedText

*Extends {@link OBJ_Collection}*

{@link FormattedText} options object that extends {@link OBJ_Collection}
options object (without `parent`).

![](../apiassets/ftext1.png)

![](../apiassets/ftext2.png)

![](../apiassets/ftext3.png)

![](../apiassets/ftext4.gif)

![](../apiassets/ftext5.png)

![](../apiassets/ftext6.gif)

Formatted text allows:
  - Use of more than one font
  - Multi-line text
  - Embedded equations
  - Interactivity on select strings

If `text` is defined as an array of strings of line definition objects, then
each element of the array will be a new line of text.

All text will be laid out with the default font (or default line font if a
line definition object is used).

To modify the font of portions of text within a line, surround the text to
modify with '|' characters. The string surrounded by the '|' characters will
then be a unique identifier that can be referenced in the `modifiers`
property which will then allow for replacing that text with some other text,
changing the font of the text, changing the touchability of the text and/or
replacing the text with an embedded equation.

If a string is surrounded by '|' characters but not defined in `modifiers`
then that string will have the formmating of the `accent` property applied
to it.

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">text</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a> | <a href="../interfaces/FigureCollections_Text.OBJ_TextLineDefinition.html" class="tsd-signature-type">OBJ_TextLineDefinition</a>> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>array of
line strings - single string is single line only.</p></div></li>
<li><span><span class="tsd-kind-parameter">modifiers</span>: <span class="tsd-signature-type"><a href="../types/FigurePrimitives_FigurePrimitiveTypes2D.OBJ_TextModifiersDefinition.html" class="tsd-signature-type">OBJ_TextModifiersDefinition</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>modifier definitions</p></div></li>
<li><span><span class="tsd-kind-parameter">font</span>: <span class="tsd-signature-type"><a href="../interfaces/types.OBJ_Font.html" class="tsd-signature-type">OBJ_Font</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>Default font to use in lines</p></div></li>
<li><span><span class="tsd-kind-parameter">defaultTextTouchBorder</span>: <span class="tsd-signature-type"><a href="../types/g2.TypeParsableBuffer.html" class="tsd-signature-type">TypeParsableBuffer</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>default buffer for
<code>touch</code> property in {@link OBJ_TextModifiersDefinition}</p></div></li>
<li><span><span class="tsd-kind-parameter">elements</span>: <span class="tsd-signature-type"><a href="../interfaces/Equation_Equation.EQN_EquationElements.html" class="tsd-signature-type">EQN_EquationElements</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>equation elements to use within
the equation phrases defined in <code>modifiers</code></p></div></li>
<li><span><span class="tsd-kind-parameter">justify</span>: <span class="tsd-signature-type">'left' | 'right' | 'center | undefined</span> <span class="tsd-signature-symbol">= left</span></span><div class="tsd-comment tsd-typography"><p>justification of lines</p></div></li>
<li><span><span class="tsd-kind-parameter">lineSpace</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= font.size * 0.5</span></span><div class="tsd-comment tsd-typography"><p>Space between ascent of each line with
descent of previous line</p></div></li>
<li><span><span class="tsd-kind-parameter">baselineSpace</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= undefined</span></span><div class="tsd-comment tsd-typography"><p>Space between baselines of lines. This
will override <code>lineSpace</code> for all lines including individual line settings</p></div></li>
<li><span><span class="tsd-kind-parameter">xAlign</span>: <span class="tsd-signature-type">'left' | 'right' | 'center' | undefined</span> <span class="tsd-signature-symbol">= left</span></span><div class="tsd-comment tsd-typography"><p>horizontal alignment of
lines with <code>position</code></p></div></li>
<li><span><span class="tsd-kind-parameter">yAlign</span>: <span class="tsd-signature-type">'bottom' | 'baseline' | 'middle' | 'top' | undefined</span> <span class="tsd-signature-symbol">= baseline</span></span><div class="tsd-comment tsd-typography"><p>vertical
alignment of lines with <code>position</code></p></div></li>
<li><span><span class="tsd-kind-parameter">border</span>: <span class="tsd-signature-type"><a href="../types/g2.TypeParsableBuffer.html" class="tsd-signature-type">TypeParsableBuffer</a> | <a href="../types/g2.TypeParsableBorder.html" class="tsd-signature-type">TypeParsableBorder</a> | 'children' | 'rect' | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= 'draw'</span></span><div class="tsd-comment tsd-typography"><p>border used for keeping shape within limits</p></div></li>
<li><span><span class="tsd-kind-parameter">touchBorder</span>: <span class="tsd-signature-type"><a href="../types/g2.TypeParsableBuffer.html" class="tsd-signature-type">TypeParsableBuffer</a> | <a href="../types/g2.TypeParsableBorder.html" class="tsd-signature-type">TypeParsableBorder</a> | 'border' | 'children' | 'rect' | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>border used for determining shape was touched. <code>number</code> and <code>'rect'</code> use
the the points in <code>'buffer'</code> to calculate the bounding rects (<code>'buffer'</code>).</p></div></li>
<li><span><span class="tsd-kind-parameter">accent</span>: <span class="tsd-signature-type"><a href="../interfaces/types.OBJ_Font.html" class="tsd-signature-type">OBJ_Font</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>default modifier for accented text without a
specific modification. By default accented text will be italic.</p></div></li>
</ul>

#### Multi-line center justified

```js
figure.add({
  make: 'ftext',
  text: ['First line', 'Second line'],
  justify: 'center',
});
```

#### Modifiers

```js
figure.add({
  make: 'ftext',
  text: ['|First| |line|', 'Second |line2|'],
  modifiers: {
    First: { font: { underline: 'true', color: [0, 0.7, 0.7, 1] } },
    line: { font: { color: [0, 0, 1, 1] } },
    line2: { text: 'line', font: { color: [0, 0.7, 0, 1], style: 'italic' } },
  },
});
```

#### Interactive words in formatted text

```js
figure.add({
  make: 'ftext',
  text: 'Touch |here| or |here2|',
  modifiers: {
    here: {
      font: { underline: true, color: [0, 0, 1, 1] },
      touch: 0.1,
      onClick: () => console.log('here 1'),
    },
    here2: {
      text: 'here',
      font: { underline: true, color: [0, 0.8, 0, 1] },
      touch: 0.1,
      onClick: () => console.log('here 2'),
    },
  },
  xAlign: 'center',
});
```

#### Embedded equation (inline form definition)

```js
figure.add({
  make: 'ftext',
  text: '|root2| is irrational',
  modifiers: {
    root2: { eqn: { root: ['radical', '2'] } },
  },
  xAlign: 'center',
});
```

#### Embedded equation with defined, touchable elements

```js
figure.add({
  name: 't',
  make: 'ftext',
  text: ['A fraction is |fraction|', 'Touch it!'],
  modifiers: {
    fraction: {
      eqn: {
        scale: [{ frac: ['num', 'v', 'den'] }, 0.7],
      },
      offset: [0, 0.2],
      touch: 0.1,
      onClick: () => figure.get('t').pulse({
        elements: ['num', 'den', 'v'],
        centerOn: 'v',
        xAlign: 'left',
        scale: 1.3,
      }),
      space: 0.3,
    },
  },
  elements: {
    num: 'numerator',
    den: { text: 'denominator', color: [0, 0, 1, 1], style: 'italic' },
    v: { symbol: 'vinculum' },
  },
  xAlign: 'center',
});
```

> To test examples, append them to the
<a href="#drawing-boilerplate">boilerplate</a>

// Accent a word
figure.add({
  make: 'ftext',
  text: 'Hello |World|',
});


---

## FontManager

Font manager can be used to query if fonts are available, and watch to see
when they load or time out.

Notifications - The notification manager property `notifications` will
publish the following events:
- `fontsLoaded`: published when all fonts have been loaded or timed out
- `fontLoaded`: published after each font is loaded
- `fontUnavailable`: published when loading a font has timed out

---

## OBJ_Font

Font definition object.

A font can be defined either from a subset of the properties used to define
[fonts in css](https://developer.mozilla.org/en-US/docs/Web/CSS/font), or
by using a texture altas of the various glyphs to be used.

A font can be rendered into a [2D canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
or into the WebGL canvas using the texture atlas.

A texture atlas can either be supplied as an image, or generated
automatically by FigureOne based on css font definitions.

Choosing how to render text depends on the application.

If text size is to be animated through a large scale range, then rendering
on the 2D canvas is advantageous as it can scale text to any size without a
loss of sharpness. The main disadvantage of the 2D canvas is the fact that
it's a different HTML canvas element to the WebGL canvas. Thus all text on
the 2D canvas will always be above (default) or below the WebGl canvas
independent of when it is drawn. This means text will always be above or
below shapes. regenerated each time the size changes by some threshold.

Conversely, drawing text on the WebGL canvas provides control on which
shapes can hide text and vise versa. The disadvantage is that text is drawn
from a texture atlas of bitmapped fonts. This means as text is progressively
scaled up or down, the the text will look more pixelated or blurry. For many
scalings (like common scalings in an equation), this will likely not be a
problem. But for large changes in animated scale, it will be better to use
the 2D canvas. Scaling also needs to be considered if the WebGL canvas is
expected to be resized. On a desktop browser, a canvas element can be
resized a lot, and so if using the WebGL atlas, it may need to be

Note, the choice of where to render text can be made for each text element.
Therefore it is possible to have some text rendered to the 2D canvas, and
other text rendered to the WebGL canvas in the same figure.

A texture atlas can either be supplied as an image, or generated
automatically by FigureOne based on the css font definitions.

CSS font definition:
  * `family` - the typeface family from which it comes (e.g. 'Helvetica',
    'Times New Roman')
  * `style` - its slope (e.g. 'italic')
  * `weight` - its thickness (e.g. 'bold')
  * `size`

Atlas font definition:
  * `src` - the image or url to the image - if not supplied then atlas will
     be generated automatically
  * `map` - description of location and size of each glyph in the atlas
  * `glyphs` - the available glyphs in the atlas. To reduce the size of the
     atlas, include only the glyphs that are being used, or use a preset
     alphabet (like 'latin', or 'math')
  * `atlasColor` - if `true` then the rendered glyph color will be the same
    as that in the texture. If `false`, then only the transparency channel of
    the texture will be used and color will be defined by the FigureElement
    drawing the text.
  * `atlasSize` - if defined, and if the glyphs are generated automatically
    then the glyphs will be created with a pixel size that is `atlasSize`
    portion of the canvas height. If undefined, then the glyphs will be
    created with a pixel size that is the ratio of the font size to the
    scene height portion of the canvas height.

A font can also have a number of modifying properties:
  * `color` - fill or outline color of each glyph - not used if the texture
     atlas color is to be used
  * `underline`
  * `outline` - defines whether the font is filled, is an outline, or both

Fonts that are generated automatically rely on the client's browser to
measure the font's width. From this the ascent and descent of each glyph
is then estimated. Each glyph's width, ascent and descent is used to layout
the glyphs in regular text and equations, as well as determine the borders
and touch borders of FigureElements that draw the text.

However, this estimate for different font families is not always perfectly
accurate. If the estimate is not sufficient, then it can be modified by using
the following properties (where each property is a proportion of the width
of a character 'a'):
  * `maxAscent`: Maximum ascent of glyphs like "A" or "$"
  * `midAscent`: ascent of mid level glyphs like "a" and "g"
  * `descent`: descent of glyphs that do not noticeably go below the
     baseline (but often do a little) like "a" and "b"
  * `midDescent`: descent of glyphs that go a little below the baseline like
     "," and ";"
  * `maxDescent`: maximum descent of glyphs like "g" and "|"

Individual glyphs can also be modified (for atlas based fonts only) using
the `modifiers` property.

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">family</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a> | undefined</span> <span class="tsd-signature-symbol">= 'Times New Roman'</span></span><div class="tsd-comment tsd-typography"><p>The font family</p></div></li>
<li><span><span class="tsd-kind-parameter">style</span>: <span class="tsd-signature-type">'normal' | 'italic' | 'oblique' | undefined</span> <span class="tsd-signature-symbol">= 'normal'</span></span></li>
<li><span><span class="tsd-kind-parameter">weight</span>: <span class="tsd-signature-type"><a href="../types/types.TypeFontWeight.html" class="tsd-signature-type">TypeFontWeight</a> | undefined</span> <span class="tsd-signature-symbol">= 'normal'</span></span><div class="tsd-comment tsd-typography"><p>font weight</p></div></li>
<li><span><span class="tsd-kind-parameter">size</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= 0.2</span></span><div class="tsd-comment tsd-typography"><p>size of font in draw space</p></div></li>
<li><span><span class="tsd-kind-parameter">underline</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a> | <a href="../interfaces/types.OBJ_Underline.html" class="tsd-signature-type">OBJ_Underline</a> | undefined</span> <span class="tsd-signature-symbol">= false</span></span><div class="tsd-comment tsd-typography"><p><code>true</code> to include
an underline or use object to define its properties</p></div></li>
<li><span><span class="tsd-kind-parameter">color</span>: <span class="tsd-signature-type">[<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>, <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>] | undefined</span> <span class="tsd-signature-symbol">= [1, 0, 0, 1]</span></span><div class="tsd-comment tsd-typography"><p>Font color
[red, green, blue, alpha] between 0 and 1 -</p></div></li>
<li><span><span class="tsd-kind-parameter">outline</span>: <span class="tsd-signature-type"><a href="../interfaces/types.OBJ_Outline.html" class="tsd-signature-type">OBJ_Outline</a> | undefined</span> <span class="tsd-signature-symbol">= false</span></span><div class="tsd-comment tsd-typography"><p>options to draw the text in outline
instead of or in addition to a fill</p></div></li>
<li><span><span class="tsd-kind-parameter">descent</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= 0.8</span></span></li>
<li><span><span class="tsd-kind-parameter">maxDescent</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= 0.2</span></span></li>
<li><span><span class="tsd-kind-parameter">midDescent</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= 0.5</span></span></li>
<li><span><span class="tsd-kind-parameter">maxAscent</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= 0.95</span></span></li>
<li><span><span class="tsd-kind-parameter">midAscent</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= 1.4</span></span></li>
<li><span><span class="tsd-kind-parameter">modifiers</span>: <span class="tsd-signature-type"><a href="../interfaces/types.OBJ_GlyphModifiers.html" class="tsd-signature-type">OBJ_GlyphModifiers</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>individual glyph adjustments for
texture atlas fonts</p></div></li>
<li><span><span class="tsd-kind-parameter">src</span>: <span class="tsd-signature-type">Image | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>source image or url for atlas</p></div></li>
<li><span><span class="tsd-kind-parameter">map</span>: <span class="tsd-signature-type">OBJ_AtlasMap | undefined</span></span><div class="tsd-comment tsd-typography"><p>atlas definition needed if using a source
image or url</p></div></li>
<li><span><span class="tsd-kind-parameter">glyphs</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a> | 'greek' | 'math' | 'latin' | 'all' | 'common' | 'mathExt' | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String" class="tsd-signature-type">string</a>> | undefined</span></span><div class="tsd-comment tsd-typography"><p>glyphs included in the font - an array can be used combining glyphs together</p></div></li>
<li><span><span class="tsd-kind-parameter">atlasSize</span>: <span class="tsd-signature-type">null |<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | undefined</span> <span class="tsd-signature-symbol">= null</span></span><div class="tsd-comment tsd-typography"><p>font size of atlas as a proportion of
the WebGL canvas height. If this is null, then the atlas font size is
calculated from the font size, scene height and number of pixels in the
canvas height.</p></div></li>
<li><span><span class="tsd-kind-parameter">loadColor</span>: <span class="tsd-signature-type"><a href="../types/types.TypeColor.html" class="tsd-signature-type">TypeColor</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p>color of temporary texture while actual
texture is loading</p></div></li>
<li><span><span class="tsd-kind-parameter">atlasColor</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a> | undefined</span></span><div class="tsd-comment tsd-typography"><p><code>true</code> to use the color of the glyphs in
the atlas. <code>false</code> will just use the opacity and color the glyphs from the
FigureElement drawing them</p></div></li>
<li><span><span class="tsd-kind-parameter">render</span>: <span class="tsd-signature-type">'gl' | '2d' | 'html' | undefined</span></span><div class="tsd-comment tsd-typography"><p>render the associated text to
either the WebGL canvas, the 2D canvas, or the HTML canvas.</p></div></li>
</ul>

#### Full font definition

```js
const font = new FigureFont({
  family: 'Helvetica',
  style: 'italic',
  weight: 'bold',
  color: [1, 1, 0, 1],
  opacity: 1,
});
```

#### Define style only, remaining properties are defaults

```js
const font = new FigureFont({
  style: 'italic',
});
```

---

