"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Modal from "@/components/Modal";

const NewTaskModal = () => {
  const router = useRouter();

  return (
    <Modal onClose={() => router.push("/dashboard/board")} isOpen>
      <div>
        <p>Create a New Task</p>
        {/* Task Creation Form */}
      </div>
    </Modal>
  );
};

export default NewTaskModal;
