/* globals figure */
function setupRecorder() {
  function supportsPassive() {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) {}
    return supportsPassive;
  }

  const playPauseButton = document.querySelector('#f1_recorder__play_pause');
  const recordButton = document.querySelector('#f1_recorder__record');
  const saveButton = document.querySelector('#f1_recorder__save');
  const timeLabel = document.querySelector('#f1_recorder__time');
  const seekContainer = document.querySelector('#f1_recorder__seek');
  const seekCircle = document.querySelector('#f1_recorder__seek_circle');
  const { recorder } = figure;

  const state = {
    playing: false,
    time: 0,
    recording: false,
    duration: 0,
    touch: 'up',
  };

  figure.fnMap.add('navNext', () => figure.getElement('nav').nav.nextSlide(true));
  figure.fnMap.add('navPrev', () => figure.getElement('nav').nav.prevSlide());
  figure.fnMap.add('toggleCursor', () => figure.toggleCursor());
  // figure.shortCuts = {
  //   n: 'navNext',
  //   p: 'navPrev',
  //   s: 'toggleCursor',
  // };

  document.addEventListener('keypress', (event) => {
    const keyCode = String.fromCharCode(event.keyCode);
    if (keyCode === 's') {
      figure.toggleCursor();
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

  function playbackStarted() {
    playPauseButton.innerHTML = 'Pause';
    // state.playing = true;
    recordButton.classList.add('f1_recorder__button_disable');
  }

  function playbackStopped() {
    playPauseButton.innerHTML = 'Play';
    // state.playing = false;
    recordButton.classList.remove('f1_recorder__button_disable');
  }

  function recordingStarted() {
    recordButton.innerHTML = 'Pause';
    // state.recording = true;
    playPauseButton.classList.add('f1_recorder__button_disable');
  }

  function recordingStopped() {
    recordButton.innerHTML = 'Record';
    // state.recording = false;
    playPauseButton.classList.remove('f1_recorder__button_disable');
  }

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

  // function getSeekTime() {
  //   const circleBounds = seekCircle.getBoundingClientRect();
  //   const seekBounds = seekContainer.getBoundingClientRect();
  //   const seekWidth = seekBounds.width - circleBounds.width;
  //   const percentX = (circleBounds.left - seekBounds.left) / seekWidth;
  //   return percentX * state.duration;
  // }

  // let seekId = null;
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
    // console.log(lastSeekTime)
    // console.log(seekId)
    // if (seekId == null) {
    //   seekId = figure.subscriptions.add('beforeDraw', () => {
    //     // console.log(lastSeekTime)
    //     const t = performance.now()
    //     recorder.seek(lastSeekTime);
    //     console.log((performance.now() - t) / 1000)
    //     seekId = null;
    //   }, 1);
    // }
    // recorder.seek(time);
    setTime(time);
    // figure.animateNextFrame();
    // setTime(percent * state.duration);
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
  seekContainer.addEventListener('touchstart', e => touchStartHandler(e), supportsPassive() ? { passive: false } : false);
  window.addEventListener('touchend', e => touchEndHandler(e), supportsPassive() ? { passive: false } : false);
  window.addEventListener('touchmove', e => touchMoveHandler(e), supportsPassive() ? { passive: false } : false);

  recorder.subscriptions.add('timeUpdate', t => setTime(t[0]));
  recorder.subscriptions.add('playbackStopped', playbackStopped.bind(this));
  recorder.subscriptions.add('playbackStarted', playbackStarted.bind(this));
  recorder.subscriptions.add('startRecording', recordingStarted.bind(this));
  recorder.subscriptions.add('stopRecording', recordingStopped.bind(this));

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
    if (!(recorder.state === 'recording' && recorder.state === 'idle')) {
      return;
    }
    if (recorder.state === 'recording') {
      recorder.stopRecording();
    } else {
      const currentTime = recorder.getCurrentTime();
      recorder.startRecording(currentTime, ['autoSlide', 'autoCursor', 'autoTouch', 'autoCursorMove', 'autoExec']);
      if (currentTime === 0) {
        recorder.recordEvent('slide', ['goto', 0], 0);
      }
    }
  }

  playPauseButton.onclick = () => togglePlayPause();
  recordButton.onclick = () => toggleRecord();
  saveButton.onclick = () => recorder.save();
  recorder.subscriptions.add('durationUpdated', (d) => { state.duration = d; });

  fetch('states.json')
    .then(response => response.json())
    .then(json => recorder.loadStates(json));

  fetch('events.json')
    .then(response => response.json())
    .then(json => recorder.loadEvents(json));

  recorder.loadAudio(new Audio('./audio.m4a'));
}

setupRecorder();
