
// @flow
/* eslint-disable camelcase */
import {
  Transform, Point, polarToRect, getBoundingRect, getPoints, getPoint,
} from '../../../tools/g2';

import type { TypeParsablePoint } from '../../../tools/g2';

import {
  joinObjects,
} from '../../../tools/tools';

/* eslint-disable max-len */
/**
 *
 * ![](./apiassets/copy.png)
 *
 * Copy Step options object
 *
 * A copy step defines how to copy existing points.
 *
 * An array of copy steps will cumulatively copy points from an original set of
 * points.
 *
 * So, if there are two copy steps then:
 * - the first step will copy the original points
 * - the second step will copy the original points and the first copy of the
 *   points
 *
 * For example, a grid of a shape can be made with two copy steps. The first
 * replicates the shape along the x axis, creating a line of shapes. The second
 * copy step then replicates the line of shapes in the y axis, creating a grid
 * of shapes.
 *
 * Each copy step appends its copied points onto an array of points that
 * started with the original points. By default, copy steps operate on all
 * points created in previous steps. However, the properties `start` and `end`
 * can be used to make the current step only operate on a subset of the points.
 *
 * `start` and `end` refer to the indexes of the copy steps where the original
 * points is at index 0, and the first copy step is at index 1. Copy step
 * arrays can also include *marker strings* which make defining `start` and
 * `end` more convient (see the third example below). These marker strings
 * can be used as `start` and `end` values. Marker strings are included
 * in the copy step indexing.
 *
 * There are two main ways to make a copy, either copy the points `to` a
 * location, or copy the points `along` a path.
 *
 * When using the `to` property, if a {@link Point} is defined
 * then the points will be copied to that point. If a {@link Transform} is
 * defined, then a copy of the points will be transformed by that transform. An
 * array of points and transforms can be defined to make multiple copies of the
 * points.
 *
 * When using the `along` property, the points are copied a number (`num`) of
 * times along a path with some `step`. The paths can be horiztonal (`'x'`),
 * vertical (`'y'`), at an angle (`number`) or through a `'rotation'` around
 * a `center` point.
 *
 * When copying along a line (`along` is `'x'`, `y'` or a `number`), then
 * `step` will be the distance offset along the line.
 *
 * When copying along a rotation (`along` is `'rotation'`), then `step` will be
 * the angular step in radians.
 *
 * Any step can use the `original` property - but it will only operate on the
 * last step that uses it. When `original` is `false`, then all points before
 * that copy step will not be included in the returned Point array.
 *
 * @property {TypeParsablePoint | TypeParsableTransform | Array<TypeParsablePoint | TypeParsableTransform>} [to] copy points to
 * a location or locations or transform a copy of the points
 * @property {'x' | 'y' | number | 'rotation' | 'moveOnly'} [along] copy points
 * along a linear path where `number` is a path at an angle in radians
 * @property {number} [num] the number of copies to make when copying `along` a
 * path
 * @property {number} [step] distance between copies if `along` is `'x'` or
 * `'y'` or a `number`, delta angle between copies if `along` is `'rotation'`
 * @property {TypeParsablePoint} [center] the center point about which to rotate
 * the copies when using `along` = `'rotation'`
 * @property {number | string} [start] copy step index or marker defining the
 * start of the points to copy
 * @property {number | string} [end] copy step index or marker defining the end
 * of the points to copy
 * @property {boolean} [original] `false` excludes all points before this step
 * in the final result (`true`)
 * @example
 * // Grid copy
 * figure.addElement({
 *   name: 'triGrid',
 *   method: 'polygon',
 *   options: {
 *     radius: 0.1,
 *     sides: 3,
 *     rotation: -Math.PI / 6,
 *     fill: 'tris',
 *     copy: [
 *       {
 *         along: 'x',
 *         num: 4,
 *         step: 0.3,
 *       },
 *       {
 *         along: 'y',
 *         num: 4,
 *         step: 0.3,
 *       },
 *     ],
 *   },
 * });
 *
 * @example
 * // Radial lines copy
 * figure.addElement({
 *   name: 'radialLines',
 *   method: 'generic',
 *   options: {
 *     points: [
 *       [-0.2, -0.1], [-0.2, 0.1], [0.2, 0.1],
 *       [-0.2, -0.1], [0.2, 0.1], [0.2, -0.1],
 *     ],
 *     copy: [
 *       {
 *         to: [[0.6, 0], [1.05, 0], [1.5, 0], [2.2, 0]],
 *       },
 *       {
 *         along: 'rotation',
 *         num: 5,
 *         step: Math.PI / 5,
 *         start: 1,              // only copy last step, not original points
 *       },
 *     ],
 *   },
 * });
 *
 * @example
 * // Ring copy (without original shape)
 * figure.addElement({
 *   name: 'halfRings',
 *   method: 'polygon',
 *   options: {
 *     radius: 0.1,
 *     sides: 20,
 *     fill: 'tris',
 *     copy: [
 *       'ring1',               // marker 1
 *       {
 *         to: [0.5, 0],
 *         original: false,     // don't include the original shape
 *       },
 *       {
 *         along: 'rotation',
 *         num: 7,
 *         step: Math.PI / 7,
 *         start: 'ring1',      // copy only from marker 1
 *       },
 *       'ring2',               // marker 2
 *       {
 *         to: [1, 0],
 *         start: 0,            // make a copy of the original shape only
 *         end: 1,
 *       },
 *       {
 *         along: 'rotation',
 *         num: 15,
 *         step: Math.PI / 15,
 *         start: 'ring2',      // copy points from Marker 2 only
 *       },
 *     ],
 *   },
 * });
 */
