---
outline: [2, 3]
---

# Listening to controller events

Controller has its own event system to keep the consumers informed of what is
happening and to allow a degree of extensibility.

## Kinds of events

Before we jump into learning about the events it is important to outline
difference between their kinds.

### Regular events

Regular events execute sequentially and all their listeners are synchronous.
They cannot be cancelled and will propagate throughout all their listeners.

The order in which listeners are called is dependent on the `priority` specified
in options when the listener is being added. Highest priority events are called
first, lowest priority events are called last.

All listeners are called with `this` bound to event target (controller in our
case) and single argument that is an instance of `Event`.

### Asynchronous events

Asynchronous events are an extension of regular events with one notable
difference — all listeners to these events are executed in an asynchronous
context, allowing them to perform long I/O operations.

Listeners to these events are still executed sequentially, so while one listener
is executing, all the others are waiting for it to complete.

### Cancellable events

Cancellable events can be the extension of both regular and asynchronous events.
The only difference is that the propagation of these events can be cancelled
programmatically.

It is expected that the cancellation of the event will also cancel the
associated action that caused the event.

Listeners can be configured to run regardless of the cancellation status using
the `always` option, which can be useful if the listener is being used to
monitor the outcome of an event.

:::warning

Cancelled events should not be modified. Since the associated action is also
expected to be cancelled, any modifications made during event propagation may or
may not be discarded.

:::

### Collectable events

Collectable events are another extension of events that are expected to collect
additional data from listeners during event propagation.

At the end of such event propagation, the data is collected and the event is
marked as collected. The event must not be used after it has been collected.

:::danger

While the `collect` method is exposed on the event object, it is for internal
use only. Collecting the event through the listener prevents the controller from
collecting it, and is equivalent to cancelling the event.

:::

## Managing events

:::info

While the API for events is designed to look similar to browsers' `EventTarget`
API, it is very different. Controller does not implement browsers' `EventTarget`
and none of event objects extend browsers' `Event`.

:::

### Adding event listeners

To add an event listeners, `addEventListener` method of controller can be used.

It accepts an event type, listener to that event, and optionally listening
options.

The following options can be specified:

- `once` specifies whether the event should be called only once. It is `false`
  by default, so the listener will be called until it is removed. If set to
  `true`, the listener will be called only once and then removed.

- `priority` is a number that defines the priority of an event. It is useful if
  you need to maintain a certain order in which listeners are called. By default
  it is `0`. Setting it to a higher number will move it up in priority, setting
  it to a lower number will move it down.

- `always` defines whether the listener should be called regardless of whether
  the event has been cancelled. If set to `true`, the listener will be called
  even if the event is cancelled.

```ts
function onLocaleChange(e) {
  notifications.show({
    title: controller.formatMessage(messages.languageChangedTitle),
    text: controller.formatMessage(messages.languageChangedText, {
      language: controller.resources.languageNames[e.locale.tag],
    }),
  })
}

controller.addEventListener('afterlocalechange', onLocaleChange, { once: true })
```

### Removing event listeners

If event listener is no longer needed, it can be removed with
`removeEventListener` method.

It accepts an event type and event listener that was previously added for that
event type.

```ts
controller.removeEventListener('afterlocalechange', onLocaleChange)
```

### Dispatching a custom event

Controller supports dispatching custom events using `dispatchEvent` method.

It takes only event as an argument and returns a boolean value indicating
whether the event was successfully propagated or not.

```ts
class CustomEvent {
  public readonly type = 'customevent'
  public constructor(public readonly message: string) {}
}

controller.addEventListener('customevent', (e) => {
  console.log(`CustomEvent event listener is called with message: ${e.message}`)
})

controller.dispatchEvent(new CustomEvent('Hello, world!'))

// Output: CustomEvent event listener is called with message: Hello, world!
```

## Event types

Now that we know everything we need about the event system we can look at the
event types.

### Locale change event

Locale change event (`localechange`) is called when locale is about to change,
either by manual invocation of `changeLocale` method or automation.

It is cancellable. Cancelling it will cancel the locale change, keeping the
current locale in effect.

It contains three fields:

- `previousLocale` may contain a locale descriptor of the previous locale.
- `locale` contains a locale descriptor of the locale that controller is being
  switched to.
- `automatic` is a boolean indicating whether the locale change was invoked by
  the automation.

### Automatic state change event

Automatic change event (`automatic`) is called when automation is about to be
turned on or off during the manual locale change.

It is cancellable. Cancelling it will cancel the locale change, keeping the
current locale and status of automation in effect.

It has only one field, `state`, which is a boolean indicating the new state of
automatic mode (`true` if it will be turned on, `false` otherwise).

### Locale load event

Locale load event (`localeload`) is the most interesting event of the
controller. It is invoked when controller is loading the locale and is
asynchronous and collectable.

The purpose of this event is to add all messages, and it most useful in custom
frameworks, but can be used without frameworks as well.

It is also cancellable. Cancelling it will produce an error and cancel the
locale change, rendering controller in errored state.

It has multiple fields:

- `locale` contains the descriptor of the locale that's being loaded.
- `messages` contains an intermediate object representing the current set of
  messages, it will include both messages that were added imperatively, as well
  as messages that were added throughout event propagation.
- `resources` contains an intermediate object representing the current set of
  resources, just like `messages`, it will contain both the resources that were
  added imperatively, as well as resources added throughout event propagation.

Two methods are also provided:

- `addMessages`, which assigns messages to the intermediate messages map;
- and `addResources`, which assigns resources to the intermediate resources map.

:::details Example code: using locale load event to add hardcoded messages

```ts
const messages = {
  'en-US': {
    greeting: 'Hello, {name}!',
  },
  'en-GB': {
    greeting: 'Hello, {name}!',
  },
  uk: {
    greeting: 'Привіт, {name}!',
  },
  de: {
    greeting: 'Hallo, {name}!',
  },
}

controller.addEventListener('localeload', (e) => {
  if (e.locale.tag in messages) {
    e.addMessages(messages[e.locale.tag])
  }
})
```

:::

:::details Example code: using locale load event to import messages

```ts
import * as americanEnglishMessages from '~/locale/en-US.json'

const messagesImports = {
  'en-US': () => americanEnglishMessages,
  'en-GB': () => import('~/locale/en-GB.json'),
  uk: () => import('~/locale/uk.json'),
  de: () => import('~/locale/de.json'),
}

controller.addEventListener('localeload', async (e) => {
  if (e.locale.tag in messagesImports) {
    const { default: messages } = await messagesImports[e.locale.tag]()

    e.addMessages(messages)
  }
})
```

:::

### After locale change event

After locale change event (`afterlocalechange`) is called after the locale has
been applied.

It contains the same fields as [Locale change event](#locale-change-event), but
compared to it cannot be cancelled.

### Error event

Error event (`error`) is called when any event listener throws an error, except
for error event listeners.

:::info

If no error event listener is defined, or if the error event listener throws an
error, then the error is printed to the console.

:::

It contains the following fields:

- `error`, which is an `Error` describing the error. If supported by the
  environment, its `cause` is set to the error thrown by the listener;
- `cause` is the error thrown by the listener;
- `event` is the event object that the listener failed to process;
- `listener` is the listener that failed to process the event.
