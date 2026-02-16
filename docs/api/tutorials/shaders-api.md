---
title: Shaders API
group: Shaders
---

# Shaders API Reference

## Contents

- [TypeGLBufferType](#typeglbuffertype)
- [TypeGLBufferUsage](#typeglbufferusage)
- [TypeGLUniform](#typegluniform)
- [TypeGLPrimitive](#typeglprimitive)
- [OBJ_GLAttribute](#obj_glattribute)
- [OBJ_GLVertexBuffer](#obj_glvertexbuffer)
- [OBJ_GLUniform](#obj_gluniform)
- [OBJ_GLColorData](#obj_glcolordata)
- [OBJ_GenericGL](#obj_genericgl)
- [OBJ_VertexShader](#obj_vertexshader)
- [TypeVertexShader](#typevertexshader)
- [OBJ_FragmentShader](#obj_fragmentshader)
- [TypeFragmentShader](#typefragmentshader)

---

## TypeGLBufferType

`'BYTE' | 'UNSIGNED_BYTE' | 'SHORT' | 'UNSIGNED_SHORT' | 'FLOAT'`

---

## TypeGLBufferUsage

`'STATIC' | 'DYNAMIC'`

---

## TypeGLUniform

`'FLOAT' | 'FLOAT_VECTOR' | 'INT' | 'INT_VECTOR'`

---

## TypeGLPrimitive

GL primitive type that describes the shapes the vertices are creating.
Analagous to WebGL [drawing primitives](https://webglfundamentals.org/webgl/lessons/webgl-points-lines-triangles.html)
where the mapping between the two are:
- `'TRIANGLES'`: TRIANGLES
- `'STRIP'`: TRIANGLE_STRIP
- `'FAN'`: TRIANGLE_FAN
- `'LINES'`: LINES
- `'POINTS'`: LINES

`'TRIANGLES' | 'POINTS' | 'FAN' | 'STRIP' | 'LINES'`

---

## OBJ_GLAttribute

GL buffer.

### Properties

<div class="fo-prop"><span class="fo-prop-name">name</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>)</span><span class="fo-prop-desc">: name of attribute in shader</span></div>
<div class="fo-prop"><span class="fo-prop-name">data</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>>)</span><span class="fo-prop-desc">: array of values</span></div>
<div class="fo-prop"><span class="fo-prop-name">size</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc">: number of values per attribute (<code>2</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">type</span> <span class="fo-prop-type">(<a href="../types/DrawingObjects_GLObject_GLObject.TypeGLBufferType.html">TypeGLBufferType</a>?)</span><span class="fo-prop-desc"> (<code>'FLOAT'</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">normalize</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc"> (<code>false</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">stride</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">offset</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>?)</span><span class="fo-prop-desc"> (<code>0</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">usage</span> <span class="fo-prop-type">(<a href="../types/DrawingObjects_GLObject_GLObject.TypeGLBufferUsage.html">TypeGLBufferUsage</a>?)</span><span class="fo-prop-desc"> (<code>'STATIC'</code>)</span></div>

---

## OBJ_GLVertexBuffer

GL vertex - associated with attribute 'a_vertex' in shader.

Assumes buffer parameters of:
- name: 'a_vertex'
- size: 2
- type: 'FLOAT'
- normalize: false
- stride: 0
- offset: 0

### Properties

<div class="fo-prop"><span class="fo-prop-name">data</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>>)</span><span class="fo-prop-desc">: array of values</span></div>
<div class="fo-prop"><span class="fo-prop-name">usage</span> <span class="fo-prop-type">(<a href="../types/DrawingObjects_GLObject_GLObject.TypeGLBufferUsage.html">TypeGLBufferUsage</a>?)</span><span class="fo-prop-desc"> (<code>'STATIC'</code>)</span></div>

---

## OBJ_GLUniform

GL Uniform

### Properties

<div class="fo-prop"><span class="fo-prop-name">name</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>)</span><span class="fo-prop-desc">: name of uniform in shader</span></div>
<div class="fo-prop"><span class="fo-prop-name">length</span> <span class="fo-prop-type">(1 | 2 | 3 | 4)</span></div>
<div class="fo-prop"><span class="fo-prop-name">type</span> <span class="fo-prop-type">(<a href="../types/DrawingObjects_GLObject_GLObject.TypeGLUniform.html">TypeGLUniform</a>)</span></div>

---

## OBJ_GLColorData

Color definition for a gl primitive.

### Properties

<div class="fo-prop"><span class="fo-prop-name">data</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>>)</span><span class="fo-prop-desc">: color data</span></div>
<div class="fo-prop"><span class="fo-prop-name">normalize</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean">boolean</a>?)</span><span class="fo-prop-desc">: if <code>true</code>, then color data values are between
0 and 255 (<code>false</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">size</span> <span class="fo-prop-type">(3 | 4?)</span><span class="fo-prop-desc">: if <code>3</code>, then color data is RGB, if <code>4</code> then color
data is RGBA</span></div>

---

## OBJ_GenericGL

DiagramElementPrimitive with low level WegGL drawing object.

A number of WebGL specific properties can be defined.

WebGL specific properties are `glPrimitive`, `vertexShader`, `fragmentShader`
`attributes`, `uniforms` and an optional `texture`. The
nomencalture for these properties is directly from WebGL.

Properties `vertices`, `colors`, `dimension`, `light` and `normals` provide
shortcuts for defining the shaders, attributes and uniforms when shaders are
not customized.

Shaders are programs that run in the GPU and are written in a C-like
language. Shaders operate on each vertex of a shape in parallel. The vertex
shader transforms each vertex to some specific position, and performs color
and lighting related calculations for scenarios when color and/or lighting
are vertex specific. The fragment shader computes the final color of each
pixel (fragment) between the vertices that make up a `glPrimitive`.

Data can be passed from the CPU (JavaScript) to the GPU with attributes and
uniforms.

Attributes are arrays of numbers that represent data specific for
each vertex in a shape. At a minimum, an attribute that defines the (x, y)
or (x, y, z) coordinates of each vertex is needed. Other attributes might be
color if all verticies do not have the same color, texture coordinates to
map vertex color to a 2D image texture, and normal vectors for defining how
light reflects from and thus brightens a surface. Each attribute must define
data for every vertex in a shape. Attributes are typically defined and loaded
into GPU buffers once. On each animation frame, the GPU will pass the
buffered attributes to the shaders. Attributes are only passed to the vertex
shader.

Uniforms are small amounts of data (vectors or square matrices with a maximum
dimension/rank of 4) that are passed from the CPU to the GPU on each frame.
A uniform value can be passed to both the vertex and fragment shader and is
thus available to all vertices and fragments. A uniform is like a
global variable whose value can change on each animation frame. Example
uniforms are:
- transform matrix that transforms all vertices in space the same way
- color value that colors all vertices the same (instead of having to define
  a color for each vertex)
- light source properties like position, direction, and amplitude

Data can be passed from the vertex shader to the fragment shader in variables
called *varyings*. Example varyings include color attributes (color that is
defined for each vertex) and lighting information if the lighting is vertex
dependent.

Shaders source code can be defined as a string, or composed automatically
from options including `dimension`, `color` and `light`. Shader source code
contains attribute and uniform variables, and these attributes and uniforms
need to be defined with `attributes` and `uniforms`.

If using automated shader composition, then only attributes need to be
defined. The uniforms will be passed to the shader from the information in
the `color` property of the FigureElementPrimitive and the `scene` used to
draw the primitive. See {@link OBJ_VertexShader} and
{@link OBJ_FragmentShader} for names of attributes and uniforms used in the
shaders, and when they are used.

### Properties

<div class="fo-prop"><span class="fo-prop-name">glPrimitive</span> <span class="fo-prop-type">(<a href="../types/FigurePrimitives_FigurePrimitiveTypes.TypeGLPrimitive.html">TypeGLPrimitive</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">vertexShader</span> <span class="fo-prop-type">(<a href="../types/webgl_shaders.TypeVertexShader.html">TypeVertexShader</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">fragmentShader</span> <span class="fo-prop-type">(<a href="../types/webgl_shaders.TypeFragmentShader.html">TypeFragmentShader</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">attributes</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_GLAttribute.html">OBJ_GLAttribute</a>>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">uniforms</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_GLUniform.html">OBJ_GLUniform</a>>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">texture</span> <span class="fo-prop-type">(<a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_Texture.html">OBJ_Texture</a>?)</span></div>
<div class="fo-prop"><span class="fo-prop-name">dimension</span> <span class="fo-prop-type">(2 | 3?)</span><span class="fo-prop-desc">: default value for `dimension in vertex shader
if vertex shader is undefined (<code>2</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">light</span> <span class="fo-prop-type">('point' | 'directional' | null?)</span><span class="fo-prop-desc">: default value for <code>light</code>
in vertex and fragment shader if shaders are not otherwise defined (<code>null</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">colors</span> <span class="fo-prop-type">(<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>> | <a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_GLColorData.html">OBJ_GLColorData</a>?)</span><span class="fo-prop-desc">: default value for
<code>light</code> in vertex and fragment shader if shaders are not otherwise defined (<code>uniform</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">vertices</span> <span class="fo-prop-type">(<a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_GLVertexBuffer.html">OBJ_GLVertexBuffer</a>?)</span><span class="fo-prop-desc">: create a <code>a_vertex</code> attribute for
vertex coordinates</span></div>
<div class="fo-prop"><span class="fo-prop-name">normals</span> <span class="fo-prop-type">(<a href="../interfaces/FigurePrimitives_FigurePrimitiveTypes.OBJ_GLVertexBuffer.html">OBJ_GLVertexBuffer</a>?)</span><span class="fo-prop-desc">: create a <code>a_normal</code> attribute</span></div>

#### Default options are 2D, uniform color, TRIANGLES.

```js
// Create two red triangles (6 vertices, 12 values)
figure.add({
  make: 'gl',
  vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
  color: [1, 0, 0, 1],
});
```

#### Simple rotatable element with a custom position

```js
figure.add({
  make: 'gl',
  vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
  color: [1, 0, 0, 1],
  position: [-0.4, -0.4, 0],
  move: { type: 'rotation' },
});
```

#### Assign a color to each vertex

```js
figure.add({
  make: 'gl',
  vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
  colors: [
    0, 0, 1, 1,
    1, 0, 0, 1,
    0, 0, 1, 1,
    1, 0, 0, 1,
    0, 0, 1, 1,
    1, 0, 0, 1,
  ],
});
```

#### Assign a color to each vertex, using just 3 numbers per color (no alpha)

```js
figure.add({
  make: 'gl',
  vertices: [0, 0, 0.5, 0, 0, 0.5, 0.5, 0, 1, 0, 0.5, 0.5],
  colors: {
    data: [
      0, 0, 1,
      1, 0, 0,
      0, 0, 1,
      1, 0, 0,
      0, 0, 1,
      1, 0, 0,
    ],
    size: 3,
  },
});
```

#### Texture filled square

```js
figure.add({
  make: 'gl',
  vertices: [-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5],
  numVertices: 6,
  texture: {
    src: './flower.jpeg',
    coords: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
    loadColor: [0, 0, 0, 0],
  },
});
```

#### Make a 3D cube using composed shaders

```js
const { toNumbers } = Fig;
const [cubeVertices, cubeNormals] = Fig.cube({ side: 0.5 });
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [2, 1, 2] });
figure.scene.setLight({ directional: [0.7, 0.5, 1] });

figure.add({
  make: 'gl',
  light: 'directional',
  dimension: 3,
  vertices: toNumbers(cubeVertices),
  normals: toNumbers(cubeNormals),
  color: [1, 0, 0, 1],
});
```

#### Custom shaders

```js
// Make a shader with a custom attribute aVertex and custom uniform uColor,
// which are then defined in the options.
// Note, the `u_worldViewProjectionMatrix` uniform does not need to be defined
// as this will be passed by FigureOne using the Scene information of the
// figure (or element if an element has a custom scene attached to it).
figure.add({
  make: 'gl',
  vertexShader: {
    src: `
      uniform mat4 u_worldViewProjectionMatrix;
      attribute vec4 aVertex;
      void main() {
        gl_Position = u_worldViewProjectionMatrix * aVertex;
      }`,
    vars: ['aVertex', 'u_worldViewProjectionMatrix'],
  },
  fragmentShader: {
    src: `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
      gl_FragColor = uColor;
      gl_FragColor.rgb *= gl_FragColor.a;
    }`,
    vars: ['uColor'],
  },
  attributes: [
    {
      name: 'aVertex',
      size: 3,
      data: [0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0.5, 0.5, 0],
    },
  ],
  uniforms: [
    {
      name: 'uColor',
      length: 4,
      value: [1, 0, 0, 1],
    },
  ],
});
```

---

## OBJ_VertexShader

Options used to compose vertex shader source code.

Shader source code can be automatically composed for different vertex
dimension (2D vs 3D), coloring and lighting options.

Composed source code uses specific attribute, uniform and varying names.
Attributes will need to be defined by the user in the `attributes` property
of {@link OBJ_GenericGL}.

Attributes:
- `vec2 a_vertex`: used to define vertex positions when `dimension = 2`.
- `vec4 a_vertex`: used to define vertex positions when `dimension = 3` -
  Note, for this case an attribute size of only 3 is needed as the fourth
  coordinate (w in the homogenous coordinate system) is automatically filled
  with a 1.
- `vec4 a_color`: used to define the color of a vertex when `color = 'vertex'`
- `vec2 a_texcoord`: used to define the texture coordinates to map the
  vertex to when `color = 'texture'`
- `vec3 a_normal`: used to define the normal vector for a vertex used when
  `light = 'point'` or `light = 'directional'`


Uniforms will be defined and updated by FigureOne based on the color and
transform of the primitive, and the scene being used to draw the primitive.
Thus, the uniform variables listed below for are for informational purposes
only.

Uniforms:
- `mat4 u_worldViewProjectionMatrix`: transfomration matrix that cascades
  projection, camera position, and any additional transformation of the shape
- `float u_z`: define a specific z for all vertices when `dimension = 2`
- `u_worldInverseTranspose`: transpose of inverse world matrix needed for
  to correctly transform normal vectors. Used when `light = 'point'` or
  `light = 'directional'`
- `vec3 u_lightWorldPosition`: defines the position of a point source light
   used when `light = 'point'`
- `mat4 u_worldMatrix`: defines the world matrix transform that orients the
  point source light relative to the shape used when `light = 'point'`.

Varyings are passed from the vertex shader to the fragement shader. They are
listed here in case the user wants to customize one shader, while relying on
composition for the other. All varying expected by the composed shader will
need to be defined in the custom shader.

- `vec2 v_texcoord`: pass texture coordinates to fragment shader used when
  `color = 'texture'`
- `vec4 v_color`: pass vertex specific color to fragment shader used when
  `color = 'vertex'`
- `vec3 v_normal`: pass normals (transformed with `u_worldInverseTranspose`)
   to fragment shader used when `light = 'directional'` or `light = 'point'`
- `vec3 v_vertexToLight`: pass vector between point source light and vertex
   to fragment shader used when `light = 'point'`

### Properties

<div class="fo-prop"><span class="fo-prop-name">dimension</span> <span class="fo-prop-type">(2 | 3?)</span><span class="fo-prop-desc"> (<code>2</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">('vertex' | 'uniform' | 'texture'?)</span><span class="fo-prop-desc"> (<code>uniform</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">light</span> <span class="fo-prop-type">('point' | 'directional' | null?)</span><span class="fo-prop-desc"> (<code>null</code>)</span></div>

---

## TypeVertexShader

A vertex shader can be defined with either:
- `{ src: string, vars: Array<string> }`: a shader source code string and a
  list of attributes and uniforms
- `string`: an identifier to a built-in shader
- {@link OBJ_VertexShader} `| Array<string | number | boolean>`: composing
  options for a composable shader

---

## OBJ_FragmentShader

Options used to compose fragment shader source code.

Shader source code can be automatically composed for different coloring and
lighting options.

Composed source code uses specific uniform and varying names.

Uniforms will be defined and updated by FigureOne based on the color and
transform of the primitive, and the scene being used to draw the primitive.
Thus, the uniform variables listed below for are for informational purposes
only.

Uniforms:
- `vec4 u_color`: global color for all vertices used all times. When
  `color = 'texture'` or `color = 'vertex'`, only the alpha channel of
  `u_color` is used.
- `sampler2D u_texture`: texture used when `color = 'texture'`.
- `vec3 u_directionalLight`: world space position of directional light
  source used when `light = 'directional'`
- `float u_ambientLight`: ambient light used when `light = 'directional'` or
  `light = 'point'`.

Varyings are passed from the vertex shader to the fragement shader. They are
listed here in case the user wants to customize one shader, while relying on
composition for the other.

- `vec2 v_texcoord`: texture coordinates from vertex shader used when
  `color = 'texture'`
- `vec4 v_color`: vertex specific color from vertex shader used when
  `color = 'vertex'`
- `vec3 v_normal`: normals from vertex shader used when
  `light = 'directional'` or `light = 'point'`
- `vec3 v_vertexToLight`: vector between point source light and vertex
   from vertex shader used when `light = 'point'`

### Properties

<div class="fo-prop"><span class="fo-prop-name">dimension</span> <span class="fo-prop-type">(2 | 3?)</span><span class="fo-prop-desc"> (<code>2</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">color</span> <span class="fo-prop-type">('vertex' | 'uniform' | 'texture'?)</span><span class="fo-prop-desc"> (<code>uniform</code>)</span></div>
<div class="fo-prop"><span class="fo-prop-name">light</span> <span class="fo-prop-type">('point' | 'directional' | null?)</span><span class="fo-prop-desc"> (<code>null</code>)</span></div>

---

## TypeFragmentShader

A fragment shader can be defined with either:
- `{ src: string, vars: Array<string> }`: a shader source code string and a
  list of attributes and uniforms
- `string`: an identifier to a built-in shader
- {@link OBJ_VertexShader} `| Array<string | number | boolean>`: composing
  options for a composable shader

---

