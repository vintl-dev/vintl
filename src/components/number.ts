import {
  defineSimpleFormatterComponent,
  definePartsFormatterComponent,
  type SimpleFormatterComponentSlots,
  type SimpleFormatterComponentProps,
  type PartsFormatterComponentProps,
  type PartsFormatterComponentSlots,
} from './utils/index.ts'

// This is required so that TypeScript cannot infer the types.
import type {} from '@formatjs/ecma402-abstract'

export const FormattedNumber = defineSimpleFormatterComponent('formatNumber')

export type FormattedNumberProps = SimpleFormatterComponentProps<'formatNumber'>

export type FormattedNumberSlots = SimpleFormatterComponentSlots<'formatNumber'>

export const FormattedNumberParts = definePartsFormatterComponent(
  'formatNumberToParts',
)

export type FormattedNumberPartsProps =
  PartsFormatterComponentProps<'formatNumberToParts'>

export type FormattedNumberPartsSlots =
  PartsFormatterComponentSlots<'formatNumberToParts'>
