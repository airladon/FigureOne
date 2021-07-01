import getShaders from './shaders';

describe('Shaders', () => {
  test('get simple shaders', () => {
    const shaders = getShaders('simple', 'simple');
    expect(typeof shaders.vertexSource).toBe('string');
    expect(typeof shaders.fragmentSource).toBe('string');
    const vNames = ['a_position', 'u_worldViewProjectionMatrix', 'u_color'];
    expect(shaders.vars).toEqual(vNames);
  });
});
