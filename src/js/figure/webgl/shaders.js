// @flow
import { joinObjects } from '../../tools/tools';

/**
 * Options used to compose vertex shader source code.
 *
 * Shader source code can be automatically composed for different vertex
 * dimension (2D vs 3D), coloring and lighting options.
 *
 * Composed source code uses specific attribute, uniform and varying names.
 * Attributes will need to be defined by the user in the `attributes` property
 * of {@link OBJ_GLPrimitive}.
 *
 * Attributes:
 * - `vec2 a_vertex`: used to define vertex positions when `dimension = 2`.
 * - `vec4 a_vertex`: used to define vertex positions when `dimension = 3` -
 *   Note, for this case an attribute size of only 3 is needed as the fourth
 *   coordinate (w in the homogenous coordinate system) is automatically filled
 *   with a 1.
 * - `vec4 a_color`: used to define the color of a vertex when `color = 'vertex'`
 * - `vec2 a_texcoord`: used to define the texture coordinates to map the
 *   vertex to when `color = 'texture'`
 * - `vec3 a_normal`: used to define the normal vector for a vertex used when
 *   `light = 'point'` or `light = 'directional'`
 *
 *
 * Uniforms will be defined and updated by FigureOne based on the color and
 * transform of the primitive, and the scene being used to draw the primitive.
 * Thus, the uniform variables listed below for are for informational purposes
 * only.
 *
 * Uniforms:
 * - `mat4 u_worldViewProjectionMatrix`: transfomration matrix that cascades
 *   projection, camera position, and any additional transformation of the shape
 * - `float u_z`: define a specific z for all vertices when `dimension = 2`
 * - `u_worldInverseTranspose`: transpose of inverse world matrix needed for
 *   to correctly transform normal vectors. Used when `light = 'point'` or
 *   `light = 'directional'`
 * - `vec3 u_lightWorldPosition`: defines the position of a point source light
 *    used when `light = 'point'`
 * - `mat4 u_worldMatrix`: defines the world matrix transform that orients the
 *   point source light relative to the shape used when `light = 'point'`.
 *
 * Varyings are passed from the vertex shader to the fragement shader. They are
 * listed here in case the user wants to customize one shader, while relying on
 * composition for the other. All varying expected by the composed shader will
 * need to be defined in the custom shader.
 *
 * - `vec2 v_texcoord`: pass texture coordinates to fragment shader used when
 *   `color = 'texture'`
 * - `vec4 v_color`: pass vertex specific color to fragment shader used when
 *   `color = 'vertex'`
 * - `vec3 v_normal`: pass normals (transformed with `u_worldInverseTranspose`)
 *    to fragment shader used when `light = 'directional'` or `light = 'point'`
 * - `vec3 v_vertexToLight`: pass vector between point source light and vertex
 *    to fragment shader used when `light = 'point'`
 *
 * @property {2 | 3} [dimension] (`2`)
 * @property {'vertex' | 'uniform' | 'texture'} [color] (`uniform`)
 * @property {'point' | 'directional' | null} [light] (`null`)
 */
export type OBJ_VertexShader = {
  light?: 'point' | 'directional' | null,
  color?: 'vertex' | 'uniform' | 'texture',
  dimension?: 2 | 3,
};

export type TypeVertexShader = string
  | { src: string, vars?: Array<string> }
  | Array<string | number | boolean>
  | OBJ_VertexShader;

