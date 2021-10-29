
// c = document.createElement('canvas');
// gl = c.getContext('webgl');
// c.addEventListener("webglcontextlost", function(e) { e.preventDefault(); console.log('context lost') }, false);

figure.loseContext()
c = document.createElement('canvas');
gl = c.getContext('webgl');
c.classList.add('figureone__gl', 'figureone__canvas')
figure.container.appendChild(c)
figure.canvasLow = c
figure.webglLow.init(figure.canvasLow.getContext('webgl', { antialias: true }))
figure.init(figure.webglLow)
figure.animateNextFrame()