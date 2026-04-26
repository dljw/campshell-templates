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
  "clockworks/free-tiktok-scraper": {
    id: "clockworks/free-tiktok-scraper",
    displayName: "Clockworks Free TikTok Scraper",
    consoleUrl: "https://apify.com/clockworks/free-tiktok-scraper",
    pricingModel: "Free actor — pay only for Apify compute units",
    pricingNote:
      "Marked as free on Apify, so you're billed for the underlying compute units (CUs) the actor consumes. Long runs or large limits use more CUs.",
    pricingPageUrl: "https://apify.com/clockworks/free-tiktok-scraper#pricing",
  },
};
