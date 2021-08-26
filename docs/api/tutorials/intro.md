
#### Figures, Primitives and Collections

[FigureOne](https://github.com/airladon/FigureOne) allows you to create a *figure* that can be both interactive and animated.

A figure is composed of one or more *figure elements*. A figure element is a simple shape, some text, or it may be a collection of other elements. These elements combine to create a complex drawing, graph or equation.

In the language of **FigureOne**, there are two types of {@link FigureElements}:

* {@link FigureElementPrimitive} - an element that will draw something to the screen, such as a line, shape or text
* {@link FigureElementCollection} - collections of elements that will move or be operated on together

Each {@link FigureElement} has a {@link Transform} that may for example translate, rotate or scale an element. When the element is rendered to the screen, the transform will be applied. In the case of a {@link FigureElementPrimitive}, the shape or text will be transformed. In the case of a {@link FigureElementCollection}, all the figure elements it contains will have their transforms cascaded with the collection transform.

This means there is a heierachy of {@link FigureElement} objects, where the parent transform is applied to (cascaded with) the child transform. Therefore collections can be thought of as modular building blocks of a more complex figure.

Changing an element's transform moves the element through space. Changing the element's transform over time animates the element.

#### An Example
Let's say we want to create a rotating labeled line. As the line is rotated, the label follows the line.

<p style="text-align: center"><img src="./tutorials/ex1.png"></p>

To create this figure, we might use a figure element hierarchy like:

<p style="text-align: center"><img src="./tutorials/ex1-hierarchy.png"></p>

The drawn elements, the line and label, are primitives. They are created in the simple no rotation case. If the line is 0.8 long, and it starts at (0, 0), then the text might be at (0.4, 0.1)

<p style="text-align: center"><img src="./tutorials/ex1-collection.png"></p>

The figure itself has limits that define the coordinate window that can be shown, in this case its bottom left is the origin, and it is 6 wide and 4 high. We want the collection to be rotated, with the center of rotation at the center of the figure. Therefore we apply a rotation and translation transform to the collection.

<p style="text-align: center"><img src="./tutorials/ex1-figure.png"></p>

There are several different ways to create the same figure, but this way is used as it highlights how a collection can be used to transform a group of primitive elements.

#### Coordinate spaces

FigureOne renders shapes in WebGL, text in Context2D and can even manipulate html elements as figure elements. As WebGL is used most in FigureOne, it will be used as an example to introduce coorindate spaces and why they matter.

A figure is rendered in a html [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element. The pixels in a canvas can be thought of as coorindates. In html convention, if a canvas element is 1000 pixels wide, and 500 pixels height, then the (0, 0) pixel is in the top left corner, and pixel (1000, 500) is in the bottom right corner. We call this *pixel space* (though in computer graphics generally it is also often referred to as *screen space* or *device space*).

Defining a shape in pixel space is not very convenient as different clients may have different sized canvases. Therefore it is convenient to define all shapes in a normalized space (say from -1 to +1 in each dimension).

This is an example of why you need to work with at least two spaces. The user interfaces with pixel space, and the drawings are defined in normalized space. For a shape to be rendered to the canvas, its vertices need to be transformed to pixel space. For a user to interact with a shape, their touch point in pixel space needs to be transformed to the normalized space.

##### WebGL

The above example is fine when defining a static figure, but becomes inefficient when animating.

For instance, if a shape is a circle or sphere, it may require thousands (or tens of thousands) of vertices to model a smooth curve.

A simple workflow to draw a shape might be:

1) Javascript: Generate points of shape from some center point
2) Transfer points from CPU to GPU
3) GPU: Render points to screen
4) On each animation frame (30-60 per second), repeat steps 1-3 for a new shape center


WebGL provides a much more efficient way to do this:

1) Javascript: Generate points of a shape centered at (0, 0)
2) Transfer these points from CPU to GPU, and store in a GPU buffer
3) Each animation frame:
  - pass just the udpated shape center to the GPU
  - GPU gets vertices from buffer and offsets each vertex with new center point

This dramatically improves performance in two ways:
* The GPU has many cores and can offset the vertices in parallel (JavaScript is single threaded)
* The shape's thousands of points only need to be passed to the GPU once

WebGL allows for smooth animation of hundreds of thousands (and sometimes millions) of verticies even on low end clients, but to use it conveniently, we need to introduce additional coordinate spaces:

