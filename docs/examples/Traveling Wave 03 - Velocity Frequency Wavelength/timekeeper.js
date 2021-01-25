/**
This function keeps track of time.

Time is in seconds, and starts at 0 from the most recent reset.

Time can be paused, unpaused, sped up or slowed down. A time speed of 1
is normal time. When the speed is changed, the time speed will ramp up or
down to the target speed and not change instantly.

Time is automatically paused whenever the browser window loses focus.
 */
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

  // Update the current time and return the change in time from the last step
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
    }
  }

  function unpauseTime() {
    if (!paused && !blurred && internalPaused) {
      internalPaused = false;
      lastTime = getNow();
    }
  }

  // Automatically pause and unpause time when browser window focus changes
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
    targetSpeed = speed;
  }
  function getTimeSpeed() { return timeSpeed; }

  return {
    reset, now, step, pause, unpause, isPaused, setTimeSpeed, getTimeSpeed,
  };
}
