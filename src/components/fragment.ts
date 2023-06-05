import type { VNode } from 'vue'

interface FragmentProps {
  of: VNode[] | VNode
}

export function Fragment(props: FragmentProps) {
  return Array.isArray(props.of) ? props.of : [props.of]
}
