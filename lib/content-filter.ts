// Blocked search terms for educational-only search scope.
// Terms are matched with word boundaries where possible.
const BLOCKED_TERMS = [
  // Explicit/adult content
  "porn", "pornstar", "pornography", "xxx", "hentai", "onlyfans",
  "nude", "nudes", "naked", "nsfw", "sex video", "sex tape",
  "sax video", "sax tape", "sax", "seggs", "seks",
  "erotic", "stripper", "escort", "camgirl", "adult video",
  "brazzers", "xvideos", "pornhub", "xhamster", "xnxx", "redtube",
  "masturbation", "mastrubation", "lgbt", "lgbtq", "gay", "lesbian",
  "sexual", "sexuality", "sex", "sexy", "fetish", "kink", "bdsm",
  "orgasm", "intimacy", "intimate", "seduction", "hookup", "one night stand",
  "dating sex", "nude model", "adult chat", "adult dating",
  "strip club", "cam site", "webcam sex", "phone sex",
  "boobs", "breast", "breasts", "breastfeed", "breastfeeding",
  "lingerie", "bikini try on", "nsfw art", "rule34", "r34",
  "anal", "oral sex", "blowjob", "handjob", "milf", "threesome",
  "incest", "voyeur", "only fans", "sex stories", "adult stories",
  "step brother", "step sister", "stepbrother", "stepsister",
  "stepbro", "stepsis", "step sibling", "step siblings",
  "brother sister", "brother and sister",
  "girl", "girls", "boy", "boys", "hot girl", "hot girls", "sexy girl", "sexy girls",
  "couple romance", "romantic video", "kiss", "kissing", "make out", "making out",

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

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Build a single regex from all blocked terms (case-insensitive).
// Use boundaries for word-like terms and plain containment for phrase-like terms.
const blockedRegex = new RegExp(
  BLOCKED_TERMS.map((term) => {
    const escaped = escapeRegex(term);
    return /^[a-z0-9 ]+$/i.test(term)
      ? `\\b${escaped.replace(/\\ /g, "\\s+")}\\b`
      : escaped;
  }).join("|"),
  "i"
);

// Normalize user input so simple obfuscations are still matched.
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PERSON_TERMS = [
  "girl", "girls", "boy", "boys", "woman", "women", "man", "men", "couple",
];

const SEXUAL_CONTEXT_TERMS = [
  "kiss", "kissing", "make out", "making out", "romance", "romantic",
  "nude", "naked", "without dress", "undress", "undressed", "sexy", "hot",
  "bedroom", "same room", "intimate", "intimacy",
];

// Educational-intent terms. If a query has one of these, it is considered related.
const EDUCATION_TERMS = [
  "learn", "learning", "tutorial", "course", "courses", "roadmap", "study", "studies",
  "lesson", "lessons", "class", "classes", "syllabus", "training", "guide", "explain",
  "how to", "beginner", "advanced", "basics", "interview", "practice", "project",
  "coding", "programming", "developer", "development", "software", "engineering",
  "python", "java", "javascript", "typescript", "react", "node", "nextjs", "sql",
  "data science", "machine learning", "ai", "ml", "devops", "blockchain", "c++", "c language",
  "math", "physics", "chemistry", "biology", "history", "geography", "economics",
];

// Terms often used for person/celebrity intent rather than educational goals.
const PERSON_INTENT_TERMS = [
  "biography", "bio", "age", "wife", "husband", "girlfriend", "boyfriend", "net worth",
  "height", "weight", "dating", "relationship", "personal life", "family", "children",
  "actor", "actress", "celebrity", "model", "singer", "influencer",
];

function includesAnyTerm(input: string, terms: string[]): boolean {
  return terms.some((term) => {
    const escaped = escapeRegex(term).replace(/\ /g, "\\s+");
    const re = new RegExp(`\\b${escaped}\\b`, "i");
    return re.test(input);
  });
}

function hasSexualContextPattern(input: string): boolean {
  const hasPerson = includesAnyTerm(input, PERSON_TERMS);
  const hasContext = includesAnyTerm(input, SEXUAL_CONTEXT_TERMS);
  return hasPerson && hasContext;
}

function hasEducationIntent(input: string): boolean {
  return includesAnyTerm(input, EDUCATION_TERMS);
}

function hasPersonIntent(input: string): boolean {
  return includesAnyTerm(input, PERSON_INTENT_TERMS);
}

function looksLikePersonNameQuery(input: string): boolean {
  // 1-3 plain words with no educational signal tends to be a person-name style query.
  if (hasEducationIntent(input)) {
    return false;
  }

  const plainWords = input
    .split(" ")
    .filter(Boolean)
    .every((w) => /^[a-z]+$/.test(w));

  const wordCount = input.split(" ").filter(Boolean).length;
  return plainWords && wordCount >= 1 && wordCount <= 3;
}

export function isBlockedQuery(query: string): boolean {
  const normalized = normalizeQuery(query);

  const unrelatedPersonIntent =
    (hasPersonIntent(query) || hasPersonIntent(normalized) || looksLikePersonNameQuery(normalized)) &&
    !hasEducationIntent(query) &&
    !hasEducationIntent(normalized);

  return (
    blockedRegex.test(query) ||
    blockedRegex.test(normalized) ||
    hasSexualContextPattern(query) ||
    hasSexualContextPattern(normalized) ||
    unrelatedPersonIntent
  );
}

export const BLOCKED_MESSAGE =
  "This search contains restricted content. Please search only educational or programming topics.";
