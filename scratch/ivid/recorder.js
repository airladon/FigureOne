/* globals figure */
function setupRecorder() {
  const playPauseButton = document.querySelector('#f1_recorder__play_pause');
  const recordButton = document.querySelector('#f1_recorder__record');
  const saveButton = document.querySelector('#f1_recorder__save');
  const cursor = figure.getElement('cursor');
  const { recorder } = figure;

  const state = {
    playing: false,
    time: 0,
    recording: false,
  };

  document.addEventListener('keypress', (event) => {
    if (String.fromCharCode(event.keyCode) === 's') {
      figure.toggleCursor();
    }
  }, false);

  function play() {
    playPauseButton.innerHTML = 'Pause';
    state.playing = true;
    recordButton.classList.add('f1_recorder__button_disable');
    console.log(recorder)
    recorder.startPlayback(0);
  }

  function pause() {
    playPauseButton.innerHTML = 'Play';
    state.playing = false;
    recordButton.classList.remove('f1_recorder__button_disable');
    recorder.pausePlayback();
  }

  function startRecording() {
    recordButton.innerHTML = 'Pause';
    state.recording = true;
    playPauseButton.classList.add('f1_recorder__button_disable');
    recorder.startRecording(0);
  }

  function stopRecording() {
    recordButton.innerHTML = 'Record';
    state.recording = false;
    playPauseButton.classList.remove('f1_recorder__button_disable');
    recorder.stopRecording();
  }

  function togglePlayPause() {
    if (state.recording) {
      return;
    }
    if (state.playing) {
      pause();
    } else {
      play();
    }
  }

  function toggleRecord() {
    if (state.playing) {
      return;
    }
    if (state.recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  playPauseButton.onclick = () => togglePlayPause();
  recordButton.onclick = () => toggleRecord();
  saveButton.onclick = () => recorder.save();

  fetch('states.json')
    .then(response => response.json())
    .then(json => recorder.loadStates(json));

  fetch('events.json')
    .then(response => response.json())
    .then(json => recorder.loadEvents(json));
}

setupRecorder();
