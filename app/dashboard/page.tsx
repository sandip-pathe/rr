"use client";

import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import NotificationPanel from "./activity/NotificationPanel";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;
  return (
    <Layout>
      <NotificationPanel />
    </Layout>
  );
};

export default Dashboard;
