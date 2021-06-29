// @flow
import { Point } from './Point';
import { round } from '../math';
// import { Transform, transformValueToArray } from './Transform';
// import { polarToRect } from './coordinates';
// import { clipAngle } from './angle';
import {
  RectBounds, RangeBounds, LineBounds,
} from './Bounds';
// import type { TypeTransformBounds, TypeTransformBoundsDefinition } from './Bounds';
// import type { TypeTransformValue, TransformDefinition } from './Transform';

function getDistance(
  velocity: number,
  deltaTimeIn: number,
  deceleration: number,
  zeroVelocityThreshold: number,
) {
  // Initial Velocity
  const v0 = Math.abs(velocity);
  // Total change in velocity to go to zero threshold
  const deltaV = Math.abs(v0) - zeroVelocityThreshold;

  let deltaTime = deltaTimeIn;

  if (deltaTime == null || deltaTime > Math.abs(deltaV / deceleration)) {
    deltaTime = Math.abs(deltaV / deceleration);
  }

  // Calculate distance traveeled over time and so find the new Position
  return [v0 * deltaTime - 0.5 * deceleration * (deltaTime ** 2), deltaTime];
}

function timeFromVS(velocity: number, distance: number, deceleration: number) {
  // Calculate the time to the intersect point
  const v0 = Math.abs(velocity);
  const acc = -v0 / Math.abs(v0) * deceleration;
  const s = distance;
  const b = v0;
  const a = 0.5 * acc;
  const c = -s;
  const t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
  const velocityAtDistance = v0 + acc * t; // (s - 0.5 * a * (t ** 2)) / t;
  return [t, velocityAtDistance];
}

/*
Decelerate value moving at velocity with some deceleration over time deltaTime.

If bounds exist, then value will bounce off bounds.

Return the new velocity and value after deltaTime. If the velocity goes to 0
before deltaTime, then return the duration it took to go to 0.

If deltaTime is null, then return the time it takes for the velocity to go to
zero and the final value when it does.
*/
function decelerateValue(
  valueIn: number,
  velocityIn: number,
  decelerationIn: number,
  deltaTimeIn: number | null = null,
  bounds: null | RangeBounds = null,
  bounceLossIn: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
): {
  velocity: number,
  duration: null | number,
  value: number,
} {
  // If deltaTimeIn === null, then the caller is requesting the time it takes
  // for the velocity to go to zero, and the final value at that time.
  // However, if the deceleration is 0, then the velocity will never go to
  // zero so return duration = null (meaning infinite time).
  if (
    deltaTimeIn === null
    && round(decelerationIn, precision) === 0
    && (bounceLossIn === 0 || bounds == null || !bounds.isDefined())
  ) {
    // if () {
    //   if (deltaTimeIn == null) {
    return {
      velocity: velocityIn,
      value: valueIn,
      duration: null,
    };
    //   }
    // }
  }

  // If the velocity is already below the zero threshold, then we are finished
  if (Math.abs(velocityIn) <= zeroVelocityThreshold) {
    return { velocity: 0, value: valueIn, duration: 0 };
  }

  // Clip the current value to within the bounds, and make the deceleration non
  // zero to prevent divide by zeros
  const value = bounds != null ? bounds.clip(valueIn) : valueIn;
  const deceleration = Math.max(decelerationIn, 0.0000001);
  // Direciton of velocity
  const direction = velocityIn / Math.abs(velocityIn);

  // Calculate the distance travelled in deltaTime - If deltaTime === null, then
  // the distance travelled till the velocity becomes 0 will be calculated.
  // Returned deltaTime will then be the time till the zero velocity.
  const [distanceTravelled, deltaTime] = getDistance(
    velocityIn, deltaTimeIn, deceleration, zeroVelocityThreshold,
  );

  // Calculate the new value from the old value, distanceTravelled and the
  // velocity direction
  const newValue = value + direction * distanceTravelled;
  // If the new value is within the bounds, then can return the result.
  if (bounds == null || bounds.contains(newValue)) {
    // If originally deltaTimeIn was null, then the requested time and value
    // were for when the velocity went to zero
    if (deltaTimeIn == null) {
      return {
        duration: deltaTime,
        value: newValue,
        velocity: 0,
      };
    }
    // If deltaTimeIn != null, then we need to find the new velocity after
    // deltaTime
    let v1 = Math.abs(velocityIn) - deceleration * deltaTime;
    if (round(v1, precision) <= round(zeroVelocityThreshold, precision)) {
      v1 = 0;
    }

    return {
      value: newValue,
      velocity: v1 * direction,
      duration: deltaTime,
    };
  }

  // if we got here, the new value is out of bounds
  const bounceScaler = 1 - bounceLossIn;
  const result = bounds.intersect(value, direction);

  // if new value is not contained within bounds, but the intersect distance
  // is larger than the distance travelled in deltaTime, then there is likely a
  // rounding error that can't be resolved - this should be better handled in
  // future...
  if (result.distance != null && result.distance > distanceTravelled) {
    throw new Error('Error in calculating intersect');
  }

  const { intersect, reflection } = result;
  const distanceToBound = result.distance;

  // Calculate the time to the intersect point
  const [t, velocityAtIntersect] = timeFromVS(velocityIn, distanceToBound, deceleration);

  // If there is no bounce (all energy is lost) then return the result
  if (bounceLossIn === 1) {
    return {
      velocity: new Point(0, 0),
      position: intersect,
      duration: t,
    };
  }

  const bounceVelocity = velocityAtIntersect * bounceScaler * reflection;

  // Now we've had a bounce, we need to call decelerateValue again with the
  // new bounce velocity and bounce position.
  // If deltaTimeIn == null, looking for the zero velocity time/value
  if (deltaTimeIn == null) {
    const newStop = decelerateValue(
      intersect, bounceVelocity, deceleration, deltaTimeIn,
      bounds, bounceLossIn, zeroVelocityThreshold, precision,
    );
    // if (newStop.duration == null) {
    //   return {
    //     duration: null,
    //     value: newStop.value,
    //     velocity: new Point(0, 0),
    //   };
    // }
    return {
      duration: t + newStop.duration,
      value: newStop.value,
      velocity: 0,
    };
  }
  return decelerateValue(
    intersect, bounceVelocity, deceleration, deltaTime - t, bounds,
    bounceLossIn, zeroVelocityThreshold, precision,
  );
}

