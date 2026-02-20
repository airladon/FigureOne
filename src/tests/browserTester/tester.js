/* global figure timeoutId Fig */
/* eslint-disable import/prefer-default-export, global-require */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable no-await-in-loop */
global.__frames = [];
global.__title = '';
global.__steps = [];
global.__duration = 5;
global.__timeStep = 0.5;
global.__width = 500;
global.__height = 375;
global.__startSteps = 1000;

const path = require('path');
const { test } = require('@playwright/test');
const { matchSnapshot } = require('../snapshotHelper');

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

function tester(htmlFile, framesFile, threshold = 0, intermitentTime = 0, finish = 'finish') {
  // Compute snapshot directory from framesFile (which contains __dirname of consumer)
  const snapshotDir = framesFile
    ? path.join(path.dirname(framesFile), '__image_snapshots__')
    : path.join(path.dirname(htmlFile.replace(/^(file:\/*|http:\/\/[^/]+\/)/, '/')), '__image_snapshots__');

  // Clear require cache so each consumer gets fresh globals
  delete require.cache[require.resolve('./start')];
  require('./start');
  if (framesFile != null && framesFile !== '') {
    delete require.cache[require.resolve(framesFile)];
    require(framesFile);
  }
  const finishPath = require.resolve(`./${finish}.js`);
  delete require.cache[finishPath];
  const { __finish } = require(finishPath);
  __finish();

  const tests = [];
  let lastTime = 0;
  __steps.forEach((step) => {
    let time;
    let action;
    let location;
    let description;
    let snap;
    if (Array.isArray(step)) {
      [time, action, location, description, snap] = step;
    } else {
      time = step;
    }
    if (snap == null) {
      snap = true;
    }
    const delta = Math.round((time - lastTime) * 10) / 10;
    const t = [
      time,
      description || '',
      delta,
      action || null,
      location || [],
      snap,
    ];
    lastTime = time;
    tests.push(t);
  });

  let file = `file:/${htmlFile}`;
  if (htmlFile.startsWith('http')) {
    file = htmlFile;
  }
  lastTime = -1;

  // We only want to return from this function after the canvas has actually been
  // painted, so we resolve the promise with the 'afterDraw' notification
  async function frame(page, delta) {
    await page.evaluate(([d]) => new Promise((resolve) => {
      figure.notifications.add('afterDraw', () => resolve(), 1);
      figure.timeKeeper.frame(d);
      figure.animateNextFrame();
    }), [delta]);
  }

  async function mouseWheelZoom(page, deltaIn, positionIn) {
    await page.evaluate(([delta, position]) => {
      const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
      const positionPixel = Fig.getPoint(position).transformBy(figureToPixelMatrix);
      const positionClient = figure.pixelToClient(positionPixel);
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: positionClient.x,
        clientY: positionClient.y,
      });
      const mouseWheelEvent = new Event('wheel', { bubbles: true, cancelable: true });
      // eslint-disable-next-line prefer-destructuring
      mouseWheelEvent.deltaX = delta[0];
      // eslint-disable-next-line prefer-destructuring
      mouseWheelEvent.deltaY = delta[1];
      figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
      figure.gestureCanvas.dispatchEvent(mouseWheelEvent);
    }, [deltaIn, positionIn]);
  }

  async function mousePan(page, startIn, stopIn) {
    await page.evaluate(([start, stop]) => {
      const figToClient = (p) => {
        const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
        const q = Fig.getPoint(p).transformBy(figureToPixelMatrix);
        return figure.pixelToClient(q);
      };
      const startClient = figToClient(start);
      const stopClient = figToClient(stop);
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: startClient.x,
        clientY: startClient.y,
      });
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: stopClient.x,
        clientY: stopClient.y,
      });
      const mouseUpEvent = new MouseEvent('mouseup', {});

      figure.gestureCanvas.dispatchEvent(mouseDownEvent);
      figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
      figure.gestureCanvas.dispatchEvent(mouseMoveEvent);
      figure.gestureCanvas.dispatchEvent(mouseUpEvent);
      figure.gesture.endHandler();
    }, [startIn, stopIn]);
  }

  async function mouseClick(page, posIn) {
    await page.evaluate(([pos]) => {
      const figToClient = (p) => {
        const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
        const q = Fig.getPoint(p).transformBy(figureToPixelMatrix);
        return figure.pixelToClient(q);
      };
      const downClient = figToClient(pos);
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: downClient.x,
        clientY: downClient.y,
      });
      const mouseUpEvent = new MouseEvent('mouseup', {});

      figure.gestureCanvas.dispatchEvent(mouseDownEvent);
      figure.gestureCanvas.dispatchEvent(mouseUpEvent);
      figure.gesture.endHandler();
    }, [posIn]);
  }

  // eslint-disable-next-line playwright/valid-title
  test.describe(__title, () => {
    let page;
    let context;

    test.beforeAll(async ({ browser }) => {
      context = await browser.newContext();
      page = await context.newPage();
      page.on('console', async (msg) => {
        let msgType = msg.type();
        if (msgType === 'warning') {
          msgType = 'warn';
        }
        const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
        if (args != null && args[0] != null) {
          // eslint-disable-next-line no-console
          console[msgType](...args);
        }
      });
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(file);
      await page.evaluate(() => {
        clearTimeout(timeoutId);
        figure.timeKeeper.setManualFrames();
      });
      await frame(page, 0);
    });

    test.afterAll(async () => {
      await context.close();
    });

    for (const [time, description, deltaTime, action, location, snap] of tests) {
      // eslint-disable-next-line no-empty-pattern
      test(`${time} ${description}`, async ({}, testInfo) => {
        let d = deltaTime;
        if (intermitentTime > 0 && deltaTime >= intermitentTime) {
          for (
            let i = intermitentTime;
            i <= Math.round((deltaTime - intermitentTime) * 100) / 100;
            i = Math.round((i + intermitentTime) * 100) / 100
          ) {
            await frame(page, intermitentTime);
            d = Math.round((d - intermitentTime) * 100) / 100;
          }
        }
        if (action !== 'delay' && action !== 'mouseWheelZoom' && action !== 'mousePan' && action !== 'mouseClick') {
          await frame(page, d);
          await page.evaluate(async ([t, l]) => {
            if (t != null) {
              if (t.startsWith('touch')) {
                let loc;
                if (Fig.tools.g2.isParsablePoint(l)) {
                  loc = Fig.tools.g2.getPoint(l || [0, 0]);
                }
                figure[t](loc);
                if (Array.isArray(l) && l.length === 2) {
                  figure.setCursor(loc);
                }
              } else {
                await eval(t);
              }
            }
          }, [action, location]);
          await frame(page, 0);
        }
        if (action === 'mouseWheelZoom') {
          await frame(page, d);
          await mouseWheelZoom(page, location[0], location[1]);
          await frame(page, 0);
        }
        if (action === 'mousePan') {
          await frame(page, d);
          await mousePan(page, location[0], location[1]);
          await frame(page, 0);
        }
        if (action === 'mouseClick') {
          await frame(page, d);
          await mouseClick(page, location[0], location[1]);
          await frame(page, 0);
        }
        if (!snap) {
          return;
        }
        if (time !== lastTime) {
          const image = await page.screenshot();
          const snapshotName = `${zeroPad(Math.round(time * 1000), 5)}-${description}-snap.png`;
          matchSnapshot(snapshotDir, image, snapshotName, testInfo);
          lastTime = time;
        }
      });
    }
  });
}


module.exports = {
  tester,
};
