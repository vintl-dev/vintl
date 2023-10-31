import {
  defineSimpleFormatterComponent,
  type SimpleFormatterComponentProps,
  type SimpleFormatterComponentSlots,
} from './utils/index.ts'

export const FormattedDisplayName =
  defineSimpleFormatterComponent('formatDisplayName')

export type FormattedDisplayNameProps =
  SimpleFormatterComponentProps<'formatDisplayName'>

export type FormattedDisplayNameSlots =
  SimpleFormatterComponentSlots<'formatDisplayName'>
