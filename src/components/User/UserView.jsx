import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/registeredTables.css';

function UserView({ user, onClose }) {
  return (
    <div className="region-container">
      <div className="region-header">
        <img
          src="https://images.pexels.com/photos/3184310/pexels-photo-3184310.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="View User"
          className="region-header-image"
        />
        <div className="region-header-overlay">
          <h2>User Details</h2>
        </div>
      </div>
      <form className="region-form">
        <div className="form-row">
          <div className="form-group">
            <label>ID</label>
            <input type="text" readOnly value={user.id || ''} />
          </div>
          <div className="form-group">
            <label>Staff Number</label>
            <input type="text" readOnly value={user.staffNumber || ''} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" readOnly value={user.firstName || ''} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" readOnly value={user.lastName || ''} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input type="text" readOnly value={user.phone || ''} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="text" readOnly value={user.email || ''} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Group Name</label>
            <input type="text" readOnly value={user.groupName || ''} />
          </div>
          <div className="form-group">
            <label>Registered At</label>
            <input type="text" readOnly value={user.registeredAt || ''} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default UserView;
