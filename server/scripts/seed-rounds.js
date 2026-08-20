import fs from "fs";
import { fileURLToPath } from "url";
import { pool, initDb, query } from "../src/db.js";
import { deriveValidWords, buildLetterCounts } from "../src/rounds.js";

const SOURCE_WORD_POOL = [
  "BLOCKCHAIN", "REMITTANCE", "COMMUNITY", "STABLECOIN", "EDUCATION",
  "PLATFORM", "MIGRATION", "TREASURY", "CREATION", "LANGUAGE",
  "MOTIVATION", "FOUNDATION", "GENERATION", "ORCHESTRA", "BROADCAST",
  "DISCOVERY", "ENGINEER", "FINANCIAL", "HARDWARE", "INDUSTRY",
  "JOURNAL", "KEYSTONE", "LIBRARY", "MONUMENT", "NETWORK",
  "OPENING", "PASSWORD", "QUESTION", "RESOURCE", "SOLUTION",
  "TOGETHER", "UNIVERSE", "VOLUNTEER", "WELCOME", "ACCIDENT",
  "BUILDING", "CUSTOMER", "DAUGHTER", "ELSEWHERE", "FAMILIAR",
  "GOVERNOR", "HERSELF", "IMAGINE", "JUSTICE", "KNOWLEDGE",
  "LITERARY", "MATERIAL", "NECESSARY", "OBSERVER", "PARTNER",
  "RECEIVER", "STRANGER", "TRAINING", "VICTORY", "YOURSELF",
  "ALGORITHM", "BEAUTIFUL", "COLLEGE", "DANGEROUS", "EXERCISE",
  "FREQUENT", "GRADUATE", "HORIZON", "INITIATE", "JUNCTION",
  "LANDMARK", "MILESTONE", "NOURISH", "OVERFLOW", "PHYSICAL",
  "QUARTER", "RESTRICT", "SURVIVAL", "THEATRE", "VAMPIRE",
  "WATERFALL", "YIELDING", "ZEBRA", "AMAZON", "BALLOON",
  "CANDY", "DINOSAUR", "ELEPHANT", "FIREPLACE", "GALAXY",
  "HURRICANE", "ISLAND", "JUNGLE", "KITCHEN", "LEMONADE",
  "MUSHROOM", "NEIGHBOR", "OPERA", "PENGUIN", "RAINBOW",
  "SANDWICH", "TEMPLE", "UMBRELLA", "VEGETABLE", "WHISPER",
  "XENON", "YOGURT", "ZENITH", "BACKPACK", "CHECKPOINT",
  "DECORATE", "EVERYONE", "FANTASY", "GATEWAY", "HARMONY",
  "INSOMNIA", "JEWELRY", "LIGHTNING"
];

const EASY_SOURCE_WORDS = [
  "COMMUNITY", "EDUCATION", "FOUNDATION", "GENERATION", "MIGRATION",
  "REMITTANCE", "SOLUTION", "TOGETHER", "VOLUNTEER", "YESTERDAY",
  "CELEBRATION", "UNDERSTAND", "BEAUTIFUL", "EXPERIENCE", "GOVERNMENT",
  "DIFFERENCE", "INFORMATION", "DEVELOPMENT", "ENVIRONMENT", "ASSOCIATION",
  "ORGANIZATION", "PARTICULAR", "EVERYTHING", "BACKGROUND", "TECHNOLOGY",
  "MANAGEMENT", "CONSTRUCTION", "REVOLUTION", "COMMUNICATION", "TRANSPORTATION"
];

const MEDIUM_SOURCE_WORDS = [
  "ALGORITHM", "MILESTONE", "LANDMARK", "ORCHESTRA", "BROADCAST",
  "TREASURY", "HORIZON", "FREQUENT", "JOURNAL", "KEYSTONE",
  "MONUMENT", "NETWORK", "PASSWORD", "QUESTION", "DATABASE",
  "FEEDBACK", "SECURITY", "CREATIVE", "CAMPAIGN", "DOCUMENT",
  "FRIENDLY", "STRUGGLE", "CONTRACT", "PROJECTS", "ABSOLUTE",
  "CAPACITY", "CRITICAL", "DELIVERY", "EMPHASIS", "FORECAST"
];

const HARD_SOURCE_WORDS = [
  "MAXIMIZE", "ADJUDGED", "PUZZLING", "CHUTZPAH", "MEZZANINE",
  "ACQUIRE", "ACQUITS", "ADEQUACY", "ADJUNCT", "BEQUEATH",
  "JACQUARD", "JONQUIL", "WIZARDRY", "XENOPHON", "SPHINX",
  "COGNIZANT", "BLIZZARD", "FLUMMOXED", "SKEPTIC", "CACOPHONY",
  "GARRULOUS", "EQUINOXES", "HAZARDOUS", "JEOPARDY", "JUXTAPOSE"
];

async function seed() {
  console.log("Initializing database...");
  await initDb();

  console.log("Analyzing word lists...");
  const wordsToSeed = new Set();
  
  const addWords = (list) => {
    for (const w of list) {
      if (w && typeof w === "string") {
        wordsToSeed.add(w.trim().toUpperCase());
      }
    }
  };

  addWords(SOURCE_WORD_POOL);
  addWords(EASY_SOURCE_WORDS);
  addWords(MEDIUM_SOURCE_WORDS);
  addWords(HARD_SOURCE_WORDS);

  const wordList = Array.from(wordsToSeed);
  console.log(`Found ${wordList.length} unique source words to precalculate.`);

  let insertedCount = 0;
  for (const sourceWord of wordList) {
    let difficulty = "medium";
    if (EASY_SOURCE_WORDS.includes(sourceWord)) {
      difficulty = "easy";
    } else if (HARD_SOURCE_WORDS.includes(sourceWord)) {
      difficulty = "hard";
    }

    try {
      const validWords = deriveValidWords(sourceWord);
      
      if (validWords.length >= 10) {
        await query(
          `INSERT INTO precalculated_rounds (source_word, difficulty, valid_words)
           VALUES ($1, $2, $3)
           ON CONFLICT (source_word) DO UPDATE
           SET difficulty = EXCLUDED.difficulty, valid_words = EXCLUDED.valid_words`,
          [sourceWord, difficulty, validWords]
        );
        insertedCount++;
        if (insertedCount % 20 === 0) {
          console.log(`Precalculated and seeded ${insertedCount}/${wordList.length} rounds...`);
        }
      } else {
        console.warn(`Skipping ${sourceWord} - only generated ${validWords.length} valid words.`);
      }
    } catch (err) {
      console.error(`Failed to precalculate ${sourceWord}: ${err.message}`);
    }
  }

  console.log(`Seeding complete. Successfully stored ${insertedCount} rounds in the database.`);
  await pool.end();
}

seed().catch(err => {
  console.error("Critical error in seeding script:", err);
  pool.end();
});
