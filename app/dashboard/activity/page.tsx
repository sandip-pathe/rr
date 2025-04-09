"use client";

import React from "react";
import NotificationTester from "./test";

const DefaultPage = () => {
  return (
    <div className="h-full flex justify-center items-center">
      <p className="text-gray-500 text-xl">
        Here you will see the dashboard and activities
      </p>
      <NotificationTester />
    </div>
  );
};

export default DefaultPage;
