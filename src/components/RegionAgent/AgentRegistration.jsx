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

  const fetchDistributors = async () => {
    try {
      const { data } = await apiClient.get('/distributor/all');
      setDistributors(data);
      console.log("Distributors data:", data);
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

  // Combined validation: required field check and email format check.
  const validateRegistrationForm = () => {
    const validations = [
      { field: regData.firstName, name: 'First Name' },
      { field: regData.lastName, name: 'Last Name' },
      { field: regData.idNumber, name: 'ID Number' },
      { field: regData.email, name: 'Email' },
      { field: regData.phoneNumber, name: 'Phone Number' },
      { field: regData.subRegion, name: 'Area' },
      { field: regData.distributor, name: 'Dealer' }
    ];
    const missing = validations.find(v => !v.field.trim());
    if (missing) return `${missing.name} is required.`;
    if (!(regData.email.includes('@') && regData.email.includes('.'))) {
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

  // Helper functions for alerts and spinners
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

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    const error = validateRegistrationForm();
    if (error) {
      setRegError(error);
      showAlert('error', 'Validation Error', error);
      return;
    }
    setRegError('');
    setIsLoading(true);
    showLoadingSpinner();
    const payload = { ...regData };
    try {
      const { data: responseText } = await apiClient.post('/agent', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      closeLoadingSpinner();
      await showAlert('success', 'Success', responseText);
      clearRegistrationForm();
      onClose();
      if (onRegistrationSuccess) onRegistrationSuccess();
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
            <input
              type="text"
              id="firstName"
              placeholder="First name"
              value={regData.firstName}
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
              placeholder="Last name"
              value={regData.lastName}
              onChange={handleRegChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="idNumber">
              <FaIdBadge className="icon" /> ID Number
            </label>
            <input
              type="text"
              id="idNumber"
              placeholder="ID number"
              value={regData.idNumber}
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
              placeholder="Email"
              value={regData.email}
              onChange={handleRegChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phoneNumber">
              <FaPhone className="icon" /> Phone
            </label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Phone number"
              value={regData.phoneNumber}
              onChange={handleRegChange}
              required
            />
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
