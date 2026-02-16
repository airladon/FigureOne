// import Figure from '../Figure';
import {
  Transform,
  // getPoint, getTransform,
} from '../../tools/g2';
import type { OBJ_Line3Arrow } from '../../tools/d3/line3';
import { joinObjects } from '../../tools/tools';
import {
  FigureElementCollection, FigureElementPrimitive,
} from '../Element';
import type {
  OBJ_Collection,
} from '../FigurePrimitives/FigurePrimitiveTypes';
import type {
  TypeColor,
} from '../../tools/types';
import type FigureCollections from './FigureCollections';

/* eslint-disable max-len */
/**
 * {@link CollectionsAxis3} options object that extends {@link OBJ_Collection}
 * options object (without `parent`).
 *
 * Each option can either be singular and applied to all axes, or in a 3 element
 * tuple where the first, second and third elements apply to the x, y, and z
 * axes respectively.
 *
 * To not create an axis, use a width of exactly 0.
 *
 *
 * @property {number | [number, number, number]} [width] width of axis
 * @property {number | [number, number, number]} [start] start value of axis
 * (`0`)
 * @property {number | [number, number, number]} [length] length of axis
 * @property {number | [number, number, number]} [sides] number of sides in
 * cross section of axis (`10`)
 * @property {number | [number, number, number]} [lines] `true` if to draw as
 * lines instead of a solid (`false`)
 * @property {OBJ_Line3Arrow | boolean | [OBJ_Line3Arrow | boolean, OBJ_Line3Arrow | boolean, OBJ_Line3Arrow | boolean]} [arrow] arrow options
 * for axes
 * @property {TypeColor | [TypeColor, TypeColor, TypeColor]} [color]
 * axes color - default is x: red, y: green, z: blue.
 *
 * @extends OBJ_Collection
 *
 */
export type COL_Axis3 = {
  width?: number | [number, number, number];
  length?: number | [number, number, number];
  start?: number | [number, number, number];
  sides?: number | [number, number, number];
  lines?: boolean | [boolean, boolean, boolean];
  arrow?: OBJ_Line3Arrow | boolean | [OBJ_Line3Arrow | boolean, OBJ_Line3Arrow | boolean, OBJ_Line3Arrow | boolean];
  color?: TypeColor | [TypeColor, TypeColor, TypeColor];
} & OBJ_Collection;
/* eslint-enable max-len */

/*
....###....##.....##.####..######...#######.
...##.##....##...##...##..##....##.##.....##
..##...##....##.##....##..##..............##
.##.....##....###.....##...######...#######.
.#########...##.##....##........##........##
.##.....##..##...##...##..##....##.##.....##
.##.....##.##.....##.####..######...#######.
*/
/* eslint-disable max-len */
/**
 * {@link FigureElementCollection} representing x, y, z axes.
 *
 * ![](./apiassets/axis3.png)
 *
 * This object creates an x, y, and z axes.
 *
 * The axes can be created uniformly, or customized individually.
 *
 * See {@link COL_Axis3} for setup options.
 *
 * To test examples below, append them to the
 * <a href="#shapes3d-boilerplate">boilerplate</a>
 *
 * @example
 * // Create positive x, y, and z axes
 * figure.add(
 *   {
 *     make: 'collections.axis3',
 *     arrow: true,
 *     length: 0.5,
 *   },
 * );
 *
 * @example
 * // Create full x, y, and z axes with arrows
 * figure.add(
 *   {
 *     make: 'collections.axis3',
 *     arrow: { ends: 'all' },
 *     start: -0.5,
 *     length: 1,
 *   },
 * );
 *
 * @example
 * // Customize each axis
 * figure.add(
 *   {
 *     make: 'collections.axis3',
 *     arrow: [{ ends: 'end' }, false, { ends: 'all', width: 0.02 }],
 *     width: 0.02,
 *     start: [0, 0, -0.5],
 *     length: [0.5, 0.5, 1],
 *   },
 * );
 *
 * @example
 * // Lines axes all the same color
 * figure.add(
 *   {
 *     make: 'collections.axis3',
 *     arrow: { ends: 'all' },
 *     start: -0.5,
 *     length: 1,
 *     lines: true,
 *     color: [1, 0, 0, 1],
 *   },
 * );
 */
