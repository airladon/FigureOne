function fillHeader(title, path) {
  const e = document.getElementById('header');
  e.innerHTML = `
  <div class="header-bar">
    <div class="title-text">FigureOne</div>
    <div class="sub-title-text">Draw, animate and interact with shapes, text, plots and equations in Javascript.</div>

    <div class="links">
      <div class="title-link link">
        <a href="https://github.com/airladon/figureone/">GitHub</a>
      </div>
      <div class="title-link link">
        <a href="https://github.com/airladon/FigureOne/tree/master/docs/tutorials">Tutorials</a>
      </div>
      <div class="title-link link">
        <a href="https://github.com/airladon/figureone/docs/api/index.html">API Reference</a>
      </div>
    </div>
  </div>
  <h1 class="example-title">${title}</h1>
  <div class="see-the-code">
    See the code on <a href="https://github.com/airladon/FigureOne/tree/master/docs/examples/${path.replace(' ', '%20')}">Github</a>
  </div>
  `;
}


function fillFooter(path = '..') {
  function link(name) {
    return `<div class="title-link link">
            <a href="${path}/${name.replace(' ', '%20')}/index.html">${name}</a>
            </div>`;
  }
  const e = document.getElementById('footer');
  e.innerHTML = `
    <div class="footer-bar">
      <div class="examples">
        <div class="other-examples">Examples</div>
        ${link('Sine Wave')}
        ${link('Pythagorean Theorem')}
        ${link('Sine Limit')}
        ${link('Interactive Angle')}
        ${link('Total Angle of a Polygon')}
        ${link('Traveling Wave 01 - Shifting Equations')}
        ${link('Traveling Wave 02 - Sine Waves')}
        ${link('Holiday Equation')}
      <div class="footer">
        <p>Built for and used by <a class="link" href="https://www.thisiget.com">www.thisiget.com</a></p>
      </div>
    </div>
  `;
}