function decelerateVector(
  positionIn: Point,
  velocityIn: Point,
  decelerationIn: number,
  deltaTimeIn: number | null = null,
  bounds: null | RectBounds | LineBounds = null,
  bounceLossIn: number = 0,
  zeroVelocityThreshold: number = 0,
  precision: number = 8,
) {
  // If deltaTimeIn === null, then the caller is requesting the time it takes
  // for the velocity to go to zero, and the final value at that time.
  // However, if the deceleration is 0, then the velocity will never go to
  // zero so return duration = null (meaning infinite time).
  if (
    deltaTimeIn == null
    && round(decelerationIn, precision) === 0
    && (bounceLossIn === 0 || bounds == null || !bounds.isDefined())
  ) {
    // if (bounceLossIn === 0 || bounds == null || !bounds.isDefined()) {
    //   if (deltaTimeIn == null) {
    return {
      velocity: velocityIn,
      position: positionIn,
      duration: null,
    };
  }

  // clip velocity to the dimension of interest
  let velocity = velocityIn;    // $FlowFixMe
  if (bounds instanceof LineBounds) {
    velocity = bounds.boundary
      .pointProjection(bounds.boundary.p1.add(velocity))
      .sub(bounds.boundary.p1);
  } else if (bounds instanceof RectBounds) {
    velocity = bounds.plane
      .pointProjection(bounds.plane.p.add(velocity))
      .sub(bounds.plane.p);
  }

  // Get the magnitude and direciton of the velocity
  const mag = velocity.length();
  const direction = velocity.normalize();

  if (mag <= zeroVelocityThreshold) {
    return {
      velocity: new Point(0, 0, 0),
      position: positionIn,
      duration: 0,
    };
  }

  // Clip position in the bounds
  let position = positionIn._dup();
  if (bounds != null) {
    position = bounds.clip(positionIn);
  }

  const deceleration = Math.max(decelerationIn, 0.0000001);

  // Calculate the distance travelled in deltaTime - If deltaTime === null, then
  // the distance travelled till the velocity becomes 0 will be calculated.
  // Returned deltaTime will then be the time till the zero velocity.
  const [distanceTravelled, deltaTime] = getDistance(
    mag, deltaTimeIn, deceleration, zeroVelocityThreshold,
  );

  const newPosition = position.add(direction.scale(distanceTravelled));

  // If the new position is within the bounds, then can return the result.
  if (bounds == null || bounds.contains(newPosition)) {
    if (deltaTimeIn == null) {
      return {
        duration: deltaTime,
        position: newPosition,
        velocity: new Point(0, 0, 0),
      };
    }
    let v1 = mag - deceleration * deltaTime;
    if (round(v1, precision) <= round(zeroVelocityThreshold, precision)) {
      v1 = 0;
    }
    return {
      position: newPosition,
      velocity: direction.scale(v1),
      duration: deltaTime,
    };
  }

  // if we got here, the new position is out of bounds
  const bounceScaler = 1 - bounceLossIn;
  const result = bounds.intersect(position, direction);

  // if newPosition is not contained within bounds, but the intersect distance
  // is larger than the distance travelled in deltaTime, then there is likely a
  // rounding error... Or if the intersect is null there is an error (it really
  // shouldn't be if the containment test is failed)
  if (
    (result.distance !== 0 && result.distance > distanceTravelled)
    || result.intersect == null
  ) {
    throw new Error('Error in calculating intersect1');
  }

  const intersectPoint = result.intersect;
  const distanceToBound = result.distance;
  const { reflection } = result;

  // // Calculate the time to the intersect point
  // const acc = -v0 / Math.abs(v0) * deceleration;
  // const s = distanceToBound;
  // const b = v0;
  // const a = 0.5 * acc;
  // const c = -s;
  // const t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);

  // Calculate the time to the intersect point
  const [t, velocityAtIntersect] = timeFromVS(mag, distanceToBound, deceleration);

  // If there is no bounce (all energy is lost) then return the result
  if (bounceLossIn === 1) {
    return {
      velocity: new Point(0, 0, 0),
      position: intersectPoint,
      duration: t,
    };
  }

  // const velocityAtIntersect = v0 + acc * t;
  const bounceVelocity = velocityAtIntersect * bounceScaler;
  const reflectionVelocity = reflection.scale(bounceVelocity);

  if (deltaTimeIn == null) {
    const newStop = decelerateVector(
      intersectPoint, reflectionVelocity, deceleration, deltaTimeIn,
      bounds, bounceLossIn, zeroVelocityThreshold, precision,
    );
    // if (newStop.duration == null) {
    //   return {
    //     duration: null,
    //     position: newStop.position,
    //     velocity: new Point(0, 0),
    //   };
    // }
    return {
      duration: t + newStop.duration,
      position: newStop.position,
      velocity: new Point(0, 0),
    };
  }
  return decelerateVector(
    intersectPoint, reflectionVelocity, deceleration, deltaTime - t, bounds,
    bounceLossIn, zeroVelocityThreshold, precision,
  );
}

