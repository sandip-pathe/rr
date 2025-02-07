import React from "react";
import { Dialog } from "@headlessui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-10 inset-0 overflow-y-auto bg-white/20"
    >
      <div className="bg-black rounded-lg shadow-lg w-[60%] h-[90vh] overflow-hidden self-center m-auto mt-10 z-100">
        {children}
      </div>
    </Dialog>
  );
};

export default Modal;
