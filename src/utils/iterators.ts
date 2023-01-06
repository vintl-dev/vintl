/**
 * Given the iterator, iterates over it in attempt to find {@link search}.
 *
 * @param iterator Iterator to iterate over.
 * @param search Item to search for.
 * @returns `true` if item is found, otherwise `false`.
 */
export function includes<T>(iterator: IterableIterator<T>, search: T) {
  for (const item of iterator) {
    if (item === search) return true
  }

  return false
}

/**
 * Given the iterator, iterates over it in attempt to find item for which the
 * predicate function would return `true`.
 *
 * @param iterator Iterator to iterate over.
 * @param predicate Predicate that returns `true` for matching item, and `false`
 *   for other items.
 * @returns Item for which the predicate returned `true`, otherwise `undefined`.
 */
export function find<T>(
  iterator: IterableIterator<T>,
  predicate: (item: T) => boolean,
): T | undefined {
  for (const item of iterator) {
    if (predicate(item)) return item
  }

  return undefined
}
