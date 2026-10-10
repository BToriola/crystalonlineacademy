export const BRAND_THEME_STORAGE_KEY = "coa-brand-theme";

export const brandThemes = [
  { value: "crystal", label: "Crystal", swatch: ["#425fea", "#ff5167", "#0b3b2e"] },
  { value: "meadow", label: "Meadow", swatch: ["#13856b", "#ff7a45", "#0d2f3f"] },
  { value: "berry", label: "Berry", swatch: ["#7c3aed", "#ec4899", "#1e1b4b"] },
  { value: "ocean", label: "Ocean", swatch: ["#0284c7", "#f97316", "#0c4a6e"] },
] as const;

export type BrandTheme = (typeof brandThemes)[number]["value"];
