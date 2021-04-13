/* globals figure */
/* eslint-disable no-empty, object-shorthand, func-names, getter-return */
function addPlayer() {
  // Add Recorder HTML
  const playerElement = document.createElement('div');
  playerElement.innerHTML = `
  <div id='f1_player'>
      <div id='f1_player__play_pause' class="f1_player__button f1_paused"></div>
      <div id='f1_player__seek'>
          <div id='f1_player__seek_bar'></div>
          <div id='f1_player__seek_circle'></div>
      </div>
      <div id='f1_player__time' class="f1_player__button">00:00 / 00:00</div>
  </div>
  `;
  document.body.appendChild(playerElement);

  // Get reference to figure's instantiated recorder
  const { recorder } = figure;

  // Buttons
  const playPauseButton = document.querySelector('#f1_player__play_pause');
  playPauseButton.onclick = () => recorder.togglePlayback();

  // Button state is updated when recorder state changes
  recorder.subscriptions.add(
    'playbackStopped', () => playPauseButton.classList.remove('f1_playing'),
  );
  recorder.subscriptions.add(
    'playbackStarted', () => playPauseButton.classList.add('f1_playing'),
  );

  // Shortcut Keys
  document.addEventListener('keypress', (event) => {
    const keyCode = String.fromCharCode(event.keyCode);
    if (keyCode === ' ') {
      recorder.togglePlayback();
    }
  }, false);

  // Time
  const timeLabel = document.querySelector('#f1_player__time');
  const seekContainer = document.querySelector('#f1_player__seek');
  const seekCircle = document.querySelector('#f1_player__seek_circle');

  function timeToStr(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function updateTimeLabel(time) {
    timeLabel.innerHTML = `${timeToStr(Math.floor(time))} / ${timeToStr(recorder.duration)}`;
  }

  function setTime(time, fromRecorder = false) {
    const circleWidth = seekCircle.clientWidth;
    const seekWidth = seekContainer.clientWidth - circleWidth;
    if (recorder.duration === 0) {
      seekCircle.style.left = 0;
    }
    const percentTime = Math.min(time / recorder.duration, 1);
    if (fromRecorder === false || (fromRecorder && recorder.state !== 'idle')) {
      seekCircle.style.left = `${Math.floor(percentTime * seekWidth)}px`;
    }
    updateTimeLabel(time);
  }

  recorder.subscriptions.add('timeUpdate', t => setTime(t[0], true));

  // Seek
  let seekId = null;
  let lastSeekTime = 0;
  function touchHandler(x) {
    const circleBounds = seekCircle.getBoundingClientRect();
    const seekBounds = seekContainer.getBoundingClientRect();
    let percent = 0;
    if (
      x >= seekBounds.left + circleBounds.width / 2
      && x <= seekBounds.right - circleBounds.width / 2
    ) {
      const xPos = x - (seekBounds.left + circleBounds.width / 2);
      percent = xPos / (seekBounds.width - circleBounds.width);
    } else if (x > seekBounds.right - circleBounds.width / 2) {
      percent = 1;
    }
    const time = percent * recorder.duration;
    lastSeekTime = time;
    if (seekId != null) {
      figure.subscriptions.remove('beforeDraw', seekId);
    }
    seekId = figure.subscriptions.add('beforeDraw', () => {
      recorder.seek(lastSeekTime);
      seekId = null;
    }, 1);
    setTime(time);
    figure.animateNextFrame();
  }

  /*
  ..######...########..######..########.##.....##.########..########..######.
  .##....##..##.......##....##....##....##.....##.##.....##.##.......##....##
  .##........##.......##..........##....##.....##.##.....##.##.......##......
  .##...####.######....######.....##....##.....##.########..######....######.
  .##....##..##.............##....##....##.....##.##...##...##.............##
  .##....##..##.......##....##....##....##.....##.##....##..##.......##....##
  ..######...########..######.....##.....#######..##.....##.########..######.
  */
  let touchState = 'up';
  function touchStartHandler(event) {
    touchState = 'down';
    touchHandler(event.touches[0].clientX);
  }

  function mouseDownHandler(event) {
    touchState = 'down';
    touchHandler(event.clientX);
  }

  function touchMoveHandler(event) {
    if (touchState === 'down') {
      touchHandler(event.touches[0].clientX);
      event.preventDefault();
    }
  }

  function mouseMoveHandler(event) {
    if (touchState === 'down') {
      touchHandler(event.clientX);
      event.preventDefault();
    }
  }

  function endHandler() {
    if (touchState === 'down') {
      recorder.seek(lastSeekTime);
    }
    touchState = 'up';
  }
  function mouseUpHandler() { endHandler(); }
  function touchEndHandler() { endHandler(); }

  seekContainer.addEventListener('mousedown', e => mouseDownHandler(e), false);
  window.addEventListener('mouseup', e => mouseUpHandler(e), false);
  window.addEventListener('mousemove', e => mouseMoveHandler(e), false);

  function supportsPassive() {
    let supportsPassiveFlag = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function () { supportsPassiveFlag = true; },
      });
      window.addEventListener('testPassive', null, opts);
      window.removeEventListener('testPassive', null, opts);
    } catch (e) {}
    return supportsPassiveFlag;
  }
  seekContainer.addEventListener('touchstart', e => touchStartHandler(e), supportsPassive() ? { passive: false } : false);
  window.addEventListener('touchend', e => touchEndHandler(e), supportsPassive() ? { passive: false } : false);
  window.addEventListener('touchmove', e => touchMoveHandler(e), supportsPassive() ? { passive: false } : false);
}

addPlayer();
