import {
  ErrorEvent,
  isAsyncEvent,
  isCanceled,
  type AfterLocaleChangeEvent,
  type AsyncEvent,
  type AutomaticStateChangeEvent,
  type Event,
  type EventListenerOptions,
  type EventObjectFrom,
  type EventTarget,
  type LocaleChangeEvent,
  type LocaleLoadEvent,
} from '../events/index.js'
import { cReportError } from '../utils/compat.js'
import type { IntlController } from './types.js'

export type ControllerEvents =
  | LocaleChangeEvent
  | LocaleLoadEvent
  | ErrorEvent
  | AutomaticStateChangeEvent
  | AfterLocaleChangeEvent

export type EventTargetPartial<T> = EventTarget<
  ControllerEvents,
  IntlController<T>
>

export function useEventTargetPartial<T>(controllerBox: {
  value: IntlController<T> | null
}): EventTargetPartial<T> {
  type Controller = IntlController<T>

  type EventEntry = {
    listener(this: Controller, event: Event): any
    options: EventListenerOptions
  }

  const eventRegister = new Map<string, Set<EventEntry>>()

  // @ts-expect-error There appears to be a bug in TS that makes it think this type is incompatible.
  function addEventListener<EventType extends EventTypes<ControllerEvents>>(
    type: EventType,
    listener: (
      this: Controller,
      event: EventObjectFrom<ControllerEvents, EventType>,
    ) => any,
    options?: EventListenerOptions,
  ): void
  function addEventListener(
    type: string,
    listener: (this: Controller, event: Event) => any,
    options?: EventListenerOptions,
  ): void {
    if (!eventRegister.has(type)) {
      eventRegister.set(type, new Set())
    }

    const entries = eventRegister.get(type)!

    for (const entry of entries) {
      if (entry.listener === listener) {
        entries.delete(entry)
      }
    }

    entries.add({
      listener,
      options: {
        ...options,
      },
    })
  }

  // @ts-expect-error See line above addEventListener.
  function removeEventListener<EventType extends EventTypes<ControllerEvents>>(
    type: EventType,
    listener: (
      this: Controller,
      event: EventObjectFrom<ControllerEvents, EventType>,
    ) => any,
  ): void
  function removeEventListener(
    type: string,
    listener: (this: Controller, event: Event) => any,
  ): void {
    const entries = eventRegister.get(type)

    if (entries == null) return

    for (const value of entries) {
      if (value.listener === listener) {
        entries.delete(value)
      }
    }
  }

  function dispatchEvent<E extends Event>(
    event: E,
  ): E extends AsyncEvent ? Promise<boolean> : boolean {
    const eventType = event.type
    const entries = eventRegister.get(eventType)

    let canceled = false

    const allowAsync = isAsyncEvent(event)

    // If you remember that async functions in JavaScript are essentially state
    // machines, this should not scare you.
    //
    // Basically, unless we are dealing with async event, this function will
    // never go beyond state 0, therefore it will act like a regular function
    // but with extra steps. Which is okay-ish compromise that helps us to avoid
    // code repetition.

    async function impl() {
      if (entries == null) return

      const sortedListeners = [...entries.values()].sort(
        (a, b) => (b.options.priority ?? 0) - (a.options.priority ?? 0),
      )

      for (const entry of sortedListeners) {
        if (canceled && !(entry.options.always ?? false)) {
          continue
        }

        try {
          const ret = entry.listener.call(controllerBox.value!, event)

          if (allowAsync) await ret
        } catch (err) {
          if (
            eventType === 'error' ||
            (eventRegister.get('error')?.size ?? 0) < 1
          ) {
            cReportError(err)
          } else {
            const wrappedError = new Error(
              `An error occurred while calling the event listener for "${eventType}"`,
              { cause: err },
            )

            dispatchEvent(
              new ErrorEvent(wrappedError, err, event, entry.listener),
            )
          }
        }

        if (entry.options.once ?? false) {
          entries.delete(entry)
        }

        if (!canceled) canceled = isCanceled(event)
      }
    }

    const completion = impl()

    if (entries != null && entries.size === 0) {
      eventRegister.delete(event.type)
    }

    if (allowAsync) {
      return completion.then(
        () => !canceled,
        () => false,
      ) as ReturnType<typeof dispatchEvent>
    } else {
      return !canceled as ReturnType<typeof dispatchEvent>
    }
  }

  return {
    addEventListener,
    removeEventListener,
    dispatchEvent,
  }
}
