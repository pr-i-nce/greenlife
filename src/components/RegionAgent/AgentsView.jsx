import React from 'react';
import '../../styles/registeredTables.css';

const AgentsView = ({ record, onClose }) => {
  const displayValue = (value) =>
    value !== null && value !== undefined && String(value).trim() !== '' ? value : 'N/A';

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="View Agent"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Agent Details</h2>
        </div>
      </div>
      <form className="rm-form">

        <div className="form-row">
          <div className="form-group">
            <label>ID:</label>
            <input type="text" value={displayValue(record.id)} readOnly />
          </div>
          <div className="form-group">
            <label>First Name:</label>
            <input type="text" value={displayValue(record.firstName)} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Last Name:</label>
            <input type="text" value={displayValue(record.lastName)} readOnly />
          </div>
          <div className="form-group">
            <label>ID Number:</label>
            <input type="text" value={displayValue(record.idNumber)} readOnly />
          </div>
        </div>
  
        <div className="form-row">
          <div className="form-group full-width">
            <label>Email:</label>
            <input type="text" value={displayValue(record.email)} readOnly />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone:</label>
            <input type="text" value={displayValue(record.phoneNumber)} readOnly />
          </div>
          <div className="form-group">
            <label>Sub Region:</label>
            <input type="text" value={displayValue(record.subRegion)} readOnly />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Region:</label>
            <input type="text" value={displayValue(record.regionName)} readOnly />
          </div>
          <div className="form-group">
            <label>Distributor:</label>
            <input type="text" value={displayValue(record.distributor)} readOnly />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Created By:</label>
            <input type="text" value={displayValue(record.createdBy)} readOnly />
          </div>
          <div className="form-group">
            <label>Updated By:</label>
            <input type="text" value={displayValue(record.updatedBy)} readOnly />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Deleted By:</label>
            <input type="text" value={displayValue(record.deletedBy)} readOnly />
          </div>
          <div className="form-group">
            <label>Deactivated By:</label>
            <input type="text" value={displayValue(record.deactivatedBy)} readOnly />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Created Date:</label>
            <input
              type="text"
              value={
                record.createdDate
                  ? new Date(record.createdDate).toLocaleString()
                  : 'N/A'
              }
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Updated Date:</label>
            <input
              type="text"
              value={
                record.updatedDate
                  ? new Date(record.updatedDate).toLocaleString()
                  : 'N/A'
              }
              readOnly
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Deleted Date:</label>
            <input
              type="text"
              value={
                record.deletedDate
                  ? new Date(record.deletedDate).toLocaleString()
                  : 'N/A'
              }
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Deactivated Date:</label>
            <input
              type="text"
              value={
                record.deactivatedDate
                  ? new Date(record.deactivatedDate).toLocaleString()
                  : 'N/A'
              }
              readOnly
            />
          </div>
        </div>
  
        <div className="form-row">
          <div className="form-group full-width" style={{ textAlign: 'center' }}>
            <button type="button" onClick={onClose} className="submit-btn">
              Close
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgentsView;
