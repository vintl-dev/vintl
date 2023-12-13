---
'@vintl/vintl': minor
---

Add more formatting components similar to ones found in `react-intl`:

- `FormattedDate`, `FormattedDateParts`
- `FormattedTime`, `FormattedTimeParts`
- `FormattedDateTimeRange`
- `FormattedRelativeTime` (doesn't update live like `react-intl`)
- `FormattedNumber`, `FormattedNumberParts`
- `FormattedPlural`
- `FormattedList`, `FormattedListParts`
- `FormattedDisplayName`
- `FormattedMessage`

Slots can be used to receive the formatted values instead of being formatted as is.

`FormattedMessage` is very similar to `IntlFormatted`, but accepts descriptor properties and does not allow to format raw messages.
