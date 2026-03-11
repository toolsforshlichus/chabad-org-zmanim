# Types

All types are exported from the package and can be imported with `import type`:

```ts
import type {
  ZmanimOptions,
  ParsedZmanimResult,
  ParsedDay,
  ParsedZman,
  ZmanType,
  LocationType,
  // ...
} from "chabad-org-zmanim";
```

## Options

### `ZmanimOptions`

```ts
interface ZmanimOptions {
  /** ZIP code or Chabad city ID. */
  locationId: number;
  /** 1 = city ID, 2 = ZIP code. */
  locationType: 1 | 2;
  /** The date to fetch zmanim for. */
  date: Date;
  /** Optional end date for date ranges. */
  endDate?: Date;
  /** Chabad.org affiliate ID (default: 143790). */
  aid?: number;
  /** Custom User-Agent string. */
  userAgent?: string;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
}
```

### `LocationType`

```ts
type LocationType = 1 | 2;
// 1 = Chabad city ID
// 2 = US ZIP code
```

## Parsed Result Types

### `ParsedZmanimResult`

The top-level result returned by `fetchZmanim` and convenience functions.

```ts
interface ParsedZmanimResult {
  /** Full location name, e.g. "Brooklyn, NY 11213". */
  locationName: string;
  /** City name. */
  city: string;
  /** Latitude and longitude. */
  coordinates: Coordinates;
  /** Additional location details (HTML stripped). */
  locationDetails: string;
  /** Array of parsed days. */
  days: ParsedDay[];
  /** Footnotes keyed by type. */
  footnotes: Record<string, string>;
  /** The original raw API response. */
  raw: ZmanimApiResponse;
}
```

### `ParsedDay`

A single day with all its zmanim.

```ts
interface ParsedDay {
  /** Date object. */
  date: Date;
  /** e.g. "March 14, 2025". */
  displayDate: string;
  /** 0 = Sunday, 6 = Saturday. */
  dayOfWeek: number;
  /** Weekly Torah portion, if applicable. */
  parsha: string | null;
  /** Holiday name, if applicable. */
  holidayName: string | null;
  /** Whether this is a Jewish holiday. */
  isHoliday: boolean;
  /** Whether DST is active. */
  isDstActive: boolean;
  /** All zmanim for this day. */
  zmanim: ParsedZman[];
  /** Quick lookup: { Shkiah: "7:04 PM", ... } */
  times: Partial<Record<ZmanType, string>>;
}
```

### `ParsedZman`

A single halachic time.

```ts
interface ParsedZman {
  /** e.g. "Shkiah", "CandleLighting". */
  type: ZmanType;
  /** English title. */
  title: string;
  /** Hebrew title. */
  hebrewTitle: string;
  /** e.g. "7:04 PM". */
  time: string;
  /** Parsed Date, or null if unparseable. */
  date: Date | null;
  /** Whether this is the default opinion. */
  isDefault: boolean;
  /** Footnote text, if any. */
  footnote: string | null;
}
```

### `Coordinates`

```ts
interface Coordinates {
  Latitude: number;
  Longitude: number;
}
```

## ZmanType

Known zman identifiers. The type also accepts arbitrary strings for forward compatibility.

```ts
type ZmanType =
  | "AlosHashachar"
  | "EarliestTefillin"
  | "NetzHachamah"
  | "LatestShema"
  | "LatestTefillah"
  | "LastEatingChametzTime"
  | "BurnChametzTime"
  | "Chatzos"
  | "MinchahGedolah"
  | "MinchahKetanah"
  | "PlagHaminchah"
  | "CandleLighting"
  | "Shkiah"
  | "Tzeis"
  | "ShabbosEnds"
  | "ChatzosNight"
  | "ShaahZmanit"
  | (string & {});
```

| Value | Description |
|-------|-------------|
| `AlosHashachar` | Dawn |
| `EarliestTefillin` | Earliest Tallis & Tefillin |
| `NetzHachamah` | Sunrise |
| `LatestShema` | Latest Shema |
| `LatestTefillah` | Latest Shacharis |
| `LastEatingChametzTime` | Stop eating Chametz (Erev Pesach) |
| `BurnChametzTime` | Burn Chametz by (Erev Pesach) |
| `Chatzos` | Midday |
| `MinchahGedolah` | Earliest Mincha |
| `MinchahKetanah` | Mincha Ketanah |
| `PlagHaminchah` | Plag HaMincha |
| `CandleLighting` | Candle Lighting |
| `Shkiah` | Sunset |
| `Tzeis` | Nightfall |
| `ShabbosEnds` | Shabbos / Yom Tov Ends |
| `ChatzosNight` | Midnight |
| `ShaahZmanit` | Halachic Hour duration |

## Raw API Types

These types mirror the exact JSON structure returned by the Chabad.org API.

### `ZmanimApiResponse`

```ts
interface ZmanimApiResponse {
  Footnotes: Record<string, string>;
  FootnoteOrder: string[];
  Days: ZmanimDay[];
  GroupHeadings: GroupHeading[];
  IsNewLocation: boolean;
  IsDefaultLocation: boolean;
  LocationName: string;
  City: string;
  Coordinates: Coordinates;
  LocationDetails: string;
  EndDate: string;
  GmtStartDate: string;
  GmtEndDate: string;
  IsAdvanced: boolean;
  PageTitle: string;
  LocationId: string;
}
```

### `ZmanimDay`

```ts
interface ZmanimDay {
  TimeGroups: TimeGroup[];
  Parsha: string | null;
  HolidayName: string | null;
  IsHoliday: boolean;
  DisplayDate: string;
  DayOfWeek: number;
  IsDstActive: boolean;
  IsDayOfDstChange: boolean;
  GmtDate: string;
}
```

### `TimeGroup`

```ts
interface TimeGroup {
  Title: string;
  ZmanType: ZmanType;
  FootnoteType: string;
  HebrewTitle: string;
  Order: number;
  EssentialZmanType: ZmanType;
  EssentialTitle: string | null;
  Items: ZmanItem[];
  InfoMessageIndex: number;
  InfoMessage: string | null;
}
```

### `ZmanItem`

```ts
interface ZmanItem {
  EssentialZmanType: ZmanType;
  Order: number;
  Title: string;
  FootnoteType: string;
  EssentialTitle: string | null;
  Link: string;
  OpinionInformation: string | null;
  OpinionDescription: string | null;
  TechnicalInformation: string | null;
  ZmanType: ZmanType;
  Zman: string;
  Date: string;
  InfoMessageIndex: number;
  InfoMessage: string | null;
  Default: boolean;
}
```

### `GroupHeading`

```ts
interface GroupHeading {
  EssentialZmanType: ZmanType | "";
  Order: number;
  EssentialTitle: string;
}
```
