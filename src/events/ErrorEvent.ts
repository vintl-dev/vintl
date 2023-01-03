import type { Event } from './types.js'

/**
 * An event which is fired whenever an error occurs within the IntlController or
 * associated listeners.
 */
export class ErrorEvent implements Event {
  readonly type = 'error'

  // eslint-disable-next-line n/handle-callback-err
  constructor(
    /** Error that occurred. */
    public readonly error: unknown,
  ) {}
}
