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


The files in this examples are:
* `setup.js` setup figure, define colors line widths and text helper functions
* `equations.js` all equation definitions and functions to pulse equation phrases
* `geometry.js` all geometry figure elements and logic related to the triangles and buttons
* `slides.js` add slide navigator and slide definitions


### Script

In the last video, we *named* the trigonometric functions using three similar. We will now use these triangles to find some *relationships* between the trigonometric functions.

This video is interactive, which means when you see me interacting with an element on the screen, then you can to. When you do so, the video will pause, so press play when you're ready to continue.

Now, for our first relationships we can recognize that as each triangle is a right angle triangle, then each triangle's sides can be related using pythagorus. So for the sin triangle, the square of the hyptoneuse is the sum of the squares of the sine and cosine. And similarly we can find the relationship between the tan, sec and one, and the cot, csc and one.

Next, as all of these triangles share the same angles and are thus similar, we know their corresponding side ratios are equal. Therefore if we consider the ratio of opposite over adjacent for each triangle, we see it is the sine over the cose for the first triangle, the tan over 1 or just the tan for the second triangle and one over the cot for the third. We can do a similar exercise for the hypotenuse over adjacent ratio, the hypotenuse over opposite ratio and any of the other combinations.

Now, let's start making some geometries with these triangles.

We can move the triangles by dragging them, and rotate them by dragging the corners. We can flip them by pressing the flip button, and reset everything by pressing the reset button. The remaining buttons will be explained as they come up, but you can interact with this diagram anytime you choose and explore them yourself if you wish.

Let's start by aligning the theta angle of all of our triangles, and removing the unit labels on the sin and tan triangle to keep things a bit cleaner. Let's now add a quarter unit circle template, and align that with theta, and now when we change the angle theta by draggin the bottom angle icon here, we can see how the trigonometric functions change relative to each other, and a circle.

For instance, you might see how the sine and cosine triangle follows the circle arc. Now, if this isn't clear, you can change it to make it clearer. In this case we can move away the cot and tan triangles, to focus just on the sin triangle and more clearly see how it follows the circle and thus allow us to say the cosine and sine functions are the x and y coordinates of the circle.

To bring our geometry back now, we can press the preset 1 button.

The next thing we might note is how as we make theta smaller, the sine, tan and arc length all become more similar.

To make this even clearer, lets remove the cot triangle, flip the sin triangle and tie it's right angle to be locked in position as theta changes. And now maybe we can more clearly see this relationship, which ends up being a limit that is often used in mathematics.

Back to our geometry now, and this isn't the only way you can arrange these triangles. Different ways may make more sense for different people and trigger different insights into how the functions are related. Try moving, rotating and flipping the triangles, while locking different angles and sides to see different geometries that relate the trigonometric functions. So for example, let's take the cot triangle and rotate it, then lock its complementary angle.

This geometry has much of the same information as the first, but maybe it's a little cleaner than the first as the cot and cos are now separated. If you modifiy this and want to come back to it, then it is the number 2 preset.

Finally, let's see one more geometry by flipping and rotating the tan triangle so that the sec line is along the x axis. Here we will lock the triangle's hypotenuse in place. We also flip the cot triangle, and align the csc line with the y axis, then lock the hypotenuse and we have a geometry where all the unit lengths are aligned on top of each other.

As we adjust the angle theta, the tan and cot lines form a tangent line the subtends the entire quadrant. Together with the csc and sec lines they form a right angle triangle, and so we can relate these with pythagorus too.

This geometry is stored in preset 3.

I encourage you to try out different geometries. Try aligning different sides next to each other and see how they change with respect to each other directly, or try aligning or juxtaposing different angles, or try looking at just two triangles instead of three. There are many things you can try, and playing around with the different geometries will give you different insights into what the trigonometric functions are and how they are related.




