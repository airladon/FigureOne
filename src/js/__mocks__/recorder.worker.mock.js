// @flow
import {
  ObjectTracker, duplicate,
} from '../tools/tools';

import type {
  Recorder,
} from '../diagram/Recorder';

export default class Worker {
  cache: ObjectTracker;
  recorder: Recorder;
  constructor() {
    this.cache = new ObjectTracker();
  }

  postMessage(event: Object) {
    const { message, payload } = event;
    if (message === 'reset') {
      this.cache = new ObjectTracker();
      this.cache.baseReference = duplicate(payload.baseReference);
      this.cache.references = duplicate(payload.references);
    } else if (message === 'get') {
      this.recorder.parseMessage({
        data: {
          message: 'cache',
          payload: {
            baseReferece: duplicate(this.cache.baseReference),
            references: duplicate(this.cache.references),
            diffs: duplicate(this.cache.diffs),
          },
        },
      });
    } else if (message === 'add') {
      // console.log(payload.now, this.cache.baseReference.elements.elements.a.transform.state[2].state[1], payload.state.elements.elements.a.transform.state[2].state[1])
      // console.log(payload.now, payload.reference, payload.state.stateTime)
      this.cache.add(payload.now, payload.state, payload.reference, payload.lastRecordTimeCount);
      // console.log(this.cache.diffs.slice(-1)[0][2])
    } else if (message === 'addReference') {
      this.cache.addReference(payload.state, payload.refName, payload.basedOn);
    }
  }
}
