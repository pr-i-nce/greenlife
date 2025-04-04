import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { FaUser, FaPhone, FaEnvelope, FaIdBadge } from 'react-icons/fa';
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

// Reusable SearchableDropdown component
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
        {value ? options.find(opt => opt.value === value)?.label : placeholder}
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

function UserUpdate({ user, onClose }) {
  const accessToken = useSelector((state) => state.auth.accessToken);

  const getAuthHeaders = () =>
    accessToken
      ? { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };

  // Define static options for user titles.
  // Note: We've added an entry for "005" (fetched value) so that it maps properly.
  const userTitleOptions = [
    { id: '001', label: 'Admin', value: '001' },
    { id: '002', label: 'Director', value: '002' },
    { id: '003', label: 'Regional Manager', value: '003' },
    { id: '004', label: 'Sub Regional Manager', value: '004' },
    { id: '005', label: 'Regional Managers', value: '005' },
  ];

  // Initialize update form data.
  // Note: For region we use user.regionName (fetched property) and for user title we map using user.userTitle.
  const [updateFormData, setUpdateFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    email: user.email || '',
    password: '',
    confirmPassword: '',
    userTitle: (() => {
      const found = userTitleOptions.find(
        (opt) => opt.label === user.userTitle || opt.value === user.userTitle
      );
      return found ? found.value : user.userTitle || '';
    })(),
    groupName: user.groupName || '',
    region: user.regionName || '',
    subRegion: user.subRegion || '',
  });

  const [groups, setGroups] = useState([]);
  const [regions, setRegions] = useState([]);
  const [subregions, setSubregions] = useState([]);

  // Fetch groups for Group Name dropdown
  useEffect(() => {
    fetch(`${BASE_URL}/group/all`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        Swal.fire('Error', err.message, 'error');
      });
  }, [accessToken]);

  // Fetch regions for Region dropdown
  useEffect(() => {
    fetch(`${BASE_URL}/region/all`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setRegions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        Swal.fire('Error', err.message, 'error');
      });
  }, [accessToken]);

  // Fetch subregions for Sub Region dropdown
  useEffect(() => {
    fetch(`${BASE_URL}/subregion/all`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setSubregions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        Swal.fire('Error', err.message, 'error');
      });
  }, [accessToken]);

  // When regions are fetched, map the user's region (using user.regionName) to the regionName value.
  useEffect(() => {
    if (regions.length > 0 && user.regionName) {
      const foundRegion = regions.find(
        (r) => r.id === user.regionName || r.regionName === user.regionName
      );
      if (foundRegion && updateFormData.region !== foundRegion.regionName) {
        setUpdateFormData(prev => ({ ...prev, region: foundRegion.regionName }));
      }
    }
  }, [regions, user.regionName, updateFormData.region]);

  const handleUpdateChange = (e) => {
    const { id, value } = e.target;
    setUpdateFormData(prev => {
      const newData = { ...prev, [id]: value };
      if (id === "groupName" && value === "Regional Managers") {
        newData.subRegion = "";
      }
      return newData;
    });
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

  // Map fetched data to dropdown options
  const groupOptions = groups.map(group => ({
    id: group.id || group.groupName,
    label: group.groupName,
    value: group.groupName,
  }));

  const regionOptions = regions.map(region => ({
    id: region.id,
    label: region.regionName,
    value: region.regionName,
  }));

  const subregionOptions = subregions.map(sub => ({
    id: sub.id,
    label: sub.subRegionName,
    value: sub.subRegionName,
  }));

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
      <form className="rm-form" onSubmit={handleUpdateSubmit}>
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
        {/* New row for User Title */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userTitle">
              <FaIdBadge className="icon" /> User Title
            </label>
            <SearchableDropdown
              id="userTitle"
              value={updateFormData.userTitle}
              onChange={handleUpdateChange}
              options={userTitleOptions}
              placeholder="Select User Title"
              noOptionsText="No titles found"
            />
          </div>
        </div>
        {/* Row for Region and conditional Sub Region dropdown */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="region">
              <FaIdBadge className="icon" /> Region
            </label>
            <SearchableDropdown
              id="region"
              value={updateFormData.region}
              onChange={handleUpdateChange}
              options={regionOptions}
              placeholder="Select Region"
              noOptionsText="No regions found"
            />
          </div>
          {updateFormData.groupName !== "Regional Managers" && (
            <div className="form-group">
              <label htmlFor="subRegion">
                <FaIdBadge className="icon" /> Sub Region
              </label>
              <SearchableDropdown
                id="subRegion"
                value={updateFormData.subRegion}
                onChange={handleUpdateChange}
                options={subregionOptions}
                placeholder="Select Sub Region"
                noOptionsText="No subregions found"
              />
            </div>
          )}
        </div>
        {/* Row for Group Name dropdown */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupName">
              <FaIdBadge className="icon" /> Group Name
            </label>
            <SearchableDropdown
              id="groupName"
              value={updateFormData.groupName}
              onChange={handleUpdateChange}
              options={groupOptions}
              placeholder="Select Group"
              noOptionsText="No groups found"
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
