With FigureOne, you can create a figure that can be both interactive and animated. 

Using <a href="#slidenavigator">SlideNavigator</a> you can create a story with the figure by progressing the figure through numerous states. These states are like the slides of a presentation, where the user typically progresses through them at their convenience. Each slide can be animated and interactive, making for an immersive experience

The evolution of this is interactive video, enabled by the <a href="#recorder">Recorder</a> class. For something to be video-like, it needs to have visual content, audio, and the ability to play, pause, stop and seek. The recorder class can:

* record and playback events, such as function calls, mouse movements, mouse clicks and slide navigation - these can either be recorded by a user, or planned for specific times
* overlay an audio track on playback
* record entire figure state at regular intervals (default 1s) as seek frames for the video
* allow user to pause video at any time and interact with the figure in its current state - on resuming playback, the figure will revert to its paused state

As such, the animation in FigureOne can be overlaid with audio to create a video like experience. Except in this case, content on the screen can be just as rich and interactive as that created normally with FigureOne.

#### State, Seeking and Pausing

Video seeking and pausing is enabled by recording and setting figure state.

A FigureOne diagram may contain numerous <a href="#figureelement">FigureElement</a>s arranged in a hierarchy of collections that group elements.

Each <a href="#figureelement">FigureElement</a> has properties that define how it behaves and is displayed, such as its visibility, color, transform, current or pending animations, and its behavior when touched or moved. These properties change over time, such as with animations and interactive actions from the user. We use the term 'state' to describe a snapshot of these property values at some instant in time. As such, individual FigureElements can have a state, and the state of all elements together is called the Figure state.

<a href="#slidenavigator">SlideNavigator</a> is essentially a Figure state manager. Each slide fully defines the state of a figure, and is independent of the current figure state. Therefore if you go to a specific slide, the Figure will always be set to the same state, no matter what it was beforehand.

Part of creating a FigureOne interactive video, is to record figure state at regular intervals. These states are the seek frames. As a user is scrubbing through a video with the seek bar, the figure will be set into the state closest to the seek time. When play is pressed, the video will resume from this state.

Video pausing can happen at any time. Therefore, on pause, the figure state is captured and saved. If the figure is interacted with, and its state changes, then when play is resumed the pause state will be reloaded and playback will resume.

#### Simple video
#### Events

Videos often tell a story, where it is desirable for the picture on the screen to change with

#### Advantages compared to Traditional Video

##### Interactivity

FigureOne videos can be made to be interactive. FigureOne elements, be they shapes, text or equations can all be made interactive and so video-like experiences can be made that are similarly interactive.

Some examples of how this could be used are:

* Allow users to manipulate a diagram to help solidfy a concept being explained midway through a video
* Allow users to explore and reformat presented data and/or plots
* Allow feedback from users directly in the video, like with embedded quizzes
* Allow users to discover concepts by providing interative tools, showing them how to experiment with the tools to discover some concept, and giving them hints along the way


##### File Size and Resolution

Similar to traditional videos, FigureOne interactive videos have a video and an audio track.

The audio track of both traditional and interactive video is similar, and has the same size vs quality trade-offs. For podcast like quality, a 64kbps mp3 file might be approximately 0.5MB/minute.

The video track is different.

A traditional video track needs to store information for each pixel on each frame of the video. While significant compression is achieved in modern video, video file sizes are still considerable. For 1080p video at 30 fps it may take upwards of 20MB/minute, and for 4k video upwards of 90MB/minute. Traditional video is both resolution and frame rate dependent. As such, videos are often encoded with multiple resolutions for efficient deployment to clients with different screen resolutions and bandwidth capabilities.

In comparison, a FigureOne interactive video needs to store just the information of the figure elements on the screen, and how they are animating. This information can be stored as zipped json data, and is small. It is neither resolution nor frame rate dependant. For example, the video data of example [Trig 2 - Names](https://github.com/airladon/FigureOne/docs/examples/trig%202%20-%20-Names/index.html) is just 64kB for 4:27 minutes of video. Compared with what might be closer to 90MB for 1080p, this is a 1500x saving. In this case, the audio is the largest component of the video package at 2.1MB.

Thus, you might say that FigureOne interactive video is video for the size of an audio file.

A helpful analogy comparing traditional video to FigureOne interactive video is that of a bitmap image file (traditional video) to vector image file (FigureOne interactive video).

#### Disadvantages compared to Traditional Video

##### Creation Complexity

A FigureOne interactive video is created using javascript code. Though much can be simplified down to json like objects, it is still useful to have some programming experience.

In comparison, traditional videos can be created by a broader range of people with relatively easy to use equipment and video editing software.

##### Content Complexity

The complexity of the video content (number of different colored pixels and how often they change) on a traditional video impacts the size of the video, but has less impact on the final performance of displaying the video on the client device. Most client devices have significant optization at the OS and sometimes hardware level to make playing video fast and smooth.

FigureOne interactive video is not a standard, and its performance is limited by the client device's browser performance. On each video frame, FigureOne needs to calculate the video state and render it to the screen. To achive relatively smooth video, FigureOne needs to be using less than 20ms to do this.

FigureOne uses WebGL for hardware accelarated graphics performance and so complex figures with lots vertices and animations can be created to perform well (>25 fps) on low end, or old client devices. However, if a figure contains hundreds of different elements, all shown and moving at the same time, then care needs to be taken to optimize the video for performance. As the content complexity increases significantly, the creation complexity increases to keep performance acceptable.

##### Full Screen Behavior in Safari

FigureOne is a javascript library that can be used in the browser, or in app frameworks that support javascript modules.

On iOS devices, Safari allows traditional video content to fully cover the screen (without menu bars) in landscape mode. This isn't available for other web content, and so for FigureOne to emulate a video experience in the browser then either the video height needs to be reduced, or the top portion of the video should have limited interactivity (as touching the top of the screen in landscape can show the menus).

