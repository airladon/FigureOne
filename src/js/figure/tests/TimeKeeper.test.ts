import TimeKeeper from '../TimeKeeper';
import 'regenerator-runtime/runtime';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const performanceNow = performance.now;

describe('TimeKeeper', () => {
  let callback;
  let callback2;
  beforeEach(() => {
    callback = jest.fn(() => {});
    callback2 = jest.fn(() => {});
  });
  afterEach(() => {
    performance.now = performanceNow;
  });
  test('Instantiate', () => {
    performance.now = () => 0;
    const ga = new TimeKeeper();
    expect(ga.now()).toEqual(0);
  });
  test('Normal time', () => {
    performance.now = () => 0;
    const ga = new TimeKeeper();
    expect(ga.now()).toEqual(0);
    performance.now = () => 1;
    expect(ga.now()).toEqual(1);
  });
  test('Manual Frames time', () => {
    performance.now = () => 0;
    const ga = new TimeKeeper();
    expect(ga.now()).toEqual(0);
    performance.now = () => 1;
    expect(ga.now()).toEqual(1);
    ga.setManualFrames();
    performance.now = () => 3;
    expect(ga.now()).toEqual(1);
    ga.endManualFrames();
    expect(ga.now()).toEqual(1);
    performance.now = () => 4;
    expect(ga.now()).toEqual(2);
  });
  describe('Real Time', () => {
    let ga;
    beforeEach(() => {
      ga = new TimeKeeper();
      ga.reset();
    });
    describe('1x Speed', () => {
      test('Single timer executed', async () => {
        // const ga = new TimeKeeper();
        const initialTime = ga.now();
        ga.setTimeout(callback, 100);
        expect(callback.mock.calls).toHaveLength(0);
        await sleep(200);
        const finalTime = ga.now();
        expect(finalTime - initialTime).toBeGreaterThan(100);
        expect(finalTime - initialTime).toBeLessThan(300);
        expect(callback.mock.calls).toHaveLength(1);
      });
      test('Single timer clear', async () => {
        // const ga = new TimeKeeper();
        const initialTime = ga.now();
        ga.setTimeout(callback, 100);
        expect(callback.mock.calls).toHaveLength(0);
        await sleep(20);
        ga.clearTimeouts();
        await sleep(180);
        const finalTime = ga.now();
        expect(finalTime - initialTime).toBeGreaterThan(100);
        expect(finalTime - initialTime).toBeLessThan(300);
        expect(callback.mock.calls).toHaveLength(0);
      });
      test('Two timers executed', async () => {
        // const ga = new TimeKeeper();
        const initialTime = ga.now();
        ga.setTimeout(callback, 50);
        ga.setTimeout(callback2, 150);
        expect(callback.mock.calls).toHaveLength(0);
        expect(callback2.mock.calls).toHaveLength(0);
        await sleep(200);
        const finalTime = ga.now();
        expect(finalTime - initialTime).toBeGreaterThan(100);
        expect(finalTime - initialTime).toBeLessThan(300);
        expect(callback.mock.calls).toHaveLength(1);
        expect(callback2.mock.calls).toHaveLength(1);
      });
      test('Two timers one cancelled', async () => {
        // const ga = new TimeKeeper();
        const initialTime = ga.now();
        ga.setTimeout(callback, 100);
        const timerToCancel = ga.setTimeout(callback2, 150);
        expect(callback.mock.calls).toHaveLength(0);
        expect(callback2.mock.calls).toHaveLength(0);

        await sleep(50);
        ga.clearTimeout(timerToCancel);
        const midTime = ga.now();
        expect(midTime - initialTime).toBeGreaterThan(0);
        expect(midTime - initialTime).toBeLessThan(100);
        expect(callback.mock.calls).toHaveLength(0);
        expect(callback2.mock.calls).toHaveLength(0);

        await sleep(150);
        const finalTime = ga.now();
        expect(finalTime - initialTime).toBeGreaterThan(100);
        expect(finalTime - initialTime).toBeLessThan(300);
        expect(callback.mock.calls).toHaveLength(1);
        expect(callback2.mock.calls).toHaveLength(0);
      });
    });
    describe('Speed', () => {
      test('Single timer executed 2x', async () => {
        // Set timer for 200ms, should take 100ms
        let endTime = performance.now();
        const endTimeCallback = () => { endTime = performance.now(); };
        // const ga = new TimeKeeper();
        ga.setSpeed(2);
        const initialTime = ga.now();
        ga.setTimeout(endTimeCallback, 200);
        await sleep(200);
        const finalTime = performance.now();
        expect(finalTime - initialTime).toBeGreaterThan(150);
        expect(finalTime - initialTime).toBeLessThan(250);
        expect(endTime - initialTime).toBeGreaterThan(80);
        expect(endTime - initialTime).toBeLessThan(120);
      });
      test('Single timer executed 0.5x', async () => {
        // Set timer for 50ms, should take 100ms
        const initialTime = performance.now();
        let endTime = initialTime;
        const endTimeCallback = () => { endTime = performance.now(); };
        ga.setSpeed(0.5);
        ga.setTimeout(endTimeCallback, 50);
        await sleep(50);
        expect(endTime).toBe(initialTime);
        await sleep(150);
        const finalTime = performance.now();
        expect(finalTime - initialTime).toBeGreaterThan(180);
        expect(finalTime - initialTime).toBeLessThan(220);
        expect(endTime - initialTime).toBeGreaterThan(80);
        expect(endTime - initialTime).toBeLessThan(120);
      });
      test('Two timers one cancelled', async () => {
        // const ga = new TimeKeeper();
        const initialTime = performance.now();
        ga.setSpeed(2);
        ga.setTimeout(callback, 200);
        const timerToCancel = ga.setTimeout(callback2, 150);
        expect(callback.mock.calls).toHaveLength(0);
        expect(callback2.mock.calls).toHaveLength(0);

        await sleep(50);
        ga.clearTimeout(timerToCancel);
        const midTime = performance.now();
        expect(midTime - initialTime).toBeGreaterThan(30);
        expect(midTime - initialTime).toBeLessThan(70);
        expect(callback.mock.calls).toHaveLength(0);
        expect(callback2.mock.calls).toHaveLength(0);

        await sleep(80);
        const finalTime = performance.now();
        expect(finalTime - initialTime).toBeGreaterThan(110);
        expect(finalTime - initialTime).toBeLessThan(150);
        expect(callback.mock.calls).toHaveLength(1);
        expect(callback2.mock.calls).toHaveLength(0);
      });
      test('Speed Change during timer', async () => {
        const initialGATime = ga.now();
        const initialTime = performance.now();
        let endTime = initialTime;
        const endTimeCallback = () => { endTime = performance.now(); };
        ga.speed = 2;
        ga.setTimeout(endTimeCallback, 1000);

        // Wait 100ms real time, means waiting 200ms time keeper time
        await sleep(100);
        let nowTime = performance.now();
        let nowGATime = ga.now();
        expect(nowTime - initialTime).toBeGreaterThan(80);
        expect(nowTime - initialTime).toBeLessThan(120);
        expect(nowGATime - initialGATime).toBeGreaterThan(180);
        expect(nowGATime - initialGATime).toBeLessThan(220);

        ga.setSpeed(4);
        // Wait 100ms real time, means waiting 400ms time keeper time
        // So total should be 600ms
        await sleep(100);
        nowTime = performance.now();
        nowGATime = ga.now();
        expect(nowTime - initialTime).toBeGreaterThan(180);
        expect(nowTime - initialTime).toBeLessThan(220);
        expect(nowGATime - initialGATime).toBeGreaterThan(570);
        expect(nowGATime - initialGATime).toBeLessThan(650);

        ga.setSpeed(0.5);
        // Wait 200ms real time, means waiting 100ms time keeper time
        // so total should be 700ms
        await sleep(200);
        nowTime = performance.now();
        nowGATime = ga.now();
        expect(nowTime - initialTime).toBeGreaterThan(380);
        expect(nowTime - initialTime).toBeLessThan(420);
        expect(nowGATime - initialGATime).toBeGreaterThan(670);
        expect(nowGATime - initialGATime).toBeLessThan(750);

        ga.setSpeed(3);
        // Wait 110ms real time, means waiting 330ms time keeper time
        // so total should be 1030ms and timeout should end
        await sleep(110);
        nowTime = performance.now();
        nowGATime = ga.now();
        expect(nowTime - initialTime).toBeGreaterThan(490);
        expect(nowTime - initialTime).toBeLessThan(550);
        expect(nowGATime - initialGATime).toBeGreaterThan(1000);
        expect(nowGATime - initialGATime).toBeLessThan(1080);
        expect(endTime - initialTime).toBeGreaterThan(490);
        expect(endTime - initialTime).toBeLessThan(540);
      });
    });
  });
  describe('Manual Frames', () => {
    let ga;
    beforeEach(() => {
      ga = new TimeKeeper();
      ga.reset();
    });
    test('Simple', async () => {
      const initialGATime = ga.now();
      const initialTime = performance.now();
      await sleep(100);
      expect(ga.now() - initialGATime).toBeGreaterThan(80);
      expect(ga.now() - initialGATime).toBeLessThan(120);
      expect(performance.now() - initialTime).toBeGreaterThan(80);
      expect(performance.now() - initialTime).toBeLessThan(120);

      ga.setManualFrames();
      await sleep(100);
      expect(ga.now() - initialGATime).toBeGreaterThan(80);
      expect(ga.now() - initialGATime).toBeLessThan(120);
      expect(performance.now() - initialTime).toBeGreaterThan(180);
      expect(performance.now() - initialTime).toBeLessThan(230);

      ga.frame(0.1);
      expect(ga.now() - initialGATime).toBeGreaterThan(180);
      expect(ga.now() - initialGATime).toBeLessThan(230);
      expect(performance.now() - initialTime).toBeGreaterThan(180);
      expect(performance.now() - initialTime).toBeLessThan(230);
    });
    test('One timer executed on time', async () => {
      ga.setManualFrames();
      const initialGATime = ga.now();
      const initialTime = performance.now();

      await sleep(100);
      expect(ga.now() - initialGATime).toBe(0);
      expect(performance.now() - initialTime).toBeGreaterThan(80);
      expect(performance.now() - initialTime).toBeLessThan(130);

      ga.setTimeout(callback, 100);
      await sleep(200);
      expect(ga.now() - initialGATime).toBe(0);
      expect(performance.now() - initialTime).toBeGreaterThan(280);
      expect(performance.now() - initialTime).toBeLessThan(330);
      expect(callback.mock.calls).toHaveLength(0);

      ga.frame(0.05);
      expect(callback.mock.calls).toHaveLength(0);
      ga.frame(0.05);
      expect(callback.mock.calls).toHaveLength(1);
      expect(ga.now() - initialGATime).toBe(100);
      expect(performance.now() - initialTime).toBeGreaterThan(280);
      expect(performance.now() - initialTime).toBeLessThan(350);
      expect(callback.mock.calls).toHaveLength(1);
    });
    test('One timer executed during time', async () => {
      ga.setManualFrames();
      const initialGATime = ga.now();
      const initialTime = performance.now();

      await sleep(100);
      expect(ga.now() - initialGATime).toBe(0);
      expect(performance.now() - initialTime).toBeGreaterThan(80);
      expect(performance.now() - initialTime).toBeLessThan(130);

      ga.setTimeout(callback, 150);
      await sleep(200);
      expect(ga.now() - initialGATime).toBe(0);
      expect(performance.now() - initialTime).toBeGreaterThan(280);
      expect(performance.now() - initialTime).toBeLessThan(330);
      expect(callback.mock.calls).toHaveLength(0);

      ga.frame(0.1);
      expect(callback.mock.calls).toHaveLength(0);
      ga.frame(0.1);
      expect(callback.mock.calls).toHaveLength(1);
      expect(ga.now() - initialGATime).toBe(200);
      expect(performance.now() - initialTime).toBeGreaterThan(280);
      expect(performance.now() - initialTime).toBeLessThan(350);
      expect(callback.mock.calls).toHaveLength(1);
    });
    describe('Timer starting timer', () => {
      let initialGATime;
      let startTimer;
      let endTime;
      let endTimer;
      beforeEach(() => {
        endTimer = jest.fn(() => { endTime = ga.now(); });
        startTimer = () => {
          ga.setTimeout(endTimer, 100);
        };
        ga.setManualFrames();
        initialGATime = ga.now();
        endTime = initialGATime;
        ga.setTimeout(startTimer, 100);
        expect(ga.now() - initialGATime).toBe(0);
        expect(ga.timers['0'].callback).toBe(startTimer);
        expect(Object.keys(ga.timers)).toHaveLength(1);
      });
      test('Timer starting timer, frame on first', async () => {
        ga.frame(0.1);
        expect(ga.timers['1'].callback).toBe(endTimer);
        expect(Object.keys(ga.timers)).toHaveLength(1);
        expect(ga.now() - initialGATime).toBe(100);
        expect(endTimer.mock.calls).toHaveLength(0);

        ga.frame(0.1);
        expect(Object.keys(ga.timers)).toHaveLength(0);
        expect(ga.now() - initialGATime).toBe(200);
        expect(endTimer.mock.calls).toHaveLength(1);
        expect(endTime - initialGATime).toBe(200);
      });
      test('Timer starting timer, frame between first and second', async () => {
        ga.frame(0.15);
        expect(ga.timers['1'].callback).toBe(endTimer);
        expect(Object.keys(ga.timers)).toHaveLength(1);
        expect(ga.now() - initialGATime).toBe(150);
        expect(endTimer.mock.calls).toHaveLength(0);

        ga.frame(0.1);
        expect(Object.keys(ga.timers)).toHaveLength(0);
        expect(ga.now() - initialGATime).toBe(250);
        expect(endTimer.mock.calls).toHaveLength(1);
        expect(endTime - initialGATime).toBe(200);
      });
      test('Timer starting timer, frame on second', async () => {
        ga.frame(0.2);
        expect(Object.keys(ga.timers)).toHaveLength(0);
        expect(ga.now() - initialGATime).toBe(200);
        expect(endTimer.mock.calls).toHaveLength(1);
        expect(endTime - initialGATime).toBe(200);
      });
      test('Timer starting timer, frame after second', async () => {
        ga.frame(0.25);
        expect(Object.keys(ga.timers)).toHaveLength(0);
        expect(ga.now() - initialGATime).toBe(250);
        expect(endTimer.mock.calls).toHaveLength(1);
        expect(endTime - initialGATime).toBe(200);
      });
    });
  });
});
