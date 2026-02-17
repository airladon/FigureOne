---
title: Interactive Video API
group: Interactive Video
---

# Interactive Video API Reference

## Contents

- [Recorder](#recorder)
- [TypeRecorderTime](#typerecordertime)
- [FunctionMap](#functionmap)

---

## Recorder

The Recorder class provides functionality to record and playback video like
experiences. It can:

- record and playback events, such as function calls, mouse movements, mouse
  clicks and slide navigation - these can either be recorded by a user, or
  programmed for specific times
- overlay an audio track on playback
- record entire figure state at regular intervals (like 1 second) as seek
  frames for the video
- allow a user to pause video at any time and interact with the figure in its
  current state - on resuming playback, the figure will revert to its paused
  state

For performance during recording, a separate javascript worker is used to
parallelize state encoding. Therefore, in addition to the FigureOne library,
a FigureOne worker file will need to be loaded. See the tutorials for
examples on how this is done.

For tutorials and examples of how to use Recorder, see

- <a href="https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2015%20-%20-Recorder%20Introduction/index.html">Tutorial 15 - Recorder Introduction</a>
- [Tutorial 16 - Recording Manual Events](https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2016%20-%20-Recording%20Manual%20Events/index.html)
- [Tutorial 17 - Recording Slides](https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2017%20-%20-Recording%20Slides/index.html)
- [Tutorial 18 - Recording Planned Events](https://github.com/airladon/FigureOne/docs/tutorials/Tutorial%2018%20-%20-Recording%20Planned%20Events/index.html)
- [Trig 1 - Trig Functions](https://github.com/airladon/FigureOne/docs/examples/Trig%201%20-%20Trig%20Functions/index.html)
- [Trig 2 - Names](https://github.com/airladon/FigureOne/docs/examples/Trig%202%20-%20Names/index.html)
- [Trig 3 - Relationships](https://github.com/airladon/FigureOne/docs/examples/Trig%203%20-%20Relationships/index.html)

Notifications - The notification manager property `notifications` will
publish the following events:
- `timeUpdate`: updated at period defined in property `timeUpdates`
- `durationUpdated`: updated whenever audio or video are loaded, or when
   recording goes beyond the current duration
- `audioLoaded`
- `videoLoaded`
- `recordingStarted`
- `recordingStopped`
- `preparingToPlay`
- `playbackStarted`
- `preparingToPause`
- `playbackStopped`
- `seek`
- `recordingStatesComplete` - recording completed and recorded states ready

@class

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">state</span>: <span class="tsd-signature-type">'recording' | 'playing' | 'idle' | 'preparingToPlay' | 'preparingToPause'</span></span></li>
<li><span><span class="tsd-kind-parameter">isAudioPlaying</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a></span></span></li>
<li><span><span class="tsd-kind-parameter">duration</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span><div class="tsd-comment tsd-typography"><p>in seconds</p></div></li>
<li><span><span class="tsd-kind-parameter">stateTimeStep</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span><div class="tsd-comment tsd-typography"><p>in seconds - change this to change the
duration between recorded seek frames</p></div></li>
<li><span><span class="tsd-kind-parameter">timeUpdates</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span><div class="tsd-comment tsd-typography"><p>in seconds - how often to publish the
'timeUpdate' notification</p></div></li>
<li><span><span class="tsd-kind-parameter">notifications</span>: <span class="tsd-signature-type"><a href="../classes/tools.NotificationManager.html" class="tsd-signature-type">NotificationManager</a></span></span><div class="tsd-comment tsd-typography"><p>- use to subscribe to
notifications</p></div></li>
</ul>

---

## TypeRecorderTime

Recorder time format.

`number | string`

Use `number` for number of seconds, or use string with format 'm:s.s' (for
example, '1:23.5' would define 1 minute, 23.5 seconds)

---

## FunctionMap

Function Map

In FigureOne {@link Recorder}, state is saved in stringified javascript
objects. When the state includes a function (like a trigger method in an
animation for example) then that function is referenced in the state object
as a unique string id.

When a geometry is loaded, functions that will be captured in state objects
need to be added to a function map. Both {@link Figure} and
{@link FigureElement} have attached function maps as the property `fnMap`.
Therefore, the method is added to either the figure or element function map,
with an associated unique string id, and that string id is used when the
function is used. For example as defined callbacks, triggerAnimationStep and
customAnimationStep callbacks, or recorder slide definitions (`entryState`,
`steadyState`, `leaveState`, `exec`, `execDelta`).

The funciton map has:
- A map of functions
- A link to a global map of functions (a singleton)
- The ability to execute a function within the map

### Properties

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">global</span>: <span class="tsd-signature-type"><a href="../classes/FunctionMap.FunctionMap.html" class="tsd-signature-type">FunctionMap</a></span></span><div class="tsd-comment tsd-typography"><p>global function map</p></div></li>
<li><span><span class="tsd-kind-parameter">map</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object" class="tsd-signature-type">Object</a></span></span><div class="tsd-comment tsd-typography"><p>local function map where keys are unique identifiers
and values are the associated functions</p></div></li>
</ul>

#### Add a console function to a FunctionMap and execute it with a parameter

```js
figure.fnMap.add('toConsole', s => console.log(s));
figure.fnMap.exec('toConsole', 'hello');
```

---

