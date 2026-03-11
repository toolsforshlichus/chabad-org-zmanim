// ─── Location ────────────────────────────────────────────────────────────────

/**
 * Location type used by the Chabad.org API.
 * - `1` — Chabad city ID
 * - `2` — US ZIP code
 */
export type LocationType = 1 | 2;

// ─── Zman Types ──────────────────────────────────────────────────────────────

/**
 * Known zman (halachic time) identifiers returned by the API.
 * The union with `(string & {})` allows arbitrary strings while still
 * providing autocomplete for the known values.
 */
export type ZmanType =
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

// ─── Raw API Response Types ──────────────────────────────────────────────────

/** A single zman item within a time group. */
export interface ZmanItem {
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

/** A group of related zmanim (e.g. all Shkiah opinions). */
export interface TimeGroup {
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

/** A single day in the API response. */
export interface ZmanimDay {
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

/** Column heading metadata. */
export interface GroupHeading {
  EssentialZmanType: ZmanType | "";
  Order: number;
  EssentialTitle: string;
}

/** Geographic coordinates. */
export interface Coordinates {
  Latitude: number;
  Longitude: number;
}

/** The full raw JSON response from the Chabad.org Zmanim API. */
export interface ZmanimApiResponse {
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

// ─── Parsed (Friendly) Types ─────────────────────────────────────────────────

/** A single parsed zman with friendly field names. */
export interface ParsedZman {
  /** The zman identifier (e.g. `"Shkiah"`, `"CandleLighting"`). */
  type: ZmanType;
  /** Human-readable English title. */
  title: string;
  /** Hebrew title. */
  hebrewTitle: string;
  /** Formatted time string (e.g. `"7:32 PM"`). */
  time: string;
  /** Parsed `Date` object, or `null` if the raw date was unparseable. */
  date: Date | null;
  /** Whether this is the default opinion for this zman type. */
  isDefault: boolean;
  /** Footnote text, if any. */
  footnote: string | null;
}

/** A parsed day with all its zmanim. */
export interface ParsedDay {
  /** The date as a `Date` object. */
  date: Date;
  /** Display-friendly date string from the API. */
  displayDate: string;
  /** Day of the week (0 = Sunday). */
  dayOfWeek: number;
  /** Weekly Torah portion, if applicable. */
  parsha: string | null;
  /** Holiday name, if applicable. */
  holidayName: string | null;
  /** Whether this day is a Jewish holiday. */
  isHoliday: boolean;
  /** Whether Daylight Saving Time is active. */
  isDstActive: boolean;
  /** All zmanim for this day. */
  zmanim: ParsedZman[];
  /**
   * Quick-lookup map of zman type to time string.
   * When multiple opinions exist, the default opinion's time is used.
   */
  times: Partial<Record<ZmanType, string>>;
}

/** The fully parsed result returned by {@link fetchZmanim}. */
export interface ParsedZmanimResult {
  /** Full location name (e.g. `"Brooklyn, NY 11213"`). */
  locationName: string;
  /** City name. */
  city: string;
  /** Geographic coordinates of the location. */
  coordinates: Coordinates;
  /** Additional location details (HTML stripped). */
  locationDetails: string;
  /** Array of parsed days. */
  days: ParsedDay[];
  /** Footnotes keyed by footnote type. */
  footnotes: Record<string, string>;
  /** The original raw API response, for advanced use. */
  raw: ZmanimApiResponse;
}

// ─── Options ─────────────────────────────────────────────────────────────────

/** Options for fetching zmanim from the Chabad.org API. */
export interface ZmanimOptions {
  /** Location ID — either a US ZIP code or a Chabad city ID. */
  locationId: number;
  /** Whether `locationId` is a city ID (`1`) or ZIP code (`2`). */
  locationType: LocationType;
  /** The date to fetch zmanim for. */
  date: Date;
  /** Optional end date for fetching a range of days. */
  endDate?: Date;
  /** Chabad.org affiliate ID (defaults to `143790`). */
  aid?: number;
  /** Custom User-Agent string. */
  userAgent?: string;
  /** `AbortSignal` for cancelling the request. */
  signal?: AbortSignal;
}
