"use client";

import { useRouter } from "next/navigation";

export default function ModalContent({ stageId }: { stageId: string }) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div>
      <h2>Create New Card in {stageId}</h2>
      {/* Add your form here */}
      <button
        onClick={handleClose}
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
      >
        Close
      </button>
    </div>
  );
}
