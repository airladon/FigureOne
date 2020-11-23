import {
  ObjectTracker,
} from '../../tools/tools';

let cache = new ObjectTracker();

// eslint-disable-next-line no-restricted-globals
addEventListener('message', (event) => {
  const { message, payload } = event.data;
  if (message === 'reset') {
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
    cache.add(payload.now, payload.state, payload.reference, payload.lastRecordTimeCount);
  } else if (message === 'addReferece') {
    cache.addReference(payload.state, payload.refName, payload.basedOn);
  }
});
