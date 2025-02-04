"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Modal from "@/components/Modal";

const TaskModal = ({ params }: { params: { id: string } }) => {
  const router = useRouter();

  return (
    <Modal onClose={() => router.push("/dashboard/board")} isOpen>
      <div>
        <p>Editing Task ID: {params.id}</p>
        {/* Task Editing Form */}
      </div>
    </Modal>
  );
};

export default TaskModal;
