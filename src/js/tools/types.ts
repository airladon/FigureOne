/**
 * Atlas map type - defined locally to avoid dependency on unmigrated figure layer.
 * Mirrors OBJ_AtlasMap from '../figure/webgl/Atlas'.
 */
type OBJ_AtlasMap = {
  [char: string]: {
    width: number;
    ascent: number;
    descent: number;
    offsetX: number;
    offsetY: number;
  };
};

/**
 * Defines whether a line is solid or dashed.
 *
 * `Array<number>`
 *
 * Leave empty for solid line.
 *
 * Use array of numbers for a dashed line where indexes 0, 2, 4... are line
 * lengths and indexes 1, 3, 5... are gap lengths. If line is longer than
 * cumulative length of line and gap lengths, then pattern will repeat.
 *
 * If array length is odd, then the first element will be the offset of the
 * dash pattern - the length where the dash pattern starts. In this case index
 * 0 is the offset, indexes 1, 3, 5... are the dash lengths and indexes 2, 4,
 * 6... are the gap lengths.
 *
 * For example [0.1, 0.01, 0.02, 0.01] produces 0.1 length dash, then a 0.01
 * length gap, then a 0.02 length dash, then a 0.01 length gap. This pattern
 * will repeat for the length of the line.
 * @group Misc Shapes
 */
export type TypeDash = Array<number>;

/**
 * Defines a color
 *
 * `[number, number, number, number]`
 *
 * Color is defined as an RGBA array with values between 0 and 1. The alpha
 * channel defines the transparency or opacity of the color where
 * 1 is fully opaque and 0 is fully transparent.
 * @group Misc Shapes
 */
export type TypeColor = Array<number>;

/**
 * `'pixel' | 'gl' | 'figure' | 'local' | 'draw'`
 * @group Misc Figure Element
 */
export type TypeCoordinateSpace = 'pixel' | 'gl' | 'figure' | 'local' | 'draw';

/**
  Curved Corner Definition
 * @interface
 * @group Misc Shapes
 */
export type OBJ_CurvedCorner = {
  radius?: number;
  sides?: number;
};

/**
 * Outline options.
 *
 * By default the glyphs will not be filled, with the outline the same color
 * as the font.
 *
 * Glyphs can be filled with the `fill` property, but both fill and outline
 * will be the same color unless the `color` property is used to override the
 * outline's color.
 *
 * @property {number} [width] line width
 * @property {boolean} [fill] include fill (`false`)
 * @property {TypeColor} [color] outline color that overrides the font color -
 * use if including a fill
 * @interface
 * @group Misc Text
 */
export type OBJ_Outline = {
  width?: number;
  fill?: boolean;
  color?: TypeColor;
};

/**
 * Underline options.
 *
 * An underline is defined as a horizontal line with some `width` with a bottom
 * edge `descent` below the text baseline.
 *
 * If `descent` is negative, the line can be moved into a strike through
 * position, or placed above the text.
 *
 * @property {number} [width]
 * @property {number} [descent]
 * @property {TypeColor} [color]
 * @interface
 * @group Misc Text
 */
export type OBJ_Underline = {
  width?: number;
  descent?: number;
  color?: TypeColor;
};

/**
 * Texture atlas font individual glyph ascent, descent and width modifiers.
 *
 * @property {w} [number] width
 * @property {d} [number] descent
 * @property {a} [number] ascent
 * @interface
 * @group Misc Text
 */
export type OBJ_GlyphModifiers = {
  w?: number;
  d?: number;
  a?: number;
};

/* eslint-disable max-len */
/**
 * Font weight definition.
 * `'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'`
 * @group Misc Text
 */
export type TypeFontWeight = 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
/* eslint-enable max-len */

