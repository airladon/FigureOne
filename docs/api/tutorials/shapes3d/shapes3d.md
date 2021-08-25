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

<!-- const figure = new Fig.Figure({ color: [1, 0, 0, 1]});

const c1 = figure.add({
  make: 'cube',
  lines: true,
  side: 0.12,
  position: [-0.25, -0.025, 0],
});
c1.scene = new Fig.Scene({
  style: 'orthographic',
  camera: { position: [1, 0.5, 2] },
  left: -1,
  right: 1,
  bottom: -0.5,
  top: 0.5,
});

const c2 = figure.add({
  make: 'cube',
  lines: true,
  side: 0.2,
  position: [0, 0, 0],
});
c2.scene = new Fig.Scene({
  style: 'perspective',
  camera: { position: [0.35, 0.25, 0.7] },
  aspectRatio: 2,
  fieldOfView: 1.7,
}); -->

![](./tutorials/shapes3d/projection.png)

The second question is then one of light. A red 3D sphere looks just like a flat circle, unless there is a light that makes some portions of it more bright than other portions.

<!-- const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

const c1 = figure.add({
  make: 'sphere',
  position: [-0.5, 0, 0],
  radius: 0.2,
  sides: 100,
});
c1.scene = new Fig.Scene({
  light: { ambient: 1 }, left: -1, bottom: -0.5, right: 1, top: 0.5,
});

const c2 = figure.add({
  make: 'sphere',
  radius: 0.2,
  sides: 100,
  position: [0, 0, 0],
});
c2.scene = new Fig.Scene({
  left: -1, bottom: -0.5, right: 1, top: 0.5, light: { directional: [1, 1, -1] },
}); -->

![](./tutorials/shapes3d/light.png)


Therefore, to define a 3D scene:
* The shapes are in x-y-z space
* The projection is defined with the `style` property (can be either `orthographic` of `perspective`)
* The camera position, where it is pointing and its orientation can be defined with the `camera` property
* The expanse of space captured is defined with `left`, `right`, `bottom`, `top`, `near` and `far` properties if we are using an *orthographic projection*, and `fieldOfView`, `aspectRatio`, `near` and `far` if we are using a *perspective projection*.
* The lighting is defined with the `light` property


##### Camera

The camera is the observer in a 3D scene and has the properties:
* `position` - position in space the camera is located at
* `lookAt` - point in space the camera is looking at
* `up` - vector that defines how the camera is oriented


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