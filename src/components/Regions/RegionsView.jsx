import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/registeredTables.css';

const RegionView = ({ record, onClose }) => {
  const displayValue = (value) =>
    value !== null && value !== undefined && String(value).trim() !== "" ? value : "null";
    
  return (
    <div className="region-container">
      <div className="region-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="View Region"
          className="region-header-image"
        />
        <div className="region-header-overlay">
          <h2>View Region: {displayValue(record.regionName)}</h2>
        </div>
      </div>
      <div className="region-form">
        <div className="grid-container">
          <div className="grid-item">
            <label>Region Name:</label>
            <p>{displayValue(record.regionName)}</p>
          </div>
          <div className="grid-item">
            <label>Region Code:</label>
            <p>{displayValue(record.regionCode)}</p>
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
    </div>
  );
};

export default RegionView;
