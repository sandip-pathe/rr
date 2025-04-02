"use client";

import React from "react";
import NotificationTester from "./test";

const DefaultPage = () => {
  return (
    <div className="h-full flex justify-center items-center">
      <p className="text-gray-500 text-xl">
        Select a conversation to start chatting
      </p>
      <NotificationTester />
    </div>
  );
};

export default DefaultPage;
