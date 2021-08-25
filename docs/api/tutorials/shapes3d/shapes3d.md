3D shapes can be drawn, animated and interacted with in FigureOne.

FigureOne tries to simplify the process for using 3D as much as possible. In fact, a number of simple shapes like cubes, spheres and surfaces can be created similarly to shapes in 2D.

However, there are a number of concepts that are useful to know when dealing with 3D that are not needed for 2D. These concepts are especially useful if customizing shapes, or if creating your own.

#### Scene

In FigureOne we create some shapes in space. The `Scene` then defines how we present those shapes to the user.

A good analogy is a camera:
* A camera captures a picture of some space
* The camera's position in space, where it is pointing, its orientation (e.g. portrait, landscape), and its zoom settings define the expanse of space that is captured in the picture
* The scene would then be these various camera properties

In fact, in 3D we will use camera as a property to define some of these properties

##### Two Dimensions

In 2D, the Scene options are relatively limited:
* The shapes are in the x-y plane
* The camera will always be above the x-y plane (in the +z direction) looking down at the x-y plane
* The camera has only one orientation: `left`/`right` is along the x axis and `bottom`/`top` is along the y axis where `left` and `bottom` are always more negative on their respective axes
* The expanse of space captured is defined with the `left`, `right`, `bottom`, and `top` properties

In other words, the `left`, `right`, `bottom`, and `top` properties completely define what space the figure shows. They also effectively define the aspect ratio of the space. So if the figure is drawn in a <div> element that is a square, then (`right` - `left`) should equal (`top` - `bottom`) for 1 unit in either x or y to be the same number of pixels on the screen. Similarly, if the <div> element is 2000 pixels wide by 1000 pixels high then (`right` - `left`) should be double (`top` - `bottom`).

##### Three Dimensions

The depth of 3D raises two questions:
* How should we deal with distances further from the observer?
* How do we convey to a user than an object has depth?

In real life, we see things get smaller as they get further away. But in technical drawings, it is often useful to keep things the same size (independent of proximity to the observer) as this can accurately convey a shape's dimensions and proportions.

Thus we need to define how we project 3D shapes onto a 2D screen:
* *perspective projection* - shapes get smaller the further they are away from the observer
* *orthographic projection* - shapes size is the same at all distances to the observer

![](./projection.png)

Our second question is then one of light. A red 3D sphere looks just like a flat circle, unless there is a light that makes some portions of it more bright than other portions.



In 3D then:
* The shapes are in x-y-z space
* The projection is defined with the `type` property (can be either `orthographic` of `perspective`)
* The camera position, where it is pointing and its orientation can be defined with the `camera` property
* The expanse of space captured is defined with `left`, `right`, `bottom`, `top`, `near` and `far` properties if we are using an *orthographic projection*, and `fieldOfView`, `aspectRatio`, `near` and `far` if we are using a *perspective projection*.
* The lighting is defined with the `light` property



Thus, after you create 

In 2D, the shapes are positioned in x-y space. The scene is defined by looking at the XY plane (from the positive z axis), and limiting the expanse of visible x-y space with the `left` (minimum x), `right` (maximum x), `top` (maximum y), and `bottom` (minimum y) properties. Any shape (or portion of a shape) outside these limits will be clipped and not shown. Using these limits you can view any portion of x-y space, and you can set the aspect ratio of the space to align with the aspect ratio of canvas the figure is drawn to.

In 3D, the shapes are created within a x-y-z space. The scene is then defined by:
  * Where the viewer is veiwing from, where they are looking and how they are oriented (in 2D it was from the positive z axis, at the center of the limits)
  * What portion of the space is shown
  * How the 3D space is projected onto a 2D window

In the case of 2D, the shapes are defined in an x-y space. The 

In 2D in FigureOne, when you create a figure you define what expanse of x-y space will be shown by using the `limits` property. You then create a number of shapes in x-y space and any shapes (or portions of shapes) that are outside these limits will be clipped and not shown.

In 3D, you similarly define a number of shapes within a 3D (x-y-z) space, but defining which shapes are shown, and how they are shown requires more information. We need to define from where and how we are looking at the shapes (`camera`), how shapes are projected into two dimensions (`projection`), what part of the x-y-z expanse should be viewable (`left`,`right`, `top`, `bottom`, `near`, `far`, `fieldOfView`, `aspectRatio`), and how the shapes are illuminated (`light`).

The `Scene` object is used to define these properties.

##### Camera

To view 3D shapes on a 2D screen, we need to project our three dimensional shapes onto a two dimensional screen. This is what a camera does.

To take a picture, we position the camera in space, point it at the object we want to capture and then adjust its zoom so the features in the object we want to capture can be seen by the camera.

If we position the camera at a different location, point it in a different direction, or use a different zoom setting then the picture we capture of the same object will look different.

`Scene.camera` has these definitions:

* `position` the position of the camera in space
* `lookAt` the position the camera is pointed toward
* `up` the vector
3D computer visualization has a similar
As a computer screen can be thought of as the view finder on a camera, we can similarly define
When we view a constructed 3D scene on a computer screen, we need to similarly define 


If we think of the screen as the screen of a camera looking at the scene of shapes it can be useful.

Depending on where we 

The simplest way to do this is with an *orthographic projection*.


##### Projection

To view a 3D scene on a 2D screen, we need to project our three dimensional shapes onto a two dimensional screen.

There are two ways to do this:
 * Orthographic projection - shapes are the same size no matter how close they are to the observer
 * Perspective projection - shapes get smaller when they are further from the observer







* Scene
  * Projection
  * Camera
  * Lighting
* Shapes
  * Cone
  * Cube
  * Sphere
  * Revolve
  * Surface
* Geometetry
  * Plane
  * Rotation
* Touching/Moving

### <a id="shapes3d-boilerplate"></a> 3D Shapes Boilerplate
```js
const figure = new Fig.Figure();
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
figure.scene.setLight({ directional: [0.7, 0.5, 1] });
```