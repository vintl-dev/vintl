import type { Event, EventListenerOptions } from '../events/types.js'
import { shallowEqual } from '../utils/shallowEqual.js'
import { observe } from '../utils/vue.js'
import type { ControllerConfiguration } from './config.js'
import type { ControllerEvents, EventTargetPartial } from './events.js'
import type { IntlController } from './types.js'

type ListenerItemRegular<ControllerType, EventType> = Extract<
  ControllerEvents,
  { type: EventType }
> extends never
  ? never
  : (
      this: IntlController<ControllerType>,
      event: Extract<ControllerEvents, { type: EventType }>,
    ) => any

type ListenerItemWithOptions<ControllerType, EventType> = {
  listener: ListenerItemRegular<ControllerType, EventType>
  options?: EventListenerOptions
}

type ListenerItem<ControllerType, EventType> =
  | ListenerItemWithOptions<ControllerType, EventType>
  | ListenerItemRegular<ControllerType, EventType>

export type ControllerEventsMap<ControllerType> = {
  [EventType in ControllerEvents extends Event
    ? ControllerEvents['type']
    : never]?: ControllerEvents extends Event
    ? EventType extends ControllerEvents['type']
      ?
          | ListenerItem<ControllerType, EventType>
          | ListenerItem<ControllerType, EventType>[]
      : never
    : never
}

type ControllerEventsMapCache<ControllerType> = {
  [EventType in ControllerEvents extends Event
    ? ControllerEvents['type']
    : never]?: ControllerEvents extends Event
    ? EventType extends ControllerEvents['type']
      ? ListenerItemWithOptions<ControllerType, EventType>[]
      : never
    : never
}

type NormalizedKey<K> = K extends number ? `${K}` : K extends string ? K : never

function keys<T extends object>(value: T): NormalizedKey<keyof T>[] {
  return Object.keys(value) as NormalizedKey<keyof T>[]
}

function isListenerWithOptions<ControllerType, EventType>(
  value:
    | ListenerItem<ControllerType, EventType>
    | ListenerItem<ControllerType, EventType>[]
    | null
    | undefined,
): value is ListenerItemWithOptions<ControllerType, EventType> {
  return (
    typeof value === 'object' &&
    value != null &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, 'listener')
  )
}

function normalizeListeners<ControllerType, EventType>(
  listenersRaw:
    | ListenerItem<ControllerType, EventType>
    | ListenerItem<ControllerType, EventType>[]
    | null
    | undefined,
): ListenerItemWithOptions<ControllerType, EventType>[] {
  const listeners: ListenerItemWithOptions<ControllerType, EventType>[] = []

  if (listenersRaw == null) return listeners

  if (isListenerWithOptions(listenersRaw)) {
    listeners.push(listenersRaw)
    return listeners
  }

  if (Array.isArray(listenersRaw)) {
    for (const rawListener of listenersRaw) {
      if (isListenerWithOptions(rawListener)) {
        listeners.push(rawListener)
      } else {
        listeners.push({
          listener: rawListener,
        })
      }
    }
  } else {
    listeners.push({
      listener: listenersRaw,
    })
  }

  return listeners
}

export function useDeclarativeEvents<ControllerType>(
  $config: ControllerConfiguration<ControllerType>,
  eventTarget: EventTargetPartial<ControllerType>,
) {
  const knownListenersByType: ControllerEventsMapCache<ControllerType> =
    Object.create(null)

  function getKnownListeners<
    EventType extends keyof typeof knownListenersByType,
  >(type: EventType): ListenerItemWithOptions<ControllerType, any>[] {
    if (knownListenersByType[type] == null) {
      knownListenersByType[type] = []
    }

    return knownListenersByType[type]!
  }

  function evict(
    type: keyof typeof knownListenersByType,
    item: ListenerItemWithOptions<ControllerType, any>,
  ) {
    const knownListeners = knownListenersByType[type]

    if (knownListeners == null) return

    const itemIndex = knownListeners.findIndex((it) => it === item)

    if (itemIndex !== -1) knownListeners.splice(itemIndex, 1)

    if (knownListeners.length === 0) delete knownListenersByType[type]
  }

  observe(
    () => $config.listen,
    (listenersByType) => {
      for (const eventType of keys(listenersByType)) {
        if (listenersByType[eventType] == null) continue

        type EventType = typeof eventType

        const knownListeners = getKnownListeners(eventType)

        const listeners = normalizeListeners<ControllerType, EventType>(
          listenersByType[eventType] as any,
        ) as ListenerItemWithOptions<ControllerType, any>[]

        for (const listenerItem of listeners) {
          const knownListenerItemIndex = knownListeners.findIndex(
            (it) => it.listener === listenerItem.listener,
          )

          if (knownListenerItemIndex !== -1) {
            const knownListenerItem = knownListeners[
              knownListenerItemIndex
            ] as ListenerItemWithOptions<ControllerType, any>

            if (shallowEqual(listenerItem.options, knownListenerItem.options)) {
              continue
            }

            eventTarget.removeEventListener(eventType, listenerItem.listener)

            knownListeners.splice(knownListenerItemIndex, 1)
          }

          let wrappedListener: (this: any, args: any[]) => any

          if (listenerItem.options?.once ?? false) {
            const originalListener = listenerItem.listener

            wrappedListener = function (this: any, ...args: any[]) {
              try {
                return (
                  originalListener as (this: any, ...args: any[]) => any
                ).call(this, ...args)
              } finally {
                evict(eventType, listenerItem)
              }
            }
          } else {
            wrappedListener = listenerItem.listener as any
          }

          eventTarget.addEventListener(
            eventType,
            wrappedListener as any,
            listenerItem.options,
          )

          knownListeners.push(listenerItem as any)
        }

        for (let i = 0; i < knownListeners.length; i++) {
          const knownListenerItem = knownListeners[i]

          const activeListenerItemIndex = listeners.findIndex(
            (it) =>
              it.listener === knownListenerItem.listener &&
              shallowEqual(it.options, knownListenerItem.options),
          )

          if (activeListenerItemIndex === -1) {
            eventTarget.removeEventListener(
              eventType,
              knownListenerItem.listener as any,
            )

            knownListeners.splice(i, 1)

            i -= 1
          }
        }

        if (knownListeners.length === 0) delete knownListenersByType[eventType]
      }
    },
  )
}
