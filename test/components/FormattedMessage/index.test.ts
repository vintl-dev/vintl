import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { createVIntlPlugin } from '../../utils/index.ts'
import { messagesPayload, MessageDisplay } from './messageDisplay.tsx'

describe('FormattedMessage', () => {
  afterAll(() => cleanup())

  const vintl = createVIntlPlugin(['en-US', 'uk'], (e) => {
    e.addMessages(messagesPayload?.[e.locale.tag] ?? {})
  })

  const { plugin, controller, resetController } = vintl

  const { getByText, getByTestId } = render(MessageDisplay, {
    global: { plugins: [plugin] },
  })

  let display: HTMLElement

  const refreshDisplay = () => (display = getByTestId('message-display'))

  beforeEach(async () => {
    await fireEvent.click(getByText('Reset'))
    refreshDisplay()
  })

  afterEach(async () => {
    await resetController()
  })

  const content = () => display.textContent

  it('renders', async () => {
    expect(content()).toMatchInlineSnapshot(
      '"Hello, Oleksandr. You have 1 new message"',
    )

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot(
      '"Hello, Oleksandr. You have 2 new messages"',
    )
  })

  it('changes locale', async () => {
    await controller.changeLocale('uk')
    expect(content()).toMatchInlineSnapshot(
      '"Привіт, Oleksandr. У вас 1 нове повідомлення"',
    )

    await fireEvent.click(getByText('+1'))
    expect(content()).toMatchInlineSnapshot(
      '"Привіт, Oleksandr. У вас 2 нових повідомлень"',
    )
  })

  it('renders with slots', async () => {
    await fireEvent.click(getByText('Slots on'))
    refreshDisplay()

    expect(display.innerHTML).toMatchInlineSnapshot(
      '"Hello, <b>Oleksandr</b> <span class=\\"emoji\\">👋</span> You have 1 new message"',
    )
  })
})
