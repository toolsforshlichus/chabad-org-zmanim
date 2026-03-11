# Fetching Zmanim

## By ZIP Code

The simplest way to get zmanim for a US location:

```ts
import { getZmanimByZip } from "chabad-org-zmanim";

const result = await getZmanimByZip(11213, new Date("2025-03-14"));

console.log(result.locationName); // "Brooklyn, NY 11213"
console.log(result.days[0].times.Shkiah); // "7:04 PM"
```

## By City ID

For locations identified by a Chabad.org city ID:

```ts
import { getZmanimByCity } from "chabad-org-zmanim";

const result = await getZmanimByCity(424023, new Date());
console.log(result.locationName);
```

## Date Ranges

Fetch multiple days in a single API call:

```ts
import { getZmanimRange } from "chabad-org-zmanim";

const result = await getZmanimRange(
  11213,        // location ID
  2,            // 2 = ZIP code
  new Date("2025-03-14"),
  new Date("2025-03-21"),
);

for (const day of result.days) {
  console.log(day.displayDate, day.times.CandleLighting ?? "—");
}
```

## Full Control

Use `fetchZmanim` for complete control over all options:

```ts
import { fetchZmanim } from "chabad-org-zmanim";

const controller = new AbortController();

const result = await fetchZmanim({
  locationId: 11213,
  locationType: 2,
  date: new Date("2025-03-14"),
  endDate: new Date("2025-03-14"),
  aid: 143790,                     // Chabad.org affiliate ID
  userAgent: "MyApp/1.0",          // custom User-Agent
  signal: controller.signal,       // cancellation
});
```

## Raw API Response

If you need the unprocessed API response:

```ts
import { fetchZmanimRaw } from "chabad-org-zmanim";

const raw = await fetchZmanimRaw({
  locationId: 11213,
  locationType: 2,
  date: new Date(),
});

// Access raw API fields directly
console.log(raw.Days[0].TimeGroups[0].Items[0].Zman);
```

You can parse a raw response later with `parseResponse`:

```ts
import { parseResponse } from "chabad-org-zmanim";

const parsed = parseResponse(raw);
```

## Working with Results

### Quick time lookup

Every parsed day has a `times` map for fast access:

```ts
const day = result.days[0];

day.times.Shkiah;           // "7:04 PM"
day.times.CandleLighting;  // "6:46 PM" or undefined
day.times.Chatzos;          // "12:45 PM"
```

Or use the `getTime` helper:

```ts
import { getTime } from "chabad-org-zmanim";

const sunset = getTime(day, "Shkiah"); // "7:04 PM" | undefined
```

### Check for Shabbos/Yom Tov

```ts
import { hasCandleLighting, hasShabbosEnds } from "chabad-org-zmanim";

if (hasCandleLighting(day)) {
  console.log("Light candles at", day.times.CandleLighting);
}

if (hasShabbosEnds(day)) {
  console.log("Shabbos ends at", day.times.ShabbosEnds);
}
```

### Get special zmanim only

```ts
import { getSpecialZmanim } from "chabad-org-zmanim";

const special = getSpecialZmanim(day);
// Returns only: CandleLighting, ShabbosEnds,
// LastEatingChametzTime, BurnChametzTime

for (const z of special) {
  console.log(z.title, z.time);
}
```

### Holiday and Parsha info

```ts
const day = result.days[0];

if (day.isHoliday) {
  console.log("Holiday:", day.holidayName);
}

if (day.parsha) {
  console.log("Parsha:", day.parsha);
}
```

## Request Cancellation

All fetch functions accept an `AbortSignal`:

```ts
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const result = await getZmanimByZip(11213, new Date(), controller.signal);
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Request was cancelled");
  }
}
```