export type CPY_Step = {
  to?: Point | [number, number] | Transform
    | Array<Point | [number, number] | Transform> | Transform,
  along?: 'x' | 'y' | number | 'rotation' | 'moveOnly',
  num?: number,
  step?: number,
  center?: TypeParsablePoint,
  start?: number | string,
  end?: number | string,
  original?: boolean,
};
/* eslint-enable max-len */

export type CPY_Steps = Array<CPY_Step>;

type CPY_Marks = { [markName: string]: number };

function getPointsToCopy(
  points: Array<Point>,
  startIn: number | string,
  endIn: number | string,
  marks: CPY_Marks,
) {
  const out = [];
  const start = marks[`${startIn}`];
  let end;
  if (endIn === 'end') {
    end = points.length;
  } else {
    end = marks[`${endIn}`];
  }
  if (end == null) {
    end = points.length;
  }

  for (let i = start; i < end; i += 1) {
    out.push(points[i]._dup());
  }
  return out;
}

function copyOffset(
  pointsToCopy: Array<Point>,
  // initialPoints: Array<Point>,
  optionsIn: CPY_Step,
) {
  const defaultOptions = {
    to: [],
  };
  const options = joinObjects({}, defaultOptions, optionsIn);
  options.to = getPoints(options.to);

  let k = 0;
  const out = Array(options.to.length * pointsToCopy.length);
  for (let i = 0; i < options.to.length; i += 1) {
    for (let j = 0; j < pointsToCopy.length; j += 1) {
      out[k] = new Point(pointsToCopy[j].x + options.to[i].x, pointsToCopy[j].y + options.to[i].y);
      k += 1;
    }
  }
  return out;
}

// TODO Speedup like copyOFfset
function copyTransform(
  pointsToCopy: Array<Point>,
  // initialPoints: Array<Point>,
  optionsIn: CPY_Step,
) {
  const defaultOptions = {
    to: [],
  };
  const options = joinObjects({}, defaultOptions, optionsIn);
  if (options.to instanceof Transform
  ) {
    options.to = [optionsIn.to];
  }

  let out = [];
  for (let i = 0; i < options.to.length; i += 1) {
    // $FlowFixMe
    const matrix = options.to[i].matrix();
    out = [...out, ...pointsToCopy.map(p => p.transformBy((matrix)))];
  }
  return out;
}

// TODO Speedup like copyOFfset
function copyLinear(
  pointsToCopy: Array<Point>,
  // initialPoints: Array<Point>,
  optionsIn: CPY_Step,
) {
  if (optionsIn.along == null) {
    return [];
  }
  const defaultOptions = {
    num: 1,
  };
  let angle = 0;

  const options = joinObjects({}, defaultOptions, optionsIn);

  if (options.along === 'y') {
    angle = Math.PI / 2;
  } else if (options.along === 'x') {
    angle = 0;
  } else if (typeof options.along === 'number') {
    angle = options.along;
  }

  if (options.step == null) {
    const bounds = getBoundingRect(pointsToCopy);
    options.step = Math.abs(bounds.height / Math.sin(angle));
  }

  let out = [];
  for (let i = 1; i < options.num + 1; i += 1) {
    const step = options.step * i;
    out = [...out, ...pointsToCopy.map(p => p.add(polarToRect(step, angle)))];
  }
  return out;
}

