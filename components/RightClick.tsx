"use client"; // Enable client-side rendering

import React, { useEffect } from "react";

const RightClickHandler = ({ children }: { children: React.ReactNode }) => {
  // Function to handle right-click
  const handleRightClick = (event: MouseEvent) => {
    event.preventDefault(); // Prevent the default context menu from appearing
  };

  useEffect(() => {
    // Attach the right-click handler to the document
    document.addEventListener("contextmenu", handleRightClick);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);

  return <>{children}</>; // Render children components
};

export default RightClickHandler;
