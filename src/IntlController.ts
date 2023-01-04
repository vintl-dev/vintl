import { type Ref, ref } from 'vue'
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
import type { Locale } from './types/index.js'
import { mergeDescriptors } from './utils/definer.js'

export function createController<ControllerType>(
  initialConfiguration?: Partial<ControllerConfiguration<ControllerType>>,
  initialLocaleData?: Record<string, Locale>,
): IntlController<ControllerType> {
  const $controller: Ref<IntlController<ControllerType> | null> = ref(null)

  const configPartial = useConfigPartial(initialConfiguration)

  const eventTargetPartial = useEventTargetPartial($controller)

  const prefersPartial = usePrefersPartial(configPartial.$config)

  const localesPartial = useLocalesPartial(
    initialLocaleData,
    configPartial.$config,
    eventTargetPartial,
    prefersPartial,
  )

  const dataPartial = useLocaleDataPartial(
    configPartial.$config,
    localesPartial.$locales,
  )

  const intlPartial = useIntlPartial<ControllerType>(
    configPartial.$config,
    dataPartial.$messages,
  )

  $controller.value = mergeDescriptors(
    configPartial,
    localesPartial,
    intlPartial,
    dataPartial,
    prefersPartial,
    eventTargetPartial,
  )

  return $controller.value
}
