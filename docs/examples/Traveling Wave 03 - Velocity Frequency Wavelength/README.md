# Example - Travelling Wave 03 - Velocity Frequency Wavelength

This is part 3 of the Travelling Waves examples.

This example is a slides based example showing:
* A sine wave disturbance in time causes a sine wave distributed in space
* Why the relationship between freqeuency, wavelength and velocity is v = lf

Most diagrams are interactive, and most colored text is interactive.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Traveling%20Wave%2003%20-%20Velocity%20Frequency%20Wavelength/index.html).

![](./example.gif)

## Explanation

This is a large example, and as such is split into numerous files to make it easier to consume. Nevertheless, it would be better to review the tutorials and some of the simpler examples first before this example.

The example is split into several files:
* `recorder.js` - a data structure that handles recording a signal over time
* `timekeeper.js` - a global timer used for all animations that allows for time freezing and slow motion
* `layout.js` - all figure elements and element logic defined