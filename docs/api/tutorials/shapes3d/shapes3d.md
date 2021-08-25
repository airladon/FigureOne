Using 3D shapes in a diagram can be visually appealing, as well as add a clarity that is not possible in 2D. 3D shapes can be drawn, animated and interacted with in FigureOne.

FigureOne tries to simplify the process for using 3D as much as possible. In fact, a number of simple shapes like cubes, spheres and surfaces can be created similarly to shapes in 2D.

However, there are a number of concepts that are useful to know when dealing with 3D that are not needed for 2D. These concepts are especially useful if customizing the built in shapes, or if creating your own.

#### Scene

In 2D in FigureOne, when you create a figure you define what expanse of the x-y space will be shown by using the `limits` property. You then create a number of shapes in x-y space and any shapes (or portions of shapes) that are outside these limits will be clipped and not shown.

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