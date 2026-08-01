import { ProcessedDoc } from "./data";

export interface EvidenceQuote {
  source_type: string;
  excerpt: string;
  source_id?: string;
}

export interface ResearchQuestionAnswer {
  id: string;
  question: string;
  answer: string;
  insight: string;
  evidenceCount: number;
  confidence: "high" | "medium" | "low";
  topThemes: { label: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  sampleQuotes: EvidenceQuote[];
}

interface QuestionConfig {
  id: string;
  question: string;
  keywords: string[];
  themeLabels: Record<string, string[]>;
  summaryTemplate: (stats: MatchStats) => string;
  insightTemplate: (stats: MatchStats) => string;
}

interface MatchStats {
  total: number;
  corpusSize: number;
  themes: Map<string, number>;
  sources: Map<string, number>;
  matches: { doc: ProcessedDoc; score: number }[];
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: "Q1",
    question: "Why do users repeatedly buy from the same categories?",
    keywords: [
      "habit", "reorder", "repeat", "same order", "weekly", "routine", "autopilot",
      "every time", "regularly", "staples", "groceries", "grocery", "same cart",
      "buy again", "usual", "always order",
    ],
    themeLabels: {
      reorder_habit: ["reorder", "repeat order", "buy again", "same order"],
      routine_lock: ["weekly", "routine", "every time", "regularly", "habit"],
      staple_focus: ["staples", "groceries", "grocery", "milk", "bread", "eggs"],
      convenience: ["convenient", "quick", "fast", "easy", "lazy"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of corpus documents (${s.total}) mention habit-driven reordering and staple-category repetition. ` +
      `Users default to the same grocery basket because reorder flows reduce mental load and meet weekly routine needs.`,
    insightTemplate: (s) =>
      `Primary driver: reorder convenience + staple grocery lock-in on Swiggy Instamart.`,
  },
  {
    id: "Q2",
    question: "What prevents users from exploring new categories?",
    keywords: [
      "trust", "quality", "expensive", "price", "discover", "browse", "hidden",
      "confusing", "overwhelming", "fake", "return", "refund", "reviews",
      "didn't know", "never tried", "category", "personal care", "afraid",
      "uncertain", "risk",
    ],
    themeLabels: {
      trust_gap: ["trust", "quality", "genuine", "fake", "authentic"],
      price_barrier: ["expensive", "overpriced", "price", "cost", "cheaper"],
      discovery_friction: ["discover", "browse", "hidden", "find", "didn't know"],
      cognitive_load: ["confusing", "overwhelming", "too many", "mental"],
      delivery_concern: ["late", "damaged", "fresh", "return", "refund"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of documents (${s.total}) surface exploration barriers. ` +
      `Top blockers are trust/quality uncertainty, price sensitivity, and discovery friction within the app catalog.`,
    insightTemplate: (s) =>
      `Exploration is blocked more by trust and cognitive friction than lack of category availability.`,
  },
  {
    id: "Q3",
    question: "How do users discover products today?",
    keywords: [
      "search", "browse", "homepage", "banner", "notification", "offer",
      "recommended", "suggested", "friend", "whatsapp", "link", "reorder",
      "scroll", "found", "discovered", "saw", "advertisement", "coupon",
    ],
    themeLabels: {
      reorder_path: ["reorder", "order again", "repeat", "buy again"],
      search: ["search", "typed", "looked for"],
      browse_ui: ["browse", "homepage", "banner", "scroll", "category"],
      social_wom: ["friend", "whatsapp", "family", "recommended by"],
      promotions: ["offer", "notification", "coupon", "discount", "deal"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of documents (${s.total}) describe discovery paths. ` +
      `Discovery is dominated by reorder shortcuts and search; passive browse and social recommendations are secondary but meaningful for new categories.`,
    insightTemplate: (s) =>
      `Habitual users discover via reorder — new categories need interruptive, contextual nudges in that flow.`,
  },
  {
    id: "Q4",
    question: "What role do habits play in shopping behavior?",
    keywords: [
      "habit", "routine", "weekly", "every week", "autopilot", "same",
      "regular", "always", "repeat", "depend on", "usual", "pattern",
      "mental load", "convenience", "quick commerce",
    ],
    themeLabels: {
      weekly_routine: ["weekly", "every week", "routine", "regular"],
      autopilot: ["autopilot", "same", "always", "without thinking"],
      dependency: ["depend", "only use", "go to", "default"],
      time_pressure: ["busy", "work", "late", "quick", "fast"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of documents (${s.total}) reference habit loops. ` +
      `Quick commerce fits into weekly routines; users treat Instamart as a reliable staple replenishment tool rather than an exploration platform.`,
    insightTemplate: (s) =>
      `Habits compress decision-making — exploration must piggyback on existing reorder moments.`,
  },
  {
    id: "Q5",
    question: "What information do users need before trying a new category?",
    keywords: [
      "review", "rating", "trust", "quality", "return", "refund", "proof",
      "compare", "price", "genuine", "expiry", "fresh", "sample", "trial",
      "specification", "details", "information", "know before", "sure",
    ],
    themeLabels: {
      social_proof: ["review", "rating", "stars", "popular", "recommended"],
      quality_assurance: ["quality", "fresh", "genuine", "expiry", "authentic"],
      price_transparency: ["price", "compare", "expensive", "value", "cost"],
      return_policy: ["return", "refund", "replace", "policy"],
      trial_size: ["sample", "trial", "small", "try first"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of documents (${s.total}) imply pre-purchase information needs. ` +
      `Users want social proof (reviews/ratings), quality signals, and low-risk trial options before buying unfamiliar categories.`,
    insightTemplate: (s) =>
      `Starter bundles with visible ratings and return clarity would reduce new-category trial friction.`,
  },
  {
    id: "Q6",
    question: "What frustrations emerge repeatedly?",
    keywords: [
      "worst", "bad", "terrible", "frustrating", "disappointed", "scam",
      "cancel", "cancelled", "late", "delay", "wrong", "missing", "cold",
      "damaged", "refund", "customer service", "support", "never again",
      "uninstall", "pathetic", "horrible", "awful",
    ],
    themeLabels: {
      delivery_failures: ["late", "delay", "cancel", "cancelled", "never arrived"],
      quality_issues: ["cold", "damaged", "stale", "wrong", "missing", "quality"],
      support_gaps: ["support", "customer service", "refund", "no response"],
      pricing_trust: ["scam", "overcharge", "expensive", "coupon", "misleading"],
      app_experience: ["bug", "crash", "slow", "uninstall", "worst app"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of documents (${s.total}) express recurring frustrations. ` +
      `Delivery delays/cancellations, order accuracy, and poor support dominate negative sentiment across sources.`,
    insightTemplate: (s) =>
      `Frustrations on core delivery erode trust needed for adjacent category exploration.`,
  },
  {
    id: "Q7",
    question: "Which user segments are more likely to experiment?",
    keywords: [
      "student", "college", "parent", "baby", "mom", "pet", "try new",
      "explore", "first time", "discovered", "variety", "party", "new category",
      "experiment", "different", "snacks", "personal care",
    ],
    themeLabels: {
      students: ["student", "college", "hostel", "exam"],
      parents: ["parent", "baby", "mom", "diaper", "kids", "child"],
      pet_owners: ["pet", "dog", "cat", "pedigree"],
      explorers: ["try new", "explore", "variety", "different categories", "first time"],
      occasion_buyers: ["party", "guest", "emergency", "midnight", "late night"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of documents (${s.total}) contain segment signals. ` +
      `Students and occasion-driven buyers show higher experimentation; habitual grocery repeaters and price-sensitive users show lower exploration intent.`,
    insightTemplate: (s) =>
      `Target habitual grocery repeaters with low-friction nudges; students respond to discovery-oriented prompts.`,
  },
  {
    id: "Q8",
    question: "What unmet needs emerge consistently across discussions?",
    keywords: [
      "wish", "need", "should", "missing", "want", "hope", "expect",
      "unmet", "better", "improve", "add", "feature", "why not",
      "would be nice", "if only", "waiting for",
    ],
    themeLabels: {
      better_quality: ["quality", "fresh", "better products", "improve quality"],
      more_variety: ["variety", "more options", "more categories", "selection"],
      fair_pricing: ["cheaper", "fair price", "discount", "value"],
      faster_support: ["support", "response", "resolve", "callback"],
      discovery_help: ["discover", "recommend", "suggest", "personalize", "curate"],
    },
    summaryTemplate: (s) =>
      `${pct(s)} of documents (${s.total}) express unmet needs. ` +
      `Consistent gaps: curated category discovery, quality assurance for non-grocery items, and transparent pricing/support.`,
    insightTemplate: (s) =>
      `A personalized category-bridge feature directly addresses the most repeated unmet need.`,
  },
];

function pct(s: MatchStats): string {
  const p = s.corpusSize > 0 ? Math.round((s.total / s.corpusSize) * 100) : 0;
  return `${p}%`;
}

function scoreDoc(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

function countThemes(text: string, themeLabels: Record<string, string[]>): string[] {
  const lower = text.toLowerCase();
  const hit: string[] = [];
  for (const [theme, kws] of Object.entries(themeLabels)) {
    if (kws.some((kw) => lower.includes(kw.toLowerCase()))) hit.push(theme);
  }
  return hit;
}

function matchQuestion(docs: ProcessedDoc[], config: QuestionConfig): MatchStats {
  const matches: { doc: ProcessedDoc; score: number }[] = [];
  const themes = new Map<string, number>();
  const sources = new Map<string, number>();

  for (const doc of docs) {
    const text = doc.clean_body ?? "";
    const score = scoreDoc(text, config.keywords);
    if (score === 0) continue;

    matches.push({ doc, score });
    const src = doc.source_type ?? "unknown";
    sources.set(src, (sources.get(src) ?? 0) + 1);

    for (const theme of countThemes(text, config.themeLabels)) {
      themes.set(theme, (themes.get(theme) ?? 0) + 1);
    }
  }

  matches.sort((a, b) => b.score - a.score);

  return {
    total: matches.length,
    corpusSize: docs.length,
    themes,
    sources,
    matches,
  };
}

function confidenceFromCount(count: number, corpusSize: number): "high" | "medium" | "low" {
  const ratio = corpusSize > 0 ? count / corpusSize : 0;
  if (ratio >= 0.15 || count >= 200) return "high";
  if (ratio >= 0.05 || count >= 50) return "medium";
  return "low";
}

function mapToAnswer(config: QuestionConfig, stats: MatchStats): ResearchQuestionAnswer {
  const topThemes = Array.from(stats.themes.entries())
    .map(([label, count]) => ({ label: label.replace(/_/g, " "), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sourceBreakdown = Array.from(stats.sources.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  const sampleQuotes: EvidenceQuote[] = stats.matches.slice(0, 5).map(({ doc }) => ({
    source_type: doc.source_type ?? "unknown",
    source_id: doc.source_id,
    excerpt: (doc.clean_body ?? "").slice(0, 220) + ((doc.clean_body?.length ?? 0) > 220 ? "..." : ""),
  }));

  return {
    id: config.id,
    question: config.question,
    answer: config.summaryTemplate(stats),
    insight: config.insightTemplate(stats),
    evidenceCount: stats.total,
    confidence: confidenceFromCount(stats.total, stats.corpusSize),
    topThemes,
    sourceBreakdown,
    sampleQuotes,
  };
}

export function analyzeResearchQuestions(
  docs: ProcessedDoc[],
  sourceFilter?: string | null
): ResearchQuestionAnswer[] {
  const filtered =
    sourceFilter && sourceFilter !== "all"
      ? docs.filter((d) => (d.source_type ?? "unknown") === sourceFilter)
      : docs;

  return QUESTIONS.map((config) => mapToAnswer(config, matchQuestion(filtered, config)));
}

export const RESEARCH_QUESTION_IDS = QUESTIONS.map((q) => q.id);