/**
 * Options used to compose fragment shader source code.
 *
 * Shader source code can be automatically composed for different coloring and
 * lighting options.
 *
 * Composed source code uses specific uniform and varying names.
 *
 * Uniforms will be defined and updated by FigureOne based on the color and
 * transform of the primitive, and the scene being used to draw the primitive.
 * Thus, the uniform variables listed below for are for informational purposes
 * only.
 *
 * Uniforms:
 * - `vec4 u_color`: global color for all vertices used all times. When
 *   `color = 'texture'` or `color = 'vertex'`, only the alpha channel of
 *   `u_color` is used.
 * - `sampler2D u_texture`: texture used when `color = 'texture'`.
 * - `vec3 u_directionalLight`: world space position of directional light
 *   source used when `light = 'directional'`
 * - `float u_ambientLight`: ambient light used when `light = 'directional'` or
 *   `light = 'point'`.
 *
 * Varyings are passed from the vertex shader to the fragement shader. They are
 * listed here in case the user wants to customize one shader, while relying on
 * composition for the other.
 *
 * - `vec2 v_texcoord`: texture coordinates from vertex shader used when
 *   `color = 'texture'`
 * - `vec4 v_color`: vertex specific color from vertex shader used when
 *   `color = 'vertex'`
 * - `vec3 v_normal`: normals from vertex shader used when
 *   `light = 'directional'` or `light = 'point'`
 * - `vec3 v_vertexToLight`: vector between point source light and vertex
 *    from vertex shader used when `light = 'point'`
 *
 * @property {2 | 3} [dimension] (`2`)
 * @property {'vertex' | 'uniform' | 'texture'} [color] (`uniform`)
 * @property {'point' | 'directional' | null} [light] (`null`)
 */
export type OBJ_FragmentShader = {
  light?: 'point' | 'directional' | null,
  color?: 'vertex' | 'uniform' | 'texture',
};

export type TypeFragmentShader = string
  | { src: string, vars?: Array<string> }
  | Array<string | number | boolean>
  | OBJ_FragmentShader;

function composeVertexShader(
  options: {
    dimension: 2 | 3,
    color: 'vertex' | 'uniform' | 'texture',
    light: null | 'point ' | 'directional',
  } = {},
) {
  const defaultOptions = {
    dimension: 2,
    color: 'uniform',
    light: null,
  };
  const {
    dimension, light, color,
  } = joinObjects(defaultOptions, options);
  let src = '\nuniform mat4 u_worldViewProjectionMatrix;\n';
  const vars = ['u_worldViewProjectionMatrix'];

  // Vertex position
  if (dimension === 2) {
    src += 'attribute vec2 a_vertex;\n';
    src += 'uniform float u_z;\n';
    vars.push('a_vertex', 'u_z');
  } else if (dimension === 3) {
    src += 'attribute vec4 a_vertex;\n';
    vars.push('a_vertex');
  }

  if (color === 'texture') {
    src += 'attribute vec2 a_texcoord;\n';
    src += 'varying vec2 v_texcoord;\n';
    vars.push('a_texcoord');
  } else if (color === 'vertex') {
    src += 'attribute vec4 a_color;\n';
    src += 'varying vec4 v_color;\n';
    vars.push('a_color');
  }

  // Normals
  if (light != null) {
    src += 'attribute vec3 a_normal;\n';
    src += 'varying vec3 v_normal;\n';
    src += 'uniform mat4 u_worldInverseTranspose;\n';
    vars.push('u_worldInverseTranspose', 'a_normal');
  }

  // Point Light requires light direction calculation per vertex
  if (light === 'point') {
    src += 'uniform vec3 u_lightWorldPosition;\n';
    src += 'uniform mat4 u_worldMatrix;\n';
    src += 'varying vec3 v_vertexToLight;\n';
    vars.push('u_lightWorldPosition', 'u_worldMatrix');
  }

  // Main Program
  src += 'void main() {\n';

  // Dimensional gl_Position
  if (dimension === 2) {
    src += '  gl_Position = u_worldViewProjectionMatrix * vec4(a_vertex.xy, u_z, 1);\n';
  } else {
    src += '  gl_Position = u_worldViewProjectionMatrix * a_vertex;\n';
  }

  if (color === 'texture') {
    src += '  v_texcoord = a_texcoord;\n';
  } else if (color === 'vertex') {
    src += '  v_color = a_color;\n';
  }

  if (light != null) {
    src += '  v_normal = mat3(u_worldInverseTranspose) * a_normal;\n';
  }

  if (light === 'point') {
    src += '  vec3 vertexWorldPosition = (u_worldMatrix * a_vertex).xyz;\n';
    src += '  v_vertexToLight = u_lightWorldPosition - vertexWorldPosition;\n';
  }

  src += '}\n';

  return [src, vars];
}

