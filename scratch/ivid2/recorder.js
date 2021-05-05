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
  // const cursor = figure.getElement('cursor');
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

  figure.fnMap.add('navNext', () => figure.getElement('nav').nav.nextSlide());
  figure.fnMap.add('navPrev', () => figure.getElement('nav').nav.prevSlide());
  figure.fnMap.add('toggleCursor', () => figure.toggleCursor());
  // figure.shortcuts = {
  //   n: 'navNext',
  //   p: 'navPrev',
  //   s: 'toggleCursor',
  // };

  document.addEventListener('keypress', (event) => {
    const keyCode = String.fromCharCode(event.keyCode);
    if (keyCode === 's') {
      figure.toggleCursor();
    } else if (keyCode === 'n') {
      figure.getElement('nav').nav.nextSlide();
    } else if (keyCode === 'p') {
      figure.getElement('nav').nav.prevSlide();
    } else if (figure.shortcuts[keyCode] != null) {
      if (figure.recorder.state === 'recording') {
        figure.recorder.recordEvent('exec', [figure.shortcuts[keyCode]]);
      }
      figure.fnMap.exec(figure.shortcuts[keyCode]);
    }
  }, false);

  function playbackStarted() {
    playPauseButton.innerHTML = 'Pause';
    state.playing = true;
    recordButton.classList.add('f1_recorder__button_disable');
  }

  function playbackStopped() {
    playPauseButton.innerHTML = 'Play';
    state.playing = false;
    recordButton.classList.remove('f1_recorder__button_disable');
  }

  function recordingStarted() {
    recordButton.innerHTML = 'Pause';
    state.recording = true;
    playPauseButton.classList.add('f1_recorder__button_disable');
  }

  function recordingStopped() {
    recordButton.innerHTML = 'Record';
    state.recording = false;
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
    recorder.seek(time);
    setTime(time);
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

  function endHandler() { state.touch = 'up'; }
  function mouseUpHandler() { endHandler(); }
  function touchEndHandler() { endHandler(); }

  seekContainer.addEventListener('mousedown', e => mouseDownHandler(e), false);
  window.addEventListener('mouseup', e => mouseUpHandler(e), false);
  window.addEventListener('mousemove', e => mouseMoveHandler(e), false);
  // docume.addEventListener('mouseleave', this.mouseUpHandler.bind(this), false);
  seekContainer.addEventListener('touchstart', e => touchStartHandler(e), supportsPassive() ? { passive: false } : false);
  window.addEventListener('touchend', e => touchEndHandler(e), supportsPassive() ? { passive: false } : false);
  window.addEventListener('touchmove', e => touchMoveHandler(e), supportsPassive() ? { passive: false } : false);

  recorder.notifications.add('timeUpdate', t => setTime(t[0]));
  recorder.notifications.add('playbackStopped', playbackStopped.bind(this));
  recorder.notifications.add('playbackStarted', playbackStarted.bind(this));
  recorder.notifications.add('recordingStarted', recordingStarted.bind(this));
  recorder.notifications.add('recordingStopped', recordingStopped.bind(this));

  function togglePlayPause() {
    if (state.recording) {
      return;
    }
    if (state.playing) {
      recorder.pausePlayback();
    } else {
      recorder.resumePlayback();
      // console.log(figure.elements._eqn._bowstring.animations.animations[0])
      // console.log(
      //   figure.elements._eqn._bowstring.animations.animations[0].startTime,
      //   figure.elements._eqn._bowstring.animations.animations[0].steps[0].startTime,
      //   figure.elements._eqn._bowstring.animations.animations[0].steps[1].startTime,
      //   performance.now() / 1000 - figure.elements._eqn._bowstring.animations.animations[0].startTime,
      // )
    }
  }

  function toggleRecord() {
    if (state.playing) {
      return;
    }
    if (state.recording) {
      recorder.stopRecording();
    } else {
      const currentTime = recorder.getCurrentTime();
      recorder.startRecording(0);
      if (currentTime === 0) {
        recorder.recordEvent('slide', ['goto', 0], 0);
      }
    }
  }

  playPauseButton.onclick = () => togglePlayPause();
  recordButton.onclick = () => toggleRecord();
  saveButton.onclick = () => recorder.save();
  recorder.notifications.add('durationUpdated', (d) => { state.duration = d; });

  // fetch('states.json')
  //   .then(response => response.json())
  //   .then(json => recorder.loadStates(json));

  // fetch('events.json')
  //   .then(response => response.json())
  //   .then(json => recorder.loadEvents(json));

  // recorder.loadAudioTrack(new Audio('./audio.m4a'));
}

setupRecorder();
