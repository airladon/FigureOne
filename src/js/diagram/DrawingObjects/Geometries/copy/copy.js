
// @flow
/* eslint-disable camelcase */
import {
  Transform, Point, polarToRect, getBoundingRect, getPoints, getPoint,
} from '../../../../tools/g2';

import type { TypeParsablePoint } from '../../../../tools/g2';

import {
  joinObjects,
} from '../../../../tools/tools';

export type CPY_Step = {
  start?: number | string,
  end?: number | string,
  original?: boolean,
  along?: 'x' | 'y' | number | 'rotation' | 'moveOnly',
  to?: Point | [number, number] | Transform
    | Array<Point | [number, number] | Transform> | Transform,
  num?: number,
  step?: number,
  center?: TypeParsablePoint,
};

type CPY_Steps = Array<CPY_Step>;

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

  let out = [];
  for (let i = 0; i < options.to.length; i += 1) {
    out = [...out, ...pointsToCopy.map(p => p.add(options.to[i]))];
  }
  return out;
}

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
  marks['1'] = points.length;

  chainToUse.forEach((c, index) => {
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
      marks[`${index + 2}`] = out.length;
    }
  });

  return [...out.slice(startIndex)];
}

export {
  copyPoints,
  copyStep,
};
