import { usePrefersPartial } from './partial/prefers.js'
import {
  type ControllerConfiguration,
  useConfigPartial,
} from './partial/config.js'
import { useLocaleDataPartial } from './partial/data.js'
import { useEventTargetPartial } from './partial/events.js'
import { useIntlPartial } from './partial/intl.js'
import { useLocalesPartial } from './partial/locales.js'
import type { IntlController } from './partial/types.js'
import type { Locale, LocaleDescriptor } from './types/index.js'
import { mergeDescriptors } from './utils/definer.js'
import { useDeclarativeEvents } from './partial/declarativeEvents.js'

export function createController<ControllerType>(
  initialConfiguration?: Partial<ControllerConfiguration<ControllerType>>,
  initialLocaleData?: Map<LocaleDescriptor, Locale>,
): IntlController<ControllerType> {
  const controllerBox: { value: IntlController<ControllerType> | null } = {
    value: null,
  }

  const configPartial = useConfigPartial(initialConfiguration)

  const eventTargetPartial = useEventTargetPartial(controllerBox)

  useDeclarativeEvents(configPartial.$config, eventTargetPartial)

  const prefersPartial = usePrefersPartial(configPartial.$config)

  const localesPartial = useLocalesPartial(
    initialLocaleData,
    configPartial.$config,
    eventTargetPartial,
    prefersPartial,
  )

  const dataPartial = useLocaleDataPartial(
    configPartial.$config,
    localesPartial,
  )

  const intlPartial = useIntlPartial<ControllerType>(
    configPartial.$config,
    dataPartial.$messages,
  )

  controllerBox.value = mergeDescriptors(
    configPartial,
    localesPartial,
    intlPartial,
    dataPartial,
    prefersPartial,
    eventTargetPartial,
  )

  return controllerBox.value
}
