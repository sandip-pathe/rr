import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

const PageComponent = () => {
  const router = useRouter();
  const { modalId } = useParams.arguments;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (modalId) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [modalId]);

  const closeModal = () => {
    router.back();
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Page Content</h1>

      {isModalOpen && (
        <Modal onClose={closeModal} isOpen={isModalOpen}>
          <div>
            <p>This is a modal</p>
            <p>{modalId}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PageComponent;
