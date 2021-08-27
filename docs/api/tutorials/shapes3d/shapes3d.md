3D shapes can be drawn, animated and interacted with in FigureOne.

FigureOne tries to simplify the process for using 3D as much as possible. In fact, a number of simple shapes like cubes, spheres and surfaces can be created similarly to shapes in 2D.

However, there are a number of concepts that are useful to know when dealing with 3D that are not needed for 2D. These concepts are especially useful if customizing shapes, or if creating your own.

#### Scene

In FigureOne we create some shapes in space. The `Scene` then defines how we present those shapes to the user. In other words, the Scene defines what portion of space gets shown to the user.

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

###### Camera

The camera is the observer of the scene. `Scene.camera` defines how we are looking at the space we which to draw. It has the properties

* `position` - where the camera is located
* `lookAt` - where the camera is looking at
* `up` - which direction is up for the camera

###### Projection

Setting up the camera defines how we are looking at the 3D space. We then need to project what we are looking at into two dimensions for the screen.

In three dimensions, some objects will be closer to the camera and others further away.

In real life, objects that are further away look smaller than closer objects. But in technical drawings, it is often useful to have an object's size remain constant (no matter the distance from the camera) so proportions of objects can be properly compared.

Therefore the projection can have two styles:
* *perspective projection* - shapes get smaller the further they are away from the camera
* *orthographic projection* - shape size is the same at all distances to the camera

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


Depending on the style of projection, the expanse of space to be captured in the projection can be defined. 

For orthographic projection, adding `near` and `far` to `left`, `right`, `bottom`, and `top` creates a rectangular prism in front of the camera. Any shapes (or portions of shapes) withing this prism will be shown.

The property names are relative to the camera. `camera.lookAt` will be a normal to the plane with `left`, `right`, `bottom` and `top`. `camera.up` will orient the plane to align with `top`.


The reson the properties are named such (and not xMin, yMin etc) is because depending on where the camera is and where it is looking, these properties may not align with any axis. The prism surface will be normal to the direction the camera is looking. The `left`, `right`, `bottom` and `top` properties will be relative to the `up` direction of the camera.


In 3D however

However, in perspective projection, the size of the 


* perspective projection: `aspectRatio`, `fieldOfView`, `near`, `far`
* orthographic projection: `left`, `right`, `bottom`, `top`, `near`, `far`

Orthographic projection is the same as 2D

If perspective projection is chosen, use 




* How should we deal with distances further from the observer?


`Scene.camera.position` defines 

###### Light

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


###### Projection

There are two parts to defining what space to project 


In three dimensions, Scene describes a lot 

In three dimensions however, more information is needed than just dimensional range

In two dimensions this means what portion of the x-y space is shown to the user.

In three dimensions this means what portion of 

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
* How do we convey to a user that an object has depth?

In real life, we see things get smaller as they get further away. But in technical drawings, it is often useful to keep things the same size (independent of proximity to the observer) as this can visually convey a shape's dimensions and proportions accurately.

Thus we need to define how we project 3D shapes onto a 2D screen:
* *perspective projection* - shapes get smaller the further they are away from the observer
* *orthographic projection* - shapes size is the same at all distances to the observer

A complete projection

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
* `up` - vector that defines which way is up for the camera when looking at `lookAt`


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