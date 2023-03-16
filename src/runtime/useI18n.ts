import { inject } from 'vue'
import type { MessageValueType } from '../types/messages.js'
import { controllerKey } from '../consts.js'
import type { IntlController } from '../controller.js'

/**
 * Retrieves installed controller in the current application.
 *
 * @throws If controller cannot be found in the current application or current
 *   application cannot be determined (called outside of `setup()` call).
 */
export function useVIntl<ControllerType = MessageValueType>() {
  const controller = inject(controllerKey)

  if (controller == null) {
    throw new Error(
      'Controller is not available in this context. Has the plugin been installed?',
    )
  }

  return controller as IntlController<ControllerType>
}

/**
 * Alias for {@link useVIntl}.
 *
 * @deprecated This composable name is deprecated and will be removed in next
 *   major version. Please use {@link useVIntl} instead.
 */
export function useI18n<ControllerType = MessageValueType>() {
  return useVIntl<ControllerType>()
}
