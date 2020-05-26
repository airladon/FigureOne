// @flow
import {
  ObjectTracker,
} from '../tools/tools';

// declare var self: DedicatedWorkerGlobalScope;

let cache = new ObjectTracker();

// onmessage = (event: MessageEvent) => {
addEventListener("message", (event) => {
  const { message, payload } = event.data;
  if (message === 'reset') {
    // resetCache(payload.baseReference, payload.references)
    cache = new ObjectTracker();
    cache.baseReference = payload.baseReference;
    cache.references = payload.references;
  } else if (message === 'get') {
    postMessage({
      message: 'cache',
      payload: {
        baseReferece: cache.baseReference,
        references: cache.references,
        diffs: cache.diffs,
      },
    });
  } else if (message === 'add') {
    // add(payload.now, payload.state, payload.reference, payload.lastRecordTimeCount);
    cache.add(payload.now, payload.state, payload.reference, payload.lastRecordTimeCount);
    // postMessage({
    //   message: 'cacheDuration',
    //   duration: cache.diffs[cache.diffs.length - 1],
    // });
  } else if (message === 'addReferece') {
    cache.addReference(payload.state, payload.refName, payload.basedOn);
  }
  // console.log('worker', event.data);
  // postMessage(`From Worker: ${event.data[0] + 2 * event.data[1]}`)
});

// function resetCache(baseReference: Object, references: Object) {
//   cache = new ObjectTracker();
//   cache.baseReference = baseReference;
//   cache.references = references;
// }

// function add(now: number, state: Object, reference: string, lastRecordTimeCount: number) {
//   cache.add(now, state, reference, lastRecordTimeCount);
//   postMessage({
//     message: 'cacheDuration',
//     duration: cache.diffs[cache.diffs.length - 1],
//   })
// }
