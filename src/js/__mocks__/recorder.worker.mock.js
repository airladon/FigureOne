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
      // $FlowFixMe
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
      this.cache.add(payload.now, payload.state, payload.reference, payload.lastRecordTimeCount);
      // console.log(this.cache.diffs.slice(-1)[0][2])
    } else if (message === 'addReference') {
      this.cache.addReference(payload.state, payload.refName, payload.basedOn);
    }
  }
}
