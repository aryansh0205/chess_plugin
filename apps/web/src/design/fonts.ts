/**
 * Font utilities for programmatic use (e.g. canvas, PDF).
 * Stacks also live as `--font-*` in `src/index.css` — keep them aligned.
 */
export const FONT_WEIGHT = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Values for Canvas `fontVariantNumeric`/`fontFeatureSettings` or raw CSS parsing. */
export const FONT_FEATURE = {
  tabularNums: "tnum" as const,
} as const;

export type FontWeightName = keyof typeof FONT_WEIGHT;
