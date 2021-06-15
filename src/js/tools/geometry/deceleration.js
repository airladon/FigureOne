// @flow
import { Point } from './Point';
import { round } from '../math';
import { Transform, transformValueToArray } from './Transform';
import { polarToRect } from './coordinates';
import { clipAngle } from './angle';
import {
  RectBounds, RangeBounds, LineBounds, Bounds, TransformBounds,
} from './Bounds';
import type { TypeTransformBounds, TypeTransformBoundsDefinition } from './Bounds';
import type { TypeTransformValue, TransformDefinition } from './Transform';

// type TypeTransformDeceleration = Array<number>;
// type TypeTransformZeroThreshold = Array<number>;
// type TypeTransformBounce = Array<number>;


function deceleratePoint(
  positionIn: Point,
  velocityIn: Point,
  decelerationIn: number,
  deltaTimeIn: number | null = null,
  boundsIn: ?Bounds = null,  // ?(Rect | Line) = null,
  bounceLossIn: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
): {
  velocity: Point,
  duration: null | number,
  position: Point,
} {
  let bounds;
  if (boundsIn instanceof RangeBounds) {
    bounds = new RectBounds({
      left: boundsIn.boundary.min,
      right: boundsIn.boundary.max,
      bottom: boundsIn.boundary.min,
      top: boundsIn.boundary.max,
    });
  } else {
    bounds = boundsIn;
  }
  if (round(decelerationIn, precision) === 0) {
    if (bounceLossIn === 0 || bounds == null || !bounds.isDefined()) {
      if (deltaTimeIn == null) {
        return {
          velocity: velocityIn,
          position: positionIn,
          duration: null,
        };
      }
    }
  }
  // clip velocity to the dimension of interest
  let velocity = velocityIn;    // $FlowFixMe
  if (bounds != null && bounds.clipVelocity != null) {  // $FlowFixMe
    velocity = bounds.clipVelocity(velocityIn);
  }
  // const velocity = velocityIn;

  let stopFlag = false;
  if (deltaTimeIn == null) {
    stopFlag = true;
  }

  // Get the mag and angle of the velocity and check if under the zero threshold
  const { mag, angle } = velocity.toPolar();
  if (mag <= zeroVelocityThreshold) {
    return {
      velocity: new Point(0, 0),
      position: positionIn,
      duration: 0,
    };
  }

  // Clip position in the bounds
  let position = positionIn._dup();
  if (bounds != null) {
    position = bounds.clip(positionIn);
  }

  // Initial Velocity
  const v0 = mag;
  // Total change in velocity to go to zero threshold
  const deltaV = Math.abs(v0) - zeroVelocityThreshold;

  let deltaTime = deltaTimeIn;

  const deceleration = Math.max(decelerationIn, 0.0000001);
  if (deltaTime == null || deltaTime > Math.abs(deltaV / deceleration)) {
    deltaTime = Math.abs(deltaV / deceleration);
  }

  // Calculate distance traveeled over time and so find the new Position
  const distanceTravelled = v0 * deltaTime - 0.5 * deceleration * (deltaTime ** 2);
  const newPosition = polarToRect(distanceTravelled, angle).add(position);

  // If the new position is within the bounds, then can return the result.
  if (bounds == null || bounds.contains(newPosition)) {
    if (stopFlag) {
      return {
        duration: deltaTime,
        position: newPosition,
        velocity: new Point(0, 0),
      };
    }
    let v1 = v0 - deceleration * deltaTime;
    if (round(v1, precision) <= round(zeroVelocityThreshold, precision)) {
      v1 = 0;
    }
    return {
      position: newPosition,
      velocity: polarToRect(v1, angle),
      duration: deltaTime,
    };
  }

  // if we got here, the new position is out of bounds
  const bounceScaler = 1 - bounceLossIn;
  const result = bounds.intersect(position, clipAngle(angle, '0to360'));

  // if newPosition is not contained within bounds, but the intersect distance
  // is larger than the distance travelled in deltaTime, then there is likely a
  // rounding error...
  if (result.distance != null && result.distance > distanceTravelled) {
    throw new Error('Error in calculating intersect');
  }

  let intersectPoint;
  if (typeof result.intersect === 'number') {
    intersectPoint = new Point(result.intersect, 0);
  } else if (result.intersect == null) {
    return {
      position: newPosition,
      velocity: new Point(0, 0),
      duration: deltaTime,
    };
  } else {
    intersectPoint = result.intersect;
  }
  // const intersectPoint = result.position;
  const distanceToBound = result.distance;
  const reflectionAngle = result.reflection;

  // Calculate the time to the intersect point
  const acc = -v0 / Math.abs(v0) * deceleration;
  const s = distanceToBound;
  const b = v0;
  const a = 0.5 * acc;
  const c = -s;
  const t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);

  // If there is no bounce (all energy is lost) then return the result
  if (bounceLossIn === 1) {
    return {
      velocity: new Point(0, 0),
      position: intersectPoint,
      duration: t,
    };
  }

  const velocityAtIntersect = v0 + acc * t; // (s - 0.5 * a * (t ** 2)) / t;
  const bounceVelocity = velocityAtIntersect * bounceScaler;
  const rectBounceVelocity = new Point(
    bounceVelocity * Math.cos(reflectionAngle),
    bounceVelocity * Math.sin(reflectionAngle),
  );

  if (stopFlag) {
    const newStop = deceleratePoint(
      intersectPoint, rectBounceVelocity, deceleration, deltaTimeIn,
      bounds, bounceLossIn, zeroVelocityThreshold, precision,
    );
    if (newStop.duration == null) {
      return {
        duration: null,
        position: newStop.position,
        velocity: new Point(0, 0),
      };
    }
    return {
      duration: t + newStop.duration,
      position: newStop.position,
      velocity: new Point(0, 0),
    };
  }
  return deceleratePoint(
    intersectPoint, rectBounceVelocity, deceleration, deltaTime - t, bounds,
    bounceLossIn, zeroVelocityThreshold, precision,
  );
}

