import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
  FaBuilding,
  FaMapMarkedAlt,
  FaPhone,
  FaEnvelope,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import apiClient, { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

const DistributorUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [updateError, setUpdateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(record?.active || false);
  const [regData, setRegData] = useState({
    businessName: '',
    regionName: '',
    subRegionName: '',
    phoneNumber: '',
    email: '',
    kraPin: ''
  });
  
  const [regions, setRegions] = useState([]);
  const [subregions, setSubregions] = useState([]);

  const [regionOpen, setRegionOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const regionDropdownRef = useRef(null);

  const [subOpen, setSubOpen] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const subDropdownRef = useRef(null);

  const fetchRegions = async () => {
    try {
      const { data } = await apiClient.get('/region/all');
      setRegions(data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load regions.' });
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
    if (accessToken) {
      fetchRegions();
      fetchSubregions();
    }
  }, [accessToken]);

  useEffect(() => {
    if (record) {
      setRegData({
        businessName: record.businessName || '',
        regionName: record.regionName || '',
        subRegionName: record.subRegionName || '',
        phoneNumber: record.phoneNumber || '',
        email: record.email || '',
        kraPin: record.kraPin || ''
      });
      setIsActive(record.active);
    }
  }, [record]);

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

  const handleChange = (e) => {
    setRegData({ ...regData, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    const { businessName, regionName, subRegionName, phoneNumber, email, kraPin } = regData;
    if (
      !businessName.trim() ||
      !regionName.trim() ||
      !subRegionName.trim() ||
      !phoneNumber.trim() ||
      !email.trim() ||
      !kraPin.trim()
    ) {
      return 'All fields are required.';
    }
    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleStatusToggle = async () => {
    const newStatus = !isActive;
    const actionLabel = newStatus ? "Activate" : "Deactivate";
    const result = await Swal.fire({
      title: `Confirm ${actionLabel}`,
      text: `Are you sure you want to ${actionLabel.toLowerCase()} this distributor?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel}`,
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        const { data: responseText } = await apiClient.put('/distributor/status', null, {
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
    const payload = { ...regData, active: isActive };
    try {
      const response = await apiClient.put('/distributor/update', payload, {
        params: { email: regData.email },
        headers: { 'Content-Type': 'application/json' }
      });
      const responseText = response.businessName;
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({ icon: 'success', title: 'Successfully updated Dealer', text: responseText }).then(() => {
          onClose();
          if (onUpdateSuccess) onUpdateSuccess();
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: responseText });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data || 'An error occurred while updating. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutsideRegion = (e) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target)) {
        setRegionOpen(false);
        setRegionSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutsideRegion);
    return () => document.removeEventListener('mousedown', handleClickOutsideRegion);
  }, []);

  const renderRegionDropdown = () => {
    const filteredRegions = regionOptions.filter(option =>
      option.label.toLowerCase().includes(regionSearch.toLowerCase())
    );
    return (
      <div className="searchable-dropdown" ref={regionDropdownRef}>
        <div className="dropdown-selected" onClick={() => setRegionOpen(!regionOpen)}>
          {regData.regionName
            ? regionOptions.find(opt => opt.value === regData.regionName)?.label
            : 'Select Region'}
          <span className="dropdown-arrow">&#9662;</span>
        </div>
        {regionOpen && (
          <div className="dropdown-menu">
            <input 
              type="text"
              className="dropdown-search"
              placeholder="Search..."
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
              autoFocus
            />
            <ul className="dropdown-list">
              {filteredRegions.length > 0 ? (
                filteredRegions.map(option => (
                  <li key={option.id} onMouseDown={() => {
                    setRegData({ ...regData, regionName: option.value });
                    setRegionOpen(false);
                    setRegionSearch('');
                  }}>
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="no-options">No regions found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
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

  const renderSubregionDropdown = () => {
    const filteredSubregions = subregionOptions.filter(option =>
      option.label.toLowerCase().includes(subSearch.toLowerCase())
    );
    return (
      <div className="searchable-dropdown" ref={subDropdownRef}>
        <div className="dropdown-selected" onClick={() => setSubOpen(!subOpen)}>
          {regData.subRegionName
            ? subregionOptions.find(opt => opt.value === regData.subRegionName)?.label
            : 'Select Subregion'}
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
              {filteredSubregions.length > 0 ? (
                filteredSubregions.map(option => (
                  <li key={option.id} onMouseDown={() => {
                    setRegData({ ...regData, subRegionName: option.value });
                    setSubOpen(false);
                    setSubSearch('');
                  }}>
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="no-options">No Areas found</li>
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
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Distributor Update"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Update Dealer</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleUpdateSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="businessName">
              <FaBuilding className="icon" /> Business Name
            </label>
            <input
              type="text"
              id="businessName"
              placeholder="Enter business name"
              value={regData.businessName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="regionName">
              <FaMapMarkedAlt className="icon" /> Region
            </label>
            {renderRegionDropdown()}
          </div>
          <div className="form-group">
            <label htmlFor="subRegionName">
              <FaMapMarkedAlt className="icon" /> Area
            </label>
            {renderSubregionDropdown()}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phoneNumber">
              <FaPhone className="icon" /> Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Enter phone number"
              value={regData.phoneNumber}
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
              placeholder="Enter email"
              value={regData.email}
              onChange={handleChange}
              required
            />
          </div> */}
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="kraPin">KRA PIN</label>
            <input 
              type="text" 
              id="kraPin" 
              placeholder="Enter KRA PIN" 
              value={regData.kraPin}
              onChange={handleChange}
              required
            />
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
          {isLoading ? 'Updating...' : 'Update Distributor'}
        </button>
      </form>
    </div>
  );
};

export default DistributorUpdate;
