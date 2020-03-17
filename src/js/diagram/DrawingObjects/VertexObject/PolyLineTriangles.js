import {
  Point, Line,
} from '../../../tools/g2';


function simpleIntersect(p1, p2, q1, q2) {
  const lineP = new Line(p1, p2);
  const lineQ = new Line(q1, q2);
  return lineP.intersectsWith(lineQ).intersect;
}

// Generate a thick line assuming gl.TRIANGLES where corners are sharp.
// Input:
//   * coords: an array of points that will define the center of the line
function polylineTriangles(coords, close, width) {
  const points = [];
  const innerBorder = [];
  const outerBorder = [];
  const line1Pairs = [];
  const line2Pairs = [];
  const halfWidth = width / 2;

  let p;
  let q;
  if (close) {
    coords.push(coords[0]);
  }

  // got through the points that define the center of the line, and generate
  // offset lines on either side of them (named Line1 and Line2).
  for (let i = 1; i < coords.length; i += 1) {
    p = coords[i - 1];    // center line point 1
    q = coords[i];        // center line point 2
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    const offset1 = new Point(
      halfWidth * Math.cos(angle + Math.PI / 2),
      halfWidth * Math.sin(angle + Math.PI / 2),
    );
    const offset2 = new Point(
      halfWidth * Math.cos(angle - Math.PI / 2),
      halfWidth * Math.sin(angle - Math.PI / 2),
    );
    line1Pairs.push([p.add(offset1), q.add(offset1)]);    // Offset line 1
    line2Pairs.push([p.add(offset2), q.add(offset2)]);    // Offset line 2
  }

  // If the line closes on itself, then find the intersection point of
  // the first and last offset lines.
  // p and q will represent the first points of offset lines 1 and 2.
  if (close) {
    // intersection point of first and last offset 1 lines
    p = simpleIntersect(
      line1Pairs[0][0],
      line1Pairs[0][1],
      line1Pairs[line1Pairs.length - 1][0],
      line1Pairs[line1Pairs.length - 1][1],
    );
    // intersection point of first and last offset 2 lines
    q = simpleIntersect(
      line2Pairs[0][0],
      line2Pairs[0][1],
      line2Pairs[line1Pairs.length - 1][0],
      line2Pairs[line2Pairs.length - 1][1],
    );
  } else {
    // if not closing on itself, then the first point is simply the first
    // point of the offset lines.
    p = line1Pairs[0][0];   // eslint-disable-line prefer-destructuring
    q = line2Pairs[0][0];   // eslint-disable-line prefer-destructuring
  }
  // The line effectively has two borders (named an inside and outside border)
  // but the inner border isn't necessarily the INSIDE border, it is just a
  // name.
  // p and q are the first points of the borders.
  innerBorder.push(p._dup());
  outerBorder.push(q._dup());

  // Go through all offset lines, calculate their intersection points
  // and from them calculate the triangle and border points.
  for (let i = 1; i < line1Pairs.length; i += 1) {
    // First two points of the Triangle 1 are the two ending points
    // of the last line segment
    points.push(p.x);
    points.push(p.y);
    points.push(q.x);
    points.push(q.y);

    // Next points are the intersection between the first line and the second line
    p = simpleIntersect(
      line1Pairs[i - 1][0],
      line1Pairs[i - 1][1],
      line1Pairs[i][0],
      line1Pairs[i][1],
    );
    q = simpleIntersect(
      line2Pairs[i - 1][0],
      line2Pairs[i - 1][1],
      line2Pairs[i][0],
      line2Pairs[i][1],
    );

    // Push the next points to the border
    innerBorder.push(p._dup());
    outerBorder.push(q._dup());

    // Finish triangle 1
    points.push(q.x);
    points.push(q.y);

    // Make triangle 2
    points.push(points[points.length - 6]);
    points.push(points[points.length - 6]);
    points.push(q.x);
    points.push(q.y);
    points.push(p.x);
    points.push(p.y);
  }

  // Calculate the last end points
  let endp;
  let endq;

  // In not closing the polyline, the end points are just the last offset
  // line points
  if (!close) {
    endp = line1Pairs[line1Pairs.length - 1][1]; // eslint-disable-line prefer-destructuring
    endq = line2Pairs[line2Pairs.length - 1][1]; // eslint-disable-line prefer-destructuring
  // If closing the polyline, then the end points are the start points
  } else {
    endp = new Point(points[0], points[1]);
    endq = new Point(points[2], points[3]);
  }
  // Close out the last two triangles
  points.push(p.x);             // Last two points of last line segment
  points.push(p.y);
  points.push(q.x);
  points.push(q.y);
  points.push(endq.x);
  points.push(endq.y);
  points.push(p.x);             // Last triangle
  points.push(p.y);
  points.push(endq.x);
  points.push(endq.y);
  points.push(endp.x);
  points.push(endp.y);
  innerBorder.push(endp._dup());
  outerBorder.push(endq._dup());

  // If closing, then remove the last duplicate coord as it was added by this
  // function
  if (close) {
    coords.pop();
  }

  // Form the border array
  let border = [];

  // If the poly line is closed, only one of the offset lines is the outside
  // border. If open, then both are the border.
  if (close) {
    if (innerBorder[0].isInPolygon(outerBorder)) {
      border = outerBorder;
    } else {
      border = innerBorder;
    }
  } else {
    border.push(innerBorder[0]);
    for (let i = 0; i < outerBorder.length; i += 1) {
      border.push(outerBorder[i]);
    }
    for (let i = innerBorder.length - 1; i >= 0; i -= 1) {
      border.push(innerBorder[i]);
    }
  }
  return {
    points,
    border,
  };
}

export default polylineTriangles;
