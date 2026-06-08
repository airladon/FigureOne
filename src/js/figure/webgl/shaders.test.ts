import getShaders from './shaders';

describe('Shaders', () => {
  test('get simple shaders', () => {
    const shaders = getShaders('simple', 'simple');
    expect(typeof shaders.vertexSource).toBe('string');
    expect(typeof shaders.fragmentSource).toBe('string');
    const vNames = ['a_vertex', 'u_worldViewProjectionMatrix', 'u_color'];
    expect(shaders.vars).toEqual(vNames);
  });
  describe('textureMap (mask recolor)', () => {
    const shaders = getShaders(
      { dimension: 2, color: 'textureMap' },
      { color: 'textureMap' },
    );
    test('vertex shader passes texture coordinates like texture mode', () => {
      expect(shaders.vertexSource).toContain('attribute vec2 a_texcoord;');
      expect(shaders.vertexSource).toContain('varying vec2 v_texcoord;');
      expect(shaders.vertexSource).toContain('v_texcoord = a_texcoord;');
    });
    test('fragment shader declares the base, mask and tint uniforms', () => {
      expect(shaders.fragmentSource).toContain('uniform sampler2D u_texture;');
      expect(shaders.fragmentSource).toContain('uniform sampler2D u_mask;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint0;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint1;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint2;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint3;');
    });
    test('fragment shader mixes each mask channel with its tint', () => {
      expect(shaders.fragmentSource).toContain('texture2D(u_texture, v_texcoord)');
      expect(shaders.fragmentSource).toContain('texture2D(u_mask, v_texcoord)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint0.rgb, mask.r * u_tint0.a)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint1.rgb, mask.g * u_tint1.a)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint2.rgb, mask.b * u_tint2.a)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint3.rgb, mask.a * u_tint3.a)');
    });
    test('vars include the texture, mask and tint uniforms', () => {
      expect(shaders.vars).toEqual(expect.arrayContaining([
        'a_texcoord', 'u_color', 'u_texture', 'u_mask',
        'u_tint0', 'u_tint1', 'u_tint2', 'u_tint3',
      ]));
    });
  });
});
