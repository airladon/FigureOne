# Example - Travelling Wave 03 - Velocity Frequency Wavelength

This is part 3 of the Travelling Waves examples.

This example is a slides based example showing:
* A sine wave disturbance in time causes a sine wave distributed in space
* Why the relationship between freqeuency, wavelength and velocity is v = lf

Most diagrams are interactive, and most colored text is interactive.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Traveling%20Wave%2003%20-%20Velocity%20Frequency%20Wavelength/index.html).

![](./example.gif)

## Explanation

This is a large example (70 slides), and as such is split into numerous files to make it easier to consume. Nevertheless, it would be better to review the tutorials and some of the simpler examples first before this example.

The example is split into several files:
* `timekeeper.js` - a global timer used for all animations that allows for time freezing and slow motion
* `recorder.js` - a data structure that records a signal over time
* `layout.js` - all figure elements and element logic defined
* `equations.js` - all equation related helper function, phrase and form definitions
* `slides.js` - slide definitions

### Time Keeper
TimeKeeper doesn't use FigureOne, and is simply a helper function for this example.

TimeKeeper keeps track of time. It allows for time to be sped up, slowed down, paused and unpaused.

Animations are tied to it so they can also be sped up, slowed down and paused.

### Recorder

This example lets a user create a disturbance at a point in a medium. The disturbance is a displacement over time.

Recorder is used to record the displacement changes over time. It records at a fixed sampling rate, and interpolates samples if recorded values come in at a slower rate.

`getRecording` and `getValueAtTimeAgo` can be used to extract either the entire recording, or just the value saved at some time respectively.

Recorder also does not use FigureOne, and so like TimeKeeper is just a helper function for this example.

### Layout

There are a lot of figure elements within this example, and so a file is dedicated to just defining those figure elements, as well as the logic and animations that make them interactive.

#### Medium Simulation

The main figure element collection in the example is a simulation of a medium. The medium consists of x and y axes, and a string of particles distriubted along the x axis. When the first particle is displaced in y, the displacement disturbance propagates through the remainder of the particles in the medium.

The first particle can be disturbed by:
* user touching and dragging
* using the defined `pulse` disturbance
* using the defined `sineWave` disturbance
* using the defined `assymetricPulse` disturbance

All four ways move the first particle. The movement gets recorded in `Recorder` and then over time, each animation frame updates all the particles by calculating their disturbance from the initial disturbance and how long it takes to get there from the medium properties.

If the first particle hasn't been disturbed for a period of time, then a `pulse` disturbance will be automatically started to keep the diagram dynamic.

There are three mediums used in the example. `medium` extends the width of the slide, and is used most frequently. `medium1` and `medium2` are smaller verions that are placed vertically next to each other so waves traveling in mediums with different properties can be compared.

#### Time Plot

Time plots are used to show the displacement of the first particle over time. Two time plots are placed vertically next to `medium1` and `medium2` to show the respective first particles. Each time plot attaches to the recorder of each medium recording the displacement of the first particle over time, and then plots it out.

