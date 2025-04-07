import { redirect } from "next/navigation";

export default function DiscoverPage() {
  // Redirect to the first tab by default
  redirect("/dashboard/repo/repo");
}