/* eslint-disable max-len */
/**
 * Font definition object.
 *
 * A font can be defined either from a subset of the properties used to define
 * [fonts in css](https://developer.mozilla.org/en-US/docs/Web/CSS/font), or
 * by using a texture altas of the various glyphs to be used.
 *
 * A font can be rendered into a [2D canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 * or into the WebGL canvas using the texture atlas.
 *
 * A texture atlas can either be supplied as an image, or generated
 * automatically by FigureOne based on css font definitions.
 *
 * Choosing how to render text depends on the application.
 *
 * If text size is to be animated through a large scale range, then rendering
 * on the 2D canvas is advantageous as it can scale text to any size without a
 * loss of sharpness. The main disadvantage of the 2D canvas is the fact that
 * it's a different HTML canvas element to the WebGL canvas. Thus all text on
 * the 2D canvas will always be above (default) or below the WebGl canvas
 * independent of when it is drawn. This means text will always be above or
 * below shapes. regenerated each time the size changes by some threshold.
 *
 * Conversely, drawing text on the WebGL canvas provides control on which
 * shapes can hide text and vise versa. The disadvantage is that text is drawn
 * from a texture atlas of bitmapped fonts. This means as text is progressively
 * scaled up or down, the the text will look more pixelated or blurry. For many
 * scalings (like common scalings in an equation), this will likely not be a
 * problem. But for large changes in animated scale, it will be better to use
 * the 2D canvas. Scaling also needs to be considered if the WebGL canvas is
 * expected to be resized. On a desktop browser, a canvas element can be
 * resized a lot, and so if using the WebGL atlas, it may need to be
 *
 * Note, the choice of where to render text can be made for each text element.
 * Therefore it is possible to have some text rendered to the 2D canvas, and
 * other text rendered to the WebGL canvas in the same figure.
 *
 * A texture atlas can either be supplied as an image, or generated
 * automatically by FigureOne based on the css font definitions.
 *
 * CSS font definition:
 *   * `family` - the typeface family from which it comes (e.g. 'Helvetica',
 *     'Times New Roman')
 *   * `style` - its slope (e.g. 'italic')
 *   * `weight` - its thickness (e.g. 'bold')
 *   * `size`
 *
 * Atlas font definition:
 *   * `src` - the image or url to the image - if not supplied then atlas will
 *      be generated automatically
 *   * `map` - description of location and size of each glyph in the atlas
 *   * `glyphs` - the available glyphs in the atlas. To reduce the size of the
 *      atlas, include only the glyphs that are being used, or use a preset
 *      alphabet (like 'latin', or 'math')
 *   * `atlasColor` - if `true` then the rendered glyph color will be the same
 *     as that in the texture. If `false`, then only the transparency channel of
 *     the texture will be used and color will be defined by the FigureElement
 *     drawing the text.
 *   * `atlasSize` - if defined, and if the glyphs are generated automatically
 *     then the glyphs will be created with a pixel size that is `atlasSize`
 *     portion of the canvas height. If undefined, then the glyphs will be
 *     created with a pixel size that is the ratio of the font size to the
 *     scene height portion of the canvas height.
 *
 * A font can also have a number of modifying properties:
 *   * `color` - fill or outline color of each glyph - not used if the texture
 *      atlas color is to be used
 *   * `underline`
 *   * `outline` - defines whether the font is filled, is an outline, or both
 *
 * Fonts that are generated automatically rely on the client's browser to
 * measure the font's width. From this the ascent and descent of each glyph
 * is then estimated. Each glyph's width, ascent and descent is used to layout
 * the glyphs in regular text and equations, as well as determine the borders
 * and touch borders of FigureElements that draw the text.
 *
 * However, this estimate for different font families is not always perfectly
 * accurate. If the estimate is not sufficient, then it can be modified by using
 * the following properties (where each property is a proportion of the width
 * of a character 'a'):
 *   * `maxAscent`: Maximum ascent of glyphs like "A" or "$"
 *   * `midAscent`: ascent of mid level glyphs like "a" and "g"
 *   * `descent`: descent of glyphs that do not noticeably go below the
 *      baseline (but often do a little) like "a" and "b"
 *   * `midDescent`: descent of glyphs that go a little below the baseline like
 *      "," and ";"
 *   * `maxDescent`: maximum descent of glyphs like "g" and "|"
 *
 * Individual glyphs can also be modified (for atlas based fonts only) using
 * the `modifiers` property.
 *
 *
 * @property {string} [family] The font family (`'Times New Roman'`)
 * @property {'normal' | 'italic' | 'oblique'} [style] (`'normal'`)
 * @property {TypeFontWeight} [weight]
 * font weight (`'normal'`)
 * @property {number} [size] size of font in draw space (`0.2`)
 * @property {boolean | OBJ_Underline} [underline] `true` to include
 * an underline or use object to define its properties (`false`)
 * @property {[number, number, number, number]} [color] Font color
 * [red, green, blue, alpha] between 0 and 1 - (`[1, 0, 0, 1]`)
 * @property {OBJ_Outline} [outline] options to draw the text in outline
 * instead of or in addition to a fill (`false`)
 * @property {number} [descent] (`0.8`)
 * @property {number} [maxDescent] (`0.2`)
 * @property {number} [midDescent] (`0.5`)
 * @property {number} [maxAscent] (`0.95`)
 * @property {number} [midAscent] (`1.4`)
 * @property {OBJ_GlyphModifiers} [modifiers] individual glyph adjustments for
 * texture atlas fonts
 * @property {Image | string} [src] source image or url for atlas
 * @property {OBJ_AtlasMap} [map] atlas definition needed if using a source
 * image or url
 * @property {string | 'greek' | 'math' | 'latin' | 'all' | 'common' | 'mathExt' | Array<string>} [glyphs]
 * glyphs included in the font - an array can be used combining glyphs together
 * @property {null |number} [atlasSize] font size of atlas as a proportion of
 * the WebGL canvas height. If this is null, then the atlas font size is
 * calculated from the font size, scene height and number of pixels in the
 * canvas height. (`null`)
 * @property {TypeColor} [loadColor] color of temporary texture while actual
 * texture is loading
 * @property {boolean} [atlasColor] `true` to use the color of the glyphs in
 * the atlas. `false` will just use the opacity and color the glyphs from the
 * FigureElement drawing them
 * @property {'gl' | '2d' | 'html'} [render] render the associated text to
 * either the WebGL canvas, the 2D canvas, or the HTML canvas.

 * @interface
 * @group Text
 * @example
 * // Full font definition
 * const font = new FigureFont({
 *   family: 'Helvetica',
 *   style: 'italic',
 *   weight: 'bold',
 *   color: [1, 1, 0, 1],
 *   opacity: 1,
 * });
 * @example
 * // Define style only, remaining properties are defaults
 * const font = new FigureFont({
 *   style: 'italic',
 * });
 */
export type OBJ_Font = {
  family?: string;
  weight?: TypeFontWeight;
  style?: 'normal' | 'italic' | 'oblique';
  size?: number;

  // Modifying properties
  underline?: boolean | OBJ_Underline;
  color?: TypeColor | null;
  outline?: boolean | OBJ_Outline;

  // Font measurements
  descent?: number;
  maxDescent?: number;
  midDescent?: number;
  maxAscent?: number;
  midAscent?: number;
  modifiers?: OBJ_GlyphModifiers;

  // Atlas definition
  src?: HTMLImageElement | string;
  map?: OBJ_AtlasMap;
  glyphs?: string | 'greek' | 'math' | 'latin' | 'all' | 'common' | 'mathExt';
  loadColor?: TypeColor;
  atlasColor?: boolean;
  atlasSize?: number | null;

  timeout?: number;

  render?: 'gl' | '2d' | 'html';
};

export type OBJ_Font_Fixed = {
  family: string;
  style: 'normal' | 'italic';
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color: TypeColor | null;
  underline: boolean | number | [number, number];
  // opacity: number;
  width: number;
  descent: number;
  maxDescent: number;
  midDescent: number;
  maxAscent: number;
  midAscent: number;
};

const doNothing = 1;
export default doNothing;
