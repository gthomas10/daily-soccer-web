import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("allows all crawlers", () => {
    const result = robots();
    expect(result.rules).toBeDefined();

    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");
  });

  it("references sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toBe(
      "https://dailysoccerreport.com/sitemap.xml"
    );
  });
});
