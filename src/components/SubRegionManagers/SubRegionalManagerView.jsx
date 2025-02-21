import React from 'react';
import '../../styles/registeredTables.css';

const SubRegionalManagerView = ({ record, onClose }) => {
  const displayValue = (value) =>
    value !== null && value !== undefined && String(value).trim() !== '' ? value : 'null';

  return (
    <div className="subregion-container">
      <div className="subregion-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="View Sub Regional Manager"
          className="subregion-header-image"
        />
        <div className="subregion-header-overlay">
          <h2>
            View {record.firstName} {record.lastName}
            {(record.firstName || record.lastName) ? "'s Details" : ' Details'}
          </h2>
        </div>
      </div>
      <div className="subregion-form">
        <div className="grid-container">
          <div className="grid-item">
            <label>ID:</label>
            <p>{displayValue(record.id)}</p>
          </div>
          <div className="grid-item">
            <label>First Name:</label>
            <p>{displayValue(record.firstName)}</p>
          </div>
          <div className="grid-item">
            <label>Last Name:</label>
            <p>{displayValue(record.lastName)}</p>
          </div>
          <div className="grid-item">
            <label>Email:</label>
            <p>{displayValue(record.email)}</p>
          </div>
          <div className="grid-item">
            <label>Phone Number:</label>
            <p>{displayValue(record.phoneNumber)}</p>
          </div>
          <div className="grid-item">
            <label>Region Name:</label>
            <p>{displayValue(record.regionName)}</p>
          </div>
          <div className="grid-item">
            <label>Subregion Name:</label>
            <p>{displayValue(record.subRegionName)}</p>
          </div>
          <div className="grid-item">
            <label>Group Name:</label>
            <p>{displayValue(record.groupName)}</p>
          </div>
          <div className="grid-item">
            <label>Status:</label>
            <p>{record.active ? 'Active' : 'Inactive'}</p>
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
            <label>Deactivated By:</label>
            <p>{displayValue(record.deactivatedBy)}</p>
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
          <div className="grid-item">
            <label>Deactivated Date:</label>
            <p>{displayValue(record.deactivatedDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubRegionalManagerView;
