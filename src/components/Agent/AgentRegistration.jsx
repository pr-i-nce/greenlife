import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
  FaUser,
  FaIdBadge,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import apiClient from '../apiClient';
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

const AgentsRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    phoneNumber: '',
    subRegion: '',
    distributor: ''
  });
  const [regError, setRegError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [subregions, setSubregions] = useState([]);

  // Map field keys to display names
  const fieldNames = {
    firstName: 'First Name',
    lastName: 'Last Name',
    idNumber: 'ID Number',
    email: 'Email',
    phoneNumber: 'Phone Number',
    subRegion: 'Area',
    distributor: 'Dealer'
  };

  const fetchDistributors = async () => {
    try {
      const { data } = await apiClient.get('/distributor/all');
      setDistributors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubregions = async () => {
    try {
      const { data } = await apiClient.get('/subregion/all');
      setSubregions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDistributors();
      fetchSubregions();
    }
  }, [accessToken]);

  const distributorOptions = distributors.map(dist => ({
    id: dist.id,
    label: dist.businessName,
    value: dist.businessName
  }));

  const subregionOptions = subregions.map(sub => ({
    id: sub.id,
    label: sub.subRegionName,
    value: sub.subRegionName
  }));

  // Use a simple loop over regData to check for missing values.
  // Also, for the email field, check its format inline.
  const validateRegistrationForm = () => {
    for (const [key, value] of Object.entries(regData)) {
      if (!value.trim()) return `${fieldNames[key] || key} is required.`;
      if (key === 'email' && (!value.includes('@') || !value.includes('.')))
        return "Please enter a valid email address.";
    }
    return "";
  };

  const clearRegistrationForm = () => {
    setRegData({
      firstName: '',
      lastName: '',
      idNumber: '',
      email: '',
      phoneNumber: '',
      subRegion: '',
      distributor: ''
    });
    setRegError('');
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.id]: e.target.value });
  };

  const showAlert = (icon, title, text) => Swal.fire({ icon, title, text });
  const showLoadingSpinner = () => {
    Swal.fire({
      title: 'Loading...',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  };
  const closeLoadingSpinner = () => Swal.close();

  const submitRegistration = (payload) =>
    apiClient.post('/agent', payload, { headers: { 'Content-Type': 'application/json' } });

  // Refactored to reduce branching and lines.
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    const error = validateRegistrationForm();
    if (error) {
      setRegError(error);
      return showAlert('error', 'Validation Error', error);
    }
    setRegError('');
    setIsLoading(true);
    showLoadingSpinner();
    try {
      const { data } = await submitRegistration({ ...regData });
      closeLoadingSpinner();
      await showAlert('success', 'Success', data);
      clearRegistrationForm();
      onClose();
      onRegistrationSuccess && onRegistrationSuccess();
    } catch (err) {
      closeLoadingSpinner();
      showAlert('error', 'Error', err.response?.data || "An error occurred while registering. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Agent Registration"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Agent Registration</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleRegistrationSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              <FaUser className="icon" /> First Name
            </label>
            <input type="text" id="firstName" placeholder="First name" value={regData.firstName} onChange={handleRegChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">
              <FaUser className="icon" /> Last Name
            </label>
            <input type="text" id="lastName" placeholder="Last name" value={regData.lastName} onChange={handleRegChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="idNumber">
              <FaIdBadge className="icon" /> ID Number
            </label>
            <input type="text" id="idNumber" placeholder="ID number" value={regData.idNumber} onChange={handleRegChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Email
            </label>
            <input type="email" id="email" placeholder="Email" value={regData.email} onChange={handleRegChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phoneNumber">
              <FaPhone className="icon" /> Phone
            </label>
            <input type="tel" id="phoneNumber" placeholder="Phone number" value={regData.phoneNumber} onChange={handleRegChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="subRegion">
              <FaMapMarkerAlt className="icon" /> Area
            </label>
            <SearchableDropdown 
              id="subRegion"
              value={regData.subRegion}
              onChange={handleRegChange}
              options={subregionOptions}
              placeholder="Select Area"
              noOptionsText="No subregions found"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="distributor">
              <FaIdBadge className="icon" /> Dealer
            </label>
            <SearchableDropdown 
              id="distributor"
              value={regData.distributor}
              onChange={handleRegChange}
              options={distributorOptions}
              placeholder="Select Dealer"
              noOptionsText="No distributors found"
            />
          </div>
        </div>
        {regError && <p className="error-message">{regError}</p>}
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register Agent'}
        </button>
      </form>
    </div>
  );
};

export default AgentsRegistration;
