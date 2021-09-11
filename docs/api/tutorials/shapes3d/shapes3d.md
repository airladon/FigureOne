3D shapes can be drawn, animated and interacted with in FigureOne.

FigureOne tries to simplify the process for using 3D as much as possible. In fact, a number of simple shapes like cubes, spheres and surfaces can be created similarly to shapes in 2D.

However, there are a number of concepts that are useful to know when dealing with 3D that are not needed for 2D. These concepts are especially useful if customizing shapes, or if creating your own.

#### Geometry

##### Point

In FigureOne, the {@link Point} class is used extensively to define shapes and their properties. Points can be defined with {@link Point} object or by using array notation. For example, creating two rectangles with different positions in two dimensions could look like:

```js
// Create two rectangles. One centered at [0.5, 0.5], and the other at
// [-0.5, -0.5]
figure.add([
  { make: 'rectangle', position: new Fig.Point(0.5, 0.5) },
  { make: 'rectangle', position: [-0.5, -0.5] },
]);
```

All points in FigureOne have an x, y, and z component. If working in two dimensions, then the z coordinate never has to be defined (as above), and will be 0 by default. When working in three dimensions, the z coordinate can be added.

```js
// Create two rectangles. One centered at [0.5, 0.5, 1], and the other at
// [-0.5, -0.5, -1]
figure.add([
  { make: 'rectangle', position: new Fig.Point(0.5, 0.5, 1) },
  { make: 'rectangle', position: [-0.5, -0.5, -1] },
]);
```

##### Plane

While {@link Point}s, {@link Line}s and {@link Rect}angles are used to define most geometries in two dimensions, a {@link Plane} is required for some three dimensional definitions.

A plane is defined as a position and a normal vector to the plane.

```js
// Create an XZ plane at [0, 0, 0] (the normal is thus along the y axis)
const p = new Fig.Plane([0, 0, 0], [0, 1, 0]);
```

The {@link Plane} object has a number of useful methods for working with planes and can determine things like:

* if a point is on the plane
* if two planes are equal
* if two planes are parallel
* the line at the intersection of two planes
* if a line is parallel to the plane
* the intersect point of a line and plane
* if a line lies on the plane
* a point's projection onto the plane
* the distance between the plane and a point



#### Scene

In FigureOne shapes are created in a space. The `Scene` then defines how we present those shapes to the user, or what portion of space gets shown to the user.

##### Two Dimensions
In two dimensions the Scene simply defines the range of x and y values that will be shown. Four properties are used for this:

* `left` - the minimum x value
* `right` - the maximum x value
* `bottom` - the minimum y value
* `top` - the maximum y value

##### Three Dimensions

In three dimensions, we want capture a three dimensional space and draw it to a two dimensional screen. To do this we:
* Choose a position from which to observe the space from
* Choose a direction to look at
* Choose which direction is up
* Choose the limits of the space we want to view in the direction we are looking
* Choose whether proximity changes the size of things (in the real world, things further away look smaller)
* Choose how to light the scene (without lighting, three dimensional objects look flat)

These choices are bundled into three categories:
* Camera
* Projection
* Light

##### Camera

The camera is the observer of the scene. `Scene.camera` defines how we are looking at the space we which to draw. It has the properties

* `position` - where the camera is located
* `lookAt` - where the camera is looking at
* `up` - which direction is up for the camera

![](./tutorials/shapes3d/camera.png)

##### Projection

Setting up the camera defines how we are looking at the 3D space. We then need to project what we are looking at into two dimensions for the screen.

In three dimensions, some objects will be closer to the camera and others further away.

In real life, objects that are further away look smaller than closer objects. But in technical drawings, it is often useful to have an object's size remain constant (no matter the distance from the camera) so proportions of objects can be properly compared.

Therefore the projection can have two styles:
* *perspective projection* - shapes get smaller the further they are away from the camera
* *orthographic projection* - shape size is the same at all distances to the camera

const figure = new Fig.Figure({ color: [1, 0, 0, 1]});

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
});

![](./tutorials/shapes3d/projection.png)


##### Orthographic Projection
Depending on the style of projection, the expanse of space to be captured in the projection can be defined. 

For orthographic projection, adding `near` and `far` to `left`, `right`, `bottom`, and `top` creates a rectangular prism in front of the camera. Any shapes (or portions of shapes) withing this prism will be shown. The property names are relative to the camera. `camera.lookAt` will be a normal to the plane with `left`, `right`, `bottom` and `top`. `camera.up` will orient the plane to align with `top`. `camera.position` and `near` will then position the prism while `far` will give it depth.

![](./tutorials/shapes3d/orthographic.jpg)

##### Perspective Projection

These same properties cannot be used for perspective projection because size changes with distance from camera. For example the width `left` and `right` will be different closer to the camera compared with further away. Therefore, a frustum is used to define visible space with the properties:

* `fieldOfView`: the angular field of view in the `camera.up` direction
* `aspectRatio`: the ratio of width to height
* `near`: the closest visible point to the camera
* `far`: the furthest visible point to the camera

![](./tutorials/shapes3d/perspective.jpg)

##### Light

Light is an important factor in vizualizing 3D. If all surfaces of an object are illuminated equally (ambient light), then different faces or curvature of the surface will be indistinguishable. The image will look flat.

FigureOne provides two simple lighting options:
* *directional light*: light that comes from infinitely far away and illuminates all objects equally (defined with a vector that describes the angle from which the light comes from)
* *point light*: light that comes from a point in space and illuminates surfaces closer to that point more brightly.

