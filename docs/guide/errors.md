# Error Handling

All errors thrown by this library extend `ZmanimError`, so you can catch them in a hierarchy.

## Error Classes

| Error Class | When It's Thrown |
|-------------|-----------------|
| `ZmanimNetworkError` | `fetch` fails, or HTTP status is not 2xx |
| `ZmanimParseError` | JSON parsing fails, or response is missing required fields |
| `ZmanimError` | Base class for both of the above |

## Catching Errors

```ts
import {
  fetchZmanim,
  ZmanimError,
  ZmanimNetworkError,
  ZmanimParseError,
} from "chabad-org-zmanim";

try {
  const result = await fetchZmanim({
    locationId: 11213,
    locationType: 2,
    date: new Date(),
  });
} catch (err) {
  if (err instanceof ZmanimNetworkError) {
    // Network failure or bad HTTP status
    console.error("Network error:", err.message);
    console.error("Status code:", err.statusCode); // e.g. 404, 500
  } else if (err instanceof ZmanimParseError) {
    // Response wasn't valid JSON or was missing fields
    console.error("Parse error:", err.message);
  } else if (err instanceof ZmanimError) {
    // Catch-all for any zmanim error
    console.error("Zmanim error:", err.message);
  }
}
```

## Error Properties

### `ZmanimError`

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable error message |
| `cause` | `unknown` | The original error that caused this one |
| `name` | `string` | Always `"ZmanimError"` |

### `ZmanimNetworkError`

Extends `ZmanimError` with:

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | `number \| undefined` | HTTP status code (if available) |

### `ZmanimParseError`

Same shape as `ZmanimError`. Thrown when:
- `res.json()` fails (malformed JSON)
- The response is missing the `Days` array
