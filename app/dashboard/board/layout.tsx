"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

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
      {modalId && modal}
    </div>
  );
};

export default BoardLayout;
