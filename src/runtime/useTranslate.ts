import type { TranslateFunction } from '../types/translateFunction.js'
import { useI18n } from './useI18n.js'

/**
 * A composable to retrieve function to format a message from the installed
 * controller in the current app.
 *
 * @deprecated Please use `const { formatMessage } = useI18n()` instead.
 * @throws If controller cannot be found in the current application or current
 *   application cannot be determined (called outside of `setup()` call).
 */
export function useTranslate(): TranslateFunction {
  return useI18n().formatMessage
}