First we must define the vertices of a shape around a (0, 0) center point. In WebGL this would often be called *object space* or *model space*.

The shape would then need to be positioned/oriented in the world with some transform. The example above was a translation, but the transform could be a scaling, rotation, translation or combination. The shape would then exist in *world space*. The transform that takes it from *model space* to *world space* is often called *model transform* or *world transform*.

WebGL only draws vertices that are in a normalized space (-1 to +1 on each axis). Any vertices that are outside of this cube are clipped and not drawn, and so this space is often called *clip space*. The transform that converts the vertices from *world space* to *clip space* is often called a *projection* transform as the world is being projected into this normalized cube.

The hardware will then transform *clip space* into *pixel space* for the final render.

##### 3D - Camera

The concept of a camera is used to define where a viewer is observing the world from. The camera can have a location in space, a point to where it is looking and an orientation.

When the world is two dimensional, the camera is off the world plane looking perpendicular to the world.

When the world is three dimensional however, the camera needs to have a location, an orientation and a position to which it is pointed.

A view transform is used to move the world relative to the camera. This space is called *camera space* or *view space*.

Thus, in a typical WebGL application there are 5 coordinate spaces:

* Model Space
* (world transform)
* World Space
* (View transform)
* View Space
* (Projection transform)
* Clip Space
* (System transform)
* Pixel Space

##### FigureOne

FigureOne uses WebGL to render shapes to create figures, but for many applications a developer does not need to know the details of WebGL to use FigureOne. As such, the coordinate space nomencalture of FigureOne is more closely tied to other common terms in FigureOne.

A figure consists of FigureElementPrimitives which handle drawing, and FigureElementCollections which can be used to create a hierarchical grouping of figure elements with shared transforms.

The coordinate spaces in FigureOne are called:
* Draw Space - where you draw vertices (equivalent to model space or object space)
* Local Space - where a FigureElement is positioned/oriented within a FigureElementCollection - each FigureElementCollection's children live in the same local space
* Figure Space - where FigureElements at the top of the hierarchy are positioned/oriented (equivalent to world space)
* Pixel Space



The coorindate space nomenclature of FigureOne is different to 

##### 3D - Projection

In three dimensions the world can either be viewed as orthographic (where parallel lines stay the same with apart), or with a vanishing perspective (parallel lines seem to merge at a point at infinite distance).

####


When a world has only two dimensions (say is in the xy plane) then the viewer will always be looking at the world from a normal of the plane (from somewhere on the z axis). The amount of the world shown will come from the *projection* transform.

However, when the world has three dimensions, the concept of a camera is used to define where a viewer is viewing the world from. The camera can have a location in space, a point to where it is looking and an orientation.

When objects in the world only have two dimensions, the projection transform can define how much of the world to view. It can project only a portion of the world into clip space, and therefore only that portion can be viewed.

When objects in the world have three dimensions, you need to choose how to look at them. To do this, the concept of a camera is used
When drawing in three dimensions, the concept of a camera is used. The camera defines how much of the world can be viewed and from what perspective.

In addition, the projection transform can 





We then use a transform to position/orient these vertices in the figure.


* *Draw Space*: where we define the vertices of a shape
* *World Space*: 


First we define the vertices of the shape in 3D space. We call this *draw space* (it is often referred to as *model space* or *object space* outside of FigureOne).

The 




Each space i
In other words, a shape can be represented in different spaces, each of which might have a particular function or advantage.



WebGL uses lines or triangles to draw or model arbitrary shapes. Each line or triangle is defined by 3 dimensional points (vertices). WebGL will render any vertex with (x, y, z) values betweem -1 to +1. Any vertices outside of this cube will be clipped (not rendered). Therefore we call this clip space.

We now have to examples of two different spaces we can define the vertices in. For example, a pixel in the middle of the canvas at (500, 250) in pixel space would map to a vertex at (0, 0, 0) in clip space.

To see if a vertex is touched by a user, we need to be able to transform a point in pixel space to clip space. To render a vertex to the screen, we need to transform a point in clip space to pixel space. Therefore, we generally need to know how to convert points between spaces.

We need at least two spaces as pixel space is where the user is, and it is more convenient to define shapes in clip space as it is normalized between -1 and 1 and therefore indepenant on the size of the canvas.

##### 2D Space

The example above is the simplest example of drawing in 2D.


