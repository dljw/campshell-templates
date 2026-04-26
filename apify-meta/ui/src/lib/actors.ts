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
  "apify/facebook-pages-scraper": {
    id: "apify/facebook-pages-scraper",
    displayName: "Apify Facebook Pages Scraper",
    consoleUrl: "https://apify.com/apify/facebook-pages-scraper",
    pricingModel: "Pay-per-result",
    pricingNote: "Each page scraped counts as one billable item.",
    pricingPageUrl: "https://apify.com/apify/facebook-pages-scraper#pricing",
  },
  "apify/facebook-posts-scraper": {
    id: "apify/facebook-posts-scraper",
    displayName: "Apify Facebook Posts Scraper",
    consoleUrl: "https://apify.com/apify/facebook-posts-scraper",
    pricingModel: "Pay-per-result",
    pricingNote: "Each post returned counts as one billable item.",
    pricingPageUrl: "https://apify.com/apify/facebook-posts-scraper#pricing",
  },
};
