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
