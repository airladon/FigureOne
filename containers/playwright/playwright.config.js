const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: '/home/pwuser',
  testMatch: '**/*.btest.js',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/__image_snapshots__/{arg}{ext}',
  timeout: 120000,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0 },
    toMatchSnapshot: { maxDiffPixelRatio: 0 },
  },
  use: { browserName: 'chromium' },
  workers: 1,
});
