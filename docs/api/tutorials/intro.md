
#### Figures, Primitives and Collections

[FigureOne](https://github.com/airladon/FigureOne) allows you to create a *figure* that can be both interactive and animated.

A figure has one or more *figure elements*. A figure element is a simple shape, some text, or it may be a collection of other elements. These elements combine to create a complex drawing, graph or equation.

In the language of **FigureOne**, there are two types of {@link FigureElements}:

* {@link FigureElementPrimitive} - an element that will draw something to the screen, such as a line, shape or text
* {@link FigureElementCollection} - collections of elements that will move or be operated on together

Each {@link FigureElement} has a {@link Transform} that may contain one or more translations, rotations and scaling factors. When the element is rendered to the screen, the transform will be applied. In the case of a {@link FigureElementPrimitive}, the shape or text will be transformed. In the case of a {@link FigureElementCollection}, all the figure elements it contains will have their transforms further transformed by the collection transform.

This means there is a heierachy of {@link FigureElement} objects, where the parent transform is applied to (cascaded with) the child transform. Therefore collections can be thought of as modular building blocks of a more complex figure.

Changing an element's transform moves the element through space. Changing the element's transform over time animates the element.

#### An Example
Let's say we want to create a rotating labeled line. As the line is rotated, the label follows the line.

<p style="text-align: center"><img src="./tutorials/ex1.png"></p>

To create this figure, we might use a figure element hierarchy like:

<p style="text-align: center"><img src="./tutorials/ex1-hierarchy.png"></p>

The drawn elements, the line and label, are primitives. They are created in the simple no rotation case. If the line is 0.8 long, and it starts at (0, 0), then the text might be at (0.4, 0.1)

<p style="text-align: center"><img src="./tutorials/ex1-collection.png"></p>

The figure itself has limits that define the coordinate window that can be shown, in this case its bottom left is the origin, and it is 3 wide and 2 high. We want the collection to be rotated, with the center of rotation at the center of the figure. Therefore we apply a rotation and translation transform to the collection.

<p style="text-align: center"><img src="./tutorials/ex1-figure.png"></p>

There are several different ways to create the same figure, but this way is used as it highlights how a collection can be used to transform a group of primitive elements.

#### Coordinate spaces

FigureOne renders shapes in WebGL, text in Context2D and can even manipulate html elements as figure elements. As WebGL is used most in FigureOne, it will be used as an example to introduce coorindate spaces and why they matter.

WebGL is rendered in a html [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element.

The [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element is defined in screen pixels. The WebGL view re-maps the canvas pixels to -1 to +1 coordinates in both the vertical and horizontal directions, independent on the aspect ratio of the canvas.

When the canvas aspect ratio is not a square, or it is more convenient to create a figure in a coordinate space not mapped between -1 to +1, then it is useful to have a separate *figure space*. In the example above, the figure space re-maps the *GL space* to 0 to 3 in the horizontal and 0 to 2 in the vertical.

These are three examples of different coordinate spaces - *pixel space*, *GL space* and *figure space*.

If you want to move or modify an element, you need to think about what you want to modify it *relative* to. Do you want to move it relative to other elements in the figure? In other words, do you want to move it in *figure space*? Or do you want to move it relative to other elements within the parent, or local collection - *local space*. Alternately, you might want to modify the vertices of the shape, in *draw space*.

In simple figures, where no collections are used, or collections don't transform their child elements you don't really need to think about what space you are working in. Figure space will be the same as local space and vertex space. You won't care about the higher level GL or pixel spaces.

But if you have transformed collections, or if you are tying an element to a location on the screen you will need to convert points between the different spaces. In addition, it is useful to know about these different spaces as sometimes they are referred to in the documentation.

One way to think about what space you are modifying is:
* Elements that are direct children of the figure: element transforms are in figure space
* Elements that are direct children of a collection: element transforms are in local space (the space of the parent colleciton)
* Vertex definitions in element primitives: vertex space

For example, a square might be defined in vertex space as a square with length 1, centered around the origin.

The transform of the figure element primitive that controls the square will move the square in *local space* - the space relative to all other elements that are the children of the same parent collection.

If the parent collection's parent is the figure itself, then its transform will move the colleciton in figure space.

Converting between spaces is relatively straight forward. All figure elements have methods to find their position or bounds in *figure*, *local* or *vertex* space. The figure has transforms that allow conversion between *figure*, *GL* and *pixel* spaces.

Where this is useful is if two primitives have different parents, and you want to move one to be in the same position as the other. To do this you would convert the target element position to *figure space*, and then to the *local space* of the element to move.


#### Drawing

When it is time to draw the scene, the figure will pass an initial transform to the first element in the hierarchy. In the example above, the "Labeled Line" collection. This transform will include any translations and scaling needed to convert from *figure* space to *GL* space for actual rendering.

The "Labeled Line" collection will then cascade this transform with it's own rotation and translation transform, and pass this to its children, the "Label" and "Line" primitives.

The "Label" primitive has it's own transform that translates it to the middle of the horizontal line in *local* space. The transform will be combined with the one from its parent, creating a final transform to draw the label with.

The primitive's shape or text definition never needs to change. At draw time, it is simply transformed by it's own transform and all the ancestors directly above it in the hierarchy. This is the same method used by WebGL as it reduces the amount of data that needs to be loaded into the graphics memory each draw frame. All the vertices of a shape are loaded into the graphics memory just once, and each frame just a transform is passed to inform the graphics processor how to orient the vertices.

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
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.5.2/figureone.min.js'></script>
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
    method: 'collections.collection',
    elements: [
      {
        name: 'line',
        method: 'primitives.line',
        options: {
          p1: [0, 0],
          p2: [2, 0],
          width: 0.01,
          color: [0, 0, 1, 1],
        },
      },
      {
        name: 'label',
        method: 'primitives.text',
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
      touchBorder: 0.3,
    },
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

The example above shows how a figure can be defined with simple javascript objects, able to be encoded simply in JSON. This means complex figures or modules can be shared and reused easily.

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