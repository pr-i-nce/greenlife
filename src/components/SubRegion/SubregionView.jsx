import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/registeredTables.css';

const SubregionView = ({ record, onClose }) => {
  const displayValue = (value) => value !== null && value !== undefined && String(value).trim() !== "" ? value : "null";
  return (
    <div className="subregion-container">
      <div className="subregion-header">
        <img src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="View Subregion" className="subregion-header-image" />
        <div className="subregion-header-overlay">
          <h2>View Area: {displayValue(record.subRegionName)}</h2>
        </div>
      </div>
      <div className="subregion-form">
        <div className="grid-container">
          <div className="grid-item">
            <label>Area Name:</label>
            <p>{displayValue(record.subRegionName)}</p>
          </div>
          <div className="grid-item">
            <label>Area Code:</label>
            <p>{displayValue(record.subRegionCode)}</p>
          </div>
          <div className="grid-item">
            <label>Created By:</label>
            <p>{displayValue(record.createdBy)}</p>
          </div>
          <div className="grid-item">
            <label>Updated By:</label>
            <p>{displayValue(record.updatedBy)}</p>
          </div>
          <div className="grid-item">
            <label>Deleted By:</label>
            <p>{displayValue(record.deletedBy)}</p>
          </div>
          <div className="grid-item">
            <label>Created Date:</label>
            <p>{displayValue(record.createdDate)}</p>
          </div>
          <div className="grid-item">
            <label>Updated Date:</label>
            <p>{displayValue(record.updatedDate)}</p>
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

export default SubregionView;