// function deceleratePoint(
//   positionIn: Point,
//   velocityIn: Point,
//   decelerationIn: number,
//   deltaTimeIn: number | null = null,
//   boundsIn: ?Bounds = null,  // ?(Rect | Line) = null,
//   bounceLossIn: number = 0,
//   zeroVelocityThreshold: number = 0,
//   precision: number = 8,
// ): {
//   velocity: Point,
//   duration: null | number,
//   position: Point,
// } {
//   let bounds;
//   if (boundsIn instanceof RangeBounds) {
//     bounds = new RectBounds({
//       left: boundsIn.boundary.min,
//       right: boundsIn.boundary.max,
//       bottom: boundsIn.boundary.min,
//       top: boundsIn.boundary.max,
//     });
//   } else {
//     bounds = boundsIn;
//   }
//   if (round(decelerationIn, precision) === 0) {
//     if (bounceLossIn === 0 || bounds == null || !bounds.isDefined()) {
//       if (deltaTimeIn == null) {
//         return {
//           velocity: velocityIn,
//           position: positionIn,
//           duration: null,
//         };
//       }
//     }
//   }
//   // clip velocity to the dimension of interest
//   let velocity = velocityIn;    // $FlowFixMe
//   if (bounds != null && bounds.clipVelocity != null) {  // $FlowFixMe
//     velocity = bounds.clipVelocity(velocityIn);
//   }
//   // const velocity = velocityIn;

//   let stopFlag = false;
//   if (deltaTimeIn == null) {
//     stopFlag = true;
//   }

//   // Get the mag and angle of the velocity and check if under the zero threshold
//   const { mag, angle } = velocity.toPolar();
//   if (mag <= zeroVelocityThreshold) {
//     return {
//       velocity: new Point(0, 0),
//       position: positionIn,
//       duration: 0,
//     };
//   }

//   // Clip position in the bounds
//   let position = positionIn._dup();
//   if (bounds != null) {
//     position = bounds.clip(positionIn);
//   }

//   // Initial Velocity
//   const v0 = mag;
//   // Total change in velocity to go to zero threshold
//   const deltaV = Math.abs(v0) - zeroVelocityThreshold;

//   let deltaTime = deltaTimeIn;

//   const deceleration = Math.max(decelerationIn, 0.0000001);
//   if (deltaTime == null || deltaTime > Math.abs(deltaV / deceleration)) {
//     deltaTime = Math.abs(deltaV / deceleration);
//   }

//   // Calculate distance traveeled over time and so find the new Position
//   const distanceTravelled = v0 * deltaTime - 0.5 * deceleration * (deltaTime ** 2);
//   const newPosition = polarToRect(distanceTravelled, angle).add(position);

//   // If the new position is within the bounds, then can return the result.
//   if (bounds == null || bounds.contains(newPosition)) {
//     if (stopFlag) {
//       return {
//         duration: deltaTime,
//         position: newPosition,
//         velocity: new Point(0, 0),
//       };
//     }
//     let v1 = v0 - deceleration * deltaTime;
//     if (round(v1, precision) <= round(zeroVelocityThreshold, precision)) {
//       v1 = 0;
//     }
//     return {
//       position: newPosition,
//       velocity: polarToRect(v1, angle),
//       duration: deltaTime,
//     };
//   }

//   // if we got here, the new position is out of bounds
//   const bounceScaler = 1 - bounceLossIn;
//   const result = bounds.intersect(position, clipAngle(angle, '0to360'));

//   // if newPosition is not contained within bounds, but the intersect distance
//   // is larger than the distance travelled in deltaTime, then there is likely a
//   // rounding error...
//   if (result.distance != null && result.distance > distanceTravelled) {
//     throw new Error('Error in calculating intersect');
//   }

//   let intersectPoint;
//   if (typeof result.intersect === 'number') {
//     intersectPoint = new Point(result.intersect, 0);
//   } else if (result.intersect == null) {
//     return {
//       position: newPosition,
//       velocity: new Point(0, 0),
//       duration: deltaTime,
//     };
//   } else {
//     intersectPoint = result.intersect;
//   }
//   // const intersectPoint = result.position;
//   const distanceToBound = result.distance;
//   const reflectionAngle = result.reflection;

//   // Calculate the time to the intersect point
//   const acc = -v0 / Math.abs(v0) * deceleration;
//   const s = distanceToBound;
//   const b = v0;
//   const a = 0.5 * acc;
//   const c = -s;
//   const t = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);

//   // If there is no bounce (all energy is lost) then return the result
//   if (bounceLossIn === 1) {
//     return {
//       velocity: new Point(0, 0),
//       position: intersectPoint,
//       duration: t,
//     };
//   }

//   const velocityAtIntersect = v0 + acc * t; // (s - 0.5 * a * (t ** 2)) / t;
//   const bounceVelocity = velocityAtIntersect * bounceScaler;
//   const rectBounceVelocity = new Point(
//     bounceVelocity * Math.cos(reflectionAngle),
//     bounceVelocity * Math.sin(reflectionAngle),
//   );

