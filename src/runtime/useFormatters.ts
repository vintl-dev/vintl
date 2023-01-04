import type { MessageValueType } from '../index.js'
import type { FormatAliases } from '../partial/intl.js'
import { getInstance } from '../utils/vue.js'

export function useFormatters(): FormatAliases<MessageValueType> {
  const fmt = (getInstance() as any).$fmt
  if (fmt == null) {
    throw new Error('Cannot retrieve formatter aliases for the current context')
  }
  return fmt
}
