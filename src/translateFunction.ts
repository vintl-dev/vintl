import type { IntlController } from './controller.js'
import type {
  MessageContent,
  MessageDescriptor,
  TranslateFunction,
} from './types/index.js'

/**
 * Creates a {@link TranslateFunction} that utilises the provided
 * {@link IntlController}.
 *
 * @param controller Controller to use for translations.
 * @returns Function to use translations from the controller.
 */
function createTranslateFunction<ControllerType>(
  controller: IntlController<ControllerType>,
): TranslateFunction {
  return function translateAndNormalize(descriptor, values, opts?) {
    let result: ReturnType<IntlController<ControllerType>['intl']['$t']> = ''

    const normalizedDescriptor: MessageDescriptor =
      typeof descriptor === 'string'
        ? {
            id: descriptor,
            defaultMessage: controller.defaultMessages[
              descriptor
            ] as MessageContent,
          }
        : descriptor

    result = controller.intl.formatMessage(
      normalizedDescriptor,
      values as Record<string, any>,
      opts,
    )

    if (typeof result === 'string') {
      return result
    }

    if (Array.isArray(result)) {
      let normalizedResult = ''

      for (const item of result) {
        normalizedResult += String(item)
      }

      return normalizedResult
    }

    return String(result)
  }
}

export { createTranslateFunction, type TranslateFunction }
