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


#### Touch Interactivity

In two dimensions, polygon borders are used to define the borders within which figure elements can be touched. Polygon borders are useful as arbitrary touch borders can be selected that are unrelated to the shape drawn to the screen.

In three dimensions, defining volumes in which to select becomes challening, both to define the volumes and to decide which volume was selected in a quick time on slower client devices.

Therefore, selection of 3D objects is performed by FigureOne by:
 * Rendering each touchable element into a temporary texture
 * Each element is rendered with a unique color
 * The temporary texture pixels are mapped to the screen pixels and the corresponding touched pixel found
 * The color of the pixel touched is mapped to the figure element with that color

This method is performant, simple (as complex touch volumes don't need to be defined), and will automatically handle depth - elements in front of other elements relative to the camera will be selected.

When a larger touch border is required for a 3D element, use the `touch` property to scale the element in the temporary texture.

When debugging, the `figure.showTouchable()` method can be used to render the temporary texture being used to determine what is touched to the screen.

#### Move Interactivity

Once an object is selected, it can be moved. In two dimensions this simply means moving the objects in the  XY plane.

But in three dimensions a choice needs to be made about how a mouse of finger movement on a 2D screen translates to a movement in 3D space.

The default way to do this in FigureOne is to use a movement plane (`element.move.plane`). FigureOne will automatically project a movement on the screen onto this plane and move the element accordingly.

#### Rotation

The only information needed for a 2D rotation is the magnitude of rotation and direction. The axis is always the same, out of the page (z axis).

In three dimensions however, a rotation can be around any arbitrary axis. Rotations can also be thought of in different ways that may be more or less convenient for a given
In 3D, a two dimensional rotation is a rotation around the z axis, where using the right hand rule a positive rotation is anti-clockwise and a negative rotation is clockwise.







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