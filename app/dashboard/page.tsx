import { ContextMenuDemo } from "@/components/tasks/ContextMenuExample";
import Layout from "../../components/Layout";
import List from "./board/List";
import NotificationPanel from "./activity/NotificationPanel";

const Dashboard = () => {
  return (
    <Layout>
      <NotificationPanel />
    </Layout>
  );
};

export default Dashboard;
