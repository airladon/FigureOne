/* globals figure */
/* eslint-disable no-empty, object-shorthand, func-names, getter-return */

function setupRecorder() {
  const { recorder } = figure;

  const state = {
    duration: 0,
    touch: 'up',
  };

  /*
  .########..##.....##.########.########..#######..##....##..######.
  .##.....##.##.....##....##.......##....##.....##.###...##.##....##
  .##.....##.##.....##....##.......##....##.....##.####..##.##......
  .########..##.....##....##.......##....##.....##.##.##.##..######.
  .##.....##.##.....##....##.......##....##.....##.##..####.......##
  .##.....##.##.....##....##.......##....##.....##.##...###.##....##
  .########...#######.....##.......##.....#######..##....##..######.
  */
  const playPauseButton = document.querySelector('#f1_player__play_pause');
  const recordButton = document.querySelector('#f1_recorder__record');
  const saveButton = document.querySelector('#f1_recorder__save');
  const loadButton = document.querySelector('#f1_recorder__load')

  // Setup button functionality
  function togglePlayPause() {
    if (recorder.state === 'recording') {
      return;
    }
    if (recorder.state !== 'idle') {
      recorder.pausePlayback();
    } else {
      recorder.resumePlayback();
    }
  }

  function toggleRecord() {
    if (!(recorder.state === 'recording') && !(recorder.state === 'idle')) {
      return;
    }
    if (recorder.state === 'recording') {
      recorder.stopRecording();
    } else {
      const currentTime = recorder.getCurrentTime();
      recorder.startRecording(currentTime, ['_autoSlide', '_autoCursor', '_autoTouch', '_autoCursorMove', '_autoExec']);
      if (currentTime === 0) {
        recorder.recordEvent('slide', ['goto', 0], 0);
      }
    }
  }

  playPauseButton.onclick = () => togglePlayPause();
  recordButton.onclick = () => toggleRecord();
  saveButton.onclick = () => recorder.save();

  loadButton.onclick = () => {
    if (loadButton.innerHTML === 'Plan Loaded') {
      return;
    }
    const script = document.createElement('script');
    script.setAttribute('src', 'cursor.js');
    script.onload = () => { loadButton.innerHTML = 'Plan Loaded'; };
    document.body.appendChild(script);
    recorder.useAutoEvents = true;
  };

  // Button state is updated from recorder subscriptions
  function playbackStarted() {
    playPauseButton.classList.add('f1_playing');
    recordButton.classList.add('f1_player__button_disable');
  }

  function playbackStopped() {
    playPauseButton.classList.remove('f1_playing');
    recordButton.classList.remove('f1_player__button_disable');
  }

  function recordingStarted() {
    recordButton.innerHTML = 'Pause';
    playPauseButton.classList.add('f1_player__button_disable');
  }

  function recordingStopped() {
    recordButton.innerHTML = 'Record';
    playPauseButton.classList.remove('f1_player__button_disable');
  }
  recorder.subscriptions.add('playbackStopped', playbackStopped.bind(this));
  recorder.subscriptions.add('playbackStarted', playbackStarted.bind(this));
  recorder.subscriptions.add('startRecording', recordingStarted.bind(this));
  recorder.subscriptions.add('stopRecording', recordingStopped.bind(this));

  /*
  .##....##.########.##....##..######.
  .##...##..##........##..##..##....##
  .##..##...##.........####...##......
  .#####....######......##.....######.
  .##..##...##..........##..........##
  .##...##..##..........##....##....##
  .##....##.########....##.....######.
  */
  document.addEventListener('keypress', (event) => {
    const keyCode = String.fromCharCode(event.keyCode);
    if (keyCode === 's') {
      figure.toggleCursor();
    } else if (keyCode === ' ') {
      togglePlayPause();
      // console.log('next')
    } else if (keyCode === 'n') {
      figure.getElement('nav').nav.nextSlide(true);
      // console.log('next')
    } else if (keyCode === 'p') {
      figure.getElement('nav').nav.prevSlide();
    } else if (figure.shortCuts[keyCode] != null) {
      if (figure.recorder.state === 'recording') {
        figure.recorder.recordEvent('exec', [figure.shortCuts[keyCode]]);
      }
      figure.fnMap.exec(figure.shortCuts[keyCode]);
    }
  }, false);
  /*
  .########.####.##.....##.########
  ....##.....##..###...###.##......
  ....##.....##..####.####.##......
  ....##.....##..##.###.##.######..
  ....##.....##..##.....##.##......
  ....##.....##..##.....##.##......
  ....##....####.##.....##.########
  */
  const timeLabel = document.querySelector('#f1_player__time');
  const seekContainer = document.querySelector('#f1_player__seek');
  const seekCircle = document.querySelector('#f1_player__seek_circle');

  function timeToStr(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function updateTimeLabel(time) {
    timeLabel.innerHTML = `${timeToStr(Math.floor(time))} / ${timeToStr(state.duration)}`;
  }

  function setTime(time) {
    const circleWidth = seekCircle.clientWidth;
    const seekWidth = seekContainer.clientWidth - circleWidth;
    if (recorder.duration === 0) {
      seekCircle.style.left = 0;
    }
    const percentTime = time / recorder.duration;
    seekCircle.style.left = `${percentTime * seekWidth}px`;
    updateTimeLabel(time);
  }

  recorder.subscriptions.add('timeUpdate', t => setTime(t[0]));
  recorder.subscriptions.add('durationUpdated', (d) => { state.duration = d; });

  /*
  ..######..########.########.##....##
  .##....##.##.......##.......##...##.
  .##.......##.......##.......##..##..
  ..######..######...######...#####...
  .......##.##.......##.......##..##..
  .##....##.##.......##.......##...##.
  ..######..########.########.##....##
  */

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
    const time = percent * state.duration;
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

  function touchStartHandler(event) {
    state.touch = 'down';
    const touch = event.touches[0];
    touchHandler(touch.clientX);
  }

  function mouseDownHandler(event) {
    state.touch = 'down';
    touchHandler(event.clientX);
  }

  function touchMoveHandler(event) {
    if (state.touch === 'down') {
      const touch = event.touches[0];
      touchHandler(touch.clientX);
      event.preventDefault();
    }
  }

  function mouseMoveHandler(event) {
    if (state.touch === 'down') {
      touchHandler(event.clientX);
      event.preventDefault();
    }
  }

  function endHandler() {
    if (state.touch === 'down') {
      recorder.seek(lastSeekTime);
    }
    state.touch = 'up';
  }
  function mouseUpHandler() { endHandler(); }
  function touchEndHandler() { endHandler(); }

  seekContainer.addEventListener('mousedown', e => mouseDownHandler(e), false);
  window.addEventListener('mouseup', e => mouseUpHandler(e), false);
  window.addEventListener('mousemove', e => mouseMoveHandler(e), false);
  // docume.addEventListener('mouseleave', this.mouseUpHandler.bind(this), false);

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

  /*
  .##........#######.....###....########.
  .##.......##.....##...##.##...##.....##
  .##.......##.....##..##...##..##.....##
  .##.......##.....##.##.....##.##.....##
  .##.......##.....##.#########.##.....##
  .##.......##.....##.##.....##.##.....##
  .########..#######..##.....##.########.
  */
  // Load video states and audio data

  // fetch('../../untracked/2021-04-01T18_40_52.860Z__scratch_ivid__events.json')
  //   .then(response => response.json())
  //   .then(json => recorder.loadEvents(json));

  // fetch('../../untracked/2021-04-01T18_40_52.860Z__scratch_ivid__states.json')
  //   .then(response => response.json())
  //   .then(json => recorder.loadStates(json));
  fetch('../../untracked/2021-04-01T18_54_48_scratch_ivid.json')
    .then(response => response.json())
    .then(json => recorder.loadSavedData(json));

  recorder.loadAudio(new Audio('./audio.mp3'));
}

setupRecorder();
