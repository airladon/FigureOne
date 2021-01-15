/**
Usage:
`node tools/packageLinker.js dev` - change links in html files to dev package
`node tools/packageLinker.js prod` - change links in html files to prod package
`node tools/packageLinker.js remote` - change links in html files to remote
 */
const Path = require('path');
const fs = require('fs');
const { getFiles } = require('./getFiles');
const pjson = require('../package.json');

const to = process.argv.slice(2)[0] || 'dev';

const files = getFiles('./docs/tutorials', /html$/, /test.html$/);

const remote = `https://cdn.jsdelivr.net/npm/figureone@${pjson.version}/figureone.min.js`;
for (let i = 0; i < files.length; i += 1) {
  const file = files[i];
  // eslint-disable-next-line no-console
  console.log(file);
  const figOne = {
    dev: Path.relative(Path.dirname(file), './package/index.js'),
    prod: Path.relative(Path.dirname(file), './package/figureone.min.js'),
    remote,
  };

  const data = fs.readFileSync(file, 'UTF-8');
  const lines = data.split(/\r?\n/);
  for (let l = 0; l < lines.length; l += 1) {
    const line = lines[l];
    if (line.match(/^ *<script.*figureone.min.js/) || line.match(/^ *<script.*package\/index.js/)) {
      const leadingSpaces = line.match(/[^ ]/).index + 1;
      const newLine = `${Array(leadingSpaces).join(' ')}<script type="text/javascript" src="${figOne[to]}"></script>`;
      lines[l] = newLine;
    }
    fs.writeFileSync(file, lines.join('\n'), 'UTF-8');
  }
}
