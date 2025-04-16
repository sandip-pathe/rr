// types/internship.ts
export interface Internship {
  id: string; // Firestore document ID
  title: string;
  type: string;
  department?: string; // Optional for university research
  professor?: string; // Optional for university research
  company?: string; // Optional for corporate/startup
  founders?: string; // Optional for student venture
  organization?: string; // Optional for government fellowship
  location?: string;
  duration: string;
  compensationType: string; // e.g., "Paid", "Unpaid", "Stipend"
  compensation?: string; // Optional for unpaid internships
  equity?: string;
  deadline: string;
  description: string;
  requirements: string;
  skills: string[];
  createdAt: Date; // For sorting
  createdBy: string; // User ID who created the internship
  contactEmail: string; // Email for application
  applyLink?: string; // Optional link for application
  status: "open" | "closed"; // Status of the internship
}