function composeFragShader(
  options: {
    light: null | 'point ' | 'directional',
    color: 'vertex' | 'uniform' | 'texture',
  } = {},
) {
  const defaultOptions = {
    color: 'uniform',
    light: null,
  };
  const {
    light, color,
  } = joinObjects(defaultOptions, options);

  let src = '\nprecision mediump float;\n';
  src += 'uniform vec4 u_color;\n';
  const vars = ['u_color'];

  if (color === 'vertex') {
    src += 'varying vec4 v_color;\n';
    vars.push('v_color');
  } else if (color === 'texture') {
    src += 'uniform sampler2D u_texture;\n';
    src += 'varying vec2 v_texcoord;\n';
    vars.push('u_texture');
  }

  if (light === 'directional') {
    src += 'varying vec3 v_normal;\n';
    src += 'uniform vec3 u_directionalLight;\n';
    src += 'uniform float u_ambientLight;\n';
    vars.push('u_ambientLight', 'u_directionalLight');
  } else if (light === 'point') {
    src += 'varying vec3 v_normal;\n';
    src += 'varying vec3 v_vertexToLight;\n';
    src += 'uniform float u_ambientLight;\n';
    vars.push('u_ambientLight');
  }


  // Main Program
  src += 'void main() {\n';
  if (color === 'vertex') {
    src += '  gl_FragColor = v_color;\n';
    src += '  gl_FragColor.a *= u_color.a;\n';
    src += '  gl_FragColor.rgb *= gl_FragColor.a;\n';
  } else if (color === 'uniform') {
    src += '  gl_FragColor = u_color;\n';
    src += '  gl_FragColor.rgb *= gl_FragColor.a;\n';
  } else if (color === 'texture') {
    src += '  gl_FragColor = texture2D(u_texture, v_texcoord) * u_color.a;\n';
  }

  // src += '  gl_FragColor.rgb *= gl_FragColor.a;\n';
  if (light === 'directional') {
    src += '  vec3 normal = normalize(v_normal);\n';
    src += '  float light = dot(normal, u_directionalLight);\n';
    src += '  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_ambientLight);\n';
  } else if (light === 'point') {
    src += '  vec3 normal = normalize(v_normal);\n';
    src += '  vec3 surfaceToLightDirection = normalize(v_vertexToLight);\n';
    src += '  float light = dot(normal, surfaceToLightDirection);\n';
    src += '  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_ambientLight);\n';
  }

  src += '}\n';

  return [src, vars];
}

