export const formatDate = (timestamp: any): string => {
    let date: Date;
    if (timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 10) return `${diffInDays} days ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
};
  
export const copyLinkToClipboard = async (link: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(link);
    // Optionally, display a toast or alert.
    alert("Link copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy link:", error);
  }
};
