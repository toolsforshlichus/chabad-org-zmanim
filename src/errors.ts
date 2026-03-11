/**
 * Base error class for all Zmanim-related errors.
 */
export class ZmanimError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ZmanimError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a network request to the Chabad.org API fails.
 */
export class ZmanimNetworkError extends ZmanimError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    cause?: unknown,
  ) {
    super(message, cause);
    this.name = "ZmanimNetworkError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API response cannot be parsed.
 */
export class ZmanimParseError extends ZmanimError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "ZmanimParseError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
