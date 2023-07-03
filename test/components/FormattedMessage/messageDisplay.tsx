import { defineMessages } from '@formatjs/intl'
import { defineComponent, ref } from 'vue'
import {
  FormattedMessage,
  type FormattedMessageSlots,
} from '../../../dist/components'

const messages = defineMessages({
  greeting: {
    id: 'greeting',
    defaultMessage:
      'Hello, {name}. You have {count, plural, one {# new message} other {# new messages}}',
  },
  greetingBold: {
    id: 'greeting.bold',
    defaultMessage:
      'Hello, <bold>{name}</bold> {wave_emoji} You have {count, plural, one {# new message} other {# new messages}}',
  },
} as const)

export const messagesPayload: Record<
  string,
  {
    [K in (typeof messages)[keyof typeof messages]['id']]: string
  }
> = {
  'en-US': {
    greeting: messages.greeting.defaultMessage,
    'greeting.bold': messages.greetingBold.defaultMessage,
  },
  uk: {
    greeting:
      'Привіт, {name}. У вас {count, plural, one {# нове повідомлення} other {# нових повідомлень}}',
    'greeting.bold':
      'Привіт, <bold>{name}</bold> {wave_emoji} У вас {count, plural, one {# нове повідомлення} other {# нових повідомлень}}',
  },
} as const

export const MessageDisplay = defineComponent(() => {
  const name = ref('Oleksandr')

  const unreadMessages = ref(1)
  const incrementByOne = () => (unreadMessages.value += 1)

  const useSlots = ref(false)
  const enableSlots = () => (useSlots.value = true)

  const reset = () => {
    name.value = 'Oleksandr'
    unreadMessages.value = 1
    useSlots.value = false
  }

  return () => {
    let display: JSX.Element

    if (useSlots.value) {
      const slots: FormattedMessageSlots<JSX.Element> = {
        '~wave_emoji': () => <span class="emoji">👋</span>,
        bold: ({ children }) => <b>{children}</b>,
      }

      display = (
        <FormattedMessage
          {...messages.greetingBold}
          values={{ name: name.value, count: unreadMessages.value }}
        >
          {slots}
        </FormattedMessage>
      )
    } else {
      display = (
        <FormattedMessage
          {...messages.greeting}
          values={{ name: name.value, count: unreadMessages.value }}
        />
      )
    }

    return (
      <>
        <p data-testid="message-display">{display}</p>
        <button onClick={incrementByOne}>+1</button>
        <button onClick={enableSlots}>Slots on</button>
        <button onClick={reset}>Reset</button>
      </>
    )
  }
})
