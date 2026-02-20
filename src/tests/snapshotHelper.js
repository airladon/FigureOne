const fs = require('fs');
const path = require('path');

/**
 * Custom snapshot comparison that preserves exact filenames (including spaces
 * and special characters) without Playwright's name sanitization.
 *
 * @param {string} snapshotDir - Absolute path to the __image_snapshots__ directory
 * @param {Buffer} image - Screenshot buffer
 * @param {string} name - Snapshot filename (e.g., '01000-touch charge-snap.png')
 * @param {object} testInfo - Playwright testInfo object
 */
function matchSnapshot(snapshotDir, image, name, testInfo) {
  const snapshotPath = path.join(snapshotDir, name);

  if (testInfo.config.updateSnapshots === 'all' || !fs.existsSync(snapshotPath)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
    fs.writeFileSync(snapshotPath, image);
    return;
  }

  const expected = fs.readFileSync(snapshotPath);
  if (!expected.equals(image)) {
    const actualPath = snapshotPath.replace(/\.png$/, '-actual.png');
    fs.writeFileSync(actualPath, image);
    throw new Error(
      `Snapshot mismatch: ${name}\n`
      + `Expected: ${snapshotPath}\n`
      + `Actual: ${actualPath}`,
    );
  }
}

module.exports = { matchSnapshot };
