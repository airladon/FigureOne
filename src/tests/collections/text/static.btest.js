const { browserStaticTester } = require('../../browserStaticTester');

browserStaticTester(
  'Collections: Text - Static',
  // 'http://localhost:8080/src/tests/collections/text/static.html',
  // 'file://./src/tests/collections/text/static.html',
  `file:/${__dirname}/static.html`,
);
