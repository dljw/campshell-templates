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
  "apify/instagram-scraper": {
    id: "apify/instagram-scraper",
    displayName: "Apify Instagram Scraper",
    consoleUrl: "https://apify.com/apify/instagram-scraper",
    pricingModel: "Pay-per-result",
    pricingNote:
      "Each profile, post, or hashtag result counts as one billable item. A free trial usage tier is included with every Apify account.",
    pricingPageUrl: "https://apify.com/apify/instagram-scraper#pricing",
  },
};
