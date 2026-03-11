import { ZmanimParseError } from "./errors.js";
import type {
  ZmanimApiResponse,
  ZmanimDay,
  ParsedDay,
  ParsedZman,
  ParsedZmanimResult,
  ZmanType,
} from "./types.js";

/**
 * Parse an ASP.NET JSON date string like `"/Date(1234567890000)/"` into a
 * JavaScript `Date` object.
 *
 * @param s - The raw date string from the API.
 * @returns A `Date` object, or `null` if the string could not be parsed.
 *
 * @example
 * ```ts
 * parseAspNetDate("/Date(1700000000000)/");
 * // => Date 2023-11-14T22:13:20.000Z
 *
 * parseAspNetDate("not a date");
 * // => null
 * ```
 */
export function parseAspNetDate(s: string): Date | null {
  const m = s.match(/\/Date\((-?\d+)\)\//);
  return m ? new Date(parseInt(m[1], 10)) : null;
}

/**
 * Strip HTML tags and decode common HTML entities.
 *
 * @param html - A string potentially containing HTML.
 * @returns Plain text with tags removed and entities decoded.
 *
 * @example
 * ```ts
 * stripHtml("<b>Hello</b> &amp; world");
 * // => "Hello & world"
 * ```
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Parse a single day from the raw API response into a friendly format.
 *
 * @internal
 */
function parseDay(
  day: ZmanimDay,
  footnotes: Record<string, string>,
): ParsedDay {
  const zmanim: ParsedZman[] = [];
  const times: Partial<Record<ZmanType, string>> = {};

  for (const group of day.TimeGroups) {
    for (const item of group.Items) {
      const footnote =
        item.FootnoteType && item.FootnoteType !== "None"
          ? (footnotes[item.FootnoteType] ?? item.InfoMessage)
          : (item.InfoMessage ?? null);

      zmanim.push({
        type: item.ZmanType,
        title: group.Title,
        hebrewTitle: group.HebrewTitle,
        time: item.Zman,
        date: parseAspNetDate(item.Date),
        isDefault: item.Default,
        footnote,
      });

      if (!(item.ZmanType in times) || item.Default) {
        times[item.ZmanType] = item.Zman;
      }
    }
  }

  return {
    date: parseAspNetDate(day.GmtDate) ?? new Date(day.DisplayDate),
    displayDate: day.DisplayDate,
    dayOfWeek: day.DayOfWeek,
    parsha: day.Parsha,
    holidayName: day.HolidayName,
    isHoliday: day.IsHoliday,
    isDstActive: day.IsDstActive,
    zmanim,
    times,
  };
}

/**
 * Parse a raw Chabad.org Zmanim API response into a friendly, structured result.
 *
 * @param raw - The raw API response object.
 * @returns A {@link ParsedZmanimResult} with parsed days, zmanim, and metadata.
 * @throws {ZmanimParseError} If the response is missing required fields.
 *
 * @example
 * ```ts
 * const raw = await fetchZmanimRaw(opts);
 * const result = parseResponse(raw);
 * console.log(result.locationName);
 * console.log(result.days[0].times.Shkiah);
 * ```
 */
export function parseResponse(raw: ZmanimApiResponse): ParsedZmanimResult {
  if (!raw?.Days) {
    throw new ZmanimParseError("Invalid API response: missing Days array");
  }

  return {
    locationName: raw.LocationName,
    city: raw.City,
    coordinates: raw.Coordinates,
    locationDetails: stripHtml(raw.LocationDetails),
    days: raw.Days.map((d) => parseDay(d, raw.Footnotes)),
    footnotes: raw.Footnotes,
    raw,
  };
}
