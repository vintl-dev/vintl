import type { FormatListOptions, IntlFormatters } from '@formatjs/intl'
import {
  type VNode,
  defineComponent,
  type SetupContext,
  type SlotsType,
  computed,
  type PropType,
} from 'vue'
import { useVIntl } from '../runtime/index.ts'
import { normalizeAttrs } from './utils/index.ts'

interface FormattedListPartsDefinedProps<Item extends string | VNode> {
  items: readonly Item[]
}

export interface FormattedListPartsProps<Item extends string | VNode>
  extends FormattedListPartsDefinedProps<Item>,
    FormatListOptions {}

export interface FormattedListPartsSlots<Item extends string | VNode> {
  default(props: {
    parts: ReturnType<IntlFormatters<Item>['formatListToParts']>
  }): any
}

export const FormattedListParts = defineComponent(
  <Item extends string | VNode>(
    props: FormattedListPartsProps<Item>,
    ctx: SetupContext<{}, SlotsType<Partial<FormattedListPartsSlots<Item>>>>,
  ) => {
    const vintl = useVIntl()

    const options = computed(() => {
      return normalizeAttrs(ctx.attrs) as FormatListOptions
    })

    return () => {
      const { items } = props as FormattedListPartsDefinedProps<Item>

      const parts = vintl.intl.formatListToParts(items, options.value) as any

      return ctx.slots.default?.({ parts }) ?? parts
    }
  },
  {
    inheritAttrs: false,
    props: {
      items: {
        type: Array as PropType<any[]>,
        default() {
          return []
        },
      },
    },
  },
)
