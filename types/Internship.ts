// types/internship.ts
export interface Internship {
  id: string; // Firestore document ID
  title: string;
  type: InternshipType;
  department?: string; // Optional for university research
  professor?: string;
  superviser?: string; // Optional for university research
  company?: string; // Optional for corporate/startup
  founders?: string; // Optional for student venture
  organization?: string; // Optional for government fellowship
  location?: string;
  duration: string;
  workload?: string; // e.g., "Full-time", "Part-time", "Remote"
  compensationType: string; // e.g., "Paid", "Unpaid", "Stipend"
  compensation?: string; // Optional for unpaid internships
  deadline: string;
  description: string;
  requirements: string;
  skills: string[];
  responseType?: string; // e.g., "Email", "Google Form", "LinkedIn"
  createdAt: Date; // For sorting
  createdBy?: string;
  createdId: string; // User ID who created the internship
  contactEmail?: string; // Email for application
  applyLink?: string; // Optional link for application
  status: "open" | "closed"; // Status of the internship
}

export type InternshipType =
  | "university"
  | "startup"
  | "corporate"
  | "government"
  | "other";

export const getInternshipTypeDisplay = (type: InternshipType): string => {
  switch (type) {
    case "university":
      return "University Research";
    case "startup":
      return "Student Startup";
    case "corporate":
      return "Corporate Partnership";
    case "government":
      return "Government Program";
    case "other":
      return "Other";
    default:
      return type;
  }
};
