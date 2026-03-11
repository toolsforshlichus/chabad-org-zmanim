# Functions

## Fetching

### `getZmanimByZip(zip, date, signal?)`

Fetch zmanim for a US ZIP code.

- **Parameters:**
  - `zip` (`number`) — 5-digit US ZIP code (e.g. `11213`)
  - `date` (`Date`) — The date to fetch zmanim for
  - `signal` (`AbortSignal`, optional) — For request cancellation
- **Returns:** `Promise<ParsedZmanimResult>`
- **Throws:** `ZmanimNetworkError`, `ZmanimParseError`

```ts
const result = await getZmanimByZip(11213, new Date("2025-03-14"));
```

---

### `getZmanimByCity(cityId, date, signal?)`

Fetch zmanim for a Chabad.org city ID.

- **Parameters:**
  - `cityId` (`number`) — Chabad.org city identifier
  - `date` (`Date`) — The date to fetch zmanim for
  - `signal` (`AbortSignal`, optional) — For request cancellation
- **Returns:** `Promise<ParsedZmanimResult>`

```ts
const result = await getZmanimByCity(424023, new Date());
```

---

### `getZmanimRange(locationId, locationType, startDate, endDate, signal?)`

Fetch zmanim for a date range in a single API call.

- **Parameters:**
  - `locationId` (`number`) — ZIP code or city ID
  - `locationType` (`1 | 2`) — `1` for city ID, `2` for ZIP code
  - `startDate` (`Date`) — First day of the range
  - `endDate` (`Date`) — Last day of the range
  - `signal` (`AbortSignal`, optional) — For request cancellation
- **Returns:** `Promise<ParsedZmanimResult>`

```ts
const result = await getZmanimRange(11213, 2, startDate, endDate);
for (const day of result.days) {
  console.log(day.displayDate, day.times.Shkiah);
}
```

---

### `fetchZmanim(options)`

Full-control fetch with all options. Returns a parsed result.

- **Parameters:**
  - `options` ([`ZmanimOptions`](/api/types#zmanimoptions)) — Full request configuration
- **Returns:** `Promise<ParsedZmanimResult>`

```ts
const result = await fetchZmanim({
  locationId: 11213,
  locationType: 2,
  date: new Date("2025-03-14"),
  endDate: new Date("2025-03-14"),
  aid: 143790,
  userAgent: "MyApp/1.0",
  signal: controller.signal,
});
```

---

### `fetchZmanimRaw(options)`

Fetch the raw JSON response without parsing.

- **Parameters:**
  - `options` ([`ZmanimOptions`](/api/types#zmanimoptions)) — Full request configuration
- **Returns:** `Promise<ZmanimApiResponse>`

```ts
const raw = await fetchZmanimRaw({
  locationId: 11213,
  locationType: 2,
  date: new Date(),
});
// raw.Days[0].TimeGroups[0].Items[0].Zman
```

---

## Helpers

### `getTime(day, type)`

Pull a single time string from a parsed day.

- **Parameters:**
  - `day` (`ParsedDay`) — A parsed day object
  - `type` (`ZmanType`) — The zman type to look up
- **Returns:** `string | undefined`

```ts
const sunset = getTime(day, "Shkiah"); // "7:04 PM" | undefined
```

---

### `hasCandleLighting(day)`

Check if a day has candle-lighting time (Erev Shabbos/Yom Tov).

- **Parameters:** `day` (`ParsedDay`)
- **Returns:** `boolean`

```ts
if (hasCandleLighting(day)) {
  console.log("Light candles at", day.times.CandleLighting);
}
```

---

### `hasShabbosEnds(day)`

Check if a day has a Shabbos/Yom Tov ending time.

- **Parameters:** `day` (`ParsedDay`)
- **Returns:** `boolean`

---

### `getSpecialZmanim(day)`

Get only the special/holiday zmanim for a day: `CandleLighting`, `ShabbosEnds`, `LastEatingChametzTime`, `BurnChametzTime`.

- **Parameters:** `day` (`ParsedDay`)
- **Returns:** `ParsedZman[]`

```ts
const special = getSpecialZmanim(day);
for (const z of special) {
  console.log(z.title, z.time);
}
```

---

## Parser Utilities

Also exported are a few low-level utilities useful if you're fetching or processing API data yourself:

- **`parseResponse(raw)`** — Parse a raw `ZmanimApiResponse` into a `ParsedZmanimResult`. Throws `ZmanimParseError` if `raw.Days` is missing.
- **`parseAspNetDate(s)`** — Parse ASP.NET date strings like `"/Date(1700000000000)/"` into `Date` objects. Returns `null` if unparseable.
- **`stripHtml(html)`** — Strip HTML tags and decode common entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&nbsp;`).
