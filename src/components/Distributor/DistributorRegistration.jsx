import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { FaBuilding, FaMapMarkedAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
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

const DistributorRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [businessName, setBusinessName] = useState('');
  const [subRegionName, setSubRegionName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [regError, setRegError] = useState('');
  
  const [subregions, setSubregions] = useState([]);

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
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load subregions.' });
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSubregions();
    }
  }, [accessToken]);

  const subregionOptions = subregions.map(sub => ({
    id: sub.id,
    label: sub.subRegionName,
    value: sub.subRegionName
  }));

  const simpleEmailValid = (email) => email.includes('@') && email.includes('.');

  const validateRegistrationForm = () => {
    if (
      !businessName.trim() ||
      !subRegionName.trim() ||
      !phoneNumber.trim() ||
      !email.trim()
    ) {
      return "All fields are required.";
    }
    if (!simpleEmailValid(email)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const clearRegistrationForm = () => {
    setBusinessName('');
    setSubRegionName('');
    setPhoneNumber('');
    setEmail('');
    setRegError('');
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateRegistrationForm();
    if (validationError) {
      setRegError(validationError);
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: validationError,
      });
      return;
    }
    setRegError('');
    const payload = {
      businessName,
      subRegionName,
      phoneNumber,
      email
    };

    try {
      const response = await fetch(`${BASE_URL}/distributor`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: responseText,
        }).then(() => {
          clearRegistrationForm();
          onClose();
          if (onRegistrationSuccess) onRegistrationSuccess();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: responseText,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "An error occurred while registering. Please try again.",
      });
    }
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Distributor Registration"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Dealer Registration</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleRegistrationSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="businessName">
              <FaBuilding className="icon" /> Business Name
            </label>
            <input 
              type="text" 
              id="businessName" 
              placeholder="Enter business name" 
              required 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subRegionName">
              <FaMapMarkedAlt className="icon" /> Area
            </label>
            <SearchableDropdown 
              id="subRegionName"
              value={subRegionName}
              onChange={(e) => setSubRegionName(e.target.value)}
              options={subregionOptions}
              placeholder="Select subregion"
              noOptionsText="No subregions found"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">
              <FaPhone className="icon" /> Contact Number
            </label>
            <input 
              type="tel" 
              id="phoneNumber" 
              placeholder="Enter contact number" 
              required 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Email
            </label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        {regError && <p className="error-message">{regError}</p>}
        <button type="submit" className="submit-btn">Register</button>
      </form>
    </div>
  );
};

export default DistributorRegistration;
