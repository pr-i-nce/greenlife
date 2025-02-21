import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/registeredTables.css'; 

const GenericModal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <FaArrowLeft className="icon" /> Back
        </button>
        {children}
      </div>
    </div>
  );
};

export default GenericModal;
