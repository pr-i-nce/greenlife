import React, { useState, useEffect, useRef } from 'react';
import swal from 'sweetalert';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
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

const SubRegionalManagerRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRegionName, setRegRegionName] = useState('');
  const [regSubRegionName, setRegSubRegionName] = useState('');
  const [regGroupName, setRegGroupName] = useState('');
  const [regError, setRegError] = useState('');

  const [regions, setRegions] = useState([]);
  const [subregions, setSubregions] = useState([]);
  const [groups, setGroups] = useState([]);

  const fetchRegions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/region/all`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch regions.');
      const data = await response.json();
      setRegions(data);
    } catch (err) {
      console.error(err);
      swal({
        title: "Error",
        text: "Failed to load regions.",
        icon: "error",
        button: "OK"
      });
    }
  };

  const fetchSubregions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/subregion/all`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch subregions.');
      const data = await response.json();
      setSubregions(data);
    } catch (err) {
      console.error(err);
      swal({
        title: "Error",
        text: "Failed to load subregions.",
        icon: "error",
        button: "OK"
      });
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${BASE_URL}/group/all`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch groups.');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
      swal({
        title: "Error",
        text: "Failed to load groups.",
        icon: "error",
        button: "OK"
      });
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchRegions();
      fetchSubregions();
      fetchGroups();
    }
  }, [accessToken]);

  const regionOptions = regions.map(region => ({
    id: region.id,
    label: region.regionName, 
    value: region.regionName
  }));

  const subregionOptions = subregions.map(sub => ({
    id: sub.id,
    label: sub.subRegionName, 
    value: sub.subRegionName
  }));

  const groupOptions = groups.map(group => ({
    id: group.id,
    label: group.groupName,
    value: group.groupName
  }));

  const validateRegistrationForm = () => {
    if (
      !regFirstName.trim() ||
      !regLastName.trim() ||
      !regEmail.trim() ||
      !regPhone.trim() ||
      !regRegionName.trim() ||
      !regSubRegionName.trim() ||
      !regGroupName.trim()
    ) {
      return "Please fill in all required fields.";
    }
    return "";
  };

  const clearRegistrationForm = () => {
    setRegFirstName('');
    setRegLastName('');
    setRegEmail('');
    setRegPhone('');
    setRegRegionName('');
    setRegSubRegionName('');
    setRegGroupName('');
    setRegError('');
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateRegistrationForm();
    if (validationError) {
      setRegError(validationError);
      swal({
        title: "Validation Error",
        text: validationError,
        icon: "error",
        button: "OK"
      });
      return;
    }
    setRegError("");
    const payload = {
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      phoneNumber: regPhone,
      regionName: regRegionName,
      subRegionName: regSubRegionName,
      groupName: regGroupName
    };

    if (!accessToken) {
      swal({
        title: "Error",
        text: "No access token available. Please login.",
        icon: "error",
        button: "OK"
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/sub-region-manager`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      if (response.ok) {
        swal({
          title: "Success",
          text: responseText,
          icon: "success",
          button: "OK"
        }).then(() => {
          clearRegistrationForm();
          onClose();
          if (onRegistrationSuccess) onRegistrationSuccess();
        });
      } else {
        swal({
          title: "Error",
          text: responseText,
          icon: "error",
          button: "OK"
        });
      }
    } catch (err) {
      console.error(err);
      swal({
        title: "Error",
        text: "An error occurred while registering. Please try again.",
        icon: "error",
        button: "OK"
      });
    }
  };

  return (
    <div className="subregion-container">
      <div className="subregion-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Sub Regional Manager Registration"
          className="subregion-header-image"
        />
        <div className="subregion-header-overlay">
          <h2>Sub Regional Manager Registration</h2>
        </div>
      </div>
      <form className="subregion-form" onSubmit={handleRegistrationSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regFirstName">
              <FaUser className="icon" /> First Name
            </label>
            <input 
              type="text" 
              id="regFirstName" 
              placeholder="First name" 
              required 
              value={regFirstName}
              onChange={(e) => setRegFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="regLastName">
              <FaUser className="icon" /> Last Name
            </label>
            <input 
              type="text" 
              id="regLastName" 
              placeholder="Last name" 
              required 
              value={regLastName}
              onChange={(e) => setRegLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regEmail">
              <FaEnvelope className="icon" /> Email
            </label>
            <input 
              type="email" 
              id="regEmail" 
              placeholder="Email" 
              required 
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="regPhone">
              <FaPhone className="icon" /> Phone
            </label>
            <input 
              type="tel" 
              id="regPhone" 
              placeholder="Phone number" 
              required 
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regRegionName">
              <FaMapMarkerAlt className="icon" /> Region
            </label>
            <SearchableDropdown 
              id="regRegionName"
              value={regRegionName}
              onChange={(e) => setRegRegionName(e.target.value)}
              options={regionOptions}
              placeholder="Select Region"
              noOptionsText="No regions found"
            />
          </div>
          <div className="form-group">
            <label htmlFor="regSubRegionName">
              <FaMapMarkerAlt className="icon" /> Area
            </label>
            <SearchableDropdown 
              id="regSubRegionName"
              value={regSubRegionName}
              onChange={(e) => setRegSubRegionName(e.target.value)}
              options={subregionOptions}
              placeholder="Select Area"
              noOptionsText="No subregions found"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regGroupName">
              <FaUsers className="icon" /> Group
            </label>
            <SearchableDropdown 
              id="regGroupName"
              value={regGroupName}
              onChange={(e) => setRegGroupName(e.target.value)}
              options={groupOptions}
              placeholder="Select Group"
              noOptionsText="No groups found"
            />
          </div>
        </div>
        {regError && <p className="error-message">{regError}</p>}
        <button type="submit" className="submit-btn">Register</button>
      </form>
    </div>
  );
};

export default SubRegionalManagerRegistration;
