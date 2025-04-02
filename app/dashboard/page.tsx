"use client";

import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import DefaultPage from "./activity/page";
import Spiner from "@/components/Spiner";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout>
        <Spiner />
      </Layout>
    );
  }
  return (
    <Layout>
      <DefaultPage />
    </Layout>
  );
};

export default Dashboard;
