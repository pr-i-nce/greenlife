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

const RegionalManagerRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRegionName, setRegRegionName] = useState('');
  const [regGroupName, setRegGroupName] = useState('');
  const [regError, setRegError] = useState('');

  const [regions, setRegions] = useState([]);
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
      fetchGroups();
    }
  }, [accessToken]);

  const regionOptions = regions.map(region => ({
    id: region.id,
    label: region.regionName, 
    value: region.regionName
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
      groupName: regGroupName
    };
    try {
      const response = await fetch(`${BASE_URL}/region-manager`, {
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
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Regional Manager Registration"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Regional Manager Registration</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleRegistrationSubmit}>
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
              <FaMapMarkerAlt className="icon" /> Region Name
            </label>
            <SearchableDropdown 
              id="regRegionName"
              value={regRegionName}
              onChange={(e) => setRegRegionName(e.target.value)}
              options={regionOptions}
              placeholder="Select region"
              noOptionsText="No regions found"
            />
          </div>
          <div className="form-group">
            <label htmlFor="regGroupName">
              <FaUsers className="icon" /> Group Name
            </label>
            <SearchableDropdown 
              id="regGroupName"
              value={regGroupName}
              onChange={(e) => setRegGroupName(e.target.value)}
              options={groupOptions}
              placeholder="Select group"
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

export default RegionalManagerRegistration;
