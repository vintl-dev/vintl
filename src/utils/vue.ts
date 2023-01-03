import _Vue, {
  getCurrentInstance,
  type VNode as _VNode,
  watch,
  type WatchSource,
  type WatchCallback,
  type WatchStopHandle,
} from 'vue'
import type { WatchOptions } from 'vue/types/v3-generated.js'

const Vue = (() => {
  const v = _Vue as any // ????
  return 'default' in v ? v.default : v
})()

type NonNully<T> = T extends null | undefined ? never : T

/**
 * @returns Returns current Vue instance.
 * @throws If Vue instance is not available in the current context.
 */
export function getInstance(): NonNully<
  ReturnType<typeof getCurrentInstance>
>['proxy'] {
  const instance = getCurrentInstance()
  if (instance == null) {
    throw new Error('Vue instance is not available in this context')
  }
  return instance.proxy
}

const VNode = Object.getPrototypeOf(Vue.prototype._e())?.constructor ?? null

if (VNode == null) {
  throw new Error(
    'Something went terribly wrong because constructor for VNode cannot be found anymore',
  )
}

/**
 * Checks whether the provided value is an instance of VNode.
 *
 * @param value Value to check.
 * @returns `true` if value is a VNode, otherwise `false`.
 */
export function isVNode(value: unknown): value is _VNode {
  return value instanceof VNode
}

/**
 * Creates VNode specifically for text.
 *
 * @param value Text inside the node, any passed value will be converted to
 *   string using `String(value)`.
 * @returns VNode or text.
 */
export function createTextNode(value: unknown): _VNode {
  return Vue.prototype._v(value)
}

/**
 * An alias for Vue's watch method with pre-defined options to watch the
 * provided source and call callback immediately after source changes or watcher
 * is initialised, in synchronous manner.
 *
 * @param source Observing source.
 * @param callback Callback to be called on source change.
 * @param options Options for observer.
 * @returns A function to stop watching.
 */
export function observe<T>(
  source: WatchSource<T>,
  callback: WatchCallback<T, T | undefined>,
  options?: Omit<WatchOptions<true>, 'immediate' | 'flush'>,
): WatchStopHandle {
  return watch(source, callback, {
    ...options,
    immediate: true,
    flush: 'sync',
  })
}
