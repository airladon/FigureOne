
function TimeKeeper() {
  let time = 0;
  let timeSpeed = 1;
  let targetSpeed = 1;
  let internalPaused = false;

  let paused = false;
  let blurred = false;

  function getNow() {
    return performance.now() / 1000;
  }
  let lastTime = getNow();

  function reset() {
    lastTime = getNow();
    time = 0;
    internalPaused = false;
  }

  function step(delta = null) {
    if (delta === null && internalPaused) {
      return 0;
    }
    const n = getNow();
    if (targetSpeed > timeSpeed) {
      timeSpeed += Math.min(targetSpeed - timeSpeed, 0.05);
    } else if (targetSpeed < timeSpeed) {
      timeSpeed += Math.max(targetSpeed - timeSpeed, -0.05);
    }
    const timeDelta = delta == null ? (n - lastTime) * timeSpeed : delta;
    time += timeDelta;
    lastTime = n;
    return timeDelta;
  }

  function pauseTime() {
    if ((paused || blurred) && !internalPaused) {
      internalPaused = true;
      // console.log(internalPaused)
    }
  }

  function unpauseTime() {
    if (!paused && !blurred && internalPaused) {
      internalPaused = false;
      lastTime = getNow();
      // console.log(internalPaused)
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
    // oldSpeed = timeSpeed;
    targetSpeed = speed;
  }
  function getTimeSpeed() { return timeSpeed; }

  return {
    reset, now, step, pause, unpause, isPaused, setTimeSpeed, getTimeSpeed,
  };
}
