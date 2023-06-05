import type { FormatPluralOptions, IntlFormatters } from '@formatjs/intl'
import {
  computed,
  defineComponent,
  type SetupContext,
  type SlotsType,
} from 'vue'
import { type MessageValueType } from '../types/index.ts'
import { useVIntl } from '../runtime/index.ts'
import { normalizeAttrs } from './utils/index.ts'

type PluralSelectors = ReturnType<IntlFormatters['formatPlural']>

type PluralSlots = {
  [K in PluralSelectors]: () => any
}

interface FormattedPluralDefinedProps {
  value: number
}

export interface FormattedPluralProps
  extends FormattedPluralDefinedProps,
    FormatPluralOptions {}

export interface FormattedPluralSlots<T> extends PluralSlots {
  default(props: { children: string | T | (string | T)[] }): any
}

export const FormattedPlural = defineComponent(
  <T extends MessageValueType>(
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

      const ruleRender = ctx.slots[rule]?.() ?? []

      return ctx.slots.default?.({ children: ruleRender }) ?? ruleRender
    }
  },
  {
    props: {
      value: {
        type: Number,
        required: false,
        default: 0,
      },
      options: {
        type: Object,
        required: false,
        default() {
          return {}
        },
      },
    },
  },
)
