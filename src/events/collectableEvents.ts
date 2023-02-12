const CollectableSymbol = Symbol('isCollectable')

const CollectedPropertyKey = 'collected'

const CollectPropertyKey = 'collect'

/**
 * Represents a collectable event that returns {@link T} on collection.
 *
 * @template T The result of collection.
 */
export interface CollectableEvent<T> {
  /** Property used to identify collectable event. */
  [CollectableSymbol]: true

  /**
   * Whether the data from the event has been collected or not. If event data
   * has been collected, none of the event's values must be used anymore since
   * they will not be used by the collector a second time, as well as may not
   * represent the actual state of the event.
   */
  get [CollectedPropertyKey](): boolean

  /**
   * Calls collector, returns the collection result and marks the event as
   * collected.
   *
   * @internal
   */
  [CollectPropertyKey](): T
}

export function implementCollection<R>(
  event: CollectableEvent<R>,
  collector: (this: void) => R,
) {
  let collected = false

  function wrappedCollector(): R {
    if (collected) {
      throw new Error('Cannot call collector for a second time')
    }

    try {
      return collector()
    } finally {
      collected = true
    }
  }

  Object.defineProperties(event, {
    [CollectableSymbol]: {
      configurable: true,
      value: true,
    },
    [CollectedPropertyKey]: {
      configurable: true,
      get() {
        return collected
      },
    },
    [CollectPropertyKey]: {
      configurable: true,
      value: wrappedCollector,
    },
  })
}
