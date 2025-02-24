import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaToggleOn, FaToggleOff, FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

const SubRegionalManagerUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [formData, setFormData] = useState({
    firstName: record.firstName || '',
    lastName: record.lastName || '',
    email: record.email || '',
    phoneNumber: record.phoneNumber || '',
    regionName: record.regionName || '',
    subRegionName: record.subRegionName || '',
    groupName: record.groupName || ''
  });
  const [updateError, setUpdateError] = useState('');
  const [isActive, setIsActive] = useState(record.active);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: record.firstName || '',
      lastName: record.lastName || '',
      email: record.email || '',
      phoneNumber: record.phoneNumber || '',
      regionName: record.regionName || '',
      subRegionName: record.subRegionName || '',
      groupName: record.groupName || ''
    });
    setIsActive(record.active);
  }, [record]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleStatusUpdate = async () => {
    const newStatus = !isActive;
    const actionLabel = newStatus ? "Activate" : "Deactivate";
    const result = await Swal.fire({
      title: `Confirm ${actionLabel}`,
      text: `Are you sure you want to ${actionLabel.toLowerCase()} this sub regional manager?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel}`,
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${BASE_URL}/sub-region-manager/status?email=${encodeURIComponent(formData.email)}&active=${newStatus}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(responseText || 'Status update failed');
        }
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: responseText,
        }).then(() => {
          onClose();
          if (onUpdateSuccess) onUpdateSuccess();
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Status Update Failed',
          text: err.message,
        });
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    const updatedData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      regionName: formData.regionName,
      subRegionName: formData.subRegionName,
      groupName: formData.groupName,
      active: isActive
    };
    try {
      setUpdating(true);
      const response = await fetch(
        `${BASE_URL}/sub-region-manager/update?email=${encodeURIComponent(formData.email)}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(updatedData)
        }
      );
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Update failed');
      }
      await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Update Successful',
        text: 'Sub Regional Manager updated successfully!',
      }).then(() => {
        onClose();
        if (onUpdateSuccess) onUpdateSuccess();
      });
    } catch (err) {
      setUpdateError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="subregion-container">
      <div className="subregion-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Sub Regional Manager Update"
          className="subregion-header-image"
        />
        <div className="subregion-header-overlay">
          <h2>Update Sub Regional Manager</h2>
        </div>
      </div>
      <form className="subregion-form" onSubmit={handleUpdateSubmit}>
        <div className="grid-container">
          <div className="grid-item">
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              placeholder="First name" 
              value={formData.firstName}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="grid-item">
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              placeholder="Last name" 
              value={formData.lastName}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="grid-item">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required 
              readOnly
            />
          </div>
          <div className="grid-item">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              placeholder="Phone number" 
              value={formData.phoneNumber}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="grid-item">
            <label htmlFor="regionName">Region Name</label>
            <input 
              type="text" 
              id="regionName" 
              placeholder="Region Name" 
              value={formData.regionName}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="grid-item">
            <label htmlFor="subRegionName">Area Name</label>
            <input 
              type="text" 
              id="subRegionName" 
              placeholder="Sub-region Name" 
              value={formData.subRegionName}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="grid-item">
            <label htmlFor="groupName">
              <FaUsers className="icon" /> Group Name
            </label>
            <input 
              type="text" 
              id="groupName" 
              placeholder="Group Name" 
              value={formData.groupName}
              onChange={handleChange}
              required 
            />
          </div>
        </div>
        {updateError && <p className="error-message">{updateError}</p>}
        <div className="grid-container">
          <div className="grid-item full-width">
            <button type="button" onClick={handleStatusUpdate} className="submit-btn">
              {isActive ? (
                <>
                  <FaToggleOn className="icon" /> Active (Click to deactivate)
                </>
              ) : (
                <>
                  <FaToggleOff className="icon" /> Inactive (Click to activate)
                </>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="submit-btn" disabled={updating}>
          {updating ? 'Updating...' : 'Update Sub Regional Manager'}
        </button>
      </form>
    </div>
  );
};

export default SubRegionalManagerUpdate;
