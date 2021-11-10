// @flow

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
 */
export type TypeColor = Array<number>;

/**
 * `'pixel' | 'gl' | 'figure' | 'local' | 'draw'`
 */
export type TypeCoordinateSpace = 'pixel' | 'gl' | 'figure' | 'local' | 'draw';

/**
  Curved Corner Definition
 */
export type OBJ_CurvedCorner = {
  radius?: number,
  sides?: number,
};

export type OBJ_Outline = {
  width?: number,
  fill?: boolean,
  color?: TypeColor,
}

export type OBJ_Underline = {
  width?: number,
  offset?: number,
  color?: TypeColor,
}

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
 *   * `glyphs` - the available glyphs in the atlas
 *   * `atlasColor` - if `true` then the rendered glyph color will be the same
 *     as that in the texture. If `false`, then only the transparency channel of
 *     the texture will be used and color will be defined by the FigureElement
 *     drawing the text.
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
 * the `modifiers` properties.
 *
 *
 * @property {string} [family] The font family (`'Times New Roman'`)
 * @property {'normal' | 'italic' | 'oblique'} [style] (`'normal'`)
 * @property {'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'} [weight]
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
 * @property {Image | string} [src] source image or url for atlas
 * @property {OBJ_AtlasMap} [map] atlas definition needed if using a source
 * image or url
 * @property {string | 'greek' | 'math' | 'latin' | 'all' | 'common' | 'mathExt'} [glyphs]
 * glyphs included in the font
 * @property {TypeColor} [loadColor] color of temporary texture while actual
 * texture is loading
 * @property {boolean} [atlasColor] `true` to use the color of the glyphs in
 * the atlas. `false` will just use the opacity and color the glyphs from the
 * FigureElement drawing them

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
  family?: string,
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  style?: 'normal' | 'italic' | 'oblique',
  size?: number,

  // Modifying properties
  underline?: boolean | OBJ_Underline,
  color?: TypeColor | null,
  outline?: boolean | OBJ_Outline,

  // Font measurements
  width?: number,
  descent?: number,
  maxDescent?: number,
  midDescent?: number,
  maxAscent?: number,
  midAscent?: number,

  // Atlas definition
  src?: Image | string,
  map?: OBJ_AtlasMap,
  glyphs?: string | 'greek' | 'math' | 'latin' | 'all' | 'common' | 'mathExt',
  loadColor?: TypeColor,
  atlasColor?: boolean,
};

export type OBJ_Font_Fixed = {
  family: string,
  style: 'normal' | 'italic',
  size: number,
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  color: TypeColor | null,
  underline: boolean | number | [number, number],
  // opacity: number,
  width: number,
  descent: number,
  maxDescent: number,
  midDescent: number,
  maxAscent: number,
  midAscent: number,
};

const doNothing = 1;
export default doNothing;
