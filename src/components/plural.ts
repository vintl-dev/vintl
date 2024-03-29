import type { FormatPluralOptions, IntlFormatters } from '@formatjs/intl'
import {
  computed,
  defineComponent,
  type SetupContext,
  type SlotsType,
} from 'vue'
import { useVIntl } from '../runtime/index.ts'
import { normalizeAttrs } from './utils/index.ts'

type PluralSelectors = ReturnType<IntlFormatters['formatPlural']>

type PluralSlots = {
  [K in PluralSelectors]?: (props: { value: number }) => any
}

interface FormattedPluralDefinedProps {
  value: number
}

export interface FormattedPluralProps
  extends FormattedPluralDefinedProps,
    FormatPluralOptions {}

export interface FormattedPluralSlots<T = string> extends PluralSlots {
  default?(props: { children: string | T | (string | T)[] }): any
}

export const FormattedPlural = defineComponent(
  <T = string>(
    props: FormattedPluralProps,
    ctx: SetupContext<{}, SlotsType<Partial<FormattedPluralSlots<T>>>>,
  ) => {
    const vintl = useVIntl<T>()

    const $options = computed(() => {
      return normalizeAttrs(ctx.attrs) as FormatPluralOptions
    })

    return () => {
      const { value } = props

      const rule = vintl.intl.formatPlural(value, $options.value)

      const ruleSlot = ctx.slots[rule] ?? ctx.slots.other

      const ruleRender = ruleSlot != null ? ruleSlot({ value }) : []

      return ctx.slots.default?.({ children: ruleRender }) ?? ruleRender
    }
  },
  {
    inheritAttrs: false,
    props: {
      value: {
        type: Number,
        required: false,
        default: 0,
      },
    },
  },
) as (props: FormattedPluralProps) => any
