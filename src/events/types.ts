import type { AsyncEvent } from './asyncEvents.js'

/** Represents an event. */
export interface Event {
  /** Type of the event. */
  readonly type: string
}

/** Represent options for adding an event listener. */
export interface EventListenerOptions {
  /**
   * Whether the event must be triggered only once.
   *
   * If set to `true`, the event listener will be removed once triggered,
   * regardless whether the triggering call was successful or resulted in an
   * error. The error will still propagate to the event caller.
   *
   * @default false // Can be called multiple times.
   */
  once?: boolean

  /**
   * The priority of the event listener.
   *
   * The higher the number, the upper in calling queue the listener will be.
   * Therefore if there are multiple event listeners A (`0`), B (`100`), C
   * (`-100`), they will be called in the order from highest priority to lowest:
   * B (`100`), A (`0`), C(`-100`). This is useful if you want to declare
   * monitor events that do not do anything on their own, but record the results
   * of all other events.
   *
   * @default 0 // Has regular priority.
   */
  priority?: number

  /**
   * Whether the listener is always called, regardless of whether the event is
   * cancelled or not.
   *
   * @default false // Does not listen to cancelled events.
   */
  always?: boolean
}

export type EventTypes<EventsUnion extends Event> = EventsUnion['type']

export type EventObjectFrom<
  EventsUnion extends Event,
  EventType extends EventTypes<EventsUnion>,
> = EventsUnion extends { type: EventType } ? EventsUnion : never

/**
 * Represents a generic event target.
 *
 * @template EventsUnion A union of event types that this event triggers by
 *   itself.
 */
export interface EventTarget<EventsUnion extends Event, ThisType> {
  /**
   * Adds the event listener for the provided event type or does nothing if it
   * is already added.
   *
   * @param type Type of the event to which listener will listen.
   * @param listener Listener to be called on event.
   * @param options Options for event listener.
   */
  addEventListener<EventType extends EventTypes<EventsUnion>>(
    type: EventType,
    listener: (
      this: ThisType,
      event: EventObjectFrom<EventsUnion, EventType>,
    ) => any,
    options?: EventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: (this: ThisType, event: Event) => any,
    options?: EventListenerOptions,
  ): void

  /**
   * Removes the event listener for the provided event type or does nothing if
   * it was already removed.
   *
   * @param type Type of the event to which the listener is subscribed.
   * @param listener Listener to be removed.
   */
  removeEventListener<EventType extends EventTypes<EventsUnion>>(
    type: EventType,
    listener: (
      this: ThisType,
      event: EventObjectFrom<EventsUnion, EventType>,
    ) => any,
  ): void
  removeEventListener(
    type: string,
    listener: (this: ThisType, event: Event) => any,
  ): void

  /**
   * Dispatches an event to all the listeners of its type.
   *
   * @param event Event to be dispatched.
   * @returns `true` if event wasn't cancelled after the propagation or is not
   *   cancellable to begin with, `false` otherwise. If event is asynchronous,
   *   then the value returned will be.
   */
  dispatchEvent<E extends Event>(
    event: E,
  ): E extends AsyncEvent ? Promise<boolean> : boolean
}
