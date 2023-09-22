import { computed, defineComponent, ref } from 'vue'
import { useMessage, useMessages } from '../../../dist/index'

export const messagesPayload: Record<string, Record<string, string>> = {
  'en-US': {
    greeting: 'Hello, {name}!',
    farewell: 'Goodbye, {name}!',
    inboxMessages:
      "You {count, plural, =0 {don't have unread messages} one {have # unread message} other {have # unread messages}}.",
    warnText: '<b>Warning!</b> This is a warning.',
  },
  uk: {
    greeting: 'Привіт, {name}!',
    farewell: 'До побачення, {name}!',
    inboxMessages:
      'У вас {count, plural, =0 {немає непрочитаних повідомлень} one {є # непрочитане повідомлення} few {є # непрочитаних повідомлення} many {є # непрочитаних повідомлень} other {є непрочитаних повідомлень}}.',
    warnText: '<b>Попередження!</b> Це попередження.',
  },
}

export const MessageDisplay = defineComponent(() => {
  const incrementByOne = () => (unreadMessages.value += 1)

  const intent = ref<'hello' | 'goodbye'>('hello')
  const setIntentToHello = () => (intent.value = 'hello')
  const setIntentToGoodbye = () => (intent.value = 'goodbye')

  const reset = () => {
    name.value = 'Andrei'
    unreadMessages.value = 0
    intent.value = 'hello'
  }

  const name = ref('Andrei')

  const unreadMessages = ref(0)

  const messages = useMessages({
    inboxMessages: {
      id: 'inboxMessages',
      defaultMessage: messagesPayload['en-US'].inboxMessages,
      values: { count: unreadMessages },
    },
    warnText: {
      id: 'warnText',
      defaultMessage: messagesPayload['en-US'].warnText,
      values: {
        b(chunks) {
          return <strong>{chunks}</strong>
        },
      },
    },
  })

  const helloMessage = useMessage({
    id: 'greeting',
    defaultMessage: messagesPayload['en-US'].greeting,
    values: { name },
  })

  const goodbyeMessage = useMessage({
    id: 'farewell',
    defaultMessage: messagesPayload['en-US'].farewell,
    values: { name },
  })

  const intentMessage = computed(() =>
    intent.value === 'hello' ? helloMessage.value : goodbyeMessage.value,
  )

  const Warning = defineComponent(() => () => messages.warnText)

  return () => {
    return (
      <>
        <p data-testid="message-display">
          <div data-testid="message-container">
            <span>{intentMessage.value}</span>
            <span>{messages.inboxMessages}</span>
          </div>
          <div data-testid="warning-container">
            <Warning />
          </div>
        </p>
        <button onClick={incrementByOne}>Add unread</button>
        <button onClick={setIntentToHello}>Set intent to hello</button>
        <button onClick={setIntentToGoodbye}>Set intent to goodbye</button>
        <button onClick={reset}>Reset</button>
      </>
    )
  }
})
