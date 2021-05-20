WebGL utilizes hardware acceleration to draw very complex shapes - even on low end devices. Most FigureOne FigureElementPrimitives interface directly with WebGL to render the shapes, and as such a user doesn't need to know anything about WebGL to use FigureOne.

FigureOne also provides a FigureElementPrimitive (`GLPrimitive`) with direct access to WebGL shaders and buffers. This means a user with some WebGL experience can write custom shaders which may dramatically increase the performance of a particularly complicated figure, or a figure with special graphical effects.

It is not in the scope of this API reference to explain what WebGL is, and how to use it. There are many good resources on the web that already do this - for example [WebGLFundamentals](https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html) gives an excellent introduction to WebGL and this [quick reference guid](https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf) is useful to refer to especially when writing shaders. A WebGL API reference is [here](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext).

For more detailed information on how to create a FigureOne `GLPrimitive`, and customize shaders and buffers see [this tutorial](https://github.com/airladon/FigureOne/tree/master/docs/tutorials/19%20-%20Performance%20Optimization).

![](../tutorials/19%20-%20Performance%20Optimization/08%20custom%20shader/example.gif)

Another example of a `GLPrimitive` in action is from the FigureOne examples [here](https://github.com/airladon/FigureOne/tree/master/docs/examples/Electric%20Field/).

![](../examples/Electric%20Field/example.gif)



