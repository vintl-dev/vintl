import {
  defineSimpleFormatterComponent,
  definePartsFormatterComponent,
} from './utils/index.ts'

// This is required so that TypeScript cannot infer the types.
import type {} from '@formatjs/ecma402-abstract'

export const FormattedNumber = defineSimpleFormatterComponent('formatNumber')

export const FormattedNumberParts = definePartsFormatterComponent(
  'formatNumberToParts',
)
