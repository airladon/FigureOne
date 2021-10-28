# Example - Mandelbrot Set

Demonstrator on using shaders and zoom and pan gestures to explore the Mandelbrot set.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Mandelbrot/index.html).

![](./example.gif)

## Notes

A shader is used to render colors to values in the complex plane. Colors are black if they are in the Mandelbrot set, and otherwise colored proportional to the number of iterations it took to determine they were not. A gesture primitive is used to capture pan and zoom gestures so the complex plane can be explored.
