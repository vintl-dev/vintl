import { cleanup, fireEvent, render } from '@testing-library/vue'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createVIntlPlugin } from '../../utils/index.ts'
import { messagesPayload, MessageDisplay } from './messageDisplay.tsx'

describe('useMessages', () => {
  afterAll(() => cleanup())

  const vintl = createVIntlPlugin(['en-US', 'uk'], messagesPayload)

  const { plugin, controller, resetController } = vintl

  afterEach(resetController)

  const { getByText, getByTestId } = render(MessageDisplay, {
    global: { plugins: [plugin] },
  })

  // const display = getByTestId('message-display')
  const messageContainer = getByTestId('message-container')
  const warningContainer = getByTestId('warning-container')

  beforeEach(() => fireEvent.click(getByText('Reset')))

  const messageHTML = () => messageContainer.innerHTML
  const warningHTML = () => warningContainer.innerHTML

  it('renders', async () => {
    expect(messageHTML()).toMatchInlineSnapshot(
      '"<span>Hello, Andrei!</span><span>You don\'t have unread messages.</span>"',
    )
    expect(warningHTML()).toMatchInlineSnapshot(
      '"<strong>Warning!</strong> This is a warning."',
    )

    await fireEvent.click(getByText('Add unread'))
    expect(messageHTML()).toMatchInlineSnapshot(
      '"<span>Hello, Andrei!</span><span>You have 1 unread message.</span>"',
    )

    await fireEvent.click(getByText('Set intent to goodbye'))
    expect(messageHTML()).toMatchInlineSnapshot(
      '"<span>Goodbye, Andrei!</span><span>You have 1 unread message.</span>"',
    )
  })

  it('changes locale', async () => {
    await controller.changeLocale('uk')
    expect(messageHTML()).toMatchInlineSnapshot(
      '"<span>Привіт, Andrei!</span><span>У вас немає непрочитаних повідомлень.</span>"',
    )
    expect(warningHTML()).toMatchInlineSnapshot(
      '"<strong>Попередження!</strong> Це попередження."',
    )

    // 1 = one
    await fireEvent.click(getByText('Add unread'))
    expect(messageHTML()).toMatchInlineSnapshot(
      '"<span>Привіт, Andrei!</span><span>У вас є 1 непрочитане повідомлення.</span>"',
    )

    // 2 = few
    await fireEvent.click(getByText('Add unread'))
    expect(messageHTML()).toMatchInlineSnapshot(
      '"<span>Привіт, Andrei!</span><span>У вас є 2 непрочитаних повідомлення.</span>"',
    )

    // safe to assume it will continue to handle number updates

    await fireEvent.click(getByText('Set intent to goodbye'))
    expect(messageHTML()).toMatchInlineSnapshot(
      '"<span>До побачення, Andrei!</span><span>У вас є 2 непрочитаних повідомлення.</span>"',
    )
  })
})
