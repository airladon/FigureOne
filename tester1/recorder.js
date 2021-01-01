function Recorder() {
  const duration = 5;
  const timeStep = 0.01;
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

  // function getRecentRecording(getDuration = duration) {
  //   const count = Math.floor(getDuration / timeStep);
  //   return {
  //     time: time.slice(0, count),
  //     data: data.slice(index - count, index).reverse(),
  //   };
  // }

  function getRecording(fullBuffer = false) {
    if (fullBuffer || buffered) {
      return {
        time: time.slice(),
        data: data.slice(index - num, index),
      };
    }
    return {
      time: time.slice(0, index - num + 1),
      data: data.slice(num, num + index),
    };
  }

  // function getData() {
  //   return data;
  // }

  function getValueAtTimeAgo(timeDelta) {
    const deltaIndex = Math.floor(timeDelta / timeStep + timeStep / 10);
    return data[index - deltaIndex - 1];
  }

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
    // getData,
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
  let startPauseTime = 0;

  let paused = false;
  let blurred = false;

  function machineNow() {
    return performance.now() / 1000;
  }
  let startTime = machineNow();

  function reset() {
    startTime = machineNow();
    time = 0;
    cumPauseTime = 0;
    startPauseTime = 0;
  }

  function step(delta = null) {
    if (delta === null && startPauseTime > 0) {
      return 0;
    }
    const lastTime = time;
    if (delta == null) {
      time = (machineNow() - startTime - cumPauseTime) * timeSpeed;
    } else {
      time += delta;
    }
    return time - lastTime;
  }

  function pauseTime() {
    if ((paused || blurred) && startPauseTime === 0) {
      startPauseTime = machineNow();
    }
  }
  function unpauseTime() {
    if (!paused && !blurred && startPauseTime > 0) {
      cumPauseTime += machineNow() - startPauseTime;
      startPauseTime = 0;
    }
  }

  window.addEventListener('focus', () => {
    blurred = false;
    unpauseTime();
  });
  window.addEventListener('blur', () => {
    blurred = true;
    pauseTime();
  });

  function pause() { paused = true; pauseTime(); }
  function unpause() { paused = false; unpauseTime(); }
  function isPaused() { return paused || blurred; }
  function now() { return time; }

  // function getIsPaused() {
  //   return isPaused && isNotFocused;
  // }

  return {
    reset, now, step, pause, unpause, isPaused,
  };
}
