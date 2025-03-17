import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
  FaUser,
  FaIdBadge,
  FaPhone,
  FaMapMarkerAlt,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import apiClient from '../apiClient';
import '../../styles/registeredTables.css';

const AgentsUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const [updateError, setUpdateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(record?.active || false);
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    phoneNumber: '',
    subRegion: '',
    distributor: ''
  });
  const [distributors, setDistributors] = useState([]);
  const [subregions, setSubregions] = useState([]);

  const [subOpen, setSubOpen] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const subDropdownRef = useRef(null);

  const [distOpen, setDistOpen] = useState(false);
  const [distSearch, setDistSearch] = useState('');
  const distDropdownRef = useRef(null);

  const fetchDistributors = async () => {
    try {
      const { data } = await apiClient.get('/distributor/all');
      setDistributors(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load distributors.' });
    }
  };

  const fetchSubregions = async () => {
    try {
      const { data } = await apiClient.get('/subregion/all');
      setSubregions(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load subregions.' });
    }
  };

  useEffect(() => {
    fetchDistributors();
    fetchSubregions();
  }, []);

  useEffect(() => {
    if (record) {
      setRegData({
        firstName: record.firstName || '',
        lastName: record.lastName || '',
        idNumber: record.idNumber || '',
        email: record.email || '',
        phoneNumber: record.phoneNumber || '',
        subRegion: record.subRegion || '',
        distributor: record.distributor || ''
      });
      setIsActive(record.active);
    }
  }, [record]);

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

  const handleChange = (e) => {
    setRegData({ ...regData, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    const { firstName, lastName, idNumber, email, phoneNumber, subRegion, distributor } = regData;
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !idNumber.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !subRegion.trim() ||
      !distributor.trim()
    ) {
      return 'All fields are required.';
    }
    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  // Status toggle handler – after successful update, call onClose and onUpdateSuccess to refresh table
  const handleStatusToggle = async () => {
    const newStatus = !isActive;
    const actionLabel = newStatus ? "Activate" : "Deactivate";
    const result = await Swal.fire({
      title: `Confirm ${actionLabel}`,
      text: `Are you sure you want to ${actionLabel.toLowerCase()} this agent?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel}`,
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        const { data: responseText } = await apiClient.put('/agent/status', null, {
          params: { email: regData.email, active: newStatus }
        });
        setIsActive(newStatus);
        Swal.fire({ icon: 'success', title: 'Status Updated', text: responseText }).then(() => {
          onClose();
          if (onUpdateSuccess) onUpdateSuccess();
        });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Status Update Failed', text: err.response?.data || err.message });
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    const errorMsg = validateForm();
    if (errorMsg) {
      setUpdateError(errorMsg);
      Swal.fire({ icon: 'error', title: 'Validation Error', text: errorMsg });
      return;
    }
    setUpdateError('');
    setIsLoading(true);
    
    // Show SweetAlert2 loading spinner for backend delay
    Swal.fire({
      title: 'Loading...',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const payload = { ...regData, active: isActive };
    try {
      await apiClient.put('/agent/update', payload, {
        params: { email: regData.email },
        headers: { 'Content-Type': 'application/json' }
      });
      Swal.close();
      Swal.fire({ icon: 'success', title: 'Successfully updated' }).then(() => {
        onClose();
        if (onUpdateSuccess) onUpdateSuccess();
      });
    } catch (err) {
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data || "An error occurred while updating. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutsideSub = (e) => {
      if (subDropdownRef.current && !subDropdownRef.current.contains(e.target)) {
        setSubOpen(false);
        setSubSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutsideSub);
    return () => document.removeEventListener('mousedown', handleClickOutsideSub);
  }, []);

  useEffect(() => {
    const handleClickOutsideDist = (e) => {
      if (distDropdownRef.current && !distDropdownRef.current.contains(e.target)) {
        setDistOpen(false);
        setDistSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutsideDist);
    return () => document.removeEventListener('mousedown', handleClickOutsideDist);
  }, []);

  const renderSubRegionDropdown = () => {
    const filtered = subregionOptions.filter(option =>
      option.label.toLowerCase().includes(subSearch.toLowerCase())
    );
    return (
      <div className="searchable-dropdown" ref={subDropdownRef}>
        <div className="dropdown-selected" onClick={() => setSubOpen(!subOpen)}>
          {regData.subRegion
            ? subregionOptions.find(opt => opt.value === regData.subRegion)?.label
            : 'Select Sub-Region'}
          <span className="dropdown-arrow">&#9662;</span>
        </div>
        {subOpen && (
          <div className="dropdown-menu">
            <input 
              type="text"
              className="dropdown-search"
              placeholder="Search..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              autoFocus
            />
            <ul className="dropdown-list">
              {filtered.length > 0 ? (
                filtered.map(option => (
                  <li key={option.id} onMouseDown={() => {
                    setRegData({ ...regData, subRegion: option.value });
                    setSubOpen(false);
                    setSubSearch('');
                  }}>
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="no-options">No areas found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderDistributorDropdown = () => {
    const filtered = distributorOptions.filter(option =>
      option.label.toLowerCase().includes(distSearch.toLowerCase())
    );
    return (
      <div className="searchable-dropdown" ref={distDropdownRef}>
        <div className="dropdown-selected" onClick={() => setDistOpen(!distOpen)}>
          {regData.distributor
            ? distributorOptions.find(opt => opt.value === regData.distributor)?.label
            : 'Select Distributor'}
          <span className="dropdown-arrow">&#9662;</span>
        </div>
        {distOpen && (
          <div className="dropdown-menu">
            <input 
              type="text"
              className="dropdown-search"
              placeholder="Search..."
              value={distSearch}
              onChange={(e) => setDistSearch(e.target.value)}
              autoFocus
            />
            <ul className="dropdown-list">
              {filtered.length > 0 ? (
                filtered.map(option => (
                  <li key={option.id} onMouseDown={() => {
                    setRegData({ ...regData, distributor: option.value });
                    setDistOpen(false);
                    setDistSearch('');
                  }}>
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="no-options">No dealers found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Agent Update"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Update Agent</h2>
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
              placeholder="First name"
              value={regData.firstName}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          </div>
          {/* <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={regData.email}
              onChange={handleChange}
              required
            />
          </div> */}
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
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="subRegion">
              <FaMapMarkerAlt className="icon" /> Area
            </label>
            {renderSubRegionDropdown()}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="distributor">
              <FaIdBadge className="icon" /> Dealer
            </label>
            {renderDistributorDropdown()}
          </div>
        </div>
        <div className="form-row">
          <button 
            type="button" 
            className="submit-btn" 
            onClick={handleStatusToggle}
          >
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
        {updateError && <p className="error-message">{updateError}</p>}
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Agent'}
        </button>
      </form>
    </div>
  );
};

export default AgentsUpdate;
