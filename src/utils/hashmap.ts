function isValidKey(value: unknown): value is PropertyKey {
  const t = typeof value
  return t === 'string' || t === 'symbol' || t === 'number'
}

type HashMap = Record<PropertyKey, any>

export function hasKey<M extends HashMap>(
  this: void,
  map: M,
  key: unknown,
): key is keyof M {
  return isValidKey(key) && Object.prototype.hasOwnProperty.call(map, key)
}

export function createHashMap<K extends PropertyKey, V = unknown>(
  this: void,
): Record<K, V> {
  return Object.create(null)
}