![](./tutorials/shapes3d/light.png)


#### Explanation Boiler-Plate Code
All code examples in the following 3D shape topics uses the same code to create a figure, set the scene and add a red x axis, green y axis and blue z axis.

All example code in the topics below would be appended to this boilerplate code:

```js
// Create the figure
const figure = new Fig.Figure();

// Set the scene
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
figure.scene.setLight({ directional: [0.7, 0.5, 0.2] });

// Add x, y, z axis
figure.add([
  {
    make: 'cylinder',
    radius: 0.01,
    color: [1, 0, 0, 1],
    line: [[-1, 0, 0], [1, 0, 0]],
  },
  {
    make: 'cylinder',
    radius: 0.01,
    color: [0, 1, 0, 1],
    line: [[0, -1, 0], [0, 1, 0]],
  },
  {
    make: 'cylinder',
    radius: 0.01,
    color: [0, 0, 1, 1],
    line: [[0, 0, -1], [0, 0, 1]],
  },
]);

```

#### Touch Interactivity

In two dimensions, polygon borders are used to define the borders within which figure elements can be touched. Polygon borders are useful as arbitrary touch borders can be selected that are unrelated to the shape drawn to the screen.

In three dimensions, defining volumes in which to select becomes challenging, both to define the volumes and to decide which volume was selected in a quick time on slower client devices.

Therefore, selection of 3D objects is performed in FigureOne by:
 * Rendering each touchable element into a temporary texture
 * Each element is rendered with a unique color
 * The temporary texture pixels are mapped to the screen pixels and the corresponding touched pixel found
 * The color of the pixel touched is mapped to the figure element with that color

This method is common, performant, simple (as complex touch volumes don't need to be defined), and will automatically handle depth - elements in front of other elements relative to the camera will be selected.

When a larger touch border is required for a 3D element, use the `touch` property to scale the element in the temporary texture.

When debugging, the `figure.showTouchable()` method can be used to render the temporary texture being used to determine what is touched to the screen.

#### Move Interactivity

Once an object is selected, it can be moved. In two dimensions this simply means moving the objects in the XY plane.

But in three dimensions a choice needs to be made about how a mouse of finger movement on a 2D screen translates to a movement in 3D space.

The default way to do this in FigureOne is to use a movement plane (`element.move.plane`). FigureOne will automatically project a movement on the screen onto this plane and move the element accordingly.

For example, to create a cube that can be translated in the YZ plane:

```js
// Add a grid in the YZ plane
figure.add([
  {
    make: 'grid',
    bounds: [-0.8, -0.8, 1.6, 1.6],
    xStep: 0.05,
    yStep: 0.05,
    line: { width: 0.002 },
    color: [0.7, 0.7, 0.7, 1],
    // By default, the grid is created in the XY plane
    // To rotate it to the XZ plane rotate π/2 around the y axis
    transform: ['r', Math.PI / 2, 0, 1, 0],
  },
]);

// Add a red cube movable in the XZ plane
figure.add({
  make: 'cube',
  side: 0.3,
  color: [1, 0, 0, 1],
  move: {
    plane: [[0, 0, 0], [1, 0, 0]],
  },
});
```
![](./tutorials/shapes3d/xztranslate.gif)

In comparison, a cube that can be rotated around the y axis would be:

>> Note: FigureOne rotates 3D objects with fingers in 

#### Camera Interactivity

It is often useful to allow a user to change the scene manually using gestures. This can be achieved by changing the scene with `setCamera` to change the camera location and `setProjection` to change the expanse of visible space.

FigureOne also provides a built-in FigureElementPrimitive `cameraControl` (see {@link OBJ_CameraControl}) which defines a transparent rectangle in which the user can swipe horizontally to rotate a scene around a vertical axis, and swipe vertically to change the elevation of the camera relative to the vertical axis.

```js
figure.add([
  {
    make: 'cube',
    side: 0.5,
    color: [0, 1, 1, 1],
    transform: ['r', 0, 1, 0, 0],
  },
  {
    make: 'cameraControl',
  },
]);
```

![](./tutorials/shapes3d/cameracontrol.gif)

#### Rotation

The only information needed for a 2D rotation is the magnitude of rotation and direction. The rotation axis is always along the z axis.

In three dimensions, a rotation can be around any arbitrary axis, and therefore 4 numbers are required. The rotation, and the x, y, and z components of the axis vector.

Both a transform object, or short-hand transform notation can be used to define a 3D rotation. In both cases, first the rotation value is defined, then the axis of rotation.

```js
// Create a rotation component in a transform object
const t1 = new Fig.Transform().rotate(Math.PI / 2, [1, 0, 0]);
// Create a transform from short hand transform notation
const t2 = Fig.getTransform(['r', Math.PI / 2, 1, 0, 0]);
```

For example, to rotate a cube around the x-Axis

```js
const cube = figure.add({
  make: 'cube',
  side: 0.5,
  color: [0, 1, 1, 1],
  // Set the transform so the rotation is arount the x axis
  transform: ['r', 0, 1, 0, 0],
});

// Animate rotation around the x axis
cube.animations.new()
  .rotation({ velocity: 0.5, duration: null })
  .start();
```

![](./tutorials/shapes3d/rotation.gif)









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
  * Transform (direction, basis)
* Touching/Moving

### <a id="shapes3d-boilerplate"></a> 3D Shapes Boilerplate
```js
const figure = new Fig.Figure();
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
figure.scene.setLight({ directional: [0.7, 0.5, 1] });
```