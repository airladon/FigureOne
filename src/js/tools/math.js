// @flow

const roundNum = (value: number, precision: number = 5): number => {
  const multiplier = 10 ** precision;
  let result = Math.round(value * multiplier) / multiplier;
  // if (Object.is(result, -0)) {
  // if (result === -0) {
  //   result = 0;
  // }
  const objectIsPolyfill = (x, y) => {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1 / x === 1 / y;
    }
    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    // eslint-disable-next-line no-self-compare
    return x !== x && y !== y;
  };
  if (objectIsPolyfill(result, -0)) {
    result = 0;
  }
  // if (result === -0) {
  //   // 0 === -0, but they are not identical
  //   return result !== 0 || 1 / x === 1 / y;
  // }

  return result;
};

type TypeRoundObject = {
  round?: (number) => TypeRoundObject;
} & Object;
/**
 * Rounds a number or numbers in an array
 * @method
 * @param {number | Array<number>} arrayOrValue - Value or array of values to be rounded
 * @param {number} precision - Number of decimal places to round to
 * @returns {number | Array<number>} Rounded value or array of values
 */
function round<T: number | TypeRoundObject | Array<number | TypeRoundObject>>(
  arrayOrValue: T,
  precision: number = 5,
): T {
  let result = 0;
  if (Array.isArray(arrayOrValue)) {
    return arrayOrValue.map(elem => round(elem, precision));
  }
  if (typeof arrayOrValue === 'number') {
    result = roundNum(arrayOrValue, precision);
  } else if (arrayOrValue != null && arrayOrValue.round != null) {
    result = arrayOrValue.round(precision);
  }
  // $FlowFixMe
  return result;
}


// // clipValue clips a value to either 0 if it's small enough, or to a max value
// // Value, and maxValue are sign independent. e.g.
// //    * value, maxValue = 2, 1 => clips to 1
// //    * value, maxValue = -2, -1 => clips to -1
// //    * value, maxValue = -2, 1 => clips to -1
// //    * value, maxValue = 2, -1 => clips to 1
// function clipValue(
//   value: number,
//   zeroThreshold: number,
//   maxValue: number = 0,
// ) {
//   let result = value;
//   let zero = zeroThreshold;
//   if (zero < 0) {
//     zero = -zero;
//   }
//   if (value > -zero && value < zero) {
//     return 0;
//   }
//   let max = maxValue;
//   if (max < 0) {
//     max = -max;
//   }

//   if (value > max) {
//     result = max;
//   }
//   if (value < -max) {
//     result = -max;
//   }
//   return result;
// }


// Clip a value to either max velocity, or 0 once under the minimum
// threashold.
//  * velocity: can be positive or negative
//  * maxVelocity will clip velocity to:
//      * |maxVelocity| if velocity > 0
//      * -|maxVelocity| if velcity < 0
//  * zeroThreshold will clip velocity to:
//       * 0 if velocity is larger than -|zeroThreshold| and smaller than
//         |zeroThreshold|.
function clipMag(
  value: number,
  zeroThreshold: number | null,
  maxValue: number | null,
): number {
  let result = value;
  let zeroT = zeroThreshold;
  let maxV = maxValue;

  if (zeroT === null) {
    zeroT = 0;
  }
  if (zeroT < 0) {
    zeroT = -zeroT;
  }
  if (maxV === null) {
    return result;
  }
  if (maxV < 0) {
    maxV = -maxV;
  }
  if (value >= -zeroT && value <= zeroT) {
    result = 0;
  }
  if (value > maxV) {
    result = maxV;
  }
  if (value < -maxV) {
    result = -maxV;
  }
  return result;
}

function clipValue(
  value: number,
  minValue: number | null,
  maxValue: number | null,
): number {
  let clipped = value;
  if (minValue !== null) {
    if (value < minValue) {
      clipped = minValue;
    }
  }

  if (maxValue !== null) {
    if (value > maxValue) {
      clipped = maxValue;
    }
  }
  return clipped;
}

