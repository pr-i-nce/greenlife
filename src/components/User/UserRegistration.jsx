import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { FaUser, FaPhone, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import apiClient from '../apiClient';
import '../../styles/registeredTables.css';

// SearchableDropdown component (unchanged)
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

const UserRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Extend form data to include regionName, subRegion, and groupName
  const [regFormData, setRegFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    userTitle: '',
    groupName: '',
    regionName: '', 
    subRegion: ''
  });

  const [groups, setGroups] = useState([]);
  const [regions, setRegions] = useState([]);
  const [subregions, setSubregions] = useState([]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await apiClient.get('/group/all', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    };
    if (accessToken) fetchGroups();
  }, [accessToken]);

  // Fetch regions from backend
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { data } = await apiClient.get('/region/all', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setRegions(Array.isArray(data) ? data : []);
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    };
    if (accessToken) fetchRegions();
  }, [accessToken]);

  // Fetch subregions from backend
  useEffect(() => {
    const fetchSubregions = async () => {
      try {
        const { data } = await apiClient.get('/subregion/all', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setSubregions(Array.isArray(data) ? data : []);
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    };
    if (accessToken) fetchSubregions();
  }, [accessToken]);

  const handleRegChange = (e) => {
    setRegFormData({ ...regFormData, [e.target.id]: e.target.value });
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();

    const response = await apiClient.post('/registration', regFormData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = response.data;
    // Assuming the API returns an object with staffNumber on success.
    if (data && data.staffNumber) {
      Swal.fire('Success', data.message || 'User registered successfully!', 'success');
      onClose();
      if (onRegistrationSuccess) onRegistrationSuccess();
    } else {
      Swal.fire('Error', 'User not created.', 'error');
    }
  };

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

  const groupOptions = groups.map(group => ({
    id: group.id || group.groupName,
    label: group.groupName,
    value: group.groupName,
  }));

  return (
    <div className="region-container">
      <div className="region-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="User Registration"
          className="region-header-image"
        />
        <div className="region-header-overlay">
          <h2>User Registration</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleRegSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              <FaUser className="icon" /> First Name
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter first name"
              value={regFormData.firstName}
              onChange={handleRegChange}
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
              value={regFormData.lastName}
              onChange={handleRegChange}
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
              value={regFormData.phone}
              onChange={handleRegChange}
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
              value={regFormData.email}
              onChange={handleRegChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regionName">
              <FaIdBadge className="icon" /> Region
            </label>
            <SearchableDropdown
              id="regionName"
              value={regFormData.regionName}
              onChange={handleRegChange}
              options={regionOptions}
              placeholder="Select Region"
              noOptionsText="No regions found"
            />
          </div>
          <div className="form-group">
            <label htmlFor="subRegion">
              <FaIdBadge className="icon" /> Sub Region
            </label>
            <SearchableDropdown
              id="subRegion"
              value={regFormData.subRegion}
              onChange={handleRegChange}
              options={subregionOptions}
              placeholder="Select Sub Region"
              noOptionsText="No subregions found"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userTitle">
              <FaIdBadge className="icon" /> User Title
            </label>
            <select
              id="userTitle"
              value={regFormData.userTitle}
              onChange={handleRegChange}
              required
            >
              <option value="">Select User Title</option>
              <option value="001">Admin</option>
              <option value="002">Director</option>
              <option value="003">Regional Manager</option>
              <option value="004">Sub Regional Manager</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="groupName">
              <FaIdBadge className="icon" /> Group Name
            </label>
            <SearchableDropdown
              id="groupName"
              value={regFormData.groupName}
              onChange={handleRegChange}
              options={groupOptions}
              placeholder="Select Group"
              noOptionsText="No groups found"
            />
          </div>
        </div>
        <button type="submit" className="submit-btn">
          Register User
      </button>
      </form>

    </div>
  );
};

export default UserRegistration;
