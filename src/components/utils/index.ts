import { camelize } from '../../utils/strings.ts'

export * from './simpleDefiner.ts'
export * from './partsDefiner.ts'

export function normalizeAttrs(attrs: Record<string, unknown>) {
  const normalizedAttrs: Record<string, unknown> = Object.create(null)
  for (const key in attrs) normalizedAttrs[camelize(key)] = attrs[key]
  return normalizedAttrs
}

export function createRecord<K extends PropertyKey, V>(): Record<K, V> {
  return Object.create(null)
}
