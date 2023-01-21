import type { FormatAliases } from '../partial/intl.js'
import type { MessageValueType } from '../types/messages.js'
import { useI18n } from './useI18n.js'

/**
 * A composable to retrieve the format function aliases from the installed
 * controller in the current app.
 *
 * @deprecated Please use `const { formats } = useI18n()` instead.
 * @throws If controller cannot be found in the current application or current
 *   application cannot be determined (called outside of `setup()` call).
 */
export function useFormatters<T = MessageValueType>(): FormatAliases<T> {
  return useI18n().formats
}