const vertex = {
  simple: {
    src: `
attribute vec4 a_vertex; 
uniform mat4 u_worldViewProjectionMatrix;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_vertex;
}`,
    vars: ['a_vertex', 'u_worldViewProjectionMatrix'],
  },
  selector: {
    src: `
attribute vec4 a_vertex; 
uniform mat4 u_worldViewProjectionMatrix;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_vertex;
}`,
    vars: ['a_vertex', 'u_worldViewProjectionMatrix'],
  },
  noLight: {
    src:
        'attribute vec3 a_vertex;'
        + 'uniform mat4 u_worldMatrix;'
        + 'uniform mat4 u_projectionMatrix;'
        + 'uniform mat4 u_viewMatrix;'
        + 'void main() {'
          + 'gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_vertex.xyz, 1);'
        + '}',
    vars: ['a_vertex', 'u_worldMatrix', 'u_projectionMatrix', 'u_viewMatrix'],
  },
  pointLight: {
    src: `
attribute vec4 a_vertex;
attribute vec3 a_normal;
varying vec3 v_normal;
uniform vec3 u_lightWorldPosition;
uniform mat4 u_worldMatrix;
uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_worldInverseTranspose;
varying vec3 v_vertexToLight;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_vertex;
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
  vec3 vertexWorldPosition = (u_worldMatrix * a_vertex).xyz;
  v_vertexToLight = u_lightWorldPosition - vertexWorldPosition;
}`,
    vars: ['a_vertex', 'a_normal', 'u_worldViewProjectionMatrix', 'u_worldInverseTranspose', 'u_lightWorldPosition', 'u_worldMatrix'],
  },
  directionalLight: {
    src: `
attribute vec4 a_vertex;
attribute vec3 a_normal;
varying vec3 v_normal;
uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_worldInverseTranspose;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_vertex;
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
}`,
    vars: ['a_vertex', 'a_normal', 'u_worldViewProjectionMatrix', 'u_worldInverseTranspose'],
  },
  vertexColor: {
    src:
        `
attribute vec2 a_vertex;
attribute vec4 a_color;
varying vec4 v_color;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform float u_z;
void main() {
  gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_vertex.xy, u_z, 1);
  v_color = a_color;
}`,
    vars: ['a_vertex', 'a_color', 'u_worldMatrix', 'u_z', 'u_projectionMatrix', 'u_viewMatrix'],
  },
  vertexColor3D: {
    src:
        `
attribute vec3 a_vertex;
attribute vec4 a_color;
varying vec4 v_color;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
void main() {
  gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_vertex.xyz, 1);
  v_color = a_color;
}`,
    vars: ['a_vertex', 'a_color', 'u_worldMatrix', 'u_projectionMatrix', 'u_viewMatrix'],
  },
  withTexture: {
    src:
        'attribute vec2 a_vertex;'
        + 'attribute vec2 a_texcoord;'
        + 'uniform mat4 u_worldMatrix;'
        + 'uniform mat4 u_projectionMatrix;'
        + 'uniform mat4 u_viewMatrix;'
        + 'uniform float u_z;'
        + 'varying vec2 v_texcoord;'
        + 'void main() {'
          + 'gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_vertex.xy, u_z, 1);'
          + 'v_texcoord = a_texcoord;'
        + '}',
    vars: ['a_vertex', 'a_texcoord', 'u_worldMatrix', 'u_z', 'u_projectionMatrix', 'u_viewMatrix'],
  },
  morph4: {
    src: `
attribute vec2 a_pos0;
attribute vec2 a_pos1;
attribute vec2 a_pos2;
attribute vec2 a_pos3;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform float u_percent;
uniform int u_from;
uniform int u_to;

void main() {
  vec2 fromPos = a_pos0;
  vec2 toPos = a_pos1;
  vec2 positions[4];

  positions[0] = a_pos0;
  positions[1] = a_pos1;
  positions[2] = a_pos2;
  positions[3] = a_pos3;

  for (int i = 0; i < 4; i++) {
    if (u_from == i) {
      fromPos = positions[i];
      break;
    }
  }
  for (int i = 0; i < 4; i++) {
    if (u_to == i) {
      toPos = positions[i];
      break;
    }
  }

  vec2 newPosition = (toPos - fromPos) * u_percent + fromPos;
  gl_Position = u_worldMatrix * vec4(newPosition.xy, u_z, 1);
}
`,
    vars: ['a_pos0', 'a_pos1', 'a_pos2', 'a_pos3', 'u_worldMatrix', 'u_percent', 'u_from', 'u_to'],
  },
  morpher: (num: number, vertexColor: boolean) => {
    let aPosDefs = '';
    let aPosArray = `vec2 fromPos = a_pos0;\n  vec2 toPos = a_pos1;\n  vec2 positions[${num}];\n`;
    let aColDefs = '';
    let aColArray = '';
    const vars = ['u_worldMatrix', 'u_percent', 'u_projectionMatrix', 'u_viewMatrix'];
    if (vertexColor) {
      aColArray = `vec4 fromCol = a_col0;\n vec4 toCol = a_col1;\n vec4 colors[${num}];`;
    }
    for (let i = 0; i < num; i += 1) {
      vars.push(`a_pos${i}`);
      aPosDefs = `${aPosDefs}attribute vec2 a_pos${i};\n`;
      aPosArray = `${aPosArray}  positions[${i}] = a_pos${i};\n`;
      if (vertexColor) {
        aColDefs = `${aColDefs}attribute vec4 a_col${i};\n`;
        aColArray = `${aColArray}  colors[${i}] = a_col${i};\n`;
        vars.push(`a_col${i}`);
      }
    }
    const uniforms = 'uniform int u_from;\nuniform int u_to;\n';
    vars.push('u_to');
    vars.push('u_from');
    let toCol = '';
    let fromCol = '';
    let setVarying = '';
    if (vertexColor) {
      aColDefs = `${aColDefs}varying vec4 v_color;\n`;
      toCol = 'toCol = colors[i];\n';
      fromCol = 'fromCol = colors[i];\n';
      setVarying = 'v_color = (toCol - fromCol) * u_percent + fromCol;\n';
    }

    const src = `
${aPosDefs}
${aColDefs}
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform float u_percent;
${uniforms}

void main() {
  ${aPosArray}
  ${aColArray}

  for (int i = 0; i < ${num}; i++) {
    if (u_from == i) {
      fromPos = positions[i];
      ${fromCol}
      break;
    }
  }
  for (int i = 0; i < ${num}; i++) {
    if (u_to == i) {
      toPos = positions[i];
      ${toCol}
      break;
    }
  }

  vec2 newPosition = (toPos - fromPos) * u_percent + fromPos;
  gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(newPosition.xy, 0, 1);
  ${setVarying}
}
`;
    return { src, vars };
  },
  morph4VertexColor: {
    src: `
attribute vec2 a_pos0;
attribute vec2 a_pos1;
attribute vec2 a_pos2;
attribute vec2 a_pos3;
attribute vec4 a_col0;
attribute vec4 a_col1;
attribute vec4 a_col2;
attribute vec4 a_col3;
uniform mat3 u_worldMatrix;
uniform float u_percent;
uniform int u_from;
uniform int u_to;
varying vec4 v_color;

void main() {
  vec2 fromPos = a_pos0;
  vec2 toPos = a_pos1;
  vec2 positions[4];
  positions[0] = a_pos0;
  positions[1] = a_pos1;
  positions[2] = a_pos2;
  positions[3] = a_pos3;

  vec4 fromCol = a_col0;
  vec4 toCol = a_col1;
  vec4 colors[4];
  colors[0] = a_col0;
  colors[1] = a_col1;
  colors[2] = a_col2;
  colors[3] = a_col3;

  for (int i = 0; i < 4; i++) {
    if (u_from == i) {
      fromPos = positions[i];
      fromCol = colors[i];
      break;
    }
  }
  for (int i = 0; i < 4; i++) {
    if (u_to == i) {
      toPos = positions[i];
      toCol = colors[i];
      break;
    }
  }

  vec2 newPosition = (toPos - fromPos) * u_percent + fromPos;
  gl_Position = u_worldMatrix * vec4(newPosition.xy, u_z, 1);
  v_color = (toCol - fromCol) * u_percent + fromCol;
}
`,
    vars: ['a_pos0', 'a_pos1', 'a_pos2', 'a_pos3', 'a_col0', 'a_col1', 'a_col2', 'a_col3', 'u_worldMatrix', 'u_percent', 'u_from', 'u_to'],
  },
};

const fragment = {
  simple: {
    src:
      'precision mediump float;'
      + 'uniform vec4 u_color;'
      + 'void main() {'
        + 'gl_FragColor = u_color;'
        + 'gl_FragColor.rgb *= gl_FragColor.a;'
      + '}',
    vars: ['u_color'],
  },
  directionalLight: {
    src: `
precision mediump float;
uniform vec4 u_color;
varying vec3 v_normal;
uniform vec3 u_directionalLight;
uniform float u_ambientLight;
void main() {
  vec3 normal = normalize(v_normal);
  float light = dot(normal, u_directionalLight);
  gl_FragColor = u_color;
  gl_FragColor.rgb *= gl_FragColor.a;
  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_ambientLight);
}`,
    vars: ['u_color', 'u_directionalLight', 'u_ambientLight'],
  },
  pointLight: {
    src: `
precision mediump float;
uniform vec4 u_color;
varying vec3 v_normal;
varying vec3 v_vertexToLight;
uniform float u_ambientLight;
void main() {
  vec3 normal = normalize(v_normal);
  vec3 surfaceToLightDirection = normalize(v_vertexToLight);
  float light = dot(normal, surfaceToLightDirection);
  gl_FragColor = u_color;
  gl_FragColor.rgb *= gl_FragColor.a;
  // gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_ambientLight);
  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_ambientLight);
}`,
    vars: ['u_color', 'u_ambientLight'],
  },
  selector: {
    src: `
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}`,
    vars: ['u_color'],
  },
  vertexColor: {
    src:
      'precision mediump float;'
      + 'uniform vec4 u_color;'
      + 'varying vec4 v_color;'
      + 'void main() {'
        + 'gl_FragColor = v_color;'
        + 'gl_FragColor.rgb *= gl_FragColor.a;'
      + '}',
    vars: ['u_color'],
  },
  withTexture: {
    src:
      'precision mediump float;'
      + 'uniform vec4 u_color;'
      + 'uniform int u_use_texture;'
      + 'uniform sampler2D u_texture;'
      + 'varying vec2 v_texcoord;'
      + 'void main() {'
        + 'if ( u_use_texture == 1) {'
          + 'gl_FragColor = texture2D(u_texture, v_texcoord) * u_color.a;'
        + '} else {'
          + 'gl_FragColor = u_color;'
          + 'gl_FragColor.rgb *= gl_FragColor.a;'
        + '}'
      + '}',
    vars: ['u_color', 'u_use_texture', 'u_texture'],
  },
  text: {
    src:
      'precision mediump float;'
      + 'uniform vec4 u_color;'
      + 'uniform sampler2D u_texture;'
      + 'varying vec2 v_texcoord;'
      + 'void main() {'
        // + 'float a = texture2D(u_texture, v_texcoord).a;'
        // + 'if ( a < 0.2 ) {'
        //   + 'a = a / 1.2;'
        // + '}'
        // + 'gl_FragColor = vec4(u_color.rgb, min(a * 1.2, 1.0) * u_color.a);'
        // + '}'
        // + 'gl_FragColor = a * u_color;'
        + 'vec4 c = texture2D(u_texture, v_texcoord);'
        + 'gl_FragColor = vec4(c.a * u_color.rgb, c.a * u_color.a);'
      + '}',
    vars: ['u_color', 'u_texture'],
  },
};

const getShaders = (
  vName: TypeVertexShader = 'simple',
  fName: TypeFragShader = 'simple',
) => {
  let vertexSource = '';
  let fragmentSource = '';
  let vars = [];
  if (typeof vName === 'string') {
    if (vertex[vName] == null) {
      throw new Error(`Built in vertex shader does not exist: ${vName}`);
    }
    vertexSource = vertex[vName].src;
    vars.push(...vertex[vName].vars);
  } else if (Array.isArray(vName) && typeof vName[0] === 'string') {
    const shader = vertex[vName[0]](...vName.slice(1));
    vertexSource = shader.src;
    vars.push(...shader.vars);
  } else if (!Array.isArray(vName) && vName.src != null) {
    vertexSource = vName.src; // $FlowFixMe
    vars.push(...(vName.vars || []));
  } else if (typeof vName === 'object') { // $FlowFixMe
    [vertexSource, vars] = composeVertexShader(vName);
  } else {  // $FlowFixMe
    throw new Error(`Vertex shader definition incorrect: ${vName}`);
  }
  if (typeof fName === 'string') {
    if (fragment[fName] == null) {
      throw new Error(`Built in fragment shader does not exist: ${fName}`);
    }
    fragmentSource = fragment[fName].src;
    vars.push(...fragment[fName].vars);
  } else if (Array.isArray(fName) && typeof fName[0] === 'string') {
    const shader = vertex[fName[0]](...fName.slice(1));
    fragmentSource = shader.src;
    vars.push(...shader.vars);
  } else if (!Array.isArray(fName) && fName.src != null) {
    fragmentSource = fName.src; // $FlowFixMe
    vars.push(...(fName.vars || []));
  } else if (typeof fName === 'object') {
    let fVars; // $FlowFixMe
    [fragmentSource, fVars] = composeFragShader(fName);
    vars.push(...fVars);
  } else {  // $FlowFixMe
    throw new Error(`Fragment shader definition incorrect: ${fName}`);
  }
  // } else {
  //   fragmentSource = fName.src;
  //   vars.push(...fName.vars);
  // }
  // console.log(vertexSource)
  // console.log(fragmentSource)
  return {
    vertexSource,
    fragmentSource,
    vars,
  };
  // if (Object.hasOwnProperty.call(vertex, vName) && Object.hasOwnProperty.call(fragment, fName)) {
  //   return {
  //     vertexSource: vertex[vName].source,
  //     fragmentSource: fragment[fName].source,
  //     vars: vertex[vName].vars.concat(fragment[fName].vars),
  //   };
  // }
  // return {
  //   vertexSource: '',
  //   fragmentSource: '',
  //   vars: [],
  // };
};

export default getShaders;

