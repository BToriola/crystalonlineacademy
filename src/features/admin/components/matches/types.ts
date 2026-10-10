export type StudentOption = { id: string; name: string; yearGroup: string; seed: string; familyTimezone?: string };
export type TutorOption = {
  id: string;
  name: string;
  subjects: string[];
  activeStudents: number;
  rating: number;
  isFounder: boolean;
  seed: string;
};