/* eslint-enable max-len */
class CollectionsAxis3 extends FigureElementCollection {
  _x: FigureElementPrimitive | null;
  _y: FigureElementPrimitive | null;
  _z: FigureElementPrimitive | null;

  x: Record<string, any>;

  y: Record<string, any>;

  z: Record<string, any>;

  /**
   * @hideconstructor
   */
  constructor(
    collections: FigureCollections,
    optionsIn: COL_Axis3,
  ) {
    const defaultOptions = {
      width: collections.primitives.defaultLength / 50,
      length: collections.primitives.defaultLength / 2,
      start: 0,
      color: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]],
      sides: 10,
      transform: new Transform().scale(1, 1).rotate(0).translate(0, 0),
    };
    const options = joinObjects<any>({}, defaultOptions, optionsIn);
    if (options.fill == null && options.line == null) {
      options.fill = collections.primitives.defaultColor.slice();
    }
    super(joinObjects<any>({}, options, { color: [1, 0, 0, 1] }));
    this.collections = collections;

    this.x = {
      width: Array.isArray(options.width) ? options.width[0] : options.width,
      length: Array.isArray(options.length) ? options.length[0] : options.length,
      color: Array.isArray(options.color[0]) ? options.color[0] : options.color,
      start: Array.isArray(options.start) ? options.start[0] : options.start,
      arrow: Array.isArray(options.arrow) ? options.arrow[0] : options.arrow,
      sides: Array.isArray(options.sides) ? options.sides[0] : options.sides,
      lines: Array.isArray(options.lines) ? options.lines[0] : options.lines,
    };
    this.y = {
      width: Array.isArray(options.width) ? options.width[1] : options.width,
      length: Array.isArray(options.length) ? options.length[1] : options.length,
      color: Array.isArray(options.color[1]) ? options.color[1] : options.color,
      start: Array.isArray(options.start) ? options.start[1] : options.start,
      arrow: Array.isArray(options.arrow) ? options.arrow[1] : options.arrow,
      sides: Array.isArray(options.sides) ? options.sides[1] : options.sides,
      lines: Array.isArray(options.lines) ? options.lines[1] : options.lines,
    };
    this.z = {
      width: Array.isArray(options.width) ? options.width[2] : options.width,
      length: Array.isArray(options.length) ? options.length[2] : options.length,
      color: Array.isArray(options.color[2]) ? options.color[2] : options.color,
      start: Array.isArray(options.start) ? options.start[2] : options.start,
      arrow: Array.isArray(options.arrow) ? options.arrow[2] : options.arrow,
      sides: Array.isArray(options.sides) ? options.sides[2] : options.sides,
      lines: Array.isArray(options.lines) ? options.lines[2] : options.lines,
    };
    this._x = null;
    this._y = null;
    this._z = null;

    // this.stateProperties = ['width', 'height', 'xAlign', 'yAlign'];
    this.addAxis('x');
    this.addAxis('y');
    this.addAxis('z');
  }

  addAxis(axisName: 'x' | 'y' | 'z') {
    const a = (this as any)[`${axisName}`];
    if (a.width === 0) {
      return;
    }
    let p1;
    let p2;
    if (axisName === 'x') {
      p1 = [a.start, 0, 0];
      p2 = [a.start + a.length, 0, 0];
    }
    if (axisName === 'y') {
      p1 = [0, a.start, 0];
      p2 = [0, a.start + a.length, 0];
    }
    if (axisName === 'z') {
      p1 = [0, 0, a.start];
      p2 = [0, 0, a.start + a.length];
    }

    const axis = this.collections.primitives.line3({
      width: a.width,
      arrow: a.arrow,
      p1,
      p2,
      color: a.color.slice(),
      sides: a.sides,
      lines: a.lines,
    });
    this.add(axisName, axis);
  }
}

export default CollectionsAxis3;
