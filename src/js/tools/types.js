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

/* eslint-disable max-len */
/**
 * Font definition object.
 *
 * Text is drawn in a [Context2D canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) and so `family`, `style` and `weight` are any valid [options](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font).
 *
 * `size` is the draw space size of the font.
 *
 * Width, descent and ascent of text is estimated, and there are times,
 * especially with non-standard fonts, that these estimates need ajustment.
 *
 * Most browsers only support a width measurement of text, and while this is
 * often good enough, there are times when it is not accurate (some fonts are
 * not accurate, sometimes the width of italics is inaccurate, width of
 * narrower letters is reported as thicker letters). Therefore, use the `width`
 * property to include a scaling factor that can reduce these errors in cases
 * where they arise.
 *
 * Many browsers don't yet support measurement of heights of text, and so
 * ascents and descents are calculated from measuring the width of an 'a'
 * character and then using scaling factors.
 *
 * `maxAscent` is the scaling factor for letters that rise above an 'a', like
 * capital letters, lower case letters like 'd' and 'l', and punctuation like
 * '|', brackets and apostrophes. Note, some fonts have slightly different
 * heights for these different letters, but it is generally pretty close.
 *
 * `midAscent` is for lower case letters like 'a', 'g', 'p'.
 *
 * `descent` is for letters that generally do not go much below the baseline
 * like 'a', 'A', 't'.
 *
 * `midDescent` is for punctuation that drops below the baseline a bit like
 * commas.
 *
 * `maxDescent` is for letters and punctuation that drops the furthest below
 * the baseline like 'g', '|', and brackets.
 *
 * @property {string} [family] The font family (`Times New Roman`)
 * @property {`normal` | `italic`} [style] (`normal`)
 * @property {number} [size] size of font in draw space (`0.2`)
 * @property {'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'} [weight]
 * font weight (`200`)
 * @property {boolean | number | [number, number]} [underline] `true` to include
 * an underline. Use `number` to define the descent of the bottom edge of the
 * underline to the baseline and [`number`, `number`] to define the descent and
 * width of the underline (`false`)
 * @property {[number, number, number, number]} [color] Font color
 * [red, green, blue, alpha] between 0 and 1 - (`[1, 0, 0, 1]`)
 * @property {number} [opacity] opacity multiplier (final opacity will be
 * `opacity` * `color` alpha) [`1`]
 * @property {number} [width] width multiplier for text when measured with
 * canvas2D.context.measureText (`1`)
 * @property {number} [descent] (`0.8`)
 * @property {number} [maxDescent] (`0.2`)
 * @property {number} [midDescent] (`0.5`)
 * @property {number} [maxAscent] (`0.95`)
 * @property {number} [midAscent] (`1.4`)
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
  style?: 'normal' | 'italic',
  size?: number,
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  color?: TypeColor | null,
  underline?: boolean | number | [number, number],
  opacity?: number,
  width?: number,
  descent?: number,
  maxDescent?: number,
  midDescent?: number,
  maxAscent?: number,
  midAscent?: number,
};

export type OBJ_Font_Fixed = {
  family: string,
  style: 'normal' | 'italic',
  size: number,
  weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
  color: TypeColor | null,
  underline: boolean | number | [number, number],
  opacity: number,
  width: number,
  descent: number,
  maxDescent: number,
  midDescent: number,
  maxAscent: number,
  midAscent: number,
};

const doNothing = 1;
export default doNothing;
