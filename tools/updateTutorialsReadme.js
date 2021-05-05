const Path = require('path');
const fs = require('fs');

// const files = [];

// function searchPath(directory, matcher = null, notMatcher = null) {
//   fs.readdirSync(directory).forEach((file) => {
//     const absolutePath = Path.join(directory, file);
//     if (fs.statSync(absolutePath).isDirectory()) {
//       searchPath(absolutePath, matcher, notMatcher);
//       return;
//     }
//     if (matcher == null) {
//       files.push(absolutePath);
//       return;
//     }
//     if (!absolutePath.match(matcher)) {
//       return;
//     }
//     if (notMatcher == null || !absolutePath.match(notMatcher)) {
//       files.push(absolutePath);
//     }
//   });
// }

// function getFiles(pathOrPaths, matcher = null, notMatcher = null) {
//   let paths = pathOrPaths;
//   if (!Array.isArray(pathOrPaths)) {
//     paths = [pathOrPaths];
//   }
//   paths.forEach((path) => {
//     if (!fs.statSync(path).isDirectory()) {
//       files.push(Path.resolve(path));
//     } else {
//       searchPath(path, matcher, notMatcher);
//     }
//   });
//   return files;
// }

// module.exports = {
//   getFiles,
// };

function getTutorials(directory) {
  const tutorials = [];
  const examples = [];
  const descriptions = [];
  fs.readdirSync('./docs/tutorials').forEach((folder) => {
    const absolutePath = Path.join(directory, folder);
    if (fs.statSync(absolutePath).isDirectory() && /^[0-9]/.test(folder)) {
      tutorials.push(folder);
    } else {
      return;
    }
    const examplePng = Path.join(directory, folder, 'example.png');
    const exampleGif = Path.join(directory, folder, 'example.gif');
    if (fs.existsSync(examplePng)) {
      examples.push('example.png');
    } else if (fs.existsSync(exampleGif)) {
      examples.push('example.gif');
    } else {
      examples.push(null);
    }

    const readme = Path.join(directory, folder, 'readme.md');
    if (fs.existsSync(readme)) {
      const description = fs.readFileSync(readme, { encoding: 'utf8' });
      descriptions.push(description.split('\n').slice(2, 3));
    } else {
      descriptions.push('');
    }
  });
  return [tutorials, examples, descriptions];
}
const [tutorials, examples, descriptions] = getTutorials('./docs/tutorials');

// console.log(tutorials, examples, descriptions);

let out = `# Tutorials

Follow these tutorials in sequence to learn about the concepts and features of FigureOne in simplified examples.
`;
tutorials.forEach((t, i) => {
  out = `${out}\n## **[${t}](./${t.split(' ').join('%20')})**\n${descriptions[i]}\n\n![](./${t.split(' ').join('%20')}/${examples[i]})\n`;
});

fs.writeFileSync('./docs/tutorials/README.md', out, { encoding: 'utf8' });
