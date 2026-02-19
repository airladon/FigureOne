import {
  ObjectTracker, duplicate,
} from '../tools/tools';

export default class Worker {
  constructor() {
    this.cache = new ObjectTracker();
  }

  postMessage(event) {
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
      this.cache.add(payload.now, payload.state, payload.reference, payload.lastRecordTimeCount);
    } else if (message === 'addReference') {
      this.cache.addReference(payload.state, payload.refName, payload.basedOn);
    }
  }
}
