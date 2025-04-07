import Layout from "@/components/Layout";
import { DiscoverTabs } from "../Tabs";

export default function RepositoriesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <DiscoverTabs />
        <div className="p-4">
          <h1 className="text-2xl font-bold">Open Projects Content</h1>
          <p>This is the repositories page content.</p>
        </div>
      </div>
    </Layout>
  );
}
