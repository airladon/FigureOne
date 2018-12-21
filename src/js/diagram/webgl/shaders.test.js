import getShaders from './shaders';

describe('Shaders', () => {
  test('get simple shaders', () => {
    const shaders = getShaders('simple', 'simple');
    expect(typeof shaders.vertexSource).toBe('string');
    expect(typeof shaders.fragmentSource).toBe('string');
    const vNames = ['a_position', 'u_matrix', 'u_z', 'u_color'];
    expect(shaders.varNames).toEqual(vNames);
  });
});
