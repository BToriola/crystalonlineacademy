export const sessionRanges = [
  { value: "this", label: "This week" },
  { value: "next", label: "Next week" },
  { value: "past", label: "Past 30 days" },
  { value: "all", label: "All" },
] as const;

export type MatchOption = {
  id: string;
  label: string;
  subject: string;
  tutorName: string;
  tutorTimezone: string;
  familyTimezone: string;
};
