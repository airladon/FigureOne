// @flow
import { joinObjects } from '../../tools/tools';

/**
 * Vertex shader composition
 */
export type OBJ_VertexShader = {
  light?: 'point' | 'directional' | null,
  normals?: boolean,
  color?: 'vertex' | 'uniform' | 'texture',
  dimension?: 2 | 3,
};

export type TypeVertexShader = string
  | { src: string, vars?: Array<string> }
  | Array<string | number | boolean>
  | OBJ_VertexShader;
/**
 * Fragment shader composition
 */
export type OBJ_FragShader = {
  light?: 'point' | 'directional' | null,
  color?: 'vertex' | 'uniform' | 'texture',
};

export type TypeFragShader = string
  | { src: string, vars?: Array<string> }
  | Array<string | number | boolean>
  | OBJ_FragShader;

function composeVertexShader(
  options: {
    dimension: 2 | 3,
    normals: boolean,
    color: 'vertex' | 'uniform' | 'texture',
    light: null | 'point ' | 'directional',
  } = {},
) {
  const defaultOptions = {
    dimension: 2,
    normals: false,
    color: 'uniform',
    light: null,
  };
  const {
    dimension, normals, light, color,
  } = joinObjects(defaultOptions, options);
  let src = '\nuniform mat4 u_worldViewProjectionMatrix;\n';
  const vars = ['u_worldViewProjectionMatrix'];

  // Vertex position
  if (dimension === 2) {
    src += 'attribute vec2 a_position;\n';
    src += 'uniform float u_z;\n';
    vars.push('a_position', 'u_z');
  } else if (dimension === 3) {
    src += 'attribute vec4 a_position;\n';
    vars.push('a_position');
  }

  if (color === 'texture') {
    src += 'attribute vec2 a_texcoord;\n';
    src += 'varying vec2 v_texcoord;\n';
  } else if (color === 'vertex') {
    src += 'attribute vec4 a_col;\n';
    src += 'varying vec4 v_col;\n';
    vars.push('a_col');
  }

  // Normals
  if (normals) {
    src += 'attribute vec3 a_norm;\n';
    src += 'varying vec3 v_norm;\n';
    src += 'uniform mat4 u_worldInverseTranspose;\n';
    vars.push('u_worldInverseTranspose', 'a_norm');
  }

  // Direcitonal Light
  if (light === 'point') {
    src += 'uniform vec3 u_lightWorldPosition;\n';
    src += 'uniform mat4 u_worldMatrix;\n';
    src += 'varying vec3 v_surfaceToLight;\n';
    vars.push('u_lightWorldPosition', 'u_worldMatrix');
  }

  // Main Program
  src += 'void main() {\n';

  // Dimensional gl_Position
  if (dimension === 2) {
    src += '  gl_Position = u_worldViewProjectionMatrix * vec4(a_position.xy, u_z, 1);\n';
  } else {
    src += '  gl_Position = u_worldViewProjectionMatrix * a_position;\n';
  }

  if (color === 'texture') {
    src += '  v_texcoord = a_texcoord;\n';
  } else if (color === 'vertex') {
    src += '  v_col = a_col;\n';
  }

  if (normals) {
    src += '  v_norm = mat3(u_worldInverseTranspose) * a_norm;\n';
  }

  if (light === 'point') {
    src += '  vec3 surfaceWorldPosition = (u_worldMatrix * a_position).xyz;\n';
    src += '  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;\n';
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
    src += 'varying vec4 v_col;\n';
    vars.push('v_col');
  } else if (color === 'texture') {
    src += 'uniform sampler2D u_texture;\n';
    src += 'varying vec2 v_texcoord;\n';
  }

  if (light === 'directional') {
    src += 'varying vec3 v_norm;\n';
    src += 'uniform vec3 u_directionalLight;\n';
    src += 'uniform float u_minLight;\n';
    vars.push('u_minLight', 'u_directionalLight');
  } else if (light === 'point') {
    src += 'varying vec3 v_norm;\n';
    src += 'varying vec3 v_surfaceToLight;\n';
    src += 'uniform float u_minLight;\n';
    vars.push('u_minLight');
  }


  // Main Program
  src += 'void main() {\n';
  if (color === 'vertex') {
    src += '  gl_FragColor = v_col;\n';
    src += '  gl_FragColor.rgb *= gl_FragColor.a;\n';
  } else if (color === 'uniform') {
    src += '  gl_FragColor = u_color;\n';
    src += '  gl_FragColor.rgb *= gl_FragColor.a;\n';
  } else if (color === 'texture') {
    src += '  gl_FragColor = texture2D(u_texture, v_texcoord) * u_color.a;\n';
  }

  // src += '  gl_FragColor.rgb *= gl_FragColor.a;\n';
  if (light === 'directional') {
    src += '  vec3 normal = normalize(v_norm);\n';
    src += '  float light = dot(normal, u_directionalLight);\n';
    src += '  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_minLight);\n';
  } else if (light === 'point') {
    src += '  vec3 normal = normalize(v_norm);\n';
    src += '  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);\n';
    src += '  float light = dot(normal, surfaceToLightDirection);\n';
    src += '  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_minLight);\n';
  }

  src += '}\n';

  return [src, vars];
}

const vertex = {
  simple: {
    src: `
attribute vec4 a_position; 
uniform mat4 u_worldViewProjectionMatrix;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_position;
}`,
    vars: ['a_position', 'u_worldViewProjectionMatrix'],
  },
  selector: {
    src: `
attribute vec4 a_position; 
uniform mat4 u_worldViewProjectionMatrix;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_position;
}`,
    vars: ['a_position', 'u_worldViewProjectionMatrix'],
  },
  noLight: {
    src:
        'attribute vec3 a_position;'
        + 'uniform mat4 u_worldMatrix;'
        + 'uniform mat4 u_projectionMatrix;'
        + 'uniform mat4 u_viewMatrix;'
        + 'void main() {'
          + 'gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position.xyz, 1);'
        + '}',
    vars: ['a_position', 'u_worldMatrix', 'u_projectionMatrix', 'u_viewMatrix'],
  },
  pointLight: {
    src: `
attribute vec4 a_position;
attribute vec3 a_norm;
varying vec3 v_norm;
uniform vec3 u_lightWorldPosition;
uniform mat4 u_worldMatrix;
uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_worldInverseTranspose;
varying vec3 v_surfaceToLight;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_position;
  v_norm = mat3(u_worldInverseTranspose) * a_norm;
  vec3 surfaceWorldPosition = (u_worldMatrix * a_position).xyz;
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
}`,
    vars: ['a_position', 'a_norm', 'u_worldViewProjectionMatrix', 'u_worldInverseTranspose', 'u_lightWorldPosition', 'u_worldMatrix'],
  },
  directionalLight: {
    src: `
attribute vec4 a_position;
attribute vec3 a_norm;
varying vec3 v_norm;
uniform mat4 u_worldViewProjectionMatrix;
uniform mat4 u_worldInverseTranspose;
void main() {
  gl_Position = u_worldViewProjectionMatrix * a_position;
  v_norm = mat3(u_worldInverseTranspose) * a_norm;
}`,
    vars: ['a_position', 'a_norm', 'u_worldViewProjectionMatrix', 'u_worldInverseTranspose'],
  },
  vertexColor: {
    src:
        `
attribute vec2 a_position;
attribute vec4 a_col;
varying vec4 v_col;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform float u_z;
void main() {
  gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position.xy, u_z, 1);
  v_col = a_col;
}`,
    vars: ['a_position', 'a_col', 'u_worldMatrix', 'u_z', 'u_projectionMatrix', 'u_viewMatrix'],
  },
  vertexColor3D: {
    src:
        `
attribute vec3 a_position;
attribute vec4 a_col;
varying vec4 v_col;
uniform mat4 u_worldMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
void main() {
  gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position.xyz, 1);
  v_col = a_col;
}`,
    vars: ['a_position', 'a_col', 'u_worldMatrix', 'u_projectionMatrix', 'u_viewMatrix'],
  },
  withTexture: {
    src:
        'attribute vec2 a_position;'
        + 'attribute vec2 a_texcoord;'
        + 'uniform mat4 u_worldMatrix;'
        + 'uniform mat4 u_projectionMatrix;'
        + 'uniform mat4 u_viewMatrix;'
        + 'uniform float u_z;'
        + 'varying vec2 v_texcoord;'
        + 'void main() {'
          + 'gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position.xy, u_z, 1);'
          + 'v_texcoord = a_texcoord;'
        + '}',
    vars: ['a_position', 'a_texcoord', 'u_worldMatrix', 'u_z', 'u_projectionMatrix', 'u_viewMatrix'],
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
      aColDefs = `${aColDefs}varying vec4 v_col;\n`;
      toCol = 'toCol = colors[i];\n';
      fromCol = 'fromCol = colors[i];\n';
      setVarying = 'v_col = (toCol - fromCol) * u_percent + fromCol;\n';
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
varying vec4 v_col;

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
  v_col = (toCol - fromCol) * u_percent + fromCol;
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
varying vec3 v_norm;
uniform vec3 u_directionalLight;
uniform float u_minLight;
void main() {
  vec3 normal = normalize(v_norm);
  float light = dot(normal, u_directionalLight);
  gl_FragColor = u_color;
  gl_FragColor.rgb *= gl_FragColor.a;
  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_minLight);
}`,
    vars: ['u_color', 'u_directionalLight', 'u_minLight'],
  },
  pointLight: {
    src: `
precision mediump float;
uniform vec4 u_color;
varying vec3 v_norm;
varying vec3 v_surfaceToLight;
uniform float u_minLight;
void main() {
  vec3 normal = normalize(v_norm);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  float light = dot(normal, surfaceToLightDirection);
  gl_FragColor = u_color;
  gl_FragColor.rgb *= gl_FragColor.a;
  // gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_minLight);
  gl_FragColor.rgb *= max((light + 1.0) / 2.0, u_minLight);
}`,
    vars: ['u_color', 'u_minLight'],
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
      + 'varying vec4 v_col;'
      + 'void main() {'
        + 'gl_FragColor = v_col;'
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
  console.log(vertexSource)
  console.log(fragmentSource)
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

