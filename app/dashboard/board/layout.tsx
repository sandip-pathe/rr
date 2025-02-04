"use client";

import { useSearchParams } from "next/navigation";
import React from "react";
import Modal from "@/components/Modal";

const BoardLayout = ({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const modalId = searchParams.get("modalId");

  return (
    <div>
      {children}
      {modalId && modal} {/* Render the modal content when modalId exists */}
    </div>
  );
};

export default BoardLayout;
