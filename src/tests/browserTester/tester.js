/* global page figure timeoutId Fig __steps __title __width __height */
/* eslint-disable import/prefer-default-export, global-require */
/* eslint-disable import/no-dynamic-require, no-eval */
/* eslint-disable jest/no-export, no-await-in-loop */
global.__frames = [];
global.__title = '';
global.__steps = [];
global.__duration = 5;
global.__timeStep = 0.5;
global.__width = 500;
global.__height = 375;

// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

page.on('console', async (msg) => {
  let msgType = msg.type();
  if (msgType === 'warning') {
    msgType = 'warn';
  }
  const args = await Promise.all(msg.args().map(jsHandle => jsHandle.jsonValue()));
  if (args != null && args[0] != null) {
  // console.log(msgType)
  // eslint-disable-next-line no-console
    console[msgType](...args);
  }
  // console.log(...args);
});


// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

function zeroPad(num, places) {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
}

// We only want to return from this function after the canvas has actually been
// painted, so we resolve the promise with the 'afterDraw' notification
async function frame(delta) {
  await page.evaluate(([d]) => new Promise((resolve) => {
    figure.notifications.add('afterDraw', () => resolve(), 1);
    figure.timeKeeper.frame(d);
    figure.animateNextFrame();
  }), [delta]);
}

function tester(htmlFile, framesFile, threshold = 0, intermitentTime = 0, finish = 'finish') {
  require('./start');
  if (framesFile != null && framesFile !== '') {
    require(framesFile);
  }
  const { __finish } = require(`./${finish}.js`);
  __finish();
  jest.setTimeout(120000);

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
    const test = [
      time,
      description || '',
      delta,
      action || null,
      location || [],
      snap,
    ];
    lastTime = time;
    tests.push(test);
  });

  let file = `file:/${htmlFile}`;
  if (htmlFile.startsWith('http')) {
    file = htmlFile;
  }
  lastTime = -1;

  async function mouseWheelZoom(deltaIn, positionIn) {
    page.evaluate(([delta, position]) => {
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

  async function mousePan(startIn, stopIn) {
    page.evaluate(([start, stop]) => {
      // const figureToPixelMatrix = figure.elements.spaceTransformMatrix('figure', 'pixel');
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

  async function mouseClick(posIn) {
    page.evaluate(([pos]) => {
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

  // eslint-disable-next-line jest/valid-title
  describe(__title, () => {
    beforeAll(async () => {
      await page.setViewportSize({ width: __width || 500, height: __height || 375 });
      await page.goto(file);
      await page.evaluate(() => {
        clearTimeout(timeoutId);
        figure.timeKeeper.setManualFrames();
      });
      await frame(0);
    });
    test.each(tests)('%s %s',
      async (time, description, deltaTime, action, location, snap) => {
        let d = deltaTime;
        if (intermitentTime > 0 && deltaTime >= intermitentTime) {
          for (
            let i = intermitentTime;
            i <= Math.round((deltaTime - intermitentTime) * 100) / 100;
            i = Math.round((i + intermitentTime) * 100) / 100
          ) {
            await frame(intermitentTime);
            d = Math.round((d - intermitentTime) * 100) / 100;
          }
        }
        if (action !== 'delay' && action !== 'mouseWheelZoom' && action !== 'mousePan' && action !== 'mouseClick') {
          await frame(d);
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
          await frame(0);
        }
        if (action === 'mouseWheelZoom') {
          await frame(d);
          await mouseWheelZoom(location[0], location[1]);
          await frame(0);
        }
        if (action === 'mousePan') {
          await frame(d);
          await mousePan(location[0], location[1]);
          await frame(0);
        }
        if (action === 'mouseClick') {
          await frame(d);
          await mouseClick(location[0], location[1]);
          await frame(0);
        }
        if (!snap) {
          return;
        }
        // Sleep for an animation frame to act on the frame above
        // await sleep(50);
        if (time !== lastTime) {
          const image = await page.screenshot();
          // eslint-disable-next-line jest/no-conditional-expect
          expect(image).toMatchImageSnapshot({
            customSnapshotIdentifier: `${zeroPad(Math.round(time * 1000), 5)}-${description}-snap`,
            failureThreshold: threshold,
          });
          lastTime = time;
        }
      });
  });
}


module.exports = {
  tester,
};