const decelerate = function getPositionVelocityFromDecAndTime(
  position: number,
  velocity: number,
  magDeceleration: number | null,
  time: number,
  zeroThreshold: number | null,
) {
  let zeroT: number = 0;
  if (zeroThreshold !== null) {
    zeroT = zeroThreshold;
  }
  let decel: number = 0;
  if (magDeceleration !== null) {
    decel = magDeceleration;
  }
  // If the velocity is currently 0, then no further deceleration can occur, so
  // return the current velocity and position
  const v = clipMag(velocity, zeroT, velocity);
  if (v === 0) {
    return {
      p: position,
      v: 0,
    };
  }

  let d = decel;
  if (decel < 0) {
    d = -d;
  }
  // If there is some initial velocity, then calc its sign and
  const sign = velocity / Math.abs(velocity);
  let newVelocity = velocity - sign * d * time;

  // if the new velocity changes sign, then it should go to 0. If it doesn't
  // change sign, then clip incase it should go to 0 because it is below
  // the zero velocity threshold.
  const newSign = newVelocity / Math.abs(newVelocity);
  if (newSign !== sign) {
    newVelocity = 0;
  } else {
    newVelocity = clipMag(newVelocity, zeroT, newVelocity);
  }

  // If the new velocity is clipped, then we need to use the time to where the
  // velocity crosses the clipping point.
  // v_new = v_init + a*t
  // Therefore, if v_new = zeroT: t = (zeroT - vi)/a
  let t = time;
  if (newVelocity === 0) {
    let z = zeroT;
    const zSign = z / Math.abs(z);
    if (zSign !== sign) {
      z = -z;
    }
    t = Math.abs((z - velocity) / d);
  }
  // Now can calculate the new position
  const newPosition = position + velocity * t - sign * 0.5 * d * t * t;

  return {
    p: newPosition,
    v: newVelocity,
  };
};


const linear = (percentTime: number, invert: ?boolean = false) => {
  if (invert) {
    return percentTime;
  }
  return percentTime;
};

function triangle(
  deltaTime: number = 1,
  frequency: number = 1,
  bias: number = 0,
  mag: number = 1,
  phaseOffset: number = 0,
) {
  return bias + 2 * mag / Math.PI
    * Math.asin(Math.sin(2 * Math.PI * frequency * deltaTime + phaseOffset));
  // return bias + mag * Math.sin(deltaTime * frequency * 2.0 * Math.PI + phaseOffset);
}

const easeinout = (percentTime: number, invert: ?boolean = false) => {
  if (invert) {
    if (percentTime === 0.5) {
      return 0.5;
    }
    const a = percentTime;
    return (2 * a - Math.sqrt(-4 * a * a + 4 * a)) / (4 * a - 2);
  }
  const x = percentTime;
  const percentDistance = (x ** 2) / ((x ** 2) + ((1 - x) ** 2));
  return percentDistance;
};

function easeout(percentTime: number, invert: ?boolean = false) {
  if (invert) {
    if (percentTime === 0) {
      return 0;
    }
    const a = percentTime / 2 + 0.5;
    const b = (2 * a - Math.sqrt(-4 * a * a + 4 * a)) / (4 * a - 2);
    return (b - 0.5) * 2;
  }
  const x = 0.5 + percentTime / 2;
  const power = 2;
  const percentDistance = (x ** power) / ((x ** power) + ((1 - x) ** power));
  return (percentDistance - 0.5) * 2;
}

function easein(percentTime: number, invert: ?boolean = false) {
  if (invert) {
    if (percentTime === 1) {
      return 1;
    }
    const a = percentTime / 2;
    const b = (2 * a - Math.sqrt(-4 * a * a + 4 * a)) / (4 * a - 2);
    return b * 2;
  }
  const x = percentTime / 2;
  const power = 2;
  const percentDistance = (x ** power) / ((x ** power) + ((1 - x) ** power));
  return percentDistance * 2;
}

function sinusoid(
  deltaTime: number = 1,
  frequency: number = 1,
  bias: number = 0,
  mag: number = 1,
  phaseOffset: number = 0,
) {
  return bias + mag * Math.sin(deltaTime * frequency * 2.0 * Math.PI + phaseOffset);
}