//   if (stopFlag) {
//     const newStop = deceleratePoint(
//       intersectPoint, rectBounceVelocity, deceleration, deltaTimeIn,
//       bounds, bounceLossIn, zeroVelocityThreshold, precision,
//     );
//     if (newStop.duration == null) {
//       return {
//         duration: null,
//         position: newStop.position,
//         velocity: new Point(0, 0),
//       };
//     }
//     return {
//       duration: t + newStop.duration,
//       position: newStop.position,
//       velocity: new Point(0, 0),
//     };
//   }
//   return deceleratePoint(
//     intersectPoint, rectBounceVelocity, deceleration, deltaTime - t, bounds,
//     bounceLossIn, zeroVelocityThreshold, precision,
//   );
// }

// function decelerateValueLegacy(
//   value: number,
//   velocity: number,
//   deceleration: number,
//   deltaTime: number | null = null,
//   boundsIn: ?RangeBounds = null,
//   bounceLoss: number = 0,
//   zeroVelocityThreshold: number = 0,
//   precision: number = 8,
// ) {
//   let bounds = boundsIn;
//   if (round(deceleration, precision) === 0) {
//     if (
//       bounceLoss === 0
//       || boundsIn == null
//       || (boundsIn != null && !boundsIn.isDefined())
//     ) {
//       if (deltaTime == null) {
//         return {
//           velocity,
//           value,
//           duration: null,
//         };
//       }
//     }
//   }
//   if (boundsIn != null) {
//     bounds = new LineBounds({
//       p1: [boundsIn.boundary.min != null ? boundsIn.boundary.min : 0, 0],
//       p2: [boundsIn.boundary.max != null ? boundsIn.boundary.max : 0, 0],
//     });
//   }
//   const result = deceleratePoint(
//     new Point(value, 0),
//     new Point(velocity, 0),
//     deceleration,
//     deltaTime,
//     bounds,
//     bounceLoss,
//     zeroVelocityThreshold,
//     precision,
//   );

//   return {
//     duration: result.duration,
//     value: result.position.x,
//     velocity: result.velocity.x,
//   };
// }

// function decelerateIndependantPoint(
//   value: Point,
//   velocity: Point,
//   deceleration: number,
//   deltaTime: number | null = null,
//   boundsIn: ?(RectBounds | RangeBounds) = null,
//   bounceLoss: number = 0,
//   zeroVelocityThreshold: number = 0,
//   precision: number = 8,
// ) {
//   let xBounds = null;
//   let yBounds = null;
//   let zBounds = null;
//   if (boundsIn != null && boundsIn instanceof RectBounds) {
//     xBounds = new RangeBounds({
//       min: boundsIn.boundary.left, max: boundsIn.boundary.right,
//     });
//     yBounds = new RangeBounds({
//       min: boundsIn.boundary.bottom, max: boundsIn.boundary.top,
//     });
//   }
//   if (boundsIn != null && boundsIn instanceof RangeBounds) {
//     xBounds = boundsIn;
//     yBounds = boundsIn;
//     zBounds = boundsIn;
//   }

//   const xResult = decelerateValue(
//     value.x, velocity.x, deceleration, deltaTime,
//     xBounds, bounceLoss, zeroVelocityThreshold, precision,
//   );
//   const yResult = decelerateValue(
//     value.y, velocity.y, deceleration, deltaTime,
//     yBounds, bounceLoss, zeroVelocityThreshold, precision,
//   );
//   const zResult = decelerateValue(
//     value.z, velocity.z, deceleration, deltaTime,
//     zBounds, bounceLoss, zeroVelocityThreshold, precision,
//   );

//   if (xResult.duration == null || yResult.duration == null || zResult.duration == null) {
//     return {
//       duration: null,
//       point: new Point(xResult.value, yResult.value, zResult.value),
//       velocity: new Point(xResult.velocity, yResult.velocity, zResult.velocity),
//     };
//   }

