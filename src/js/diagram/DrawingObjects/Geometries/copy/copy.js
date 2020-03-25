
// @flow
/* eslint-disable camelcase */
import {
  Transform, Point, polarToRect, getBoundingRect, getPoints,
} from '../../../../tools/g2';

import type { TypeParsablePoint } from '../../../../tools/g2';

import {
  joinObjects,
} from '../../../../tools/tools';

type CPY_Generic = {
  start?: number | string,
  end?: number | string,
  original?: boolean,
};

type CPY_Linear = {
  num?: number,
  angle?: number,
  axis?: 'x' | 'y',
  step?: number,
} & CPY_Generic;

type CPY_Angle = {
  num?: number,
  step?: number,
  center?: number,
} & CPY_Generic;

// type CPY_Location = TypeParsablePoint | Array<TypeParsablePoint> | {
//   to?: TypeParsablePoint | Array<TypeParsablePoint>,
// } & CPY_Generic;

type CPY_Offset = TypeParsablePoint | Array<TypeParsablePoint> | {
  to?: TypeParsablePoint | Array<TypeParsablePoint>,
} & CPY_Generic;

type CPY_Transform = Transform | Array<Transform> | {
  to?: Transform | Array<Transform>,
} & CPY_Generic;

type CPY_Step = { linear: CPY_Linear }
              | { angle: CPY_Angle }
              | { offset: CPY_Offset }
              // | { location: CPY_Location }
              | { transform: CPY_Transform };

type CPY_Steps = Array<CPY_Step>;


function linearCopy(
  points: Array<Point>,
  copyIn: TypeCopyLinear,
) {
  const bounds = getBoundingRect(points);
  const defaultCopy = {
    num: 1,
    angle: 0,
  };
  const copy = joinObjects({}, defaultCopy, copyIn);

  if (copy.axis != null && copy.axis === 'y') {
    copy.angle = Math.PI / 2;
  }
  if (copy.axis != null && copy.axis === 'x') {
    copy.angle = 0;
  }


  if (copy.angle !== 0 && copy.step == null) {
    copy.step = Math.abs(bounds.height / Math.sin(copy.angle));
  }

  const out = [];
  for (let i = 0; i < copy.num + 1; i += 1) {
    const step = copy.step * i;
    points.forEach((p) => {
      out.push(p.add(polarToRect(step, copy.angle)));
    });
  }
  return out;
}

function angleCopy(
  points: Array<Point>,
  copyIn: TypeCopyAngle,
) {
  const defaultCopy = {
    numAngle: 1,
    step: Math.PI / 4,
    center: [0, 0],
    skip: 0,
  };

  const copy = joinObjects({}, defaultCopy, copyIn);
  copy.center = getPoint(copy.center);
  const out = [];
  const skipPoints = Math.floor(copy.skip ? points.length * copy.skip : 0);

  for (let i = 0; i < copy.numAngle + 1; i += 1) {
    const matrix = new Transform()
      .translate(-copy.center.x, -copy.center.y)
      .rotate(i * copy.step)
      .translate(copy.center.x, copy.center.y)
      .matrix();
    const startPoint = i === 0 ? 0 : skipPoints;
    for (let p = startPoint; p < points.length; p += 1) {
      out.push(points[p].transformBy(matrix));
    }
  }
  return out;
}

// Array<Transform> | Array<Point> | TypeCopyAngle
// | TypeCopyLinear | Point | Transform | TypeCopyOffset
// | TypeCopyTransform;
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
  points: Array<Point>,
  copy: CPY_Offset,
  marks: CPY_Marks,
) {
  const defaultOptions = {
    start: 0,
    end: 'end',
    original: true,
    to: [],
  };
  let options;
  if (copy instanceof Point
     || typeof copy === 'number'
     || copy.x != null || copy.y != null
     || Array.isArray(copy)
  ) {
    options = defaultOptions;
    options.to = copy;
  } else {
    options = joinObjects({}, defaultOptions, copy);
  }
  options.to = getPoints(options.to);
  const pointsToCopy = getPointsToCopy(points, options.start, options.end, marks);

  let out = [];
  if (options.original) {
    out = [...pointsToCopy];
  }
  for (let i = 0; i < options.to.length; i += 1) {
    out = [...out, ...pointsToCopy.map(p => p.add(options.to[i]))];
  }
  return out;
}

function copyLinear(
  points: Array<Point>,
  optionsIn: CPY_Linear,
  marks: CPY_Marks,
) {
  const defaultOptions = {
    start: 0,
    end: 'end',
    original: true,
    num: 1,
    angle: 0,
  };

  const options = joinObjects({}, defaultOptions, optionsIn);

  if (options.axis != null && options.axis === 'y') {
    options.angle = Math.PI / 2;
  }
  if (options.axis != null && options.axis === 'x') {
    options.angle = 0;
  }


  if (options.angle !== 0 && options.step == null) {
    const bounds = getBoundingRect(points);
    options.step = Math.abs(bounds.height / Math.sin(options.angle));
  }

  const pointsToCopy = getPointsToCopy(points, options.start, options.end, marks);

  let out = [];
  if (options.original) {
    out = [...pointsToCopy];
  }
  for (let i = 1; i < options.num + 1; i += 1) {
    const step = options.step * i;
    out = [...out, ...pointsToCopy.map(p => p.add(polarToRect(step, options.angle)))];
  }
  return out;
}

function copyStep(
  points: Array<Point>,
  copyStyle: 'linear' | 'offset' | 'arc' | 'angle' | 'transform',
  copy: CPY_Step,
  marks: CPY_Marks,
) {
  if (copyStyle === 'offset') {
    return copyOffset(points, copy, marks);
  }

  if (copyStyle === 'linear') {
    return copyLinear(points, copy, marks);
  }
  return points;
  // if (copy instanceof Point) {
  //   return [
  //     ...points.map(p => p._dup()),
  //     ...points.map(p => p.add(copy)),
  //   ];
  // }
  // if (copy instanceof Transform) {
  //   const matrix = copy.matrix();
  //   return [
  //     ...points.map(p => p._dup()),
  //     ...points.map(p => p.transformBy(matrix)),
  //   ];
  // }
  // if (Array.isArray(copy) && copy.length === 0) {
  //   return points.map(p => p._dup());
  // }
  // if ((Array.isArray(copy) && typeof copy[0] === 'number')
  //     || typeof copy === 'number') {
  //   return [
  //     ...points.map(p => p._dup()),
  //     ...points.map(p => p.add(getPoint(copy))),
  //   ];
  // }
  // if (Array.isArray(copy)) {
  //   const firstElement = copy[0];
  //   let out = [];
  //   out = points.map(p => p._dup());
  //   if (firstElement instanceof Point) {
  //     copy.forEach((copyPoint) => {
  //       out = [...out, ...points.map(p => p.add(copyPoint))];
  //     });
  //     return out;
  //   }
  //   if (firstElement instanceof Transform) {
  //     copy.forEach((copyTransform) => {
  //       const matrix = copyTransform.matrix();
  //       out = [...out, ...points.map(p => p.transformBy(matrix))];
  //     });
  //     return out;
  //   }
  //   if (Array.isArray(firstElement)) {
  //     copy.forEach((copyPoint) => {
  //       const cp = getPoint(copyPoint);
  //       out = [...out, ...points.map(p => p.add(cp))];
  //     });
  //     return out;
  //   }
  //   if (typeof firstElement === 'number') {
  //     copy.forEach((copyPoint) => {
  //       const cp = getPoint(copyPoint);
  //       out = [...out, ...points.map(p => p.add(cp))];
  //     });
  //     return out;
  //   }
  // }

  // if (!Array.isArray(copy) && copy.offset != null) {
  //   if (copy.offset instanceof Transform) {
  //     const matrix = copy.offset.matrix();
  //     return points.map(p => p.transformBy(matrix));
  //   }
  //   const offset = getPoint(copy.offset);
  //   return points.map(p => p.add(getPoint(offset)));
  // }

  // // if (!Array.isArray(copy) && copy.transform != null) {
  // //   const matrix = copy.transform.matrix();
  // //   return points.map(p => p.transformBy(matrix));
  // // }

  // if (!Array.isArray(copy) && copy.num != null) {
  //   return linearCopy(points, copy);
  // }

  // if (!Array.isArray(copy) && copy.numAngle != null) {
  //   return angleCopy(points, copy);
  // }
  // return points;
}

function copyPoints(
  points: Array<TypeParsablePoint>,
  chain: ?Array<CPY_Steps>,
) {
  const marks = {};
  let out = [];
  let nextPoints = getPoints(points);
  if (chain == null) {
    return nextPoints;
  }
  marks['0'] = 0;
  marks['1'] = points.length;

  chain.forEach((c, index) => {
    if (typeof c === 'string') {
      marks[c] = out.length;
    } else {
      const copyStyle = Object.keys(c)[0];
      out = copyStep(nextPoints, copyStyle, c[copyStyle], marks);
      nextPoints = out;
      marks[`${index + 1}`] = out.length;
    }
  });
  return out;
}

export {
  copyPoints,
  copyStep,
};