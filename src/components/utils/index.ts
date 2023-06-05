import { isVNode, createTextVNode, type VNode } from 'vue'
import type { MessageValueType } from '../../types/index.ts'
import { camelize } from '../../utils/strings.ts'

export * from './simpleDefiner.ts'
export * from './partsDefiner.ts'

export function vnodeOrText<T extends MessageValueType>(value: T | string) {
  return isVNode(value) ? value : createTextVNode(value as any)
}

export function normalizeDynamicOutput<T extends MessageValueType>(
  value: T | string | (string | T)[],
) {
  return (
    Array.isArray(value) ? value.map(vnodeOrText) : [vnodeOrText(value)]
  ) satisfies VNode[]
}

export function normalizeAttrs(attrs: Record<string, unknown>) {
  const normalizedAttrs: Record<string, unknown> = Object.create(null)
  for (const key in attrs) normalizedAttrs[camelize(key)] = attrs[key]
  return normalizedAttrs
}

export function createRecord<K extends PropertyKey, V>(): Record<K, V> {
  return Object.create(null)
}
