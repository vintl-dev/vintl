import type { FormatListOptions } from '@formatjs/intl'
import {
  computed,
  defineComponent,
  type PropType,
  type SetupContext,
  type SlotsType,
  type VNode,
} from 'vue'
import { useVIntl } from '../runtime/index.ts'
import { normalizeAttrs } from './utils/index.ts'

interface FormattedListDefinedProps<Item extends string | VNode> {
  items: readonly Item[]
}

export type FormattedListProps<Item extends string | VNode> =
  FormattedListDefinedProps<Item> & FormatListOptions

export interface FormattedListSlots<
  Item extends string | VNode = string | VNode,
> {
  default(props: {
    children: Item extends string ? string : string | Item | (string | Item)[]
  }): any
}

export const FormattedList = defineComponent(
  <Item extends string | VNode>(
    props: FormattedListProps<Item>,
    ctx: SetupContext<{}, SlotsType<Partial<FormattedListSlots<Item>>>>,
  ) => {
    const vintl = useVIntl()

    const options = computed(() => {
      return normalizeAttrs(ctx.attrs) as FormatListOptions
    })

    return () => {
      const { items } = props as FormattedListDefinedProps<Item>

      const children = vintl.intl.formatList(items, options.value) as any

      return ctx.slots.default?.({ children }) ?? children
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
) as <Item extends string | VNode>(props: FormattedListProps<Item>) => any
// override because typescript is stupid
