import type { IntlFormatters } from '@formatjs/intl'

export type PartsFormattersKeys<K = keyof IntlFormatters> =
  K extends `${string}Parts` ? K : never
