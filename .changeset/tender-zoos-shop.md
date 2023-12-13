---
'@vintl/vintl': minor
---

Added `useMessages` composable

`useMessages` is the new composable that allows you to pass in an object with the extended message descriptors, and returns back a reactive object with the current messages. Extended message descriptors can contain values or formatters that will be used when interpreting the message. This allows you to create messages in a very inefferctive manner.
