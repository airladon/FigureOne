// @flow
import { Point, getPoint } from './Point';
import { Transform } from './Transform';
import { Line } from './Line';
import { joinObjects } from '../tools';

function isLeft(p0: Point, p1: Point, p2: Point) {
  return (
    (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y)
  );
}

export type OBJ_Polygon = {
  sides?: number,
  radius?: number,
  center?: number,
  rotation?: TypeRotationDefinition,
  close?: boolean,
  rotationOffset?: number,
  direction?: 1 | -1,
};

function polygon(options: OBJ_Polygon) {
  const o = joinObjects({
    sides: 4,
    radius: 1,
    center: [0, 0, 0],
    rotation: 0,
    close: true,
    rotationOffset: 0,
    direction: 1,
  }, options);
  o.center = getPoint(o.center);
  const {
    sides, radius, center, rotation, close, rotationOffset, direction,
  } = o;

  const dAngle = Math.PI * 2 / sides;
  const matrix = new Transform().rotate(rotation).matrix();
  const points = [];
  for (let i = 0; i < sides + close ? 1 : 0; i += 1) {
    points.push(new Point(
      radius * Math.cos(direction * (dAngle * i + rotationOffset)),
      radius * Math.sin(direction * (dAngle * i + rotationOffset)),
    ).transformBy(matrix).add(center));
  }
  return points;
}

function isPointInPolygon(point: Point, polygon: Array<Point>) {
  let windingNumber = 0;
  let n = polygon.length - 1;
  const v = polygon.slice();
  const p = point;
  let popLastPoint = false;
  // polygon needs to have the last vertex the same as the first vertex
  if (v[0].isNotEqualTo(v[n])) {
    v.push(v[0]);
    popLastPoint = true;
    n += 1;
  }
  for (let i = 0; i < n; i += 1) {
    if (v[i].y <= p.y) {
      if (v[i + 1].y > p.y) {                // an upward crossing
        if (isLeft(v[i], v[i + 1], p) > 0) { // P left of  edge
          windingNumber += 1;                // have  a valid up intersect
        }
      }
    } else if (v[i + 1].y <= p.y) {           // start y > P.y (no test needed)
      // a downward crossing
      if (isLeft(v[i], v[i + 1], p) < 0) {    // P right of  edge
        windingNumber -= 1;      // have  a valid down intersect
      }
    }
  }
  if (popLastPoint) {
    v.pop();
  }
  if (windingNumber === 0) {
    return false;
  }
  return true;
}

function isPointOnPolygon(point: Point, polygon: Array<Point>) {
  let popLastPoint = false;
  const p = point;
  let n = polygon.length - 1;   // Number of sides
  const v = polygon.slice();

  // polygon needs to have the last vertex the same as the first vertex
  if (v[0].isNotEqualTo(v[n])) {
    v.push(v[0]);
    popLastPoint = true;
    n += 1;
  }

  for (let i = 0; i < n; i += 1) {
    const l = new Line(v[i], v[i + 1]);
    if (l.hasPointOn(p)) {
      if (popLastPoint) {
        v.pop();
      }
      return true;
    }
  }
  if (isPointInPolygon(p, polygon)) {
    if (popLastPoint) {
      v.pop();
    }
    return true;
  }

  if (popLastPoint) {
    v.pop();
  }
  return false;
}

export {
  isPointInPolygon,
  isPointOnPolygon,
  polygon,
};
