# Interactive Video Controls

There are two main sets of controls in two separate files:

* `player.js` - play, pause and seek controls, and time label
* `recorder.js` - record, record states, and save controls

Both files create HTML elements as the UI controls and append them to the DOM. They then tie the controls to [Recorder](https://airladon.github.io/FigureOne/api/#recorder).

Note, `Recorder` maintains state information and sends notifications when state changes. Therefore the UI controls do not contain any state information themselves, but rather subscribe to `Recorder`s notifications and update themselves when the state changes.
### `player.js`

#### Create UI buttons
The first step is to create some HTML elements and append them to the DOM:
```js
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
```
#### Setup Playback button
The play/pause button toggles `Recorder` playing and pausing. When toggled, `Recorder` will send 'playbackStarted' or 'playbackStopped' notifications which are used to remove or add a css class to the button's html element. This class change toggles the button's image between the play and pause symbol.

```js
  // Get reference to recorder
  const { recorder } = figure;

  // Setup play/pause button
  const playPauseButton = document.querySelector('#f1_player__play_pause');
  playPauseButton.onclick = () => recorder.togglePlayback();

  // The play/pause button picture will change on 'playbackStopped' and
  // 'playbackStarted' notifications from the recorder.
  recorder.subscriptions.add(
    'playbackStopped', () => playPauseButton.classList.remove('f1_playing'),
  );
  recorder.subscriptions.add(
    'playbackStarted', () => playPauseButton.classList.add('f1_playing'),
  );
```

#### Add Keyboard Control

Add an event listener to listen for when a user presses the space bar. On press, toggle `Recorder` playback.

```js
  // If the user presses space bar, the play/pause will toggle
  document.addEventListener('keypress', (event) => {
    const keyCode = String.fromCharCode(event.keyCode);
    if (keyCode === ' ') {
      recorder.togglePlayback();
    }
  }, false);
```
#### Time

```js
  // HTML elements used in time and seek logic below
  const timeLabel = document.querySelector('#f1_player__time');
  const seekContainer = document.querySelector('#f1_player__seek');
  const seekCircle = document.querySelector('#f1_player__seek_circle');

  // Format a time value in seconds into a mm:ss string
  function timeToStr(time) {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time - minutes * 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  // Function that sets the circle position of the seek bar, and updates the
  // time text based on some input time
  function setTime(time = recorder.getCurrentTime(), fromRecorder = false) {
    const circleWidth = seekCircle.clientWidth;
    const seekWidth = seekContainer.clientWidth - circleWidth;
    if (recorder.duration === 0) {
      seekCircle.style.left = 0;
    }
    const percentTime = Math.min(time / recorder.duration, 1);
    if (fromRecorder === false || (fromRecorder && recorder.state !== 'idle')) {
      seekCircle.style.left = `${Math.floor(percentTime * seekWidth)}px`;
    }
    timeLabel.innerHTML = `${timeToStr(Math.floor(time))} / ${timeToStr(recorder.duration)}`;
  }

  // On 'timeUpdate' and 'duration' notifications from recorder, update the
  // player seek bar and time label
  recorder.subscriptions.add('timeUpdate', t => setTime(t[0], true));
  recorder.subscriptions.add('durationUpdated', () => setTime());
```

The function `setTime` sets the time in the playback control by updating the seek bar and time label. The function only updates the seekCircle position if the input parameter `fromRecorder` is `false`. This means, whenever the `Recorder` class sends a notification that results in the time being set ('timeUpdate' or 'durationUpdated'), then the seek circle will be set. However, if the circle is being dragged by a user, then only the time label will be updated.

#### Seek

The remainder of the file deals with gestures associated with the user scrubbing the seek time by dragging the seek circle.

The function `touchHandler` is called whenever the seek circle has been moved by the user. It then get's the circle's position and converts it to a percentage of the seek bar width. As the circle may move many times between animation frames, but the figure will only be drawn once per animation frame, then the recorder is only asked to seek to a time when an animation frame is about to be drawn. This means there is a max of one seek call per animation frame.

Finally, the time label is updated.

```js
  let seekId = null;
  let lastSeekTime = 0;
  function touchHandler(x) {
    // Get circle position and convert it to percent of seek container width
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

    // Only ask the recorder to seek when a frame is about to be drawn.
    if (seekId != null) {
      figure.subscriptions.remove('beforeDraw', seekId);
    }
    seekId = figure.subscriptions.add('beforeDraw', () => {
      recorder.seek(lastSeekTime);
      seekId = null;
    }, 1);

    // Update the time label
    setTime(time);
    figure.animateNextFrame();
  }
```

To track when a user moves the seek circle, we need to monitor `mousedown`, `mouseup`, and `mousemove` events (and the equivalent touch events `touchstart`, `touchend` and `touchmove`). Tracking the `mousemove` and `touchmove` events will include all events, so we want to filter them to only include events after a `mousedown` or `touchstart` event on the seek bar and before the next `mouseup` or `touchend` event.

Therefore, we use a `touchDown` flag that is `true` when the seekbar is touched and false after the next `mouseup` or `touchend` event.

The functions that handle these events are then:

```js
// We only want to track mouse or touch movements when the seek bar is being
  // touched. Use touchState flag to track this.
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
```

Finally we add event listeners and point them to these event handlers. The `supportsPassive` function is recomended by chrome which will otherwise throw a warning.

```js
  // Listen for events using the above handlers
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
```

### `recorder.js`

The recorder UI is three buttons:

* Record/Pause - start and stop real time recording
* Record States - scrub through video recording states at regular intervals - used instead of Record/Pause in cases where all events are programmatic and do not need to be recorded in real time. This will scrub through states in a time must faster than real time.
* Save - save the interactive video file in json format. The file will include all events (recorded or programmed) and seek states.

#### Create UI Buttons

Similar to `player.js`, the recorder is a set of HTML elements.

```js
  // Create UI elements and add to DOM
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
```

#### Toggle Recording

Next we setup the logic to toggle recording. We only toggle if recorder state is not 'recording' and not 'idle'.

```js
  const { recorder } = figure;

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
```

#### Buttons

Tie the buttons to `Recorder`:
```js
  // Buttons
  const recordButton = document.querySelector('#f1_recorder__record');
  const recordStatesButton = document.querySelector('#f1_recorder__recordStates');
  const saveButton = document.querySelector('#f1_recorder__save');

  recordButton.onclick = () => toggleRecord();
  recordStatesButton.onclick = () => recorder.startStatesRecording();
  saveButton.onclick = () => recorder.save();
```

#### Button State

Button state is updated from `Recorder` notifications. The play/pause button created in `player.js` is also disabled during recording.

```js
  // Button state is updated from recorder notifications
  function playbackStarted() {
    recordButton.classList.add('f1_player__button_disable');
  }

  function playbackStopped() {
    recordButton.classList.remove('f1_player__button_disable');
  }

  const playPauseButton = document.querySelector('#f1_player__play_pause');
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
```

#### Keyboard Control

Add several useful keyboard shortcuts for quick control during the recording process:

* 'r' - toggles recording
* 'c' - toggles showing the cursor (added by `figure.addCursor()` in `figure.js`)
* space - stops recording

```js
  // Shortcut keys
  document.addEventListener('keypress', (event) => {
    const keyCode = String.fromCharCode(event.keyCode);
    if (keyCode === 'c') {
      figure.toggleCursor();
    } else if (keyCode === ' ' && recorder.state === 'recording') {
      recorder.stopRecording();
    } else if (keyCode === 'r') {
      toggleRecord();
    } else if (figure.shortCuts[keyCode] != null) {
      if (figure.recorder.state === 'recording') {
        figure.recorder.recordEvent('exec', [figure.shortCuts[keyCode]]);
      }
      figure.fnMap.exec(figure.shortCuts[keyCode]);
    }
  }, false);
```

In addition, `figure.shortCuts` is a user defined dictionary of short cuts to different functions to execute. These functions may be animations, pulses or state changes. When these functions are executed, their execution time will be recorded as an event by `recorder`. However, as events are saved in json data in the interactive video data file, the values associated with the shortCut keys in `figure.shortCuts` cannot be function definitions. Instead, they have to be strings that refer to function definitions in the figure's FunctionMap (`figure.fnMap`)

All functions should be defined as a key the figure's [Functionmap](https://airladon.github.io/FigureOne/api/#functionmap) `figure.fnMap` as keys are strings and can thus be recorded in the interactive video data file as a json string.
