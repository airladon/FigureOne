// @flow
/* eslint-disable prefer-destructuring */
import { dotProduct } from '../geometry/common';
import { Point, getPoint } from '../geometry/Point';
import type { TypeParsablePoint } from '../geometry/Point';
import { getMatrix } from '../geometry/Transform';
import { pointsToNumbers } from '../geometry/tools';
import { joinObjects } from '../tools';
import type { Type3DMatrix } from '../m3';
import type { TypeParsableTransform } from '../geometry/Transform';
import { threePointAngle } from '../geometry/angle';

// From https://blackpawn.com/texts/pointinpoly/
function isPointInTriangle(A: Point, B: Point, C: Point, p: Point) {
  const v0 = [C.x - A.x, C.y - A.y, C.z - A.z];
  const v1 = [B.x - A.x, B.y - A.y, B.z - A.z];
  const v2 = [p.x - A.x, p.y - A.y, p.z - A.z];

  const dot00 = dotProduct(v0, v0);
  const dot01 = dotProduct(v0, v1);
  const dot02 = dotProduct(v0, v2);
  const dot11 = dotProduct(v1, v1);
  const dot12 = dotProduct(v1, v2);

  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  return (u >= 0) && (v >= 0) && (u + v < 1);
}

// from https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf
function triangulation(pointsIn: Array<Point>) {
  let node = {
    p: pointsIn[0],
    next: null,
    prev: null,
    angle: 0,
  };
  let firstNode = node;
  let remainingPoints = pointsIn.length;

  for (let i = 1; i < pointsIn.length; i += 1) {
    node.next = {
      p: pointsIn[i],
      next: null,
      prev: node,
      angle: 0,
    };
    node = node.next;
  }
  node.next = firstNode;
  firstNode.prev = node;

  const reflex = [];
  const earTips = [];
  const convex = [];
  for (let i = 0; i < remainingPoints; i += 1) {
    node.angle = threePointAngle(node.prev.p, node.p, node.next.p);
    if (node.angle <= Math.PI) {
      convex.push(node);
    } else {
      reflex.push(node);
    }
  }

  const isEar = (n) => {
    for (let i = 0; i < reflex.length; i += 1) {
      if (!isPointInTriangle(n.prev.p, n.p, n.next, reflex[i].p)) {
        return false;
      }
    }
    return true;
  };

  for (let i = 0; i < convex.length; i += 1) {
    if (isEar(convex[i])) {
      earTips.push(convex);
    }
  };

}