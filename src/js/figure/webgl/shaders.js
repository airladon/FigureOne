// @flow

const vertex = {
  simple: {
    source:
        'attribute vec2 a_position;'
        + 'uniform mat3 u_matrix;'
        + 'uniform float u_z;'
        + 'void main() {'
          + 'gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, u_z, 1);'
        + '}',
    varNames: ['a_position', 'u_matrix', 'u_z'],
  },
  withTexture: {
    source:
        'attribute vec2 a_position;'
        + 'attribute vec2 a_texcoord;'
        + 'uniform mat3 u_matrix;'
        + 'uniform float u_z;'
        + 'varying vec2 v_texcoord;'
        + 'void main() {'
          + 'gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, u_z, 1);'
          + 'v_texcoord = a_texcoord;'
        + '}',
    varNames: ['a_position', 'a_texcoord', 'u_matrix', 'u_z'],
  },
};

const fragment = {
  simple: {
    source:
      'precision mediump float;'
      + 'uniform vec4 u_color;'
      + 'void main() {'
        + 'gl_FragColor = u_color;'
        + 'gl_FragColor.rgb *= gl_FragColor.a;'
      + '}',
    varNames: ['u_color'],
  },
  withTexture: {
    source:
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
    varNames: ['u_color', 'u_use_texture', 'u_texture'],
  },
  text: {
    source:
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
    varNames: ['u_color', 'u_texture'],
  },
};

const getShaders = (vName: string = 'simple', fName: string = 'simple') => {
  if (Object.hasOwnProperty.call(vertex, vName) && Object.hasOwnProperty.call(fragment, fName)) {
    return {
      vertexSource: vertex[vName].source,
      fragmentSource: fragment[fName].source,
      varNames: vertex[vName].varNames.concat(fragment[fName].varNames),
    };
  }
  return {
    vertexSource: '',
    fragmentSource: '',
    varNames: [],
  };
};

export default getShaders;