// TODO Speedup like copyOFfset
function copyAngle(
  pointsToCopy: Array<Point>,
  // initialPoints: Array<Point>,
  optionsIn: CPY_Step,
) {
  const defaultOptions = {
    num: 1,
    step: Math.PI / 4,
    center: [0, 0],
  };

  const options = joinObjects({}, defaultOptions, optionsIn);
  options.center = getPoint(options.center);

  let out = [];
  const { center } = options;
  for (let i = 1; i < options.num + 1; i += 1) {
    const matrix = new Transform()
      .translate(-center.x, -center.y)
      .rotate(i * options.step)
      .translate(center.x, center.y)
      .matrix();
    out = [...out, ...pointsToCopy.map(p => p.transformBy(matrix))];
  }
  return out;
}

// function copyArc(
//   pointsToCopy: Array<Point>,
//   initialPoints: Array<Point>,
//   optionsIn: CPY_Arc,
// ) {
//   const defaultOptions = {
//     num: 1,
//     step: 0.1,
//     angleStep: Math.PI / 4,
//     // arcStep: 0.1,
//     startAngle: 0,
//     stopAngle: Math.PI * 2,
//     center: [0, 0],
//   };

//   const options = joinObjects({}, defaultOptions, optionsIn);
//   options.center = getPoint(options.center);

//   let out = initialPoints;
//   const { center } = options;
//   for (let i = 1; i < options.num + 1; i += 1) {
//     const matrix = new Transform()
//       .translate(-center.x, -center.y)
//       .rotate(i * options.step)
//       .translate(center.x, center.y)
//       .matrix();
//     out = [...out, ...pointsToCopy.map(p => p.transformBy(matrix))];
//   }
//   return out;
// }


function copyStep(
  points: Array<Point>,
  copyStyle: 'linear' | 'to' | 'rotation' | 'x' | 'y' | number,
  options: CPY_Step,
  // marks: CPY_Marks,
) {
  // const out = [];

  if (copyStyle === 'linear' || copyStyle === 'x' || copyStyle === 'y' || typeof copyStyle === 'number') {
    return copyLinear(points, options);
  }

  if (copyStyle === 'to') {
    if (options.to == null) {
      return points;
    }
    if (Array.isArray(options.to) && options.to.length === 0) {
      return points;
    }

    if (options.to instanceof Transform) {
      return copyTransform(points, options);
    }
    if (Array.isArray(options.to) && options.to[0] instanceof Transform) {
      return copyTransform(points, options);
    }
    return copyOffset(points, options);
  }

  if (copyStyle === 'rotation') {
    return copyAngle(points, options);
  }
  return points;
}

function copyPoints(
  points: Array<TypeParsablePoint> | Array<Point>,
  chain: ?CPY_Step | CPY_Steps,
) {
  const marks = {};
  // let out = [];
  let startIndex = 0;
  // let all = [];
  // $FlowFixMe
  let out = getPoints(points);
  if (chain == null) {
    return out;
  }
  let chainToUse = [];
  if (!Array.isArray(chain)) {
    chainToUse = [chain];
  } else {
    chainToUse = chain;
  }
  marks['0'] = 0;
  // marks['1'] = points.length;

  chainToUse.forEach((c, index) => {
    marks[`${index + 1}`] = out.length;
    if (typeof c === 'string') {
      marks[c] = out.length;
    } else {
      const defaultOptions = {
        start: startIndex,
        end: 'end',
        original: true,
      };
      const options = joinObjects({}, defaultOptions, c);
      let copyStyle = 'to';
      if (options.along != null) {
        copyStyle = options.along;
      }

      const pointsToCopy = getPointsToCopy(out, options.start, options.end, marks);

      if (options.original === false) {
        startIndex = out.length;
      }
      out = [...out, ...copyStep(pointsToCopy, copyStyle, options)];
    }
  });

  return [...out.slice(startIndex)];
}

export {
  copyPoints,
  copyStep,
};