In FigureOne we call this *pixel space*, though it is also refered to as screen space or device space.

The [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element is defined in screen pixels. The WebGL view re-maps the canvas pixels to -1 to +1 coordinates in both the vertical and horizontal directions, independent on the aspect ratio of the canvas.

WebGL uses lines or triangles to draw or model arbitrary shapes. Each line or triangle is defined by (x, y, z) points (vertices).


If you wish to draw a sphere, you may need hundreds or thousands of triangles to model a smooth surface. Each triangle needs three vertices, and a lot of vertices need to be defined and moved into memory to be drawn.

There are two ways to animate a sphere's position:
1) For each frame, calculate the new position of each vertex of the sphere in the CPU (JavaScript), and load the new vertices into the GPU
2) For each frame, calculate the new center position of the sphere in the CPU (JavaScript) and transfer only that to the GPU. The GPU can then offset all the vertices with the new center.

Method 2) is much faster. Compared to a single threaded JavaScript application running on the CPU, a GPU has many cores that work on the vertices in parallel. Also, transferring tens of thousands of vertices between the CPU and GPU can be relativly slow, so only doing this once before the animation starts makes for much smoother animations.




*
To animate the sphere's position then, you will need to recalculate 

If you wish to

WebGL uses lines or triangles to draw or model arbitrary shapes. Each line or triangle is defined by (x, y, z) points (vertices). In FigureOne terminology, we call the shape that is formed by the triangles or lines a FigureElementPrimitive as these are a collection of vertices that will typically stay fixed. We say these vertices are defined in *draw space*.

These lines or triangles exist in 3D and get rendered to a 2D screen by going through a series of transformations. Each transformation moves the vertex into a new space, where it may have a different relative position to other vertices in it's shape and other shapes.

First the shape must be positioned in the figure. For example, a sphere may be drawn with a center point of (0, 0, 0), but you may wish to animate moving it around the figure. Inst



 A typical series of transformations include:
* draw to figure transformation: move, rotate, scale, or otherwise transform the vertices to position and orient them in the figure. In OpenGL/WebGL nomenclature this would be a *model to world* or *object to world* transformation.
* figure to camera transformation: transform all the vertices in the figure to be relative to a camera which defines from where the figure is viewed
* camera to projection transformation: project all vertices relative to a -1 to 1 box in x, y and z. All vertices outside the box will be clipped and not shown.
* projection to screen transformation

Each FigureElementPrimitive will have a FigureElementCollection as a parent. The FigureElementCollection provides a *local space* to translate, scale, rotate or otherwise transform the FigureElementPrimitive relative to other children within the collection.

So for example, if we have two shapes (two FigureElementPrimitives) that are a sphere and cube each centered at (0, 0, 0) within its own draw space, they can be placed next to each other by translating one of 

Each shape has a parent FigureCollection and can be transformed relative to other shapes within the collection.

A FigureCollection hierarchy may be formed where collections are parents of other collections, allowing for chained transformations relative to each level of the hierarchy.



A shape is thus defined as a number of vertices drawn in *draw* space.


WebGL typically uses many small triangles to model a more arbitrary shape. Each triangle is defined by three verticesThe vertices of each of these triangles effectively model the arbitrary shape, and are normally sayd

A shape is a collections of vertices that typically create triangles that model an arbitrary shape. A shape's vertices are defined *model* space. That shape 

