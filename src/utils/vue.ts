import {
  getCurrentInstance,
  watch,
  type WatchSource,
  type WatchCallback,
  type WatchStopHandle,
  type WatchOptions,
} from 'vue'

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
