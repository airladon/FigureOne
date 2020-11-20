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
  Curved Corner Definition
 */
export type OBJ_CurvedCorner = {
  radius?: number,
  sides?: number,
};

const doNothing = 1;
export default doNothing;
