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
  gradient: {
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
  gradient: {
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
  if (typeof vName === 'string' && vertex[vName] != null) {
    vertexSource = vertex[vName].src;
    vars.push(...vertex[vName].vars);
  } else {
    vertexSource = vName.src;
    vars.push(...vName.vars);
  }
  if (typeof fName === 'string' && fragment[fName] != null) {
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

