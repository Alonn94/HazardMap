import React from "react";
import "./Modal.css"; // Optional styling

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;