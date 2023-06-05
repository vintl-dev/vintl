import {
  definePartsFormatterComponent,
  defineSimpleFormatterComponent,
  type PartsFormatterComponentProps,
  type PartsFormatterComponentSlots,
  type SimpleFormatterComponentProps,
  type SimpleFormatterComponentSlots,
} from './utils/index.ts'

export const FormattedDate = defineSimpleFormatterComponent('formatDate')

export type FormattedDateProps = SimpleFormatterComponentProps<'formatDate'>

export type FormattedDateSlots = SimpleFormatterComponentSlots<'formatDate'>

export const FormattedDateParts =
  definePartsFormatterComponent('formatDateToParts')

export type FormattedDatePartsProps =
  PartsFormatterComponentProps<'formatDateToParts'>

export type FormattedDatePartsSlots =
  PartsFormatterComponentSlots<'formatDateToParts'>

export const FormattedTime = defineSimpleFormatterComponent('formatTime')

export type FormattedTimeProps = SimpleFormatterComponentProps<'formatTime'>

export type FormattedTimeSlots = SimpleFormatterComponentSlots<'formatTime'>

export const FormattedTimeParts =
  definePartsFormatterComponent('formatTimeToParts')

export type FormattedTimePartsProps =
  PartsFormatterComponentProps<'formatTimeToParts'>

export type FormattedTimePartsSlots =
  PartsFormatterComponentSlots<'formatTimeToParts'>