WebGL is rendered in a html [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element.

The [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element is defined in screen pixels. The WebGL view re-maps the canvas pixels to -1 to +1 coordinates in both the vertical and horizontal directions, independent on the aspect ratio of the canvas.

When the canvas aspect ratio is not a square, or it is more convenient to create a figure in a coordinate space not mapped between -1 to +1, then it is useful to have a separate *figure space*. In the example above, the figure space re-maps the *GL space* to 0 to 6 in the horizontal and 0 to 4 in the vertical.

These are three examples of different coordinate spaces - *pixel space*, *GL space* and *figure space*.

If you want to move or modify an element, you need to think about what you want to modify it *relative* to. Do you want to move it relative to other elements in the figure? In other words, do you want to move it in *figure space*? Or do you want to move it relative to other elements within the parent, or local collection - *local space*. Alternately, you might want to modify the vertices of the shape, in *draw space*.

In simple figures, where no collections are used, or collections don't transform their child elements you don't really need to think about what space you are working in. Figure space will be the same as local space and draw space. You won't care about the higher level GL or pixel spaces.

But if you have transformed collections, or if you are tying an element to a location on the screen you will need to convert points between the different spaces. In addition, it is useful to know about these different spaces as sometimes they are referred to in the documentation.

One way to think about what space you are modifying is:
* Elements that are direct children of the figure: element transforms are in figure space
* Elements that are direct children of a collection: element transforms are in local space (the space of the parent colleciton)
* Vertex definitions in element primitives: draw space

For example, a square might be defined in draw space as a square with length 1, centered around the origin.

The transform of the figure element primitive that controls the square will move the square in *local space* - the space relative to all other elements that are the children of the same parent collection.

If the parent collection's parent is the figure itself, then its transform will move the colleciton in figure space.

Converting between spaces is relatively straight forward. All figure elements have methods to find their position or bounds in *figure*, *local* or *vertex* space. The figure has transforms that allow conversion between *figure*, *GL* and *pixel* spaces.

Where this is useful is if two primitives have different parents, and you want to move one to be in the same position as the other. To do this you would convert the target element position to *figure space*, and then to the *local space* of the element to move.


#### Drawing

When it is time to draw the scene, the figure will pass an initial transform to the first element in the hierarchy. In the example above, the "Labeled Line" collection. This transform will include any translations and scaling needed to convert from *figure* space to *GL* space for actual rendering.

The "Labeled Line" collection will then cascade this transform with it's own rotation and translation transform, and pass this to its children, the "Label" and "Line" primitives.

The "Label" primitive has it's own transform that translates it to the middle of the horizontal line in *local* space. The transform will be combined with the one from its parent, creating a final transform to draw the label with.

The primitive's shape or text definition never needs to change. At draw time, it is simply transformed by it's own transform and all the ancestors directly above it in the hierarchy. This is the same method used by WebGL as it reduces the amount of data that needs to be loaded into the graphics memory each draw frame. All the vertices of a shape are loaded into the graphics memory just once, and for each frame just a transform is passed to inform the graphics processor how to orient the vertices.

If you have a dynamic shape whose vertices do change every frame (like a morphing animation), you can choose to load the vertices every frame. However, depending on the performance of the browser's host machine, and the number of vertices being adjusted, you might see a performance impact compared to a shape with a similar amount of vertices that do not change. That said, for shapes of **reasonable** size, this will not be a problem.

#### Code

Finally, let's see the code for the example above. Two files, `index.html` and `index.js` should be in the same folder.

```html
<!-- index.html -->
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 1200px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.10.4/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

```javascript
// index.js
const figure = new Fig.Figure({ limits: [0, 0, 6, 4 ]});
figure.add(
  {
    name: 'labeledLine',
    make: 'collections.collection',
    elements: [
      {
        name: 'line',
        make: 'primitives.line',
        p1: [0, 0],
        p2: [2, 0],
        width: 0.01,
        color: [0, 0, 1, 1],
      },
      {
        name: 'label',
        make: 'primitives.text',
        text: 'Line 1',
        position: [1, 0.1],
        font: { color: [0, 0, 1, 1] },
        xAlign: 'center',
      },
    ],
    position: [3, 2],
    touchBorder: 0.3,
    mods: {
      isMovable: true,
      move: {
        type: 'rotation',
      },
    },
  },
);
```

#### Using FigureOne

The example above shows how a figure can be defined with simple javascript objects, that are able to be encoded in JSON. This means complex figures or modules can be shared and reused easily.

For many uses, it is fine to fully define a figure and all its elements before a user interacts with it.

Figures can also be defined more dynamically, such as in the example below which has exactly the same function as the example above.

```javascript
// index.js
const figure = new Fig.Figure({ limits: [0, 0, 6, 4 ]});

const label = figure.primitives.text({
  text: 'Line 1',
  position: [1, 0.1],
  font: { color: [0, 0, 1, 1] },
  xAlign: 'center',
});
const line = figure.primitives.line({
  p1: [0, 0],
  p2: [2, 0],
  width: 0.01,
  color: [0, 0, 1, 1],
});

const labeledLine = figure.collections.collection({
  position: [3, 2],
  touchBorder: 0.3,
});
figure.elements.add('labeledLine', labeledLine);
labeledLine.add('line', line);
labeledLine.add('label', label);
labeledLine.move.type = 'rotation';
labeledLine.setMovable();
```