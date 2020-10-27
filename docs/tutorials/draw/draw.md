Each {@link DiagramElementPrimitive} element manages drawing a shape, drawing text, or manipulating a HTML element.

FigureOne's built-in shapes are drawn using WebGL, which uses triangles to create different shapes. To draw a shape, you define the verticies of the triangles. Every drawing frame (animation or screen refresh), the color of the vertices and the transform that moves them around is used to render the final shape to the screen.


### <a id="drawing-boilerplate"></a> Drawing Boilerplate
To test examples within the 'Drawing Shapes' sections of the API reference create an `index.html` file and `index.js` file.

All examples are snippets which can be appended to the end of the `index.js` file.

```html
<!-- index.html -->
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 800px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.2.3/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

```javascript
// index.js
const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});
```

### Quick Start

Let's start by creating a {@link DiagramElementPrimitive} element that draws a polygon and adding it to the diagram.

```javascript
// create the `DiagramElementPrimitive`
const p = diagram.create.polygon({
  radius: 0.2,
  fill: true,
  color: [0, 0, 1, 1],
  sides: 6,
});
// add it to the diagram
diagram.elements.add('p', p);
```

Another way to create and add the same shape to the diagram is to use the `Diagram.addElement` or `Diagram.addElements` method:

```javascript
diagram.addElement({
  name: 'p',
  method: 'polygon',
  options: {
    radius: 0.2,
    fill: true,
    color: [0, 0, 1, 1],
    sides: 6,
  },
});
```

Both ways create the same element. The first way is more programatic and especially useful when extending shape creation classes. In comparison, the second way can allow you to layout an entire diagram in a single object that is compatible with JSON. This means it is relatively straight forward to share diagram elements between projects. When using code folding in an IDE, the second way also makes it easy to work with diagrams with many elements.

For most of the API reference, the second way will be used.

### Built-in Shapes

There are several built in shape methods that can be used to create complex diagrams:
* <a href="#obj_line">line</a>
* <a href="#obj_polyline">polyline</a>
* <a href="#obj_triangle">triangle</a>
* <a href="#obj_rectangle">rectangle</a>
* <a href="#obj_polygon">polygon</a>

### Drawing a generic shape

While there are several built-in shapes such as polygons, rectangles and polylines in FigureOne, there is also a 'generic' method that will allow creation of any shape.

To use the generic method however, it is important to understand how WebGL uses triangles to create shapes.

Any shape can be quantized into triangles. For instance, the digram below shows a rectangle broken into two triangles with vertices labeled.

<p style="text-align: center"><img src="./tutorials/draw/rect.png"></p>

To draw this shape, you would need to draw the two triangles, which means drawing 6 vertices:
* 1, 2, 3
* 1, 3, 4

```javascript
diagram.addElement({
  name: 'rectangle',
  method: 'generic',
  options: {
    points: [
      [-2, -1], [-2, 1], [2, 1],
      [-2, -1], [2, 1], [2, -1],
    ],
    drawType: 'triangles',
  },
});
```

This method will be able to draw almost anything.

However, for some shapes there are simpler ways to draw the same thing with fewer repeated vertices.

#### drawType: 'strip'

A strip starts with one triangle, and then every subsequent vertex will create a triangle with the last two vertices.

Therefore, to draw the same rectangle we would draw the first triangle with the vertices 2, 1 and then 3. Then 1 and 3 could be used with 4 to create the second triangle.

```javascript
diagram.addElement({
  name: 'rectangle',
  method: 'generic',
  options: {
    points: [
      [-2, 1], [-2, -1], [2, 1],  // first triangle
      [2, -1],                    // second triangle formed with vertices 1 and 3
    ],
    drawType: 'strip',
  },
});
```

This method works well for continuous shapes, but will not work for shapes that have gaps.

A good example of a shape that works with `'strip'` is below. The vertices are labeled in the order they would be defined.

<p style="text-align: center"><img src="./tutorials/draw/strip.png"></p>

#### drawType: 'fan'

A fan starts with one point. The next two points create the first triangle, and then every subsequent point uses the first and last point to create the next triangle.

Therefore, to draw the same rectangle we would draw the first point 1, then complete the first triangle with 2 and 3. Then we would draw point 4 to make the second triangle with points 1 and 3.

```javascript
diagram.addElement({
  name: 'rectangle',
  method: 'generic',
  options: {
    points: [
      [-2, -1],         // first point (vertex 1)
      [-2, 1], [2, 1],  // complete first triangle (vertices 2, 3)
      [2, -1],          // second triangle formed with first and last vertex (1, 3)
    ],
    drawType: 'fan',
  },
});
```

This method works for any shape that can be broken into triangles that all share a common point. For example:

<p style="text-align: center"><img src="./tutorials/draw/fan.png"></p>

Note, `'strip'` can create any shape `'fan'` can, but it can be a little more involved. For instance, the shape above would need to duplicate one of the vertices to fully fill it:

<p style="text-align: center"><img src="./tutorials/draw/strip-fan.png"></p>

#### drawType: 'lines'

`'lines'` is the final style that WebGL accepts for drawing primitives. In this case vertex pairs are used to create lines.

This is not useful for drawing filled shapes, but is useful for drawing thin outlines.

For instance, to draw a rectangle outline:
```javascript
diagram.addElement({
  name: 'rectangle',
  method: 'generic',
  options: {
    points: [
      [-2, -1], [-2, 1],  // left edge
      [-2, 1], [2, 1],    // top edge
      [2, 1], [2, -1],    // right edge
      [2, -1], [-2, -1],  // bottom edge
    ],
    drawType: 'lines',
  },
});
```