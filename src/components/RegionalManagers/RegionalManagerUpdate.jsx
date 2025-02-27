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
          ? options.find(opt => opt.value === value)?.label
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

const RegionalManagerUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  
  const [formData, setFormData] = useState({
    firstName: record.firstName || '',
    lastName: record.lastName || '',
    email: record.email || '',
    phoneNumber: record.phoneNumber || '',
    regionName: record.regionName || '',
    groupName: record.groupName || ''
  });
  const [isActive, setIsActive] = useState(record.active);
  const [updating, setUpdating] = useState(false);
  const [regions, setRegions] = useState([]);
  const [groups, setGroups] = useState([]);

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
    setFormData({
      firstName: record.firstName || '',
      lastName: record.lastName || '',
      email: record.email || '',
      phoneNumber: record.phoneNumber || '',
      regionName: record.regionName || '',
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
      text: `Are you sure you want to ${actionLabel.toLowerCase()} this regional manager?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel}`,
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/region-manager/status?email=${encodeURIComponent(formData.email)}&active=${newStatus}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
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
    const updatedData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      regionName: formData.regionName,
      groupName: formData.groupName
    };
    try {
      setUpdating(true);
      const response = await fetch(`${BASE_URL}/region-manager/update?email=${encodeURIComponent(formData.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Update failed');
      }
      await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Update Successful',
        text: 'Regional Manager updated successfully!',
      }).then(() => {
        onClose();
        if (onUpdateSuccess) onUpdateSuccess();
      });
    } catch (err) {
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
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Regional Manager Update"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Update Regional Manager</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleUpdateSubmit}>
        <div className="grid-container">
          <div className="grid-item">
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              placeholder="Enter your first name" 
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
              placeholder="Enter your last name" 
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
        <div className="grid-container">
          <div className="grid-item full-width">
            <button type="button" onClick={handleStatusUpdate} className="submit-btn">
              {isActive ? (
                <>
                  <FaToggleOn className="icon" /> Deactivate
                </>
              ) : (
                <>
                  <FaToggleOff className="icon" /> Activate
                </>
              )}
            </button>
          </div>
        </div>
        <button type="submit" className="submit-btn" disabled={updating}>
          {updating ? 'Updating...' : 'Update Regional Manager'}
        </button>
      </form>
    </div>
  );
};

export default RegionalManagerUpdate;