//   return {
//     duration: Math.max(xResult.duration, yResult.duration, zResult.duration),
//     point: new Point(xResult.value, yResult.value, zResult.value),
//     velocity: new Point(xResult.velocity, yResult.velocity, zResult.velocity),
//   };
// }

// function decelerateTransform(
//   transform: Transform,
//   velocity: Transform,
//   decelerationIn: TypeTransformValue,
//   deltaTime: number | null,
//   boundsIn: TypeTransformBounds | TypeTransformBoundsDefinition | 'none',
//   bounceLossIn: TypeTransformValue,
//   zeroVelocityThresholdIn: TypeTransformValue,
//   precision: number = 8,
// ): { velocity: Transform, transform: Transform, duration: null | number } {
//   const deceleration = transformValueToArray(decelerationIn, transform);
//   const bounceLoss = transformValueToArray(bounceLossIn, transform);
//   const zeroVelocityThreshold = transformValueToArray(zeroVelocityThresholdIn, transform);
//   let bounds;
//   if (boundsIn instanceof TransformBounds) {
//     bounds = boundsIn;
//   } else if (boundsIn === 'none') {
//     bounds = new TransformBounds(transform);
//   } else {
//     bounds = new TransformBounds(transform, boundsIn);
//   }
//   let duration = 0;
//   const newDef: TransformDefinition = [];
//   const newVDef: TransformDefinition = [];

//   for (let i = 0; i < transform.def.length; i += 1) {
//     const transformation = transform.def[i];
//     let result = { duration: 0 };
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
//     } else if (
//       transformation[0] === 's'
//       || transformation[0] === 'rc'
//       || transformation[0] === 'rd'
//     ) {
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
//     } else if (
//       transformation[0] === 'r'
//     ) {
//       result = decelerateValue( // $FlowFixMe
//         transformation[1],
//         velocity.def[i][1],
//         deceleration[i], deltaTime, // $FlowFixMe
//         bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
//         precision,
//       );
//       newTransformation = [
//         transformation[0],
//         result.value,
//       ];
//       newVTransformation = [
//         transformation[0],
//         result.velocity,
//       ];
//     } else if (
//       transformation[0] === 'rs'
//     ) {
//       result = decelerateIndependantPoint( // $FlowFixMe
//         new Point(transformation[1], transformation[2], 0),
//         new Point(velocity.def[i][1], velocity.def[i][2], 0),
//         deceleration[i], deltaTime, // $FlowFixMe
//         bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
//         precision,
//       );
//       newTransformation = [
//         transformation[0],
//         result.point.x, result.point.y,
//       ];
//       newVTransformation = [
//         transformation[0],
//         result.velocity.x, result.velocity.y,
//       ];
//     } else if (
//       transformation[0] === 'ra'
//     ) {
//       const result1 = decelerateIndependantPoint( // $FlowFixMe
//         new Point(transformation[1], transformation[2], transformation[3]),
//         new Point(velocity.def[i][1], velocity.def[i][2], velocity.def[i][3]),
//         deceleration[i], deltaTime, // $FlowFixMe
//         bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
//         precision,
//       );
//       const result2 = decelerateValue( // $FlowFixMe
//         transformation[4],
//         velocity.def[i][4],
//         deceleration[i], deltaTime, // $FlowFixMe
//         bounds.boundary[i], bounceLoss[i], zeroVelocityThreshold[i],
//         precision,
//       );
//       newTransformation = [
//         transformation[0],
//         result1.point.x, result1.point.y, result1.point.z, result2.value,
//       ];
//       newVTransformation = [
//         transformation[0],
//         result1.velocity.x, result1.velocity.y, result1.velocity.z, result2.value,
//       ];
//       result = {
//         duration: Math.max(result1.duration, result2.duration),
//       };
//     }
//     if (deltaTime === null) { // $FlowFixMe
//       if (result.duration == null || result.duration > duration) {
//         ({ duration } = result);
//       }
//     } // $FlowFixMe
//     newVDef.push(newVTransformation); // $FlowFixMe
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
  // deceleratePoint,
  decelerateVector,
  // decelerateIndependantPoint,
  decelerateValue,
  // decelerateTransform,
};
