import { describe, it, expect } from "vitest";
import {
  getTime,
  hasCandleLighting,
  hasShabbosEnds,
  getSpecialZmanim,
} from "../src/index.js";
import type { ParsedDay } from "../src/index.js";

function makeMockDay(
  times: Record<string, string>,
  zmanim: Array<{ type: string; title: string; time: string }> = [],
): ParsedDay {
  return {
    date: new Date("2025-03-14"),
    displayDate: "March 14, 2025",
    dayOfWeek: 5,
    parsha: "Vayikra",
    holidayName: null,
    isHoliday: false,
    isDstActive: true,
    times,
    zmanim: zmanim.map((z) => ({
      type: z.type,
      title: z.title,
      hebrewTitle: "",
      time: z.time,
      date: null,
      isDefault: true,
      footnote: null,
    })),
  };
}

describe("getTime", () => {
  it("returns the time for an existing zman type", () => {
    const day = makeMockDay({ Shkiah: "7:04 PM", Chatzos: "12:45 PM" });
    expect(getTime(day, "Shkiah")).toBe("7:04 PM");
    expect(getTime(day, "Chatzos")).toBe("12:45 PM");
  });

  it("returns undefined for a missing zman type", () => {
    const day = makeMockDay({ Shkiah: "7:04 PM" });
    expect(getTime(day, "CandleLighting")).toBeUndefined();
  });
});

describe("hasCandleLighting", () => {
  it("returns true when CandleLighting is present", () => {
    const day = makeMockDay({ CandleLighting: "6:46 PM" });
    expect(hasCandleLighting(day)).toBe(true);
  });

  it("returns false when CandleLighting is absent", () => {
    const day = makeMockDay({ Shkiah: "7:04 PM" });
    expect(hasCandleLighting(day)).toBe(false);
  });
});

describe("hasShabbosEnds", () => {
  it("returns true when ShabbosEnds is present", () => {
    const day = makeMockDay({ ShabbosEnds: "7:55 PM" });
    expect(hasShabbosEnds(day)).toBe(true);
  });

  it("returns false when ShabbosEnds is absent", () => {
    const day = makeMockDay({});
    expect(hasShabbosEnds(day)).toBe(false);
  });
});

describe("getSpecialZmanim", () => {
  it("filters out non-special zmanim", () => {
    const day = makeMockDay(
      {
        Shkiah: "7:04 PM",
        CandleLighting: "6:46 PM",
        Chatzos: "12:45 PM",
      },
      [
        { type: "Shkiah", title: "Sunset", time: "7:04 PM" },
        { type: "CandleLighting", title: "Candle Lighting", time: "6:46 PM" },
        { type: "Chatzos", title: "Midday", time: "12:45 PM" },
      ],
    );

    const special = getSpecialZmanim(day);
    expect(special).toHaveLength(1);
    expect(special[0].type).toBe("CandleLighting");
  });

  it("returns empty array when no special zmanim exist", () => {
    const day = makeMockDay(
      { Shkiah: "7:04 PM" },
      [{ type: "Shkiah", title: "Sunset", time: "7:04 PM" }],
    );
    expect(getSpecialZmanim(day)).toHaveLength(0);
  });

  it("returns multiple special zmanim", () => {
    const day = makeMockDay(
      {
        CandleLighting: "6:46 PM",
        ShabbosEnds: "7:55 PM",
        LastEatingChametzTime: "10:30 AM",
        BurnChametzTime: "11:30 AM",
      },
      [
        { type: "CandleLighting", title: "Candle Lighting", time: "6:46 PM" },
        { type: "ShabbosEnds", title: "Shabbos Ends", time: "7:55 PM" },
        {
          type: "LastEatingChametzTime",
          title: "Last Eating Chametz",
          time: "10:30 AM",
        },
        { type: "BurnChametzTime", title: "Burn Chametz", time: "11:30 AM" },
      ],
    );

    const special = getSpecialZmanim(day);
    expect(special).toHaveLength(4);
  });
});
