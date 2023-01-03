import { defineComponent, type PropType } from 'vue'
import type { VNode } from 'vue'
import { isVNode } from './vue.js'

export const Fragment = defineComponent({
  functional: true,
  props: {
    of: {
      type: [Array, Object] as PropType<VNode[] | VNode>,
      validate(value: unknown): value is VNode | VNode[] {
        return Array.isArray(value)
          ? value.every((it) => isVNode(it))
          : isVNode(value)
      },
      default() {
        return [] as VNode[]
      },
    },
  },
  render(_, ctx) {
    const children = ctx.props.of
    return Array.isArray(children) ? children : [children]
  },
})
