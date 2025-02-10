"use client";

import { createContext, useContext, useState } from "react";

interface PageHeadingContextType {
  heading: string;
  setHeading: (heading: string) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const PageHeadingContext = createContext<PageHeadingContextType | undefined>(
  undefined
);

export const PageHeadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [heading, setHeading] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  return (
    <PageHeadingContext.Provider
      value={{ heading, setHeading, isVisible, setIsVisible }}
    >
      {children}
    </PageHeadingContext.Provider>
  );
};

export const usePageHeading = () => {
  const context = useContext(PageHeadingContext);
  if (!context)
    throw new Error("usePageHeading must be used within a PageHeadingProvider");
  return context;
};
