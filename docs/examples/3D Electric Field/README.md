# Example - Electric Field

Demonstrator of how shaders can be used to animate over 1000 elements simultaneously and still get excellent performance on low end clients.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Electric%20Field/index.html).

![](./example.gif)

## Notes

This example allows the user to cycle through different charge distributions, or interactively create their own charge distribution. As the charges move, the resulting electric field is updated in real time.

This example has 961 arrows and 20 charges all of which can animate simultaneously (where each charge is a collection of 4 primitive elements).

To ensure good performance on all devices, the arrows are all combined into one FigureElement and a custom vertex shader is used to compute and then rotate and scale each arrow on each draw frame.

As a result, a low end 2016 Chromebook can run this example and consistently draw over 20 frames per second.
