// @flow

const vertex = {
  simple: {
    src:
        'attribute vec2 a_position;'
        + 'uniform mat4 u_matrix;'
        + 'uniform float u_z;'
        + 'void main() {'
          + 'gl_Position = u_matrix * vec4(a_position.xy, u_z, 1);'
        + '}',
    vars: ['a_position', 'u_matrix', 'u_z'],
  },
  vertexColor: {
    src:
        `
attribute vec2 a_position;
attribute vec4 a_col;
varying vec4 v_col;
uniform mat4 u_matrix;
uniform float u_z;
void main() {
  gl_Position = u_matrix * vec4(a_position.xy, u_z, 1);
  v_col = a_col;
}`,
    vars: ['a_position', 'a_col', 'u_matrix', 'u_z'],
  },
  withTexture: {
    src:
        'attribute vec2 a_position;'
        + 'attribute vec2 a_texcoord;'
        + 'uniform mat4 u_matrix;'
        + 'uniform float u_z;'
        + 'varying vec2 v_texcoord;'
        + 'void main() {'
          + 'gl_Position = u_matrix * vec4(a_position.xy, u_z, 1);'
          + 'v_texcoord = a_texcoord;'
        + '}',
    vars: ['a_position', 'a_texcoord', 'u_matrix', 'u_z'],
  },
  morph4: {
    src: `
attribute vec2 a_pos0;
attribute vec2 a_pos1;
attribute vec2 a_pos2;
attribute vec2 a_pos3;
uniform mat4 u_matrix;
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
  gl_Position = u_matrix * vec4(newPosition.xy, u_z, 1);
}
`,
    vars: ['a_pos0', 'a_pos1', 'a_pos2', 'a_pos3', 'u_matrix', 'u_percent', 'u_from', 'u_to'],
  },
  morpher: (num: number, vertexColor: boolean) => {
    let aPosDefs = '';
    let aPosArray = `vec2 fromPos = a_pos0;\n  vec2 toPos = a_pos1;\n  vec2 positions[${num}];\n`;
    let aColDefs = '';
    let aColArray = '';
    const vars = ['u_matrix', 'u_percent'];
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
uniform mat4 u_matrix;
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
  gl_Position = u_matrix * vec4(newPosition.xy, 0, 1);
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
uniform mat3 u_matrix;
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
  gl_Position = u_matrix * vec4(newPosition.xy, u_z, 1);
  v_col = (toCol - fromCol) * u_percent + fromCol;
}
`,
    vars: ['a_pos0', 'a_pos1', 'a_pos2', 'a_pos3', 'a_col0', 'a_col1', 'a_col2', 'a_col3', 'u_matrix', 'u_percent', 'u_from', 'u_to'],
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
  vName: string | { src: string, vars: Array<string> } | Array<string | number | boolean> = 'simple',
  fName: string | { src: string, vars: Array<string> } | Array<string | number | boolean> = 'simple',
) => {
  let vertexSource = '';
  let fragmentSource = '';
  const vars = [];
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
  } else if (!Array.isArray(vName)) {
    vertexSource = vName.src;
    vars.push(...vName.vars);
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
  } else if (!Array.isArray(fName)) {
    fragmentSource = fName.src;
    vars.push(...fName.vars);
  } else {  // $FlowFixMe
    throw new Error(`Fragment shader definition incorrect: ${fName}`);
  }
  // } else {
  //   fragmentSource = fName.src;
  //   vars.push(...fName.vars);
  // }
  // console.log(vertexSource, vars)
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

