import { ZmanimNetworkError, ZmanimParseError } from "./errors.js";
import type { ZmanimApiResponse, ZmanimOptions, ParsedZmanimResult } from "./types.js";
import { parseResponse } from "./parser.js";

/** Chabad.org Zmanim API endpoint. */
const BASE_URL =
  "https://www.chabad.org/webservices/zmanim/zmanim/Get_Zmanim";

/** Default Chabad.org affiliate ID. */
const DEFAULT_AID = 143790;

/** Default User-Agent string sent with requests. */
const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";

/**
 * Format a `Date` as `M/D/YYYY` (used for `startdate` / `enddate` params).
 * @internal
 */
function fmtDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

/**
 * Format a `Date` as `M-D-YYYY` (used for the `tdate` param).
 * @internal
 */
function fmtTdate(d: Date): string {
  return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
}

/**
 * Build the full API URL for the given options.
 * @internal
 */
export function buildUrl(opts: ZmanimOptions): string {
  const params = new URLSearchParams({
    locationid: String(opts.locationId),
    locationtype: String(opts.locationType),
    tdate: fmtTdate(opts.date),
    aid: String(opts.aid ?? DEFAULT_AID),
    startdate: fmtDate(opts.date),
    enddate: fmtDate(opts.endDate ?? opts.date),
  });
  return `${BASE_URL}?${params}`;
}

/**
 * Build HTTP headers for the API request.
 * @internal
 */
export function buildHeaders(opts: ZmanimOptions): Record<string, string> {
  const ua = opts.userAgent ?? DEFAULT_UA;
  return {
    accept: "application/json",
    "accept-language": "en-US,en;q=0.9",
    referer: `https://www.chabad.org/calendar/zmanim_cdo/locationid/${opts.locationId}/locationtype/${opts.locationType}/tdate/${fmtTdate(opts.date)}`,
    "user-agent": ua,
    "x-user-agent": `${ua} co_ajax/2.0`,
    "sec-ch-ua":
      '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    priority: "u=1, i",
  };
}

/**
 * Fetch the raw JSON response from the Chabad.org Zmanim API.
 *
 * Use this when you need full control over the raw response data.
 * For most use cases, prefer {@link fetchZmanim} which returns a parsed result.
 *
 * @param opts - Request options including location, date, and optional overrides.
 * @returns The raw API response object.
 * @throws {ZmanimNetworkError} If the network request fails or returns a non-2xx status.
 * @throws {ZmanimParseError} If the response body is not valid JSON.
 *
 * @example
 * ```ts
 * const raw = await fetchZmanimRaw({
 *   locationId: 11213,
 *   locationType: 2,
 *   date: new Date(),
 * });
 * console.log(raw.Days[0].TimeGroups);
 * ```
 */
export async function fetchZmanimRaw(
  opts: ZmanimOptions,
): Promise<ZmanimApiResponse> {
  let res: Response;

  try {
    res = await fetch(buildUrl(opts), {
      method: "GET",
      headers: buildHeaders(opts),
      signal: opts.signal,
    });
  } catch (err) {
    throw new ZmanimNetworkError(
      `Network request failed: ${err instanceof Error ? err.message : err}`,
      undefined,
      err,
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ZmanimNetworkError(
      `HTTP ${res.status}: ${res.statusText} — ${body.slice(0, 500)}`,
      res.status,
    );
  }

  try {
    return (await res.json()) as ZmanimApiResponse;
  } catch (err) {
    throw new ZmanimParseError(
      `Failed to parse JSON: ${err instanceof Error ? err.message : err}`,
      err,
    );
  }
}

/**
 * Fetch zmanim from the Chabad.org API and return a parsed, easy-to-use result.
 *
 * This is the main entry point for most use cases.
 *
 * @param opts - Request options including location, date, and optional overrides.
 * @returns A parsed result with structured days, zmanim, and location metadata.
 * @throws {ZmanimNetworkError} If the network request fails.
 * @throws {ZmanimParseError} If the response cannot be parsed.
 *
 * @example
 * ```ts
 * import { fetchZmanim } from "chabad-org-zmanim";
 *
 * const result = await fetchZmanim({
 *   locationId: 11213,
 *   locationType: 2,
 *   date: new Date("2025-03-14"),
 * });
 *
 * for (const day of result.days) {
 *   console.log(day.displayDate, day.times.Shkiah);
 * }
 * ```
 */
export async function fetchZmanim(
  opts: ZmanimOptions,
): Promise<ParsedZmanimResult> {
  return parseResponse(await fetchZmanimRaw(opts));
}
