"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";

// Dynamically import List to only render on the client-side
const List = dynamic(() => import("./List"), { ssr: false });

// Loading fallback UI
const Loading = () => <div>Loading...</div>;

export default function BoardPage({ modal }: { modal: React.ReactNode }) {
  const [modalId, setModalId] = useState<string | null>(null);

  // Ensure the code only runs on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setModalId(searchParams.get("modalId"));
    }
  }, []); // Empty dependency array ensures it runs only on client-side mount

  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <List />
        {modalId && modal}
      </Suspense>
    </Layout>
  );
}
