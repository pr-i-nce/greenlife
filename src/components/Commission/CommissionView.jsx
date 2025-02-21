import React from 'react';
import GenericModal from '../GenericModal';
import '../../styles/registeredTables.css';

const CommissionView = ({ commission, onClose }) => {
  const displayValue = (value) =>
    value !== null && value !== undefined && String(value).trim() !== "" ? value : "null";
    
  return (
    <GenericModal onClose={onClose}>
      <div className="subregion-container">
        <div className="subregion-header">
          <img 
            src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="View Commission" 
            className="subregion-header-image" 
          />
          <div className="subregion-header-overlay">
            <h2>View Commission: {commission.commissionType}</h2>
          </div>
        </div>
        <div className="grid-container">
          <div className="grid-item">
            <label>Commission Type:</label>
            <p>{displayValue(commission.commissionType)}</p>
          </div>
          <div className="grid-item">
            <label>First Commission (%):</label>
            <p>{displayValue(commission.initialCommission)}</p>
          </div>
          <div className="grid-item">
            <label>Second Commission (%):</label>
            <p>{displayValue(commission.lastCommission)}</p>
          </div>
          {commission.totalCommission !== undefined && (
            <div className="grid-item">
              <label>Total Commission:</label>
              <p>{displayValue(commission.totalCommission)}</p>
            </div>
          )}
          <div className="grid-item">
            <label>Created Date:</label>
            <p>{displayValue(commission.createdDate)}</p>
          </div>
          <div className="grid-item">
            <label>Updated Date:</label>
            <p>{displayValue(commission.updatedDate)}</p>
          </div>
          <div className="grid-item">
            <label>Deleted Date:</label>
            <p>{displayValue(commission.deletedDate)}</p>
          </div>
          <div className="grid-item">
            <label>Created By:</label>
            <p>{displayValue(commission.createdBy)}</p>
          </div>
          <div className="grid-item">
            <label>Updated By:</label>
            <p>{displayValue(commission.updatedBy)}</p>
          </div>
          <div className="grid-item">
            <label>Deleted By:</label>
            <p>{displayValue(commission.deletedBy)}</p>
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export default CommissionView;
