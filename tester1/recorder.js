function Recorder() {
  const duration = 10;
  const timeStep = 0.01;
  const num = duration / timeStep;
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
    }
  }

  function record(value, deltaTime) {
    if (deltaTime < timeStep) {
      return;
    }
    // Count the number of samples that need to be added to the signal
    const count = Math.floor(deltaTime / timeStep);

    const lastValue = data[index - 1];
    const deltaValue = (value - lastValue) / count; 
    for (let i = 0; i < count; i += 1) {
      data[index] = lastValue + deltaValue * (i + 1);
      incrementIndex();
    }
  }

  // function getRecentRecording(getDuration = duration) {
  //   const count = Math.floor(getDuration / timeStep);
  //   return {
  //     time: time.slice(0, count),
  //     data: data.slice(index - count, index).reverse(),
  //   };
  // }

  function getRecording() {
    return {
      time: time.slice(),
      data: data.slice(index - num, index),
    };
  }

  function getData() {
    return data;
  }

  function getValueAtTimeAgo(timeDelta) {
    const deltaIndex = Math.floor(timeDelta / timeStep + timeStep / 10);
    return data[index - deltaIndex];
  }

  function reset(initialValueOrCallback = 0) {
    if (typeof initialValueOrCallback === 'number') {
      data = [...Array(num).fill(initialValueOrCallback), ...Array(num)];
    } else {
      data = [...initialValueOrCallback(timeStep, num), ...Array(num)];
    }
    index = num;
  }
  reset();

  return {
    record,
    getData,
    getRecording,
    // getRecentRecording,
    getValueAtTimeAgo,
    reset,
  };
}

function TimeKeeper() {
  let time = 0;
  const timeSpeed = 1;
  let cumPauseTime = 0;
  let isPaused = false;
  let startPauseTime;

  function machineNow() {
    return performance.now() / 1000;
  }
  let startTime = machineNow();

  function reset() {
    startTime = machineNow();
    time = 0;
    cumPauseTime = 0;
  }

  reset();

  function step(delta = null) {
    const lastTime = time;
    // let deltaTime = delta;
    if (delta == null) {
      time = (machineNow() - startTime - cumPauseTime) * timeSpeed;
      // console.log(deltaTime)
    } else {
      time += delta;
    }
    // time += deltaTime;
    return time - lastTime;
  }

  function pause() {
    if (!isPaused) {
      startPauseTime = machineNow();
      isPaused = true;
    }
  }

  function unpause() {
    if (isPaused) {
      cumPauseTime += machineNow() - startPauseTime;
      isPaused = false;
    }
  }

  // Active
  window.addEventListener('focus', () => {
    unpause();
  });

  // Inactive
  window.addEventListener('blur', () => {
    pause();
  });

  function now() {
    return time;
  }

  return {
    reset, now, step, pause, unpause,
  };
}
// const a = Recorder1();
// a.record(1, 3);

// console.log(a.getData());
// console.log(a.getRecording());

function RecorderOld() {
  const duration = 10;
  const timeStep = 0.01;
  const len = duration / timeStep;
  let lastTime = 0;
  let cumPauseTime = 0;
  let focusPaused = false;
  let paused = false;
  let data = [];
  let pauseStart = 0;
  let startTime = 0;

  function reset(value) {
    data = Array(len).fill(value);
    lastTime = 0;
    cumPauseTime = 0;
    startTime = new Date().getTime();
    focusPaused = false;
    paused = false;
  }

  // function load(initialValue) {
  //   // This data class will hold signal data for the most recent 10s at a
  //   // resolution (sampling rade) of 0.02s.
  //   duration = 10;
  //   timeStep = 0.01;
  //   len = duration / timeStep;
  //   reset(initialValue);
  // }
  function isPaused() {
    if (focusPaused || paused) {
      return true;
    }
    return false;
  }


  function now() {
    if (isPaused()) {
      return pauseStart - startTime - cumPauseTime;
    }
    return new Date().getTime() - startTime - cumPauseTime;
  }

  function initialize(callback) {
    data = callback(now(), timeStep, len);
  }

  function dataPause() {
    if (isPaused()) {
      return;
    }
    pauseStart = new Date().getTime();
  }

  function dataUnpause() {
    if (!isPaused()) {
      return;
    }
    cumPauseTime += new Date().getTime() - pauseStart;
  }

  function focusPause() {
    dataPause();
    focusPaused = true;
  }

  function focusUnpause() {
    if (!paused) {
      dataUnpause();
    }
    focusPaused = false;
  }

  function pause() {
    dataPause();
    paused = true;
  }

  function unpause() {
    if (!focusPaused) {
      dataUnpause();
    }
    paused = false;
  }


  // Update the signal data with the new value. Signal data is has a resolution
  // of 0.02s, so if this value comes in more than 0.04s after the last value
  // was recorder, then use interpolation to fill in the missing samples.
  function update(value) {
    if (isPaused()) {
      return;
    }
    const currentTime = now();
    const deltaTime = (currentTime - lastTime) / 1000;

    // If the value has come in faster than the time resolution, then
    // do nothing
    // console.log(deltaTime)
    if (deltaTime < timeStep) {
      return;
    }

    lastTime = currentTime;

    // Count the number of samples that need to be added to the signal
    const count = Math.floor(deltaTime / timeStep);

    // Interpolate between the last recorded value and the new value
    const newValues = [];
    const deltaValue = (data[0] - value) / (count);
    for (let i = 0; i < count; i += 1) {
      newValues.push(value + deltaValue * i);
    }
    data = [...newValues, ...data.slice(0, len - count)];
  }

  function getY(timeDelta) {
    const index = Math.floor(timeDelta / timeStep + timeStep / 10);
    return data[index];
  }

  return {
    getY,
    update,
    pause,
    unpause,
    focusPause,
    focusUnpause,
    reset,
    initialize,
    now,
  };
}