function sinusoidAbs(
  deltaTime: number = 1,
  frequency: number = 1,
  bias: number = 0,
  mag: number = 1,
  phaseOffset: number = 0,
) {
  return bias + Math.abs(mag * Math.sin(deltaTime * frequency * 2.0 * Math.PI + phaseOffset));
}

// const animationPhase = (transform, time, rotDirection = 0, animationStyle = easeinout) => {
//     return {
//         transform: transform._dup(),
//         time: time,
//         rotDirection: rotDirection,
//         animationStyle: animationStyle,
//     }
// }


/**
 * Creates an array with a range of numbers
 * @param start - Range start
 * @param stop - Range stop
 * @param step - Range step
 * @returns {Array<number>} Range of numbers in an array
 */
function range(start: number, stop: number, step: number = 1, precision: number = 8) {
  const out = [];
  if (stop > start) {
    if (step <= 0) {
      return [];
    }
    for (let i = start; i <= stop; i = round(i + step, precision)) {
      out.push(i);
    }
  } else {
    if (step >= 0) {
      return [];
    }
    for (let i = start; i >= stop; i = round(i + step, precision)) {
      out.push(i);
    }
  }
  return out;
}

/**
 * Return a -1 or 1 randomly
 * @return {number} -1 or 1
 */
function randSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

/**
 * Return a random int.
 *
 * If a `max = null`, then the returned integer will be in the range of 0 to
 * `minOrMax`.
 *
 * Otherwise the returned value is in the range of `minOrMax` to `max`.
 *
 * Use `sign` to also return a random sign (negative or positive);
 *
 * @return {number} random integer
 */
function randInt(minOrMax: number, max: ?number = null, sign: boolean = false) {
  let r = 0;
  if (max != null) {
    const min = minOrMax;
    r = Math.floor(Math.random() * Math.floor((max - min)) + Math.floor(min));
  } else {
    r = Math.floor(Math.random() * Math.floor(minOrMax));
  }
  if (sign) {
    r *= randSign();
  }
  return r;
}

/**
 * Return a random number.
 *
 * If a `max = null`, then the returned number will be in the range of 0 to
 * `minOrMax`.
 *
 * Otherwise the returned value is in the range of `minOrMax` to `max`.
 *
 * Use `sign` to also return a random sign (negative or positive);
 *
 * @return {number} random number
 */
function rand(minOrMax: number, max: ?number = null, plusOrMinus: boolean = false) {
  let r = 0;
  if (max != null) {
    const min = minOrMax;
    r = Math.random() * (max - min) + min;
  } else {
    r = Math.random() * minOrMax;
  }
  if (plusOrMinus) {
    r *= randSign();
  }
  return r;
}

/**
 * Get a random element from an array.
 */
function randElement<T>(inputArray: Array<T>): T {
  const index = randInt(inputArray.length);
  return inputArray[index];
}

/**
 * Remove and return random element from an array.
 */
function removeRandElement<T>(inputArray: Array<T>): T {
  const index = rand(inputArray.length);
  return inputArray.splice(index, 1)[0];
}

/**
 * Get a number of random elements from an array.
 */
function randElements<T>(num: number, inputArray: Array<T>): Array<T> {
  const possibleIndeces = range(0, inputArray.length - 1, 1);
  const elements = [];
  for (let i = 0; i < num; i += 1) {
    const index = removeRandElement(possibleIndeces);
    elements.push(inputArray[index]);
  }
  return elements;
}

function rand2D(minX: number, minY: number, maxX: number, maxY: number) {
  return {
    x: rand(minX, maxX),
    y: rand(minY, maxY),
  };
}

export {
  round,
  roundNum,
  decelerate,
  easeinout,
  easeout,
  easein,
  sinusoid,
  sinusoidAbs,
  linear,
  triangle,
  clipMag,
  clipValue,
  range,
  randInt,
  rand,
  randElement,
  removeRandElement,
  randElements,
  rand2D,
  randSign,
};

