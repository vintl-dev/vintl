import type { LocaleDescriptor } from '../index.js'
import type { Event } from './types.js'

/** The event that is fired whenever locale has been loaded and applied. */
class AfterLocaleChangeEvent implements Event {
  public readonly type = 'afterlocalechange'

  public constructor(
    /** The locale that has been used before. */
    public readonly previousLocale: LocaleDescriptor | null,
    /** The locale that has just been applied. */
    public readonly locale: LocaleDescriptor,
    /** Whether the locale has been applied automatically. */
    public readonly automatic: boolean,
  ) {}
}

export { AfterLocaleChangeEvent }
