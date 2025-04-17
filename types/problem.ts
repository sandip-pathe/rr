// types/problem.ts
export interface Problem {
  id: string;
  title: string;
  description: string;
  categories: string[];
  postedBy: string;
  postedByUserId: string;
  postedDate: string; // ISO date string
  interestCount: number;
  isTrending: boolean;
  isRecent: boolean;
  difficulty?: "beginner" | "intermediate" | "advanced";
  expectedOutcomes?: string;
  resources?: string[];
  deadline?: string; // Optional deadline for solutions
  contactEmail?: string; // Optional contact for more info
}

export interface ProblemFormData {
  title: string;
  description: string;
  categories: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  expectedOutcomes?: string;
  resources?: string[];
  deadline?: string;
  contactEmail?: string;
}
