# Errors

All errors thrown by this library are subclasses of `ZmanimError`.

## Class Hierarchy

```
Error
 └── ZmanimError
      ├── ZmanimNetworkError
      └── ZmanimParseError
```

## `ZmanimError`

Base class for all library errors.

```ts
class ZmanimError extends Error {
  readonly cause?: unknown;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable error description |
| `name` | `string` | `"ZmanimError"` |
| `cause` | `unknown` | The original error, if wrapping one |

## `ZmanimNetworkError`

Thrown when the HTTP request fails.

```ts
class ZmanimNetworkError extends ZmanimError {
  readonly statusCode?: number;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | `number \| undefined` | HTTP status code, if available |

**Thrown when:**
- `fetch()` throws (e.g. DNS failure, timeout, network unreachable)
- The server returns a non-2xx HTTP status

## `ZmanimParseError`

Thrown when the response cannot be parsed.

```ts
class ZmanimParseError extends ZmanimError {}
```

**Thrown when:**
- `res.json()` fails (malformed JSON body)
- The parsed response is missing the required `Days` array

## Usage

```ts
import {
  getZmanimByZip,
  ZmanimError,
  ZmanimNetworkError,
  ZmanimParseError,
} from "chabad-org-zmanim";

try {
  const result = await getZmanimByZip(11213, new Date());
} catch (err) {
  if (err instanceof ZmanimNetworkError) {
    console.error(`Network error (HTTP ${err.statusCode}):`, err.message);
  } else if (err instanceof ZmanimParseError) {
    console.error("Parse error:", err.message);
  } else if (err instanceof ZmanimError) {
    console.error("Unknown zmanim error:", err.message);
  } else {
    throw err; // re-throw unexpected errors
  }
}
```

## Accessing the Original Error

All error classes preserve the original error via the `cause` property:

```ts
try {
  await getZmanimByZip(99999, new Date());
} catch (err) {
  if (err instanceof ZmanimNetworkError && err.cause) {
    console.error("Original error:", err.cause);
  }
}
```
