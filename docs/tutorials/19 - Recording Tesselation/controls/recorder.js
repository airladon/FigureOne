/* globals figure */
/* eslint-disable no-empty, object-shorthand, func-names, getter-return */
function addRecorder() {
  const recorderElement = document.createElement('div');
  recorderElement.innerHTML = `
  <div class="comment_out_to_show_recorder">
      <div id='f1_recorder' >
          <div id='f1_recorder__record' class="f1_player__button f1_recorder__button">Record</div>
          <div id='f1_recorder__recordStates' class="f1_player__button f1_recorder__button">Record States</div>
          <div id='f1_recorder__save' class="f1_player__button f1_recorder__button">Save</div>
      </div>
  </div>
  `;
  document.body.appendChild(recorderElement);
  const { recorder } = figure;

  // Buttons
  const playPauseButton = document.querySelector('#f1_player__play_pause');
  const recordButton = document.querySelector('#f1_recorder__record');
  const recordStatesButton = document.querySelector('#f1_recorder__recordStates');
  const saveButton = document.querySelector('#f1_recorder__save');

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

  // playPauseButton.onclick = () => togglePlayPause();
  recordButton.onclick = () => toggleRecord();
  recordStatesButton.onclick = () => recorder.startStatesRecording();
  saveButton.onclick = () => recorder.save();

  // Button state is updated from recorder subscriptions
  function playbackStarted() {
    recordButton.classList.add('f1_player__button_disable');
  }

  function playbackStopped() {
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
  recorder.subscriptions.add('recordingStarted', recordingStarted.bind(this));
  recorder.subscriptions.add('recordingStopped', recordingStopped.bind(this));

  // Shortcut keys
  document.addEventListener('keypress', (event) => {
    const keyCode = String.fromCharCode(event.keyCode);
    if (keyCode === 'c') {
      figure.toggleCursor();
    } else if (keyCode === ' ' && recorder.state === 'recording') {
      recorder.stopRecording();
    } else if (keyCode === 'r') {
      toggleRecord();
    } else if (figure.shortcuts[keyCode] != null) {
      if (figure.recorder.state === 'recording') {
        figure.recorder.recordEvent('exec', [figure.shortcuts[keyCode]]);
      }
      figure.fnMap.exec(figure.shortcuts[keyCode]);
    }
  }, false);
}

addRecorder();
