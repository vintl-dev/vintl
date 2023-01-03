import type { Event } from './types.js'

const Canceled = Symbol('isCancellable')

const CanceledPropertyKey = 'canceled'

const CancelPropertyKey = 'cancel'

export interface CancelableEvent {
  [Canceled]: true

  /** Read-only value representing whether the event has been cancelled. */
  get [CanceledPropertyKey](): boolean

  /** Cancels event. Once cancelled, event cannot be un-cancelled. */
  [CancelPropertyKey](): void
}

/**
 * Implements {@link CancelableEvent} on the instance of event that supports it.
 *
 * @param event Event that supports cancellation.
 * @param controller {@link AbortController} responsible for cancellation of
 *   event.
 */
export function implementCancelation(event: CancelableEvent) {
  let cancelled = false

  Object.defineProperties(event, {
    [Canceled]: {
      configurable: true,
      get() {
        return cancelled
      },
    },
    [CanceledPropertyKey]: {
      configurable: true,
      get() {
        return cancelled
      },
    },
    [CancelPropertyKey]: {
      configurable: true,
      value: function cancel() {
        cancelled = true
      },
    },
  })
}

/**
 * @param event Event to check.
 * @returns Whether the event is cancellable.
 */
export function isCancelable(event: Event): event is Event & CancelableEvent {
  return Canceled in event
}

/**
 * Checks whether the provided event has been cancelled.
 *
 * There are two reasons you may prefer this utility function to using
 *
 * - {@link CancelableEvent.canceled} method is marked as configurable and can be
 *   overridden by bad code.
 * - You don't know the event type.
 *
 * @param event Event, which cancellation status needs a check.
 * @returns Always `false` if event is not cancellable, otherwise whether the
 *   event was cancelled or not.
 */
export function isCanceled(event: Event) {
  return isCancelable(event) && event[Canceled]
}
