import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { FaToggleOn, FaToggleOff, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

const SearchableDropdown = ({ id, value, onChange, options, placeholder, noOptionsText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (selectedValue) => {
    onChange({ target: { id, value: selectedValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="searchable-dropdown" ref={dropdownRef}>
      <div className="dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
        {value
          ? (options.find(opt => opt.value === value)?.label || value)
          : placeholder}
        <span className="dropdown-arrow">&#9662;</span>
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          <input 
            type="text"
            className="dropdown-search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <ul className="dropdown-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <li key={option.id} onMouseDown={() => handleOptionSelect(option.value)}>
                  {option.label}
                </li>
              ))
            ) : (
              <li className="no-options">{noOptionsText || "No options found"}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

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
  const [regions, setRegions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subregions, setSubregions] = useState([]);

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

  useEffect(() => {
    if (accessToken) {
      fetch(`${BASE_URL}/region/all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          const regionOptions = Array.isArray(data)
            ? data.map(region => ({
                id: region.id,
                label: region.regionName, 
                value: region.regionName,
              }))
            : [];
          setRegions(regionOptions);
        })
        .catch(err => {
          console.error("Error fetching regions:", err);
          Swal.fire("Error", err.message, "error");
        });
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetch(`${BASE_URL}/group/all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          const groupOptions = Array.isArray(data)
            ? data.map(group => ({
                id: group.id,
                label: group.groupName,
                value: group.groupName,
              }))
            : [];
          setGroups(groupOptions);
        })
        .catch(err => {
          console.error("Error fetching groups:", err);
          Swal.fire("Error", err.message, "error");
        });
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetch(`${BASE_URL}/subregion/all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(res => res.json())
        .then(data => {
          const subregionOptions = Array.isArray(data)
            ? data.map(sub => ({
                id: sub.id,
                label: sub.subRegionName, 
                value: sub.subRegionName,
              }))
            : [];
          setSubregions(subregionOptions);
        })
        .catch(err => {
          console.error("Error fetching subregions:", err);
          Swal.fire("Error", err.message, "error");
        });
    }
  }, [accessToken]);

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
          <h2>Update Area Manager</h2>
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
            <label htmlFor="regionName">
              <FaMapMarkerAlt className="icon" /> Region
            </label>
            <SearchableDropdown 
              id="regionName"
              value={formData.regionName}
              onChange={handleChange}
              options={regions}
              placeholder="Select Region"
              noOptionsText="No regions found"
            />
          </div>
          <div className="grid-item">
            <label htmlFor="subRegionName">Area</label>
            <SearchableDropdown 
              id="subRegionName"
              value={formData.subRegionName}
              onChange={handleChange}
              options={subregions}
              placeholder="Select Subregion"
              noOptionsText="No subregions found"
            />
          </div>
          <div className="grid-item">
            <label htmlFor="groupName">
              <FaUsers className="icon" /> Group Name
            </label>
            <SearchableDropdown 
              id="groupName"
              value={formData.groupName}
              onChange={handleChange}
              options={groups}
              placeholder="Select Group"
              noOptionsText="No groups found"
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
