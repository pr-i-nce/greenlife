import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/registeredTables.css';

const DistributorView = ({ record, onClose }) => {
  const displayValue = (value) =>
    value !== null && value !== undefined && String(value).trim() !== "" ? value : "null";

  return (
    <div className="distributor-container">
      <div className="distributor-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="View Distributor"
          className="distributor-header-image"
        />
        <div className="distributor-header-overlay">
          <h2>View Distributor: {displayValue(record.businessName)}</h2>
        </div>
      </div>
      <div className="distributor-form">
        <div className="grid-container">
          <div className="grid-item">
            <label>Business Name:</label>
            <p>{displayValue(record.businessName)}</p>
          </div>
          <div className="grid-item">
            <label>Region:</label>
            <p>{displayValue(record.regionManager)}</p>
          </div>
          <div className="grid-item">
            <label>Subregion:</label>
            <p>{displayValue(record.regionCode)}</p>
          </div>
          <div className="grid-item">
            <label>Phone Number:</label>
            <p>{displayValue(record.phoneNumber)}</p>
          </div>
          <div className="grid-item">
            <label>Email:</label>
            <p>{displayValue(record.email)}</p>
          </div>
          <div className="grid-item">
            <label>Created By:</label>
            <p>{displayValue(record.createdBy)}</p>
          </div>
          <div className="grid-item">
            <label>Created Date:</label>
            <p>{displayValue(record.createdDate)}</p>
          </div>
          <div className="grid-item">
            <label>Updated By:</label>
            <p>{displayValue(record.updatedBy)}</p>
          </div>
          <div className="grid-item">
            <label>Updated Date:</label>
            <p>{displayValue(record.updatedDate)}</p>
          </div>
          <div className="grid-item">
            <label>Deleted By:</label>
            <p>{displayValue(record.deletedBy)}</p>
          </div>
          <div className="grid-item">
            <label>Deleted Date:</label>
            <p>{displayValue(record.deletedDate)}</p>
          </div>
        </div>
      </div>
      <button className="back-btn" onClick={onClose}>
        <FaArrowLeft /> Back
      </button>
    </div>
  );
};

export default DistributorView;
