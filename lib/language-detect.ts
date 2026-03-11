// Maps language keywords (including common typos/abbreviations) to their canonical name
const LANGUAGE_MAP: Record<string, string> = {
  // Indian languages
  tamil: "Tamil",
  tmail: "Tamil",
  tamli: "Tamil",
  taml: "Tamil",
  hindi: "Hindi",
  hndi: "Hindi",
  hidi: "Hindi",
  telugu: "Telugu",
  telgu: "Telugu",
  tlugu: "Telugu",
  malayalam: "Malayalam",
  malyalam: "Malayalam",
  malaylam: "Malayalam",
  kannada: "Kannada",
  kanada: "Kannada",
  kannad: "Kannada",
  bengali: "Bengali",
  bangla: "Bengali",
  bengla: "Bengali",
  marathi: "Marathi",
  marthi: "Marathi",
  gujarati: "Gujarati",
  gujrati: "Gujarati",
  punjabi: "Punjabi",
  panjabi: "Punjabi",
  odia: "Odia",
  oriya: "Odia",
  assamese: "Assamese",
  urdu: "Urdu",

  // International languages
  spanish: "Spanish",
  espanol: "Spanish",
  french: "French",
  francais: "French",
  german: "German",
  deutsch: "German",
  portuguese: "Portuguese",
  chinese: "Chinese",
  mandarin: "Chinese",
  japanese: "Japanese",
  korean: "Korean",
  russian: "Russian",
  arabic: "Arabic",
  turkish: "Turkish",
  italian: "Italian",
  dutch: "Dutch",
  thai: "Thai",
  vietnamese: "Vietnamese",
  indonesian: "Indonesian",
  malay: "Malay",
  persian: "Persian",
  farsi: "Persian",
  swedish: "Swedish",
  polish: "Polish",
  ukrainian: "Ukrainian",
  greek: "Greek",
  hebrew: "Hebrew",
  english: "English",
};

// Prepositions and filler words used before/after language names
const FILLER_WORDS = new Set(["in", "on", "with", "using", "language", "lang"]);

export interface LanguageDetectionResult {
  /** The cleaned topic without the language keyword */
  cleanTopic: string;
  /** The detected language, or null if none / English */
  language: string | null;
}

/**
 * Detects a spoken-language keyword in a search query.
 * Returns the cleaned topic and the detected language.
 * If no language or English is detected, language is null (default = English).
 */
export function detectLanguage(topic: string): LanguageDetectionResult {
  const words = topic.trim().split(/\s+/);
  let detectedLang: string | null = null;
  const indicesToRemove = new Set<number>();

  for (let i = 0; i < words.length; i++) {
    const lower = words[i].toLowerCase();
    const match = LANGUAGE_MAP[lower];
    if (match && match !== "English") {
      detectedLang = match;
      indicesToRemove.add(i);

      // Also remove adjacent filler words like "in" before the language keyword
      if (i > 0 && FILLER_WORDS.has(words[i - 1].toLowerCase())) {
        indicesToRemove.add(i - 1);
      }
      // Remove filler words after too (e.g., "tamil language")
      if (i < words.length - 1 && FILLER_WORDS.has(words[i + 1].toLowerCase())) {
        indicesToRemove.add(i + 1);
      }
      break; // Use the first language match
    }
  }

  const cleanWords = words.filter((_, idx) => !indicesToRemove.has(idx));
  const cleanTopic = cleanWords.join(" ").trim();

  return {
    cleanTopic: cleanTopic || topic.trim(),
    language: detectedLang,
  };
}
