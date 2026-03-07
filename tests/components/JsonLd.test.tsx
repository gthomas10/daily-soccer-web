// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import JsonLd from "@/components/JsonLd";

afterEach(cleanup);

describe("JsonLd", () => {
  it("renders a script tag with application/ld+json type", () => {
    const data = { "@context": "https://schema.org", "@type": "Thing" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(script).not.toBeNull();
  });

  it("renders valid JSON content", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "PodcastSeries",
      name: "Test Podcast",
      url: "https://example.com",
    };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const parsed = JSON.parse(script!.textContent!);
    expect(parsed["@type"]).toBe("PodcastSeries");
    expect(parsed.name).toBe("Test Podcast");
    expect(parsed.url).toBe("https://example.com");
  });

  it("escapes HTML-significant characters to prevent XSS", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: '</script><script>alert("xss")</script>',
    };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(script!.textContent).not.toContain("</script>");
    expect(script!.textContent).toContain("\\u003c");
    const parsed = JSON.parse(
      script!.textContent!.replace(/\\u003c/g, "<")
    );
    expect(parsed.name).toBe('</script><script>alert("xss")</script>');
  });

  it("renders PodcastEpisode schema correctly", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "PodcastEpisode",
      name: "Episode 1",
      description: "First episode",
      datePublished: "2026-03-01",
      timeRequired: "PT45M30S",
      associatedMedia: {
        "@type": "MediaObject",
        contentUrl: "https://example.com/audio.mp3",
      },
      partOfSeries: {
        "@type": "PodcastSeries",
        name: "Test Podcast",
        url: "https://example.com",
      },
    };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const parsed = JSON.parse(script!.textContent!);
    expect(parsed["@type"]).toBe("PodcastEpisode");
    expect(parsed.associatedMedia["@type"]).toBe("MediaObject");
    expect(parsed.partOfSeries["@type"]).toBe("PodcastSeries");
  });
});
