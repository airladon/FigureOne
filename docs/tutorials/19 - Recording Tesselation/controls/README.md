### Controls
#### Player

For playback of videos, the player control uses several of `Recorder` key methods:

* `togglePlayback()` - starts and stops playback
* `seek(time)`
* `getCurrentTime()` - seek or current playback position of video

properties:
* `state` - can be `'recording' | 'playing' | 'idle' | 'preparingToPlay' | 'preparingToPause'`, 
* `duration`

and notifications:
* `'playbackStarted'`
* `'playbackStopped'`
* `'timeUpdate'` - published every ~100ms, and on seek changes
* `'durationUpdated'` - published after the audio is loaded, and after data file is loaded

The recorder methods `togglePlayback` and `seek` will change the recorder state and current time respectively. When these change, the `'playbackStarted'`, `'playbackStopped'`, and `'timeUpdate'` notifications will be sent.

Therefore the player's job is:
* Send playback and seek commands to the recorder
* Update its own UI (play/pause button, time label and seek position) based on notifications from the recorder.

So for example, the when the playPauseButton is clicked, it will toggle the recorder playback
```js
  // Setup play/pause button
  const playPauseButton = document.querySelector('#f1_player__play_pause');
  playPauseButton.onclick = () => recorder.togglePlayback();
```

The icon of the playpause button is a image defined in `controls.css`:
```css
.f1_paused {
  background-image: url('./play.svg');
}
.f1_playing {
  background-image: url('./pause.svg');
}
```

By default the html element has the `.f1_paused` class. If 
```js
  // The play/pause button picture will change on 'playbackStopped' and
  // 'playbackStarted' notifications from the recorder.
  recorder.subscriptions.add(
    'playbackStopped', () => playPauseButton.classList.remove('f1_playing'),
  );
  recorder.subscriptions.add(
    'playbackStarted', () => playPauseButton.classList.add('f1_playing'),
  );
```
