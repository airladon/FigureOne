
#### Touch

Figure elements can be made touchable (or clickable with a mouse).

To set an element as touchable, use the `touch` property during its definition or the <a href="#figureelementsettouchable">FigureElement.setTouchable()</a> method on the element after its creation.

The following three examples all set an element to be touchable, and trigger a console statement when touched.

```js
// Use a notification to handle a touch event
const hex = figure.add({
  make: 'polygon',
  sides: 6,
  color: [1, 0, 0, 1],
  touch: true,
});
hex.notifications.add('onClick', () => console.log('Touched!'));
```

```js
// Create a touchable element
figure.add({
  make: 'polygon',
  sides: 6,
  color: [1, 0, 0, 1],
  // simply including the `touch` property will make the element touchable
  touch: {
    onClick: () => console.log('Touched!'),
  },
});
```

```js
// Set an element to be touchable after creation
const hex = figure.add({
  make: 'polygon',
  sides: 6,
  color: [1, 0, 0, 1],
});
hex.setTouchable({ onClick: () => console.log('Touched!')});
```

Sometimes touching small elements can be challenging with a finger. Therefore it is useful to set how much of the area around an element can also trigger a touch event. To do so, borders and touch borders of elements can be defined.

#### Borders

##### Two Dimensions

Two dimensional shapes can have borders and touch borders to determine when shapes overlap, or when a touch event is on a shape.

Each FigureElementPrimitive has `drawBorder` and `drawBorderBuffer` properties. The `drawBorder` is typically a border around all the vertices that make up the shape. The `drawBorderBuffer` is usually equal to or larger than the `drawBorder` and often follows the contours of the border but with some additional buffer. Both types of borders can also be fully customized with an array of `Point`s.

These properties are used to calculate the `border` and `touchBorder` of a shape. The `border` can be used for determining the shape's edge, and therefore any collision it has with other shapes or the figure's edge. The `touchBorder` is used to determine when a touch event is on the shape.

