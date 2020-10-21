// @flow
import {
  Point, Line, distance,
} from '../../../../tools/g2';
import {
  roundNum,
} from '../../../../tools/math';


function makeDashDefinition(dashes: Array<number>) {
  const cum = [];
  const cycleLength = dashes.reduce((p, sum) => {
    cum.push(p + sum);
    return p + sum;
  }, 0);
  return {
    definition: dashes,
    sum: cycleLength,
    cum,
  };
}

function getDashElementAndRemainder(
  dash: {
    definition: Array<number>,
    cum: Array<number>,
    sum: number,
  },
  offset: number,
  precision: number = 8,
) {
  let singleCycleOffset;
  if (offset > dash.sum) {
    singleCycleOffset = roundNum(offset % dash.sum, precision);
  } else {
    singleCycleOffset = offset;
  }

  for (let i = 0; i < dash.definition.length; i += 1) {
    if (singleCycleOffset < dash.cum[i]) {
      return [i, roundNum(dash.cum[i] - singleCycleOffset, precision)];
    }
    if (singleCycleOffset === dash.cum[i]) {
      if (i + 1 < dash.definition.length) {
        return [i + 1, roundNum(dash.cum[i + 1] - singleCycleOffset, precision)];
      }
      return [0, roundNum(dash.cum[0], precision)];
    }
  }
  return [0, 0];
}

function makeDashes(
  dash: {
    definition: Array<number>,
    cum: Array<number>,
    sum: number,
  },
  p1: Point,
  p2: Point,
  offset: number,
  precision: number = 8,
) {
  const points = [];
  let cumDistance = 0;
  // eslint-disable-next-line prefer-const
  let [index, remainder] = getDashElementAndRemainder(dash, offset, precision);
  let onLine = true;
  const line12 = new Line(p1, p2);
  const totLength = roundNum(line12.length(), precision);
  let dashLength = roundNum(remainder, precision);
  let lastIndex = index;
  while (cumDistance < totLength) {
    const isOnLine = index % 2 === 0;
    onLine = isOnLine;
    if (isOnLine) {
      const q1 = line12.pointAtPercent(cumDistance / totLength);
      let q2;
      if (roundNum(cumDistance + dashLength, precision) <= totLength) {
        q2 = line12.pointAtPercent((cumDistance + dashLength) / totLength);
        cumDistance += dashLength;
      } else {
        q2 = p2._dup();
        cumDistance += dashLength;
      }
      points.push([q1, q2]);
    } else {
      cumDistance += dashLength;
    }
    cumDistance = roundNum(cumDistance, precision);
    lastIndex = index;
    index = (index + 1) % dash.definition.length;
    dashLength = roundNum(dash.definition[index], precision);
  }

  return {
    points,
    continues: cumDistance > totLength && lastIndex % 2 === 0,
    onLine,
  };
}

function lineToDash(
  points: Array<Point>,
  dash: Array<number>,
  close: boolean = false,
  offset: number = 0,
  precision: number = 8,
) {
  let out = [];
  const dd = makeDashDefinition(dash);
  let cumLength = offset;
  let lastContinue = false;
  let onLine = true;
  const processLine = (p1, p2) => {
    const dashes = makeDashes(dd, p1, p2, cumLength, precision);
    ({ onLine } = dashes);
    const dashLines = dashes.points;
    const dashContinues = dashes.continues;
    if (lastContinue && dashLines[0] != null) {
      out[out.length - 1] = [...out[out.length - 1], ...dashLines[0].slice(1)];
      out = [...out, ...dashLines.slice(1)];
    } else {
      out = [...out, ...dashLines];
    }
    lastContinue = dashContinues;
    cumLength = roundNum(cumLength + distance(p1, p2), precision);
  };

  for (let i = 0; i < points.length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    processLine(p1, p2);
  }
  if (close) {
    const p1 = points[points.length - 1];
    const p2 = points[0];
    processLine(p1, p2);
    const [startIndex] = getDashElementAndRemainder(dd, offset);
    // const startIsOnLine = startIndex % 2 === 0;
    if (lastContinue && startIndex % 2 === 0 && out.length > 1) {
      out[0] = [...out[out.length - 1], ...out[0].slice(1)];
    }
  }

  return [out, onLine];
}

export {
  getDashElementAndRemainder,
  makeDashDefinition,
  makeDashes,
  lineToDash,
};
