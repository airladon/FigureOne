
const webgl = {
  locations: {
    // eslint-disable-next-line camelcase
    a_position: '',
  },
  gl: {
    TRIANGLES: 1,
    TRIANGLE_STRIP: 2,
    createBuffer: () => {},
    bindBuffer: () => {},
    bufferData: () => {},
    bindFramebuffer: () => {},
    enableVertexAttribArray: () => {},
    enable: () => {},
    disable: () => {},
    vertexAttribPointer: () => {},
    uniformMatrix3fv: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    uniform4f: () => {},
    uniform1f: () => {},
    uniform1i: () => {},
    drawArrays: () => {},
    clearColor: () => {},
    clear: () => {},
    createTexture: () => {},
    activeTexture: () => {},
    bindTexture: () => {},
    pixelStorei: () => {},
    texImage2D: () => {},
    blendFunc: () => {},
    deleteBuffer: () => {},
    viewport: () => {},
    readPixels: () => {},
    canvas: {
      width: 100,
      height: 100,
      clientWidth: 100,
      clientHeight: 100,
    },
  },
  targetTexture: {
    fb: null,
  },
  resize: () => {},
  getProgram: () => {},
  useProgram: () => ({
    // eslint-disable-next-line camelcase
    a_position: '',
    // eslint-disable-next-line camelcase
    u_worldViewProjectionMatrix: '',
  }),
  programs: [],
  lastUsedProgram: null,
  textures: {},
  addTexture: () => {},
};

export default webgl;
