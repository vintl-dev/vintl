import type { AutomationPartial } from './IntlController.prefers.js'
import type { ConfigPartial } from './IntlController.config.js'
import type { LocaleDataPartial } from './IntlController.data.js'
import type { EventTargetPartial } from './IntlController.events.js'
import type { IntlPartial } from './IntlController.intl.js'
import type { LocalesPartial } from './IntlController.locales.js'

export interface IntlController<T>
  extends AutomationPartial,
    ConfigPartial,
    LocaleDataPartial,
    EventTargetPartial<T>,
    IntlPartial<T>,
    LocalesPartial {}
