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
      expect(shaders.fragmentSource).toContain('uniform sampler2D u_mask0;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint0;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint1;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint2;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint3;');
    });
    test('fragment shader mixes each mask channel with its tint', () => {
      expect(shaders.fragmentSource).toContain('texture2D(u_texture, v_texcoord)');
      expect(shaders.fragmentSource).toContain('texture2D(u_mask0, v_texcoord)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint0.rgb, mask0.r * u_tint0.a)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint1.rgb, mask0.g * u_tint1.a)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint2.rgb, mask0.b * u_tint2.a)');
      // The alpha channel is gated on (1 - r - g - b) so region 3 is only the
      // opaque-black pixels not already claimed by an r/g/b region.
      expect(shaders.fragmentSource).toContain('mix(col, u_tint3.rgb, mask0.a * (1.0 - clamp(mask0.r + mask0.g + mask0.b, 0.0, 1.0)) * u_tint3.a)');
    });
    test('vars include the texture, mask and tint uniforms', () => {
      expect(shaders.vars).toEqual(expect.arrayContaining([
        'a_texcoord', 'u_color', 'u_texture', 'u_mask0',
        'u_tint0', 'u_tint1', 'u_tint2', 'u_tint3',
      ]));
    });
    test('single mask produces exactly one mask sampler and four tints', () => {
      const samplers = (shaders.fragmentSource.match(/uniform sampler2D u_mask/g) || []).length;
      const tints = (shaders.fragmentSource.match(/uniform vec4 u_tint/g) || []).length;
      expect(samplers).toBe(1);
      expect(tints).toBe(4);
    });
  });

  describe('textureMap with multiple masks', () => {
    const shaders = getShaders(
      { dimension: 2, color: 'textureMap' },
      { color: 'textureMap', masks: 3 },
    );
    test('declares one sampler and four tints per mask', () => {
      const samplers = (shaders.fragmentSource.match(/uniform sampler2D u_mask/g) || []).length;
      const tints = (shaders.fragmentSource.match(/uniform vec4 u_tint/g) || []).length;
      expect(samplers).toBe(3);
      expect(tints).toBe(12);
      expect(shaders.fragmentSource).toContain('uniform sampler2D u_mask2;');
      expect(shaders.fragmentSource).toContain('uniform vec4 u_tint11;');
    });
    test('mixes channels from each mask with the matching tint block', () => {
      // mask 2 (the third) uses tints 8..11.
      expect(shaders.fragmentSource).toContain('texture2D(u_mask2, v_texcoord)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint8.rgb, mask2.r * u_tint8.a)');
      expect(shaders.fragmentSource).toContain('mix(col, u_tint11.rgb, mask2.a * (1.0 - clamp(mask2.r + mask2.g + mask2.b, 0.0, 1.0)) * u_tint11.a)');
    });
    test('vars include every mask and tint uniform', () => {
      expect(shaders.vars).toEqual(expect.arrayContaining([
        'u_mask0', 'u_mask1', 'u_mask2', 'u_tint0', 'u_tint7', 'u_tint11',
      ]));
    });
  });
});
