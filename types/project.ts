export interface Project {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  createdAt: string;
  admins: string[];
  members: string[];
  adminDetails: Record<string, string>;
  memberDetails: Record<string, string>;
  description: string;
  category: string;
  isPublic: boolean;
  likes: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userDetails: {
    name: string;
    photoURL?: string;
  };
  text: string;
  createdAt: string;
  isPublic: boolean;
}
