import { Timestamp } from "firebase/firestore";

export type NotificationType = "message" | "project" | "task" | "community";

export interface Notification {
  id: string;
  userId: string;
  message: string;
  referenceId: string;
  type: NotificationType;
  link: string;
  isRead: boolean;
  createdAt: Timestamp;
}
