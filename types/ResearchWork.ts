// types.ts (new file)
export interface ResearchItem {
  id: string;
  title: string;
  type: string;
  date: string;
  reads?: number;
  citations?: number;
  authors?: Author[];
  doi?: string;
  adminDetails?: Record<string, string>;
  memberDetails?: Record<string, string>;
  description: string;
  publishedIn?: string;
  publisher?: string;
  location?: string;
  edition?: string;
  futureScope?: string;
  status?: string;
  category?: string;
  isProject?: boolean;
}

export interface Author {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
}
