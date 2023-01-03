import type { Locale, LocaleDescriptor, MessagesMap } from '../types/index.js'
import { createHashMap } from '../utils/hashmap.js'
import type { Event } from './types.js'
import {
  type CancelableEvent,
  implementCancelation,
} from './cancelableEvents.js'
import {
  type CollectableEvent,
  implementCollection,
} from './collectableEvents.js'
import { type AsyncEvent, markAsAsync } from './asyncEvents.js'

/**
 * An event that is fired whenever the {@link IntlController} does not have a
 * locale loaded and requests it to be loaded. This event is called
 * asynchronously and can be used to implement custom message loaders.
 *
 * This event is cancellable, cancelling it will result in {@link IntlController}
 * throwing an error to the requestor of locale change.
 */
class LocaleLoadEvent implements Event {
  public readonly type = 'localeload'

  /** Locale descriptor for the locale that is being loaded. */
  public readonly locale: LocaleDescriptor

  /**
   * Intermediate object presenting messages that were loaded previously and
   * throughout this event's propagation to all listeners. It may or may not be
   * the actual messages map, depending on whether it was initialized before.
   */
  public readonly messages: Partial<MessagesMap>

  /**
   * Intermediate object presenting locale resources that were loaded previously
   * and throughout this event's propagation to all listener. It may or may not
   * be the actual resources map, depending on whether it was initialized
   * before.
   */
  public readonly resources: Partial<VueIntlController.LocaleResources>

  /** @param locale Locale object which the initial values will be mapped from. */
  public constructor(locale: Locale) {
    this.locale = locale.descriptor

    this.messages = locale.messages ?? (createHashMap() as MessagesMap)

    this.resources = locale.resources ?? createHashMap()

    implementCancelation(this)

    implementCollection(this, () => {
      this.cancel()

      return {
        messages: this.messages,
        resources: this.resources,
      }
    })

    markAsAsync(this)
  }

  /**
   * Adds provided messages to the the intermediate messages map, overriding any
   * existing values.
   *
   * For better type interference this method uses partial object notation
   * rather than parameters.
   *
   * @param messages Messages to add to the intermediate messages map.
   */
  public addMessages(messages: Partial<MessagesMap>) {
    Object.assign(this.messages, messages)
  }

  /**
   * Adds provided resources to the the intermediate resources map, overriding
   * any existing values.
   *
   * For better type interference this method uses partial object notation
   * rather than parameters.
   *
   * @param resources Resources to add to the intermediate resources map.
   */
  public addResources(resources: Partial<VueIntlController.LocaleResources>) {
    Object.assign(this.resources, resources)
  }
}

interface LocaleLoadEvent
  extends AsyncEvent,
    CancelableEvent,
    CollectableEvent<{
      messages: Partial<MessagesMap>
      resources: Partial<VueIntlController.LocaleResources>
    }> {}

export { LocaleLoadEvent }
