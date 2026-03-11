// Blocked search terms - matches whole words (case-insensitive)
const BLOCKED_TERMS = [
  // Explicit/adult content
  "porn", "pornstar", "pornography", "xxx", "hentai", "onlyfans",
  "nude", "nudes", "naked", "nsfw", "sex video", "sex tape",
  "erotic", "stripper", "escort", "camgirl", "adult video",
  "brazzers", "xvideos", "pornhub", "xhamster", "xnxx", "redtube",

  // Substance abuse
  "drug dealer", "how to make drugs", "buy drugs", "cocaine",
  "heroin", "meth", "methamphetamine", "crack cocaine", "fentanyl",
  "drunk", "drunker", "get drunk", "binge drinking",

  // Violence / weapons / illegal
  "how to hack", "hack someone", "ddos", "exploit vulnerability",
  "make bomb", "build bomb", "weapon", "gun tutorial",
  "how to steal", "credit card fraud", "identity theft",
  "murder", "kill someone", "hitman", "assassin",
  "child abuse", "child exploitation",
  "terrorism", "terrorist", "isis",
  "piracy tutorial", "crack software", "keygen",

  // Gambling / scams
  "online gambling hack", "casino cheat", "scam tutorial",
  "phishing", "money laundering",
];

// Build a single regex from all blocked terms (word-boundary matching)
const blockedRegex = new RegExp(
  BLOCKED_TERMS.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

export function isBlockedQuery(query: string): boolean {
  return blockedRegex.test(query);
}

export const BLOCKED_MESSAGE =
  "This search contains restricted content. Please search for educational or programming topics.";
