# Example - Holiday Equation

Simplify the equation to it's final form.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Holiday%20Equation/index.html).

![](./example.gif)

## Notes
This example is an equation with many forms that can be navigated through.

The code is split into two main areas:

* Define equation (and its many forms)
* Define the slides (equation forms and corresponding descriptions)

### Equation

Most of the code in the initial section defines the many equation symbols and forms.

Several helper functions are defined initially for top comments, strikes and superscripts to make the equation forms as short as possible. In addition many reused equation phrases are defined to help make the final forms more readable.

Finally, a slide navigator is added that provides buttons and a description to navigate through the equations forms. The only customization done to the navigator is positions of the different elements.

### Slides

The second part of the example defines a number of slides for the [slideNavigator](https://airladon.github.io/FigureOne/api/#slidenavigator to navigate through. Each slide has an associated description and equation form.

The descriptions are all [TextLines](https://airladon.github.io/FigureOne/api/#obj_textlines) objects, which uses modifiers to format specific words or phrases. As several of the modifiers are used on multiple slides, all the modifiers are defined once, and then made available to all slides.

For most slides, the progression has descriptions preceding changes in equation form. When the next button is pressed, the description will say what will happen next, and then subsequent touches will animate the equation to the correspdongind forms.
