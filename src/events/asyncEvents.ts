import type { Event } from './types.js'

const AsyncEventSymbol = Symbol('isAsync')

export interface AsyncEvent {
  /** Property used to identify async event. */
  [AsyncEventSymbol]: true
}

export function markAsAsync(event: AsyncEvent) {
  Object.defineProperty(event, AsyncEventSymbol, {
    configurable: true,
    value: true,
  })
}

/**
 * Checks whether the event is async event.
 *
 * @param event Event to check.
 * @returns Whether the event must be executed in async manner.
 */
export function isAsyncEvent(event: Event): event is Event & AsyncEvent {
  return AsyncEventSymbol in event && AsyncEventSymbol in event
}
