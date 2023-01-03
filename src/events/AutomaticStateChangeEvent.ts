import type { CancelableEvent } from './cancelableEvents.js'
import { implementCancelation } from './cancelableEvents.js'
import type { Event } from './types.js'

class AutomaticStateChangeEvent implements Event {
  public readonly type = 'automatic'

  constructor(
    /** New state of automatic locale mode. */
    public readonly state: boolean,
  ) {
    implementCancelation(this)
  }
}

interface AutomaticStateChangeEvent extends CancelableEvent {}

export { AutomaticStateChangeEvent }
