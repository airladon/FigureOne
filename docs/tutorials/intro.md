This introduction will introduce some key terms and concepts that are found frequently throughout the documentation.

#### Diagrams, Primitives and Collections

**FigureOne** allows you to create a *figure*, or *diagram* that can be both interactive and animated.

A diagram has one or more *diagram elements*. A diagram element is a simple shape, some text, or it may be a collection of other elements. These elements combine to create a complex drawing, graph or equation.

In the language of **FigureOne**, there are two types of {@link DiagramElements}:

* {@link DiagramElementPrimitive} - an element that will draw something to the screen, such as a line, shape or text
* {@link DiagramElementCollection} - collections of primitives or other collections

Each `DiagramElement` has a {@link Transform} that may contain one or more translations, rotations and scaling factors. When the element is rendered to the screen, the transform will be applied. In the case of a {@link DiagramElementPrimitive}, the shape or text will be transformed. In the case of a {@link DiagramElementCollection}, all the `DiagramElements` it contains will have the transform applied to them.

This means there is a heierachy of `DiagramElement` objects, where the parent transform is applied to (cascaded with) the child transform. Therefore collections can be thought of as modular building blocks of a more complex figure.

Changing an element's transform moves the element through space. Changing the element's transform over time animates the element.

#### An Example
Let's say we want to create a rotating labeled line. As the line is rotated, the label follows the line.

![](./tutorials/ex1.png)

To create this diagram, we might use a diagram element hierarchy like:

![](./tutorials/ex1-hierarchy.png)

The drawn elements, the line and text, are primitives. They are created in the simple no rotation case. If the line is 0.8 long, and it starts at (0, 0), then the text might be at (0.4, 0.1)

![](./tutorials/ex1-collection.png)

The diagram itself has limits that define the coordinate window that can be shown, in this case its bottom left is the origin, and it is 3 wide and 2 high. We want the collection to be rotated, with the center of rotation at the center of the diagram. Therefore we apply a rotation and translation transform to the collection.

![](./tutorials/ex1-diagram.png)

There are several different ways to create the same diagram, but this way is used as it highlights how a collection can be used to transform a group of primitive elements.

#### Coordinate spaces

Most rendering in FigureOne is done using WebGL, tied to a html [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element.

The [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element is defined in screen pixels. The WebGL view port re-maps the canvas pixels to -1 to +1 in both the vertical and horizontal directions, independent on the aspect ratio of the canvas.

When the canvas aspect ratio is not a square, or it is more convenient to create a diagram in a coordinate space not mapped between -1 to +1, then it is useful to have a separate *diagram space*. In the example above, the diagram space re-maps the *GL space* to 0 to 3 in the horizontal and 0 to 2 in the vertical.

These are three examples of different coordinate spaces - *pixel space*, *GL space* and *diagram space*.

If you want to move or modify an element, you need to think about what you want to modify it *relative* to. Do you want to move it relative to other elements in the diagram? In other words, do you want to move it in *diagram space*? Or do you want to move it relative to other elements within the parent, or local collection - *local space*. Alternately, you might want to modify the vertices of the shape, in *vertex space*.

In simple diagrams, where no collections are used, or collections don't transform their child elements you don't really need to think about what space you are working in. Diagram space will be the same as local space and vertex space. You won't care about the higher level GL or pixel spaces.

But if you have transformed collections, or if you are tying an element to a location on the screen you will need to convert points between the different spaces. In addition, it is useful to know about these different spaces as sometimes they are referred to in the documentation.

One way to think about what space you are modifying is:
* Elements that are direct children of the diagram: element transforms are in diagram space
* Elements that are direct children of a collection: element transforms are in local space (the space of the parent colleciton)
* Vertex definitions in element primitives: vertex space

For example, a square might be defined in vertex space as a square with length 1, centered around the origin.

The transform of the diagram element primitive that controls the square will move the square in *local space* - the space relative to all other elements that are the children of the same parent collection.

If the parent collection's parent is the diagram itself, then its transform will move the colleciton in diagram space.

If you want to animate one primitive element to another primitive element, both of which have different parents, then you would:

* convert target position to diagram space
* convert target diagram space position to element 1's local space
* animate element 1 from it's current local position to element 2's equivalent local space

Converting between spaces is relatively straight forward. All diagram elements have methods to find their position or bounds in *diagram*, *local* or *vertex* space. The diagram has transforms that allow conversion between *diagram*, *GL* and *pixel* spaces.


#### Drawing

When it is time to draw the scene, the diagram will pass an initial transform to the first element in the hierarchy. In the example above, the "Labeled Line" collection. This transform will include any translations and scaling needed to convert from *diagram* space to *GL* space for actual rendering.

The "Labeled Line" collection will then cascade this transform with it's own rotation and translation transform, and pass this to its children, the "Label" and "Line" primitives.

The "Label" primitive has it's own transform that translates it to the middle of the horizontal line in *local* space. The transform will be combined with the one from its parent, creating a final transform to draw the label with.

The primitive's shape or text definition never needs to change. At draw time, it is simply transformed by it's own transform and all the ancestors directly above it in the hierarchy. This is the same method used by WebGL as it reduces the amount of memory that needs to be loaded into the graphics memory each draw frame. All the vertices of a shape are loaded into the graphics memory just once, and each frame just a transform is passed informs the graphics processor how to orient the vertices.

If you have a dynamic shape whose vertices do change every frame (like a morphing animation), you can choose to load the vertices every frame. However, depending on the performance of the browser's host machine, and the number of vertices being adjusted, you might see a performance impact compared to a shape with a similar amount of vertices that do not change.

#### Code

`index.html`
```html
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 1200px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.2.3/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

`index.js`
```javascript
const diagram = new Fig.Diagram({ limits: [0, 0, 6, 4 ]});
diagram.addElement(
  {
    name: 'labeledLine',
    method: 'collection',
    addElements: [
      {
        name: 'line',
        method: 'line',
        options: {
          p1: [0, 0],
          p2: [2, 0],
          width: 0.01,
          color: [0, 0, 1, 1],
        },
      },
      {
        name: 'label',
        method: 'text',
        options: {
          text: 'Line 1',
          position: [1, 0.1],
          font: { color: [0, 0, 1, 1] },
          xAlign: 'center',
        },
      },
    ],
    options: {
      position: [3, 2],
    },
    mods: {
      isTouchable: true,
      isMovable: true,
      touchInBoundingRect: true,
      move: {
        type: 'rotation',
      },
    },
  },
);
diagram.initialize();
diagram.elements.isTouchable = true;
```

