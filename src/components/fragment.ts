import { defineComponent, type VNodeChild } from 'vue'

interface FragmentProps {
  of: VNodeChild
}

export const Fragment = defineComponent(
  (props: FragmentProps) => () => props.of,
  {
    // eslint-disable-next-line vue/require-prop-types
    props: ['of'],
  },
)
