import type { MessageDescriptor } from '../types/index.js'

export function defineMessage<const Descriptor extends MessageDescriptor>(
  descriptor: Descriptor,
) {
  return descriptor
}

export function defineMessages<
  const Descriptors extends Record<string, MessageDescriptor>,
>(descriptors: Descriptors) {
  return descriptors
}
