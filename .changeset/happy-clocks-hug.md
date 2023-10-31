---
'@vintl/vintl': minor
---

Add more formatting components similar to `react-intl`

- `FormattedDate`, `FormattedDateParts`
- `FormattedTime`, `FormattedTimeParts`
- `FormattedDateTimeRange`
- `FormattedRelativeTime` (static, unlike `react-intl`)
- `FormattedNumber`, `FormattedNumberParts`
- `FormattedPlural`
- `FormattedList`, `FormattedListParts`
- `FormattedDisplayName`
- `FormattedMessage`

Since this is a Vue library, they use slots to pass formatted values (otherwise rendering them as is).

`FormattedMessage` is very similar to `IntlFormatted`, but accepts descriptor properties and does not allow to format raw messages.
