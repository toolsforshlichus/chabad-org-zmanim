/**
 * # chabad-org-zmanim
 *
 * Zero-dependency TypeScript client for the Chabad.org Zmanim API.
 *
 * @packageDocumentation
 */

// Errors
export { ZmanimError, ZmanimNetworkError, ZmanimParseError } from "./errors.js";

// Types
export type {
  LocationType,
  ZmanType,
  ZmanItem,
  TimeGroup,
  ZmanimDay,
  GroupHeading,
  Coordinates,
  ZmanimApiResponse,
  ParsedZman,
  ParsedDay,
  ParsedZmanimResult,
  ZmanimOptions,
} from "./types.js";

// Parser utilities
export { parseAspNetDate, stripHtml, parseResponse } from "./parser.js";

// Client
export { fetchZmanimRaw, fetchZmanim } from "./client.js";

// Convenience helpers
export {
  getZmanimByZip,
  getZmanimByCity,
  getZmanimRange,
  getTime,
  hasCandleLighting,
  hasShabbosEnds,
  getSpecialZmanim,
} from "./helpers.js";
