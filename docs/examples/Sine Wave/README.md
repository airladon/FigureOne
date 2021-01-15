# Example - Sine Wave

See how sine waves and rotation are related with interaction and animation.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Sine%20Wave/index.html).

Rotate the line manually, or press 'fast' or 'slow' to make a sine wave.

![](./example.gif)

## Notes

Most of the time, a figure's elements are drawn to the screen only when something changes. However, because this example has a dynamic signal recording that continuously updates, a draw will be forced on every animation frame. When doing this, be careful to minimize the processing required on each draw. Otherwise on low-end clients, the animations may not be as smooth as desired.

Three figure elements can possibly to change each frame:
- `rotator` - the rotating line
- `sine` - the horizontal line connecting the end of the rotator to the recording
- `signalLine` - the dynamic signal line

`rotator` is a relatively simple primitive element, whose rotational transform changes as it is moved. This is the least expensive element to draw.

The `sine` line is more expensive. Each time the dashed line changes length, its points definition changes. Dashed lines are always more expensive to draw than solid lines. With just a single dashed line in this figure, it will not be a large problem, but if dealing with many dashed lines, some strategies to speed performance are:
- Longer dashes results in fewer dashes, and therefore simpler lines.
- Make a custom dashed line object that calculates and draws the longest dashed line needed, then each frame just select the number of dashes to draw. The tradeoff with this is partial dashes will not be drawn for intermediate lengths.

The most expensive calculation and drawing operation is the `signalLine`. For simplicity, each frame generates the signal trace from scratch. The main strategy in the example to keep calculation time down is to use the `simple: true` property of the `polyline`. This is useful for thin traces with many points as it doesn't spend time calculating corner intersections of each line segment of the trace. This corner intersections are important for thick lines with relatively few points, but they are invisible otherwise.
