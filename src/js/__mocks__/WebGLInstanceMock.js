
const webgl = {
  locations: {
    a_position: '',
  },
  gl: {
    TRIANGLES: 1,
    TRIANGLE_STRIP: 2,
    createBuffer: () => {},
    bindBuffer: () => {},
    bufferData: () => {},
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    uniformMatrix3fv: () => {},
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
  },
  resize: () => {},
  getProgram: () => {},
  useProgram: () => ({
    a_position: '',
  }),
  programs: [],
  lastUsedProgram: null,
  textures: {},
  addTexture: () => {},
};

export default webgl;
