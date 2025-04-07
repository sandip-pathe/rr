"use client";

import React from "react";
import ReactDOM from "react-dom";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root");
  const content = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black rounded-lg shadow-lg relative w-full max-w-md max-h-[90vh] flex flex-col self-center m-auto mt-10 z-100">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="overflow-y-auto flex-1 p-6 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );

  return modalRoot ? ReactDOM.createPortal(content, modalRoot) : content;
};

export default CustomModal;
