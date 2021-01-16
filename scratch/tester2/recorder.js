function Recorder() {
  const duration = 18;
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
    // console.log(index)
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

  function getRecording(fullBuffer = false, timeDuration = 5) {
    const n = timeDuration / timeStep;
    const i = index - num;
    if (fullBuffer || buffered || i > n) {
      return {
        time: time.slice(0, n),
        data: data.slice(index - n, index),
      };
    }
    // console.log(i, time.length)
    return {
      time: time.slice(0, i + 1),
      data: data.slice(num, num + i),
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
  let timeSpeed = 1;
  let internalPaused = false;

  let paused = false;
  let blurred = false;

  function getNow() {
    return performance.now() / 1000;
  }
  // let startTime = getNow();
  let lastTime = getNow();

  function reset() {
    lastTime = getNow();
    time = 0;
    // startPauseTime = 0;
    internalPaused = false;
  }

  function step(delta = null) {
    if (delta === null && internalPaused) {
      return 0;
    }
    const n = getNow();
    const timeDelta = delta == null ? (n - lastTime) * timeSpeed : delta;
    time += timeDelta;
    lastTime = n;
    return timeDelta;
  }

  function pauseTime() {
    if ((paused || blurred) && !internalPaused) {
      internalPaused = true;
    }
  }

  function unpauseTime() {
    if (!paused && !blurred && internalPaused) {
      internalPaused = false;
      lastTime = getNow();
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
  function setTimeSpeed(speed) {
    timeSpeed = speed;
  }
  function getTimeSpeed() { return timeSpeed; }

  return {
    reset, now, step, pause, unpause, isPaused, setTimeSpeed, getTimeSpeed,
  };
}
