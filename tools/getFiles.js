const Path = require('path');
const fs = require('fs');

const files = [];

function searchPath(directory, matcher = null, notMatcher = null) {
  fs.readdirSync(directory).forEach((file) => {
    const absolutePath = Path.join(directory, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      searchPath(absolutePath, matcher, notMatcher);
      return;
    }
    if (matcher == null) {
      files.push(absolutePath);
      return;
    }
    if (!absolutePath.match(matcher)) {
      return;
    }
    if (notMatcher == null || !absolutePath.match(notMatcher)) {
      files.push(absolutePath);
    }
  });
}

function getFiles(pathOrPaths, matcher = null, notMatcher = null) {
  let paths = pathOrPaths;
  if (!Array.isArray(pathOrPaths)) {
    paths = [pathOrPaths];
  }
  paths.forEach((path) => {
    if (!fs.statSync(path).isDirectory()) {
      files.push(Path.resolve(path));
    } else {
      searchPath(path, matcher, notMatcher);
    }
  });
  return files;
}

module.exports = {
  getFiles,
};
