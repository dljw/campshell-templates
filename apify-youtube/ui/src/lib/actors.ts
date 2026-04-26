// Static metadata about the Apify actor(s) this template wraps.
// Pricing model is stable; specific dollar rates change — link out for live rates.

export interface ActorInfo {
  id: string;
  displayName: string;
  consoleUrl: string;
  pricingModel: string;
  pricingNote: string;
  pricingPageUrl: string;
}

export const ACTORS: Record<string, ActorInfo> = {
  "streamers/youtube-scraper": {
    id: "streamers/youtube-scraper",
    displayName: "Streamers YouTube Scraper",
    consoleUrl: "https://apify.com/streamers/youtube-scraper",
    pricingModel: "Pay-per-result",
    pricingNote:
      "Each video, channel, or search result counts as one billable item. Includes a free trial usage tier on Apify.",
    pricingPageUrl: "https://apify.com/streamers/youtube-scraper#pricing",
  },
};
