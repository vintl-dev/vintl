import type { VNode } from 'vue'

interface Props {
  of: VNode[] | VNode
}

export function Fragment(props: Props) {
  return Array.isArray(props.of) ? props.of : [props.of]
}
