# Example - Sine Limit

Rotate the blue line and observe how the vertical line and arc lengths become more similar as the angle reduces. Then press the "Next" button to build up the equation that describes this.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Sine%20Limit/index.html).

![](./example.gif)

## Notes

The code is split into four main areas:

* Define shapes
* Define equation and its forms
* Setup slides
* Setup the updating function and initialize

The shapes 

### Define shapes

A number of shapes need to be setup including:

* A radius line to move and change the angle with 
* The angle
* An arc
* A line representing the sine of the angle


Each of the shapes is customized for this particular example and so many properties are used in each definition.

### Define Equation

To build the equation up, 8 forms are used. To make the code more succinct and readable, two stratergies are employed:

* Define helper functions for bottom comments, fractions and containers
* Uses phrases to reduce the length of the forms

A SlideNavigator collection element is then setup at the end with previous and next buttons, as well as a description element.

### Slides

The documentation for FigureOne's [slideNavigator](https://airladon.github.io/FigureOne/api/#slidenavigator) introduces the concept.

>>>It is sometimes useful to break down a visualization into easier to consume parts.

>>>For example, a complex figure or concept can be made easier if built up from a simple begining. Each step along the way might change the elements within the figure, or the form of an equation, and be accompanied by a corresponding description giving context, reasoning or next steps.

>>>An analogy to this is a story or presentation, where each step along the way is a presentation slide.

>>>This class is a simple slide navigator, providing a convenient way to define slides and step through them.

>>>To build up the story on why the sine of an angle is approximately equal to the angle for small angles, a series of equation forms and descriptions are used. Each form and description is put into a set of slides.

This example has descriptions with many interactive words. As each interactive word requires a description modifier (definition of a color, onClick functionality and touch border), half of the code is spent just setting these up (the `modifiersCommon` object).

The slides are then defined. This slides are relatively simple, mostly defining the descriptions and equation forms.

### Update and Initialize

Each time the radius line rotation changes several elements need to be updated:
- Sine line length and position
- Angle
- Arc

Finally, an initial rotation for the radius line is setup.