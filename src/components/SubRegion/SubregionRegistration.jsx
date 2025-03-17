import React, { useState, useEffect, useRef } from 'react';
import swal from 'sweetalert';
import { FaClipboardList, FaMapMarkerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import apiClient from '../apiClient';
import '../../styles/registeredTables.css';

const SubregionRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [formData, setFormData] = useState({ subRegionName: "", subRegionCode: "", regionName: "" });
  const [error, setError] = useState("");
  const [regions, setRegions] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

  const fetchRegions = async () => {
    try {
      const { data } = await apiClient.get('/region/all');
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

  useEffect(() => {
    if (accessToken) {
      fetchRegions();
    }
  }, [accessToken]);

  const filteredRegions = regions.filter(region =>
    region.regionName.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const handleDropdownSelect = (regionName) => {
    setFormData({ ...formData, regionName });
    setDropdownOpen(false);
    setDropdownSearch("");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setDropdownSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.regionName.trim() || !formData.subRegionName.trim() || !formData.subRegionCode.trim()) {
      setError("All fields are required.");
      swal({ title: "Validation Error", text: "All fields are required.", icon: "error", button: "OK" });
      return;
    }
    setError("");
    const payload = { 
      subRegionName: formData.subRegionName, 
      subRegionCode: formData.subRegionCode,
      regionName: formData.regionName
    };
    try {
      const response = await apiClient.post('/subregion', payload, {
        headers: { "Content-Type": "application/json" }
      });
      const responseText = response.data;
      swal({ icon: "success", title: "Success", text: responseText, confirmButtonColor: "#2B9843" })
        .then(() => {
          setFormData({ subRegionName: "", subRegionCode: "", regionName: "" });
          onClose();
          if (onRegistrationSuccess) onRegistrationSuccess();
        });
    } catch (err) {
      swal({ icon: "error", title: "Error", text: err.response?.data || "An error occurred while registering. Please try again." });
    }
  };

  return (
    <div className="subregion-container" style={{ overflowY: "auto", maxHeight: "90vh" }}>
      <div className="subregion-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Subregion Registration"
          className="subregion-header-image"
        />
        <div className="subregion-header-overlay">
          <h2>Area Registration</h2>
        </div>
      </div>
      <form className="subregion-form" onSubmit={handleSubmit}>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regionName">Region</label>
            <div className="searchable-dropdown" ref={dropdownRef}>
              <div className="dropdown-selected" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {formData.regionName || "Select Region"}
                <span className="dropdown-arrow">&#9662;</span>
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <input 
                    type="text"
                    className="dropdown-search"
                    placeholder="Search..."
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    autoFocus
                  />
                  <ul className="dropdown-list">
                    {filteredRegions.length > 0 ? (
                      filteredRegions.map(region => (
                        <li key={region.id} onMouseDown={() => handleDropdownSelect(region.regionName)}>
                          {region.regionName}
                        </li>
                      ))
                    ) : (
                      <li className="no-options">No regions found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subRegionName">
              <FaClipboardList className="icon" /> Area Name
            </label>
            <input 
              type="text" 
              id="subRegionName" 
              placeholder="Enter area name" 
              value={formData.subRegionName}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subRegionCode">
              <FaMapMarkerAlt className="icon" /> Area Code
            </label>
            <input 
              type="text" 
              id="subRegionCode" 
              placeholder="Enter area code" 
              value={formData.subRegionCode}
              onChange={handleChange}
              required 
            />
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn">Register Area</button>
      </form>
    </div>
  );
};

export default SubregionRegistration;
