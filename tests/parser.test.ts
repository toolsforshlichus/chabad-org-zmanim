import { describe, it, expect } from "vitest";
import {
  parseAspNetDate,
  stripHtml,
  parseResponse,
  ZmanimParseError,
} from "../src/index.js";
import type { ZmanimApiResponse } from "../src/index.js";

describe("parseAspNetDate", () => {
  it("parses a valid ASP.NET date string", () => {
    const date = parseAspNetDate("/Date(1700000000000)/");
    expect(date).toBeInstanceOf(Date);
    expect(date!.getTime()).toBe(1700000000000);
  });

  it("parses a negative timestamp", () => {
    const date = parseAspNetDate("/Date(-62135596800000)/");
    expect(date).toBeInstanceOf(Date);
    expect(date!.getTime()).toBe(-62135596800000);
  });

  it("returns null for invalid strings", () => {
    expect(parseAspNetDate("not a date")).toBeNull();
    expect(parseAspNetDate("")).toBeNull();
    expect(parseAspNetDate("Date(123)")).toBeNull();
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<b>Hello</b> <i>world</i>")).toBe("Hello world");
  });

  it("decodes common HTML entities", () => {
    expect(stripHtml("A &amp; B &lt; C &gt; D")).toBe("A & B < C > D");
    expect(stripHtml("&quot;quoted&quot;")).toBe('"quoted"');
    expect(stripHtml("it&#39;s")).toBe("it's");
    expect(stripHtml("hello&nbsp;world")).toBe("hello world");
  });

  it("trims whitespace", () => {
    expect(stripHtml("  hello  ")).toBe("hello");
  });

  it("handles combined HTML and entities", () => {
    expect(stripHtml("<p>Tom &amp; Jerry</p>")).toBe("Tom & Jerry");
  });
});

describe("parseResponse", () => {
  it("throws ZmanimParseError for missing Days", () => {
    expect(() => parseResponse({} as ZmanimApiResponse)).toThrow(
      ZmanimParseError,
    );
    expect(() => parseResponse({} as ZmanimApiResponse)).toThrow(
      "missing Days array",
    );
  });

  it("throws ZmanimParseError for null input", () => {
    expect(() => parseResponse(null as unknown as ZmanimApiResponse)).toThrow(
      ZmanimParseError,
    );
  });

  it("parses a minimal valid response", () => {
    const raw: ZmanimApiResponse = {
      Footnotes: {},
      FootnoteOrder: [],
      Days: [
        {
          TimeGroups: [
            {
              Title: "Sunset",
              ZmanType: "Shkiah",
              FootnoteType: "None",
              HebrewTitle: "שקיעה",
              Order: 1,
              EssentialZmanType: "Shkiah",
              EssentialTitle: "Sunset",
              Items: [
                {
                  EssentialZmanType: "Shkiah",
                  Order: 1,
                  Title: "Sunset",
                  FootnoteType: "None",
                  EssentialTitle: "Sunset",
                  Link: "",
                  OpinionInformation: null,
                  OpinionDescription: null,
                  TechnicalInformation: null,
                  ZmanType: "Shkiah",
                  Zman: "7:04 PM",
                  Date: "/Date(1710453840000)/",
                  InfoMessageIndex: 0,
                  InfoMessage: null,
                  Default: true,
                },
              ],
              InfoMessageIndex: 0,
              InfoMessage: null,
            },
          ],
          Parsha: "Vayikra",
          HolidayName: null,
          IsHoliday: false,
          DisplayDate: "March 14, 2025",
          DayOfWeek: 5,
          IsDstActive: true,
          IsDayOfDstChange: false,
          GmtDate: "/Date(1710374400000)/",
        },
      ],
      GroupHeadings: [],
      IsNewLocation: false,
      IsDefaultLocation: false,
      LocationName: "Brooklyn, NY 11213",
      City: "Brooklyn",
      Coordinates: { Latitude: 40.669, Longitude: -73.939 },
      LocationDetails: "<b>Brooklyn</b>, NY",
      EndDate: "/Date(1710374400000)/",
      GmtStartDate: "/Date(1710374400000)/",
      GmtEndDate: "/Date(1710374400000)/",
      IsAdvanced: false,
      PageTitle: "Zmanim",
      LocationId: "11213",
    };

    const result = parseResponse(raw);

    expect(result.locationName).toBe("Brooklyn, NY 11213");
    expect(result.city).toBe("Brooklyn");
    expect(result.coordinates.Latitude).toBe(40.669);
    expect(result.locationDetails).toBe("Brooklyn, NY");
    expect(result.days).toHaveLength(1);

    const day = result.days[0];
    expect(day.displayDate).toBe("March 14, 2025");
    expect(day.parsha).toBe("Vayikra");
    expect(day.isHoliday).toBe(false);
    expect(day.dayOfWeek).toBe(5);
    expect(day.zmanim).toHaveLength(1);
    expect(day.times.Shkiah).toBe("7:04 PM");

    const zman = day.zmanim[0];
    expect(zman.type).toBe("Shkiah");
    expect(zman.title).toBe("Sunset");
    expect(zman.hebrewTitle).toBe("שקיעה");
    expect(zman.time).toBe("7:04 PM");
    expect(zman.isDefault).toBe(true);
    expect(zman.footnote).toBeNull();
    expect(zman.date).toBeInstanceOf(Date);
  });

  it("maps footnotes to zmanim", () => {
    const raw: ZmanimApiResponse = {
      Footnotes: { SomeFootnote: "This is a footnote." },
      FootnoteOrder: ["SomeFootnote"],
      Days: [
        {
          TimeGroups: [
            {
              Title: "Candle Lighting",
              ZmanType: "CandleLighting",
              FootnoteType: "SomeFootnote",
              HebrewTitle: "הדלקת נרות",
              Order: 1,
              EssentialZmanType: "CandleLighting",
              EssentialTitle: "Candle Lighting",
              Items: [
                {
                  EssentialZmanType: "CandleLighting",
                  Order: 1,
                  Title: "Candle Lighting",
                  FootnoteType: "SomeFootnote",
                  EssentialTitle: "Candle Lighting",
                  Link: "",
                  OpinionInformation: null,
                  OpinionDescription: null,
                  TechnicalInformation: null,
                  ZmanType: "CandleLighting",
                  Zman: "6:46 PM",
                  Date: "/Date(1710453840000)/",
                  InfoMessageIndex: 0,
                  InfoMessage: null,
                  Default: true,
                },
              ],
              InfoMessageIndex: 0,
              InfoMessage: null,
            },
          ],
          Parsha: null,
          HolidayName: null,
          IsHoliday: false,
          DisplayDate: "March 14, 2025",
          DayOfWeek: 5,
          IsDstActive: true,
          IsDayOfDstChange: false,
          GmtDate: "/Date(1710374400000)/",
        },
      ],
      GroupHeadings: [],
      IsNewLocation: false,
      IsDefaultLocation: false,
      LocationName: "Test",
      City: "Test",
      Coordinates: { Latitude: 0, Longitude: 0 },
      LocationDetails: "",
      EndDate: "",
      GmtStartDate: "",
      GmtEndDate: "",
      IsAdvanced: false,
      PageTitle: "",
      LocationId: "0",
    };

    const result = parseResponse(raw);
    expect(result.days[0].zmanim[0].footnote).toBe("This is a footnote.");
  });
});
