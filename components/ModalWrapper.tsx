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

  // Ensure there's a div with id 'modal-root' in your _document or index.html
  const modalRoot = document.getElementById("modal-root");
  const content = (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeButton} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );

  return modalRoot ? ReactDOM.createPortal(content, modalRoot) : content;
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    borderRadius: "8px",
    padding: "20px",
    position: "relative" as const,
    minWidth: "300px",
    maxWidth: "90%",
  },
  closeButton: {
    position: "absolute" as const,
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
};

export default CustomModal;
