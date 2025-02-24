import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaUser, FaPhone, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import { BASE_URL } from '../apiClient';

const safeJsonParse = (res) => {
  return res.text().then((text) => {
    try {
      return text ? JSON.parse(text) : {};
    } catch (err) {
      console.error('JSON parse error:', err);
      return {};
    }
  });
};

function UserUpdate({ user, onClose }) {
  const accessToken = useSelector((state) => state.auth.accessToken);

  const getAuthHeaders = () =>
    accessToken
      ? { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };

  const [updateFormData, setUpdateFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    email: user.email || '',
    password: '',
    confirmPassword: '',
    groupName: user.groupName || '',
  });

  const handleUpdateChange = (e) => {
    setUpdateFormData({ ...updateFormData, [e.target.id]: e.target.value });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (updateFormData.password.trim() !== '') {
      if (updateFormData.password !== updateFormData.confirmPassword) {
        Swal.fire('Error', 'Passwords do not match', 'error');
        return;
      }
    }
    const staffNumber = user.staffNumber;
    fetch(`${BASE_URL}/registration/update?staffNumber=${encodeURIComponent(staffNumber)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateFormData),
    })
      .then((res) => safeJsonParse(res))
      .then((data) => {
        if (data && data.staffNumber) {
          Swal.fire('Success', data.message || 'User updated successfully!', 'success');
          onClose();
        } else {
          Swal.fire('Error', 'User not updated.', 'error');
        }
      })
      .catch((error) => {
        console.error('Update error:', error);
        Swal.fire('Error', error.message || 'Error updating user', 'error');
      });
  };

  return (
    <div className="region-container">
      <div className="region-header">
        <img
          src="https://images.pexels.com/photos/3184310/pexels-photo-3184310.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Update User"
          className="region-header-image"
        />
        <div className="region-header-overlay">
          <h2>Update User</h2>
        </div>
      </div>
      <form className="region-form" onSubmit={handleUpdateSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              <FaUser className="icon" /> First Name
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter first name"
              value={updateFormData.firstName}
              onChange={handleUpdateChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">
              <FaUser className="icon" /> Last Name
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="Enter last name"
              value={updateFormData.lastName}
              onChange={handleUpdateChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">
              <FaPhone className="icon" /> Phone
            </label>
            <input
              type="text"
              id="phone"
              placeholder="Enter phone"
              value={updateFormData.phone}
              onChange={handleUpdateChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={updateFormData.email}
              onChange={handleUpdateChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupName">
              <FaIdBadge className="icon" /> Group Name
            </label>
            <input
              type="text"
              id="groupName"
              placeholder="Enter group name"
              value={updateFormData.groupName}
              onChange={handleUpdateChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="submit-btn">
          Update User
        </button>
      </form>
    </div>
  );
}

export default UserUpdate;
