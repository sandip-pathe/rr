import { Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

export const getLastSeenText = (lastSeen?: Timestamp | Date | null): string => {
  if (!lastSeen) return "Offline";

  let date: Date;

  if (lastSeen instanceof Timestamp) {
    date = lastSeen.toDate();
  } else if (lastSeen instanceof Date) {
    date = lastSeen;
  } else {
    return "Offline";
  }

  try {
    return `${formatDistanceToNow(date, { addSuffix: true })}`;
  } catch (e) {
    console.error("Invalid lastSeen value:", e);
    return "Offline";
  }
};
