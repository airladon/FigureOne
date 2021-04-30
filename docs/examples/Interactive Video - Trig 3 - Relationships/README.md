# Example - Trig 3 - Relationships

Interactive video showing how three similar triangles can be arranged to find many different trigonometric functions. You are encouraged to arrage the triangles yourself to better understand the relationships. Play the video. If you interact with the figure at any time, the video will pause while you do so. When you are ready to continue, press the play button to continue.

### How to view

The example is hosted [here](https://airladon.github.io/FigureOne/examples/Interactive%20Video%20-%20Trig%203%20-%20Relationships/index.html).

If you want to view it locally however, it is important to know that loading local files into a html can be prevented by web browser security settings, this example needs to be loaded from a web server.

You can create a local web server and host the example by first cloning the repository:

```bash
git clone https://github.com/airladon/FigureOne
```

Then, from the repository root, start the development container (you will need to install Docker if you don't have it already):
```bash
./start.sh
```

The container will start and present a command prompt. You can start a http-server by typing:
```bash
http-server
```

You can then open a browser and go to `http://localhost:8080/docs/examples/Interactive%20Video%20-%20Trig%203%20-%20Relationships/index.html`.


![](example.gif)


### Explanation

This FigureOne interactive video is an extension of [tutorial 17](../../tutorials/15%20-%20Recording%20Slides) and [tutorial 18](../../tutorials/15%20-%20Recording%20Slides) as it uses a simple [SlideNavigator](https://airladon.github.io/FigureOne/api/#slidenavigator) to manage predetermined events throughout the video.

### Background
The figure consists of three similar right angle triangles. Each similar triangle has the same angle theta, and a side of unit length in a different position relative to theta. Thus one triangle has a unit side as the hypotenuse, another as the side adjacent to theta, and the third as the side opposite theta.

As the trigonometric functions are constant for all similar triangles, and as each triangle has a unit side in a different position relative to theta, then these triangles can represent all the trigonometric functions. Each triangle represents the two trigonometric functions where the unit side is the denominator of the trigonometric ratio.

For example, the sine is the opposite over the hypotenuse. Therefore the triangle with the hypotenuse unit length side, will have a side opposite theta that is the same length as the sine function value.

Arranging these triangles in different configurations is one way to find relationships between the trigonometric functions.

### Figure Elements

There are several main elements to the figure:
* Three similar triangles whose side lengths represent the trigonometric functions (`triSinCos`, `triTanSec`, `triCotCsc`)
* Buttons that reset or arrange the triangles in one of three preset arrangements (`reset`, `preset1`, `preset2`, `preset3`)
* Two buttons that can show/hide the unit length label and theta label of a selected triangle (`unitButton`, `thetaButton`)
* Two buttons that can fix the hypotenuse and an angle in place for a selected triangle when theta changes (`lockHyp`, `lock`)
* A button that can flip a selected triangle (`flipButton`)
* A button that can hide/show a quarter circle (`arcButton`)
* A widget that can be dragged to change theta of each triangle (`theta`, `rotator`, `angleBackground` )
* A background rectangle that detects if a user touches it. It can only be touched if the user touches the video area but not a triangle. When it is touched, any selected triangle is deselected.

Each triangle can be:
* Selected by touching it
* Moved by dragging it
* Rotated by dragging its corner

Each triangle carries state information with it:
* `angle` - last theta angle of the triangle
* `center` - center position of triangle with default theta
* `lock` - which vertex is locked in place
* `lockHyp` - whether to lock the hypotenuse rotation in place
* `lockPosition` - position of the locked vertex in local space
* `theta` - whether the theta label is visible
* `unit` - whether the unit label is visible
* `x` - length of adjacent side (side along the x axis when tri rotation is 0)
* `y` - length of opposite side (side along the y axis when tri rotation is 0)


The files in this examples are:
* `setup.js` setup figure, define colors line widths and text helper functions
* `equations.js` all equation definitions and functions to pulse equation phrases
* `circle_tri.js` all geometry figure elements and logic related to the circle and right angle triangle comparison
* `lines_definitions.js` all geometry figure elements and logic related where the tangent, secant and chord line names come from
* `slides.js` add slide navigator and slide definitions


### Script
