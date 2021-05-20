// @flow

const vertex = {
  simple: {
    src:
        'attribute vec2 a_position;'
        + 'uniform mat3 u_matrix;'
        + 'uniform float u_z;'
        + 'void main() {'
          + 'gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, u_z, 1);'
        + '}',
    vars: ['a_position', 'u_matrix', 'u_z'],
  },
  vertexColor: {
    src:
        `
attribute vec2 a_position;
attribute vec4 a_col;
varying vec4 v_col;
uniform mat3 u_matrix;
uniform float u_z;
void main() {
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, u_z, 1);
  v_col = a_col;
}`,
    vars: ['a_position', 'a_col', 'u_matrix', 'u_z'],
  },
  withTexture: {
    src:
        'attribute vec2 a_position;'
        + 'attribute vec2 a_texcoord;'
        + 'uniform mat3 u_matrix;'
        + 'uniform float u_z;'
        + 'varying vec2 v_texcoord;'
        + 'void main() {'
          + 'gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, u_z, 1);'
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
uniform mat3 u_matrix;
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
  gl_Position = vec4((u_matrix * vec3(newPosition.xy, 1)).xy, 0, 1);
}
`,
    vars: ['a_pos0', 'a_pos1', 'a_pos2', 'a_pos3', 'u_matrix', 'u_percent', 'u_from', 'u_to'],
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
  vName: string | { src: string, vars: Array<string> } = 'simple',
  fName: string | { src: string, vars: Array<string> } = 'simple',
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
  } else {
    vertexSource = vName.src;
    vars.push(...vName.vars);
  }
  if (typeof fName === 'string') {
    if (fragment[fName] == null) {
      throw new Error(`Built in fragment shader does not exist: ${fName}`);
    }
    fragmentSource = fragment[fName].src;
    vars.push(...fragment[fName].vars);
  } else {
    fragmentSource = fName.src;
    vars.push(...fName.vars);
  }
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

