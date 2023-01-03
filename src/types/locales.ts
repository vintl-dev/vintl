import type { JSONMap } from './json.js'
import type { MessagesMap } from './messages.js'

declare global {
  namespace VueIntlController {
    /**
     * Represents a map of locale meta data object, used as
     * {@link LocaleDescriptor.meta} property.
     *
     * All values in this map should be JSON-serializable, therefore it extends
     * internal type {@link JSONMap}.
     */
    interface LocaleMeta extends JSONMap {}

    /**
     * Represents a map of associated with locale resources.
     *
     * These resources are loaded by the custom loaders, {@link IntlController}
     * has no means to load resources by itself to allow for more dynamic
     * configurations.
     */
    interface LocaleResources {}
  }
}

/**
 * Represents a descriptor for the locale.
 *
 * All values in this object should be JSON-serializable, therefore it extends
 * internal type {@link JSONMap}.
 */
export interface LocaleDescriptor {
  /** BCP 47 of the locale code. */
  code: string

  /**
   * Meta data associated with the locale.
   *
   * It is useful when you need to have some data about locale available at all
   * times, for example its name that you display in UI, perhaps automatically
   * calculated data like % translated, etc.
   */
  meta?: VueIntlController.LocaleMeta
}

/** Represents a locale object. */
export interface Locale {
  /** Descriptor for the locale. */
  get descriptor(): LocaleDescriptor

  /** Messages for the locale. */
  messages: MessagesMap

  /** Resources for the locale. */
  resources: VueIntlController.LocaleResources
}
