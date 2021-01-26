/**
This function records values over time. The recorder samples at a specific rate
(`timeStep`), and if values are input with larger time steps, then additional
points will be added with linear interpolation.

Either all values, or values at specific times can be retrieved.

The recording is stored in a queue array. The array is double the length of the
recording available. When it is full, the last half of the array is copied to
the first half and recording continues from half way. This limits the number
of times arrays need to be copied.
 */
function Recorder(duration) {
  const timeStep = 0.005;
  const num = duration / timeStep;
  let buffered = false;
  let index;
  let data;
  const time = Array(num);
  for (let i = 0; i < num; i += 1) {
    time[i] = i * timeStep;
  }

  function incrementIndex() {
    index += 1;
    if (index === num * 2) {
      data = [...data.slice(num), ...Array(num)];
      index = num;
      buffered = true;
    }
  }

  let lastDelta = 0;
  // Add a value to the recording, and the amount of time that has ellapsed
  // since the last record. If the ellapsed time is longer than `timeStep`, then
  // interpolated values will be added at each `timeStep`.
  function record(value, deltaTimeIn) {
    const deltaTime = deltaTimeIn + lastDelta;
    if (deltaTime < timeStep) {
      lastDelta = deltaTime;
      return;
    }
    // Count the number of samples that need to be added to the signal
    const count = Math.floor(deltaTime / timeStep);
    lastDelta = deltaTime - count * timeStep;

    const lastValue = data[index - 1];
    const deltaValue = (value - lastValue) / count;
    for (let i = 0; i < count; i += 1) {
      data[index] = lastValue + deltaValue * (i + 1);
      incrementIndex();
    }
  }

  function getRecording(fullBuffer = false, timeDuration = 5) {
    const n = timeDuration / timeStep;
    const i = index - num;
    if (fullBuffer || buffered || i > n) {
      return {
        time: time.slice(0, n),
        data: data.slice(index - n, index),
      };
    }
    return {
      time: time.slice(0, i + 1),
      data: data.slice(num, num + i),
    };
  }

  function getValueAtTimeAgo(timeDelta) {
    const deltaIndex = Math.floor(timeDelta / timeStep + timeStep / 10);
    return data[index - deltaIndex - 1];
  }

  // Reset all the data values with an initial value or a callback function
  // that fills out all values
  function reset(initialValueOrCallback = 0) {
    if (typeof initialValueOrCallback === 'number') {
      data = [...Array(num).fill(initialValueOrCallback), ...Array(num)];
    } else {
      data = [...initialValueOrCallback(timeStep, num), ...Array(num)];
    }
    buffered = false;
    index = num;
  }
  reset();

  return {
    record,
    getRecording,
    getValueAtTimeAgo,
    reset,
  };
}
