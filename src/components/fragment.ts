import { defineComponent, type VNode } from 'vue'

interface FragmentProps {
  of: VNode[] | VNode
}

export const Fragment = defineComponent(
  (props: FragmentProps) => () => props.of,
)
