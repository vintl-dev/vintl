import type { LocaleDescriptor } from '../index.js'
import {
  type CancelableEvent,
  implementCancelation,
} from './cancelableEvents.js'
import type { Event } from './types.js'

/**
 * An event that is fired whenever the {@link IntlController} locale changes.
 *
 * This event is cancellable, cancelling it will result in locale staying the
 * same as it was.
 *
 * This event is called before {@link LocaleLoadEvent}.
 */
class LocaleChangeEvent implements Event {
  public readonly type = 'localechange'

  /**
   * @param previousLocale Previously used locale.
   * @param locale Locale that locale will be changed to.
   * @param automatic Whether the locale change was invoked by automation.
   */
  constructor(
    public readonly previousLocale: LocaleDescriptor | null,
    public readonly locale: LocaleDescriptor,
    public readonly automatic: boolean,
  ) {
    implementCancelation(this)
  }
}

interface LocaleChangeEvent extends CancelableEvent {}

export { LocaleChangeEvent }
