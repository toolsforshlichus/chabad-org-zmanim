import { fetchZmanim } from "./client.js";
import type {
  LocationType,
  ParsedDay,
  ParsedZman,
  ParsedZmanimResult,
  ZmanType,
} from "./types.js";

/**
 * Get zmanim for a **US ZIP code** on a given date.
 *
 * @param zip - A 5-digit US ZIP code (e.g. `11213`).
 * @param date - The date to fetch zmanim for.
 * @param signal - Optional `AbortSignal` for cancellation.
 * @returns Parsed zmanim result.
 *
 * @example
 * ```ts
 * import { getZmanimByZip } from "chabad-org-zmanim";
 *
 * const result = await getZmanimByZip(11213, new Date());
 * console.log(result.days[0].times.Shkiah); // "7:04 PM"
 * ```
 */
export async function getZmanimByZip(
  zip: number,
  date: Date,
  signal?: AbortSignal,
): Promise<ParsedZmanimResult> {
  return fetchZmanim({ locationId: zip, locationType: 2, date, signal });
}

/**
 * Get zmanim for a **Chabad city ID** on a given date.
 *
 * City IDs can be found on Chabad.org location pages.
 *
 * @param cityId - The Chabad.org city identifier.
 * @param date - The date to fetch zmanim for.
 * @param signal - Optional `AbortSignal` for cancellation.
 * @returns Parsed zmanim result.
 *
 * @example
 * ```ts
 * import { getZmanimByCity } from "chabad-org-zmanim";
 *
 * const result = await getZmanimByCity(424023, new Date());
 * console.log(result.locationName);
 * ```
 */
export async function getZmanimByCity(
  cityId: number,
  date: Date,
  signal?: AbortSignal,
): Promise<ParsedZmanimResult> {
  return fetchZmanim({ locationId: cityId, locationType: 1, date, signal });
}

/**
 * Get zmanim for a **date range**.
 *
 * Returns all days between `startDate` and `endDate` (inclusive) in a single
 * API call.
 *
 * @param locationId - ZIP code or city ID.
 * @param locationType - `2` for ZIP code, `1` for city ID.
 * @param startDate - First day of the range.
 * @param endDate - Last day of the range.
 * @param signal - Optional `AbortSignal` for cancellation.
 * @returns Parsed zmanim result with multiple days.
 *
 * @example
 * ```ts
 * import { getZmanimRange } from "chabad-org-zmanim";
 *
 * const result = await getZmanimRange(
 *   11213,
 *   2,
 *   new Date("2025-03-14"),
 *   new Date("2025-03-21"),
 * );
 *
 * for (const day of result.days) {
 *   console.log(day.displayDate, day.times.CandleLighting ?? "—");
 * }
 * ```
 */
export async function getZmanimRange(
  locationId: number,
  locationType: LocationType,
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal,
): Promise<ParsedZmanimResult> {
  return fetchZmanim({
    locationId,
    locationType,
    date: startDate,
    endDate,
    signal,
  });
}

/**
 * Pull a single time string from a parsed day by zman type.
 *
 * @param day - A parsed day object.
 * @param type - The zman type to look up (e.g. `"Shkiah"`).
 * @returns The time string, or `undefined` if not present.
 *
 * @example
 * ```ts
 * const sunset = getTime(day, "Shkiah");
 * // "7:04 PM" or undefined
 * ```
 */
export function getTime(day: ParsedDay, type: ZmanType): string | undefined {
  return day.times[type];
}

/**
 * Check whether a parsed day has candle-lighting time
 * (indicating Shabbos or Yom Tov is beginning).
 *
 * @example
 * ```ts
 * if (hasCandleLighting(day)) {
 *   console.log("Light candles at", day.times.CandleLighting);
 * }
 * ```
 */
export function hasCandleLighting(day: ParsedDay): boolean {
  return "CandleLighting" in day.times;
}

/**
 * Check whether a parsed day has a Shabbos/Yom Tov ending time.
 *
 * @example
 * ```ts
 * if (hasShabbosEnds(day)) {
 *   console.log("Shabbos ends at", day.times.ShabbosEnds);
 * }
 * ```
 */
export function hasShabbosEnds(day: ParsedDay): boolean {
  return "ShabbosEnds" in day.times;
}

/**
 * Get only the special/holiday-related zmanim for a day.
 *
 * Returns zmanim of type: `CandleLighting`, `ShabbosEnds`,
 * `LastEatingChametzTime`, and `BurnChametzTime`.
 *
 * @param day - A parsed day object.
 * @returns Array of special zmanim (may be empty).
 *
 * @example
 * ```ts
 * const special = getSpecialZmanim(day);
 * for (const z of special) {
 *   console.log(z.title, z.time);
 * }
 * ```
 */
export function getSpecialZmanim(day: ParsedDay): ParsedZman[] {
  const special = new Set<string>([
    "CandleLighting",
    "ShabbosEnds",
    "LastEatingChametzTime",
    "BurnChametzTime",
  ]);
  return day.zmanim.filter((z) => special.has(z.type));
}
