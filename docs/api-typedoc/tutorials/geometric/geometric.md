---
title: Geometry
group: Geometry
---
# Geometry
To define many shapes, geometric concepts such as points and lines need to be used.

FigureOne includes classes that define a:
* {@link Point}
* {@link Line}
* {@link Plane}
* {@link Rect}
* {@link Transform}

Each of these classes have convenience methods that make it easy to to work with them such as
* Checking if two points are equal or within some delta
* Adding, subtracting and multiplying points
* Checking if a point is on a line, or inside a rectangle
* Finding the intersection between two lines
* Transforming a point with a transform
* Chaining transforms together

There are many more methods in each class and it is recommended you quickly review them so you know what is available and don't need to reimplement existing logic.

Many of these classes are used by each other. For instance, {@link Line} makes a lot of use of {@link Point}. Therefore instead of defining a point by instantiating a class each time, short hand, parsable equivalents for Points, Lines, Rectangles and Transforms are available. For more information refer to:

* {@link TypeParsablePoint}
* {@link TypeParsableLine}
* {@link TypeParsablePlane}
* {@link TypeParsableRect}
* {@link TypeParsableTransform}