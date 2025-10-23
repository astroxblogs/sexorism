// client/app/lib/categories.ts
export const CATEGORY_MAP: Record<string, string> = {
  "technology": "Technology",
  "fashion": "Fashion",
  "health-wellness": "Health & Wellness",
  "travel": "Travel",
  "food-cooking": "Food & Cooking",
  "sports": "Sports",
  "business-finance": "Business & Finance",
  "lifestyle": "Lifestyle",
  "trends": "Trends",
  "relationship": "Relationship",
  "astrology": "Astrology",
  "vastu-shastra": "Vastu Shastra",
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_MAP);

export const isCategorySlug = (s?: string | null) =>
  !!s && CATEGORY_SLUGS.includes(s);
