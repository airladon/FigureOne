import {
  Point, Line, distance,
} from '../g2';


function makeDashDefinition(dashes: Array<number>) {
  const cum = [];
  const cycleLength = dashes.reduce((p, sum) => {
    cum.push(p + sum)
    return p +sum;
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
 ) {
  let singleCycleOffset;
  if (offset > dash.sum) {
    singleCycleOffset = offset % dash.sum;
  } else {
    singleCycleOffset = offset;
  }

  for (let i = 0; i < dash.definition.length; i += 1) {
    if (singleCycleOffset <= dash.cum[i]) {
      return [i, dash.cum[i] - singleCycleOffset];
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
) {
  const points = [];
  let cumDistance = 0;
  let [index, remainder] = getDashElementAndRemainder(
    dash, offset
  );

  const line12 = new Line(p1, p2);
  const totLength = line12.length();
  let dashLength = remainder;
  let lastIndex = index;
  while (cumDistance < totLength) {
    let isOnLine = index % 2 === 0 ? true : false;
    if (isOnLine) {
      const q1 = line12.pointAtPercent(cumDistance / totLength);
      let q2;
      if (cumDistance + dashLength <= totLength) {
        q2 = line12.pointAtPercent((cumDistance + dashLength) / totLength),
        cumDistance += dashLength;
      } else {
        q2 = p2._dup();
        cumDistance += dashLength;
      }
      points.push([q1, q2]);
    } else {
      cumDistance += dashLength;
    }
    lastIndex = index;
    index = (index + 1) % dash.definition.length;
    dashLength = dash.definition[index];
  }

  return {
    points,
    continues: cumDistance > totLength && lastIndex % 2 === 0 ? true : false,
  };
}

function lineToDash(
  points: Array<Points>,
  dash: Array<number>,
  close: boolean = false,
  offset: number = 0,
) {
  let out = [];
  const dd = makeDashDefinition(dash);
  let cumLength = offset;
  let lastContinue = false;

  const processLine = (p1, p2) => {
    const dashes = makeDashes(dd, p1, p2, cumLength);
    const dashLines = dashes.points;
    const dashContinues = dashes.continues;
    if (lastContinue && dashLines[0] != null) {
      out[out.length - 1] = [...out[out.length - 1], ...dashLines[0].slice(1)];
      out = [...out, ...dashLines.slice(1)];
    } else {
      out = [...out, ...dashLines];
    }
    lastContinue = dashContinues;
    cumLength += distance(p1, p2);
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    processLine(p1, p2);
  }
  if (close) {
    const p1 = points[points.length - 1];
    const p2 = points[0];
    processLine(p1, p2);
    const [startIndex, ] = getDashElementAndRemainder(dd, offset);
    const startIsOnLine = startIndex % 2 === 0 ? true : false;
    if (lastContinue && startIndex % 2 === 0 && out.length > 1) {
      out[0] = [...out[out.length-1], ...out[0].slice(1)];
    }
  }

  return out;
}

export {
  getDashElementAndRemainder,
  makeDashDefinition,
  makeDashes,
  lineToDash,
};
