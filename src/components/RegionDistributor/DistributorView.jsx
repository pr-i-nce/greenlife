import React from 'react';
import '../../styles/registeredTables.css';

const DistributorView = ({record}) => {

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="View Distributor"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Distributor Details</h2>
        </div>
      </div>
      <form className="rm-form">
        <div className="form-row">
          <div className="form-group">
            <label>ID:</label>
            <input type="text" value={record.id || 'null'} readOnly />
          </div>
          <div className="form-group">
            <label>Business Name:</label>
            <input type="text" value={record.businessName || 'null'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Region:</label>
            <input type="text" value={record.regionName || 'null'} readOnly />
          </div>
          <div className="form-group">
            <label>Subregion:</label>
            <input type="text" value={record.subRegionName || 'null'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number:</label>
            <input type="text" value={record.phoneNumber || 'null'} readOnly />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="text" value={record.email || 'null'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Status:</label>
            <input type="text" value={record.active ? 'Active' : 'Inactive'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Created By:</label>
            <input type="text" value={record.createdBy || 'null'} readOnly />
          </div>
          <div className="form-group">
            <label>Updated By:</label>
            <input type="text" value={record.updatedBy || 'null'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Deleted By:</label>
            <input type="text" value={record.deletedBy || 'null'} readOnly />
          </div>
          <div className="form-group">
            <label>Deactivated By:</label>
            <input type="text" value={record.deactivatedBy || 'null'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Created Date:</label>
            <input type="text" value={record.createdDate ? record.createdDate.toString() : 'null'} readOnly />
          </div>
          <div className="form-group">
            <label>Updated Date:</label>
            <input type="text" value={record.updatedDate ? record.updatedDate.toString() : 'null'} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Deleted Date:</label>
            <input type="text" value={record.deletedDate ? record.deletedDate.toString() : 'null'} readOnly />
          </div>
          <div className="form-group">
            <label>Deactivated Date:</label>
            <input type="text" value={record.deactivatedDate ? record.deactivatedDate.toString() : 'null'} readOnly />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DistributorView;