function decelerateValue(
  value: number,
  velocity: number,
  deceleration: number,
  deltaTime: number | null = null,
  boundsIn: ?RangeBounds = null,
  bounceLoss: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
) {
  let bounds = boundsIn;
  if (round(deceleration, precision) === 0) {
    if (
      bounceLoss === 0
      || boundsIn == null
      || (boundsIn != null && !boundsIn.isDefined())
    ) {
      if (deltaTime == null) {
        return {
          velocity,
          value,
          duration: null,
        };
      }
    }
  }
  if (boundsIn != null) {
    bounds = new LineBounds({
      p1: [boundsIn.boundary.min != null ? boundsIn.boundary.min : 0, 0],
      p2: [boundsIn.boundary.max != null ? boundsIn.boundary.max : 0, 0],
    });
  }
  const result = deceleratePoint(
    new Point(value, 0),
    new Point(velocity, 0),
    deceleration,
    deltaTime,
    bounds,
    bounceLoss,
    zeroVelocityThreshold,
    precision,
  );

  return {
    duration: result.duration,
    value: result.position.x,
    velocity: result.velocity.x,
  };
}

function decelerateIndependantPoint(
  value: Point,
  velocity: Point,
  deceleration: number,
  deltaTime: number | null = null,
  boundsIn: ?(RectBounds | RangeBounds) = null,
  bounceLoss: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
) {
  let xBounds = null;
  let yBounds = null;
  let zBounds = null;
  if (boundsIn != null && boundsIn instanceof RectBounds) {
    xBounds = new RangeBounds({
      min: boundsIn.boundary.left, max: boundsIn.boundary.right,
    });
    yBounds = new RangeBounds({
      min: boundsIn.boundary.bottom, max: boundsIn.boundary.top,
    });
  }
  if (boundsIn != null && boundsIn instanceof RangeBounds) {
    xBounds = boundsIn;
    yBounds = boundsIn;
    zBounds = boundsIn;
  }

  const xResult = decelerateValue(
    value.x, velocity.x, deceleration, deltaTime,
    xBounds, bounceLoss, zeroVelocityThreshold, precision,
  );
  const yResult = decelerateValue(
    value.y, velocity.y, deceleration, deltaTime,
    yBounds, bounceLoss, zeroVelocityThreshold, precision,
  );
  const zResult = decelerateValue(
    value.z, velocity.z, deceleration, deltaTime,
    zBounds, bounceLoss, zeroVelocityThreshold, precision,
  );

  if (xResult.duration == null || yResult.duration == null || zResult.duration == null) {
    return {
      duration: null,
      point: new Point(xResult.value, yResult.value, zResult.value),
      velocity: new Point(xResult.velocity, yResult.velocity, zResult.velocity),
    };
  }

  return {
    duration: Math.max(xResult.duration, yResult.duration, zResult.duration),
    point: new Point(xResult.value, yResult.value, zResult.value),
    velocity: new Point(xResult.velocity, yResult.velocity, zResult.velocity),
  };
}

