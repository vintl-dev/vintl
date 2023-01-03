import type { Ref } from 'vue'

type MaybeRef<T> = T | Ref<T>

/**
 * Represents an instance of a preferred locales source.
 *
 * This object can be reactive.
 */
export interface PreferredLocalesSource {
  /**
   * An array of preferred locales by this source or `null` if no locales are
   * preferred.
   *
   * None of the locales specified have to be configured in IntlController, all
   * non-existing locales will be simply skipped until array is exhausted in
   * which case the source's prefers are skipped entirely and the next source is
   * used.
   */
  get prefers(): MaybeRef<string[] | null>

  /** Called whenever the source is installed. */
  install?(): void

  /** Optional method that will be called whenever the source is removed. */
  uninstall?(): void
}