While it may look like there are a lot of options to define borders below, there are really just three:
* Use the `drawBorder`
* Use the `drawBorderBuffer`
* Use a rectangle that encompasses `drawBorder` or `drawBorderBuffer` (or in the case of a FigureElementCollection, its children's borders and touchBorders) with some optional additional buffer

There are several ways to define a `border` and `touchBorder` for a FigureElementPrimitive:
* `'draw'` - use the `drawBorder` points
* `'buffer'` - use the `drawBorderBuffer` points
* `'rect'` - use the rectangle that encompasses the `drawBorder` points
* `number` - same as rect but rect is larger by `number` on all its sides
* `[number, number]` - same as rect but with left/right buffer and bottom/top buffer
* `[number, number, number, number]` - same as rect but left, bottom, right, top buffer
* `{ left?: number, bottom?: number, right?: number, top?: number }` - same as rect but left, bottom, right, top buffer
* `Array<TypeParsablePoint>` - use a custom border
* `Array<Array<TypeParsablePoint>>` - use more than one closed border that may be separate from each other
* `'border'`: for `touchBorder` only - use whatever `border` uses

A `FigureElementCollection`s `border` comes from its child elements:
* `'children'` - use the `border`s of the children
* `'rect'` - use the rectangle that encompasses the `border`s of all children
* `number` - same as rect but rect is larger by `number` on all its sides
* `[number, number]` - same as rect but with left/right buffer and bottom/top buffer
* `[number, number, number, number]` - same as rect but left, bottom, right, top buffer
* `{ left?: number, bottom?: number, right?: number, top?: number }` - same as rect but left, bottom, right, top buffer
* `Array<TypeParsablePoint>` - use a custom border
* `Array<Array<TypeParsablePoint>>` - use more than one closed border that may be separate from each other

A `FigureElementCollection`s `touchBorder` also comes from its child elements:
* `'border'`: use whatever `border` uses
* `'children'` - use the `touchBorder`s of the children
* `'rect'` - use the rectangle that encompasses the `touchBorder`s of all children
* `number` - same as rect but rect is larger by `number` on all its sides
* `[number, number]` - same as rect but with left/right buffer and bottom/top buffer
* `[number, number, number, number]` - same as rect but left, bottom, right, top buffer
* `{ left?: number, bottom?: number, right?: number, top?: number }` - same as rect but left, bottom, right, top buffer
* `Array<TypeParsablePoint>` - use a custom border
* `Array<Array<TypeParsablePoint>>` - use more than one closed border that may be separate from each other

The border for a FigureElement can be retrieved with <a href="#figureelementgetborder">FigureElementPrimitive.getBorder()</a> and <a href="#figureelementcollectiongetborder">FigureElementCollection.getBorder()</a>

When debugging, the borders and touchBorders of all shapes can be shown with <a href="#showborders">Figure.showBorders()</a> and <a href="#showtouchborders">Figure.showTouchBorders()</a>.

Borders and touch borders can be created during an object's creation:

```js
const figure = new Fig.Figure();
figure.add(
  {
    make: 'polygon',
    sides: 8,
    radius: 0.2,
    // create a touch border that is a rectangle around the border
    // with a buffer of 0.1 on the left and right, and 0.3 on bottom
    // and top
    touchBorder: [0.1, 0.3],
    color: [1, 0, 0, 1],
  },
);
figure.showTouchBorders();
```

##### Three Dimensions

In two dimensions, polygon borders are used to define the borders within which figure elements can be touched. Polygon borders are useful as arbitrary touch borders can be selected that are unrelated to the shape drawn to the screen.

In three dimensions, defining volumes in which to select becomes challenging, both to define the volumes and to decide which volume was selected in a quick time on slower client devices.

Therefore, selection of 3D objects is performed in FigureOne by:
 * Rendering each touchable element into a temporary texture
 * Each element is rendered with a unique color
 * The temporary texture pixels are mapped to the screen pixels and the corresponding touched pixel found
 * The color of the pixel touched is mapped to the figure element with that color

This method is common, performant, simple (as complex touch volumes don't need to be defined), and will automatically handle depth - elements in front of other elements relative to the camera will be selected.

When a larger touch border is required for a 3D element, use the `touchScale` property to scale the element in the temporary texture.

When debugging, the `figure.showTouchable()` method can be used to render the temporary texture being used to determine what is touched to the screen.

```js
const figure = new Fig.Figure({ scene: { style: 'orthographic' } });

figure.add({
  make: 'cube',
  color: [1, 0, 0, 1],
  touch: true,
  touchScale: 1.5,
});
figure.showTouchable();
```

#### Move Interactivity

Once an element is touched, it can be moved. How movement is defined depends on whether the movement is happening in two or three dimensions.

##### Two Dimensions

##### Three Dimensions

In three dimensions a choice needs to be made about how a mouse of finger movement on a 2D screen translates to a movement in 3D space.

The default way to do this in FigureOne is to use a movement plane (`element.move.plane`). FigureOne will automatically project a movement on the screen onto this plane and move the element accordingly.

For example, to create a cube that can be translated in the YZ plane:

>> For the following examples, use the explanation <a href="#shapes3d-explanation-boilerplate">boiler plate</a> from the 3D shape primitives section.


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

TODO note on rotation challenges

#### Camera Interactivity

In 3D figures, it is often useful to allow a user to change the scene manually using gestures. This can be achieved by changing the scene with `setCamera` to change the camera location and `setProjection` to change the expanse of visible space.

FigureOne also provides a built-in FigureElementPrimitive `cameraControl` (see {@link OBJ_CameraControl}) which defines a transparent rectangle in which the user can swipe horizontally to rotate a scene around a vertical axis, and swipe vertically to change the elevation of the camera relative to the vertical axis.

>> Use the explanation <a href="#shapes3d-explanation-boilerplate">boiler plate</a> from the 3D shape primitives section for this example.

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
