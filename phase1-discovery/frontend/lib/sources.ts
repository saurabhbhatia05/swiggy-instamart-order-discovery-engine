export const SOURCE_LABELS: Record<string, string> = {
  play_store: "Play Store",
  app_store: "App Store",
  reddit: "Reddit",
  qc_discussion: "QC Discussions",
  product_review: "Product Reviews",
  forums: "Forums",
  social: "Social",
  unknown: "Unknown",
};

export function formatSourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source.replace(/_/g, " ");
}

export const ALL_SOURCES = "all";