function decelerateTransform(
  transform: Transform,
  velocity: Transform,
  decelerationIn: TypeTransformValue,
  deltaTime: number | null,
  boundsIn: TypeTransformBounds | TypeTransformBoundsDefinition | 'none',
  bounceLossIn: TypeTransformValue,
  zeroVelocityThresholdIn: TypeTransformValue,
  precision: number = 8,
): { velocity: Transform, transform: Transform, duration: null | number } {
  const deceleration = transformValueToArray(decelerationIn, transform);
  const bounceLoss = transformValueToArray(bounceLossIn, transform);
  const zeroVelocityThreshold = transformValueToArray(zeroVelocityThresholdIn, transform);
  let bounds;
  if (boundsIn instanceof TransformBounds) {
    bounds = boundsIn;
  } else if (boundsIn === 'none') {
    bounds = new TransformBounds(transform);
  } else {
    bounds = new TransformBounds(transform, boundsIn);
  }
  let duration = 0;
  const newDef: TransformDefinition = [];
  const newVDef: TransformDefinition = [];

  for (let i = 0; i < transform.def.length; i += 1) {
    const transformation = transform.def[i];
    let result = { duration: 0 };
    let newTransformation;
    let newVTransformation;
    if (transformation[0] === 't') {
      result = deceleratePoint( // $FlowFixMe
        new Point(transformation[1], transformation[2], transformation[3]),
        new Point(velocity.def[i][1], velocity.def[i][2], velocity.def[i][3]),
        deceleration[i], deltaTime,
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = ['t', result.position.x, result.position.y, result.position.z];
      newVTransformation = ['t', result.velocity.x, result.velocity.y, result.velocity.z];
    } else if (transformation[0] === 's' || transformation[0] === 'r') {
      result = decelerateIndependantPoint( // $FlowFixMe
        new Point(transformation[1], transformation[2], transformation[3]),
        new Point(velocity.def[i][1], velocity.def[i][2], velocity.def[i][3]),
        deceleration[i], deltaTime, // $FlowFixMe
        bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
        precision,
      );
      newTransformation = [
        transformation[0],
        result.point.x, result.point.y, result.point.z,
      ];
      newVTransformation = [
        transformation[0],
        result.velocity.x, result.velocity.y, result.velocity.z,
      ];
    }
    if (deltaTime === null) { // $FlowFixMe
      if (result.duration == null || result.duration > duration) {
        ({ duration } = result);
      }
    } // $FlowFixMe
    newVDef.push(newVTransformation); // $FlowFixMe
    newDef.push(newTransformation);
  }

  if (deltaTime != null) {
    duration = deltaTime;
  }
  return {
    transform: new Transform(newDef, transform.name),
    velocity: new Transform(newVDef, transform.name),
    duration,
  };
}

// function decelerateTransform(
//   transform: Transform,
//   velocity: Transform,
//   deceleration: TypeTransformDeceleration,
//   deltaTime: number | null,
//   boundsIn: TransformBounds | TypeTransformBoundsDefinition,
//   bounceLoss: TypeTransformBounce,
//   zeroVelocityThreshold: TypeTransformZeroThreshold,
//   precision: number = 8,
// ) {
//   let duration = 0;
//   const newDef = [];
//   const newVDef = [];

//   let bounds;
//   if (boundsIn instanceof TransformBounds) {
//     bounds = boundsIn;
//   } else {
//     bounds = new TransformBounds(transform, boundsIn);
//   }
//   for (let i = 0; i < transform.def.length; i += 1) {
//     const transformation = transform.def[i];
//     let result;
//     let newTransformation;
//     let newVTransformation;
//     if (transformation[0] === 't') {
//       result = deceleratePoint( // $FlowFixMe
//         new Point(transformation[1], transformation[2], transformation[3]),
//         new Point(velocity.def[i][1], velocity.def[i][2], velocity.def[i][3]),
//         deceleration[i], deltaTime,
//         bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
//         precision,
//       );
//       newTransformation = ['t', result.position.x, result.position.y, result.position.z];
//       newVTransformation = ['t', result.velocity.x, result.velocity.y, result.velocity.z];
//     } else if (transformation[0] === 's' || transformation[0] === 'r') {
//       result = decelerateIndependantPoint( // $FlowFixMe
//         new Point(transformation[1], transformation[2], transformation[3]),
//         new Point(velocity.def[i][1], velocity.def[i][2], velocity.def[i][3]),
//         deceleration[i], deltaTime, // $FlowFixMe
//         bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
//         precision,
//       );
//       newTransformation = [
//         transformation[0],
//         result.point.x, result.point.y, result.point.z,
//       ];
//       newVTransformation = [
//         transformation[0],
//         result.velocity.x, result.velocity.y, result.velocity.z,
//       ];
//     }
//     if (deltaTime === null) {
//       // $FlowFixMe
//       if (result.duration == null || result.duration > duration) {
//         ({ duration } = result);
//       }
//     }
//     newVDef.push(newVTransformation);
//     newDef.push(newTransformation);
//   }

//   if (deltaTime != null) {
//     duration = deltaTime;
//   }
//   return {
//     transform: new Transform(newDef, transform.name),
//     velocity: new Transform(newVDef, transform.name),
//     duration,
//   };
// }

export {
  deceleratePoint,
  decelerateIndependantPoint,
  decelerateValue,
  decelerateTransform,
};
