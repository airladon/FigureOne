# Example - Travelling Wave 03 - Velocity Frequency Wavelength

This is part 3 of the Travelling Waves examples.

This example is a slides based example showing:
* A sine wave disturbance in time causes a sine wave distributed in space
* Why the relationship between freqeuency, wavelength and velocity is v = lf

Most diagrams are interactive, and most colored text is interactive.

This example doesn't introduce new concepts compared to the other examples, but it is significantly more complexity in figure logic, equations and slides.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Traveling%20Wave%2003%20-%20Velocity%20Frequency%20Wavelength/index.html).

![](./example.gif)

## Explanation

This is a large example (70 slides), and as such is split into numerous files to make it easier to consume. As such, it would be better to review the tutorials and some of the simpler examples first before this example.

The example is split into several files:
* `timekeeper.js` - a global timer used for all animations that allows for time freezing and slow motion
* `recorder.js` - a data structure that records a signal over time
* `layout.js` - all figure elements and element logic defined
* `equations.js` - all equation related helper function, phrase and form definitions
* `slides.js` - slide definitions

Splitting files like this would not necessarily be best practice for production. Using a bundler (like webpack), to combine them into a single file would reduce load time for clients as few files need to be downloaded.

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

#### Equations

There are 31 different equation forms (made from 56 phrases) shown. As a consequence, it is hard to read linearly, but easier to read starting at the form name, and then drilling down into the phrases and elements that make it up.

#### Slides

While there are 70 unique slides defined, there is some overlap as some slides are just transitioning between equation forms. For instance, there are "only" 40 slides with unique text descriptions.

Each text description is usually one sentence (sometimes two). The trade-off between displaying more text and less slides, or more slides with less text is one that will be different for different scenarios.

Most of the slides are simply text description changes, equation form changes, or changes in what is being shown in the figure. Common properties like `scenarioCommon`, `steadStateCommon` and `enterStateCommon` are used at every opportunity to help make each slide definition just a difference compared to the last slide, rather than a complete redefinition of everythin.

## Caveats

This example is primarily used to demonstrate FigureOne. However, it is also trying to show an intuitive wave to understand the relationship between freqeuency, velocity and wavelength of traveling sine waves.

For the interested reader, there are a few more things to note to put the content of this example in context.

### Common Traveling Sine Wave Equation

In this example, a sine wave travelling in the positive direction is considered. The equation used to described it in space and time is:

y(x,t) = sin(wt - kx)   - (1)

Where k = 2π/lambda

In many texts, a slightly different equation is stated:

y(x,t) = sin(kx - wt)   - (2)

Both equations describe a travelling sine wave, but they have different phases (π).

The difference comes from where they are derived from.

Equation (2) usually starts with a known sine spatial distribution (instead of a disturbance in time):

y(x, t0) = sin(kx)

From this, a right traveling wave is simply a right shifted equation:

y(x - x', t0) = sin(k(x-x'))

As x' = vt0, it simplifies to (2)

y(x, t) = sin(kx - wt)

Now, if we use (2) to look at the disturbance as a function of time at a fixed x we see:

y(x0, t) = sin(const - wt)

Meaning we essentially have a sin(-wt) function.

If we use this as our initial disturbance in the same process as deriving (1), then we arrive at (2).

So both (1) and (2) both are valid solutions to the wave equation, but they are different because the time dependent disturbance is different.

### Medium vs Field Propagation Velocity

The difference between propagation velocity in mediums and fields can be a little confusing.

For instance, sound travels faster in solid objects that in air, thus its wavelength is longer in solids. In comparison, electromagnetic fields travel slower in solid objects compared to air, and have shorter wavelengths.

In the case of a medium, the wave is propagated by the medium. It's velocity is a function of the physical characteristic of the medium and how tightly coupled the molecues within it are relative to the type of wave travelling through it (e.g. pressure wave vs temperature wave).

In comparison, a field (like the electromagnetic field) exists everywhere. When it exists in a medium, the medium will slow the propagation of a disturbance in the field (photon). The medium does not propagate the wave, but it does interact with the field to slow it down.

So for both fields and mediums, a faster velocity results in a longer wavelength. However for field waves, a more dense medium may slow down propagation relative to a less dense medium, whereas the same medium might speed propagation for a pressure wave compared with the same less dense medium.
