import type { TranslateFunction } from '../types/translateFunction.js'
import { getInstance } from '../utils/vue.js'

export function useTranslate(): TranslateFunction {
  const t = (getInstance() as any).$t as TranslateFunction

  if (t === null) {
    throw new Error(
      'Cannot retrieve translate function for the current context',
    )
  }

  return t
}
