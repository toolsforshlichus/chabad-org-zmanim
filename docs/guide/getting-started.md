# Getting Started

## Installation

::: code-group

```bash [npm]
npm install chabad-org-zmanim
```

```bash [bun]
bun add chabad-org-zmanim
```

```bash [yarn]
yarn add chabad-org-zmanim
```

```bash [pnpm]
pnpm add chabad-org-zmanim
```

:::

## Requirements

- **Node.js 18+** (uses native `fetch`)
- Or any server-side runtime with a global `fetch`: Bun, Deno, Cloudflare Workers, etc.
- **Does not work in browsers** — see [Browser Usage](/guide/browser)

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

## How It Works

This library calls the Chabad.org Zmanim web service API, which is the same API used by the [Chabad.org Zmanim page](https://www.chabad.org/calendar/zmanim.htm). It:

1. Constructs the correct API URL with your location and date
2. Sends an HTTP request with the appropriate headers
3. Parses the JSON response (including ASP.NET date formats)
4. Returns a structured, typed result with quick-lookup time maps

## Location Types

There are two ways to specify a location:

| Type | `locationType` | Example |
|------|---------------|---------|
| US ZIP code | `2` | `11213` (Crown Heights, Brooklyn) |
| Chabad city ID | `1` | `424023` |

The convenience functions `getZmanimByZip` and `getZmanimByCity` handle the `locationType` for you.


