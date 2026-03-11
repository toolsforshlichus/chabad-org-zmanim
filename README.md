# chabad-org-zmanim

**[Documentation](https://toolsforshlichus.github.io/chabad-org-zmanim/)** | **[GitHub](https://github.com/toolsforshlichus/chabad-org-zmanim)** | **[npm](https://www.npmjs.com/package/chabad-org-zmanim)**

Zero-dependency TypeScript client for the [Chabad.org Zmanim API](https://www.chabad.org/calendar/zmanim.htm). Fetch halachic times (zmanim) for any location with full type safety.

- Zero dependencies
- **Server-side only** — does not work in browsers (see [Browser Usage](#browser-usage) below)
- Works in Node.js 18+, Bun, Deno, and edge runtimes
- Dual ESM / CommonJS output
- Full TypeScript types with JSDoc documentation
- Parses raw API responses into friendly objects
- Convenience helpers for common use cases

## Installation

```bash
npm install chabad-org-zmanim
```

```bash
bun add chabad-org-zmanim
```

```bash
yarn add chabad-org-zmanim
```

```bash
pnpm add chabad-org-zmanim
```

## Quick Start

```ts
import { getZmanimByZip } from "chabad-org-zmanim";

const result = await getZmanimByZip(11213, new Date());

console.log(result.locationName);
// "Brooklyn, NY 11213"

const today = result.days[0];
console.log(today.times.Shkiah);
// "7:04 PM"
console.log(today.times.CandleLighting);
// "6:46 PM" (only on Erev Shabbos/Yom Tov)
```

## API Reference

### Fetching Zmanim

#### `getZmanimByZip(zip, date, signal?)`

Fetch zmanim for a US ZIP code.

```ts
import { getZmanimByZip } from "chabad-org-zmanim";

const result = await getZmanimByZip(11213, new Date("2025-03-14"));
```

| Parameter | Type          | Description                        |
| --------- | ------------- | ---------------------------------- |
| `zip`     | `number`      | 5-digit US ZIP code                |
| `date`    | `Date`        | The date to fetch zmanim for       |
| `signal`  | `AbortSignal` | Optional signal for cancellation   |

#### `getZmanimByCity(cityId, date, signal?)`

Fetch zmanim for a Chabad.org city ID.

```ts
import { getZmanimByCity } from "chabad-org-zmanim";

const result = await getZmanimByCity(424023, new Date());
```

#### `getZmanimRange(locationId, locationType, startDate, endDate, signal?)`

Fetch zmanim for a date range (multiple days in a single API call).

```ts
import { getZmanimRange } from "chabad-org-zmanim";

const result = await getZmanimRange(
  11213,
  2, // 2 = ZIP code, 1 = city ID
  new Date("2025-03-14"),
  new Date("2025-03-21"),
);

for (const day of result.days) {
  console.log(day.displayDate, day.times.CandleLighting ?? "—");
}
```

#### `fetchZmanim(options)`

Full-control fetch with all options. Returns a parsed result.

```ts
import { fetchZmanim } from "chabad-org-zmanim";

const result = await fetchZmanim({
  locationId: 11213,
  locationType: 2,
  date: new Date("2025-03-14"),
  endDate: new Date("2025-03-14"), // optional
  aid: 143790,                      // optional, Chabad.org affiliate ID
  userAgent: "MyApp/1.0",           // optional
  signal: controller.signal,        // optional AbortSignal
});
```

#### `fetchZmanimRaw(options)`

Same as `fetchZmanim` but returns the raw API JSON response without parsing.

```ts
import { fetchZmanimRaw } from "chabad-org-zmanim";

const raw = await fetchZmanimRaw({
  locationId: 11213,
  locationType: 2,
  date: new Date(),
});

// raw.Days[0].TimeGroups[0].Items[0].Zman
```

### Helper Functions

#### `getTime(day, zmanType)`

Pull a single time string from a parsed day.

```ts
import { getTime } from "chabad-org-zmanim";

const sunset = getTime(day, "Shkiah"); // "7:04 PM" | undefined
```

#### `hasCandleLighting(day)`

Check if a day has candle lighting (Erev Shabbos/Yom Tov).

```ts
if (hasCandleLighting(day)) {
  console.log("Light candles at", day.times.CandleLighting);
}
```

#### `hasShabbosEnds(day)`

Check if a day has a Shabbos/Yom Tov ending time.

```ts
if (hasShabbosEnds(day)) {
  console.log("Shabbos ends at", day.times.ShabbosEnds);
}
```

#### `getSpecialZmanim(day)`

Get only the special/holiday zmanim: `CandleLighting`, `ShabbosEnds`, `LastEatingChametzTime`, `BurnChametzTime`.

```ts
const special = getSpecialZmanim(day);
for (const z of special) {
  console.log(z.title, z.time);
}
```

### Parser Utilities

Also exported: `parseResponse(raw)`, `parseAspNetDate(dateString)`, and `stripHtml(html)` — useful if you're fetching or processing API data yourself.

## Types

All types are exported for use in your own code:

```ts
import type {
  ZmanimOptions,
  ZmanimApiResponse,
  ParsedZmanimResult,
  ParsedDay,
  ParsedZman,
  ZmanType,
  LocationType,
  Coordinates,
  // ... and more
} from "chabad-org-zmanim";
```

### `ZmanType`

Known zman identifiers returned by the API:

| Value                   | Description                         |
| ----------------------- | ----------------------------------- |
| `AlosHashachar`         | Dawn                                |
| `EarliestTefillin`      | Earliest time for Tallis & Tefillin |
| `NetzHachamah`          | Sunrise                             |
| `LatestShema`           | Latest Shema                        |
| `LatestTefillah`        | Latest Shacharis                    |
| `LastEatingChametzTime` | Stop eating Chametz (Erev Pesach)   |
| `BurnChametzTime`       | Burn Chametz by (Erev Pesach)       |
| `Chatzos`               | Midday                              |
| `MinchahGedolah`        | Earliest Mincha                     |
| `MinchahKetanah`        | Mincha Ketanah                      |
| `PlagHaminchah`         | Plag HaMincha                       |
| `CandleLighting`        | Candle Lighting                     |
| `Shkiah`                | Sunset                              |
| `Tzeis`                 | Nightfall                           |
| `ShabbosEnds`           | Shabbos / Yom Tov Ends             |
| `ChatzosNight`          | Midnight                            |
| `ShaahZmanit`           | Halachic Hour duration              |

The type also accepts arbitrary strings for forward compatibility with new zman types.

### `ParsedDay`

Each day in the result contains:

```ts
interface ParsedDay {
  date: Date;
  displayDate: string;    // "March 14, 2025"
  dayOfWeek: number;      // 0 = Sunday
  parsha: string | null;
  holidayName: string | null;
  isHoliday: boolean;
  isDstActive: boolean;
  zmanim: ParsedZman[];   // All zmanim with full detail
  times: Record<string, string>; // Quick lookup: { Shkiah: "7:04 PM", ... }
}
```

## Error Handling

The library throws typed errors you can catch and handle:

```ts
import {
  fetchZmanim,
  ZmanimError,
  ZmanimNetworkError,
  ZmanimParseError,
} from "chabad-org-zmanim";

try {
  const result = await fetchZmanim({ ... });
} catch (err) {
  if (err instanceof ZmanimNetworkError) {
    console.error("Network failed:", err.message, err.statusCode);
  } else if (err instanceof ZmanimParseError) {
    console.error("Bad response:", err.message);
  } else if (err instanceof ZmanimError) {
    console.error("Zmanim error:", err.message);
  }
}
```

| Error Class          | When                                        |
| -------------------- | ------------------------------------------- |
| `ZmanimNetworkError` | Fetch fails or HTTP status is not 2xx       |
| `ZmanimParseError`   | JSON parsing fails or response is malformed |
| `ZmanimError`        | Base class for all errors above              |

## Request Cancellation

All fetch functions accept an `AbortSignal`:

```ts
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

const result = await getZmanimByZip(11213, new Date(), controller.signal);
```

## Browser Usage

**This library does not work in the browser.** The Chabad.org API does not set CORS headers, so browsers will block requests made directly from client-side code. This is a server-side only library.

If you need zmanim data in a browser application, you have two options:

1. **Proxy through your own server** — call this library from your backend (Node.js, Deno, Bun, etc.) and expose the data through your own API.
2. **Use a serverless function** — wrap a call to this library in a Cloudflare Worker, Vercel Edge Function, AWS Lambda, or similar.

```ts
// Example: Next.js API route
import { getZmanimByZip } from "chabad-org-zmanim";

export async function GET(request: Request) {
  const result = await getZmanimByZip(11213, new Date());
  return Response.json(result);
}
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- Or any server-side runtime with a global `fetch` (Bun, Deno, Cloudflare Workers, etc.)
- **Not compatible with browsers** due to CORS restrictions

## Disclaimer

This is an **unofficial** client. It is not affiliated with or endorsed by Chabad.org. Use responsibly and in accordance with Chabad.org's terms of service.

## License

[MIT](./LICENSE)
