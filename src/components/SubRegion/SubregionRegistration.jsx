import React, { useState, useEffect, useRef } from 'react';
import swal from 'sweetalert';
import { FaClipboardList, FaMapMarkerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

const SubregionRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [formData, setFormData] = useState({ subRegionName: "", subRegionCode: "", regionName: "" });
  const [error, setError] = useState("");
  const [regions, setRegions] = useState([]);

  // Dropdown state for Region
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

  // Fetch regions from backend
  const fetchRegions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/region/all`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error("Failed to fetch regions.");
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

  useEffect(() => {
    if (accessToken) {
      fetchRegions();
    }
  }, [accessToken]);

  // Filter regions based on search input
  const filteredRegions = regions.filter(region =>
    region.regionName.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  // Handle dropdown option selection
  const handleDropdownSelect = (regionName) => {
    setFormData({ ...formData, regionName });
    setDropdownOpen(false);
    setDropdownSearch("");
  };

  // Close dropdown when clicking outside
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
      const response = await fetch(`${BASE_URL}/subregion`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      if (response.ok) {
        swal({ icon: "success", title: "Success", text: responseText, confirmButtonColor: "#2B9843" })
          .then(() => {
            setFormData({ subRegionName: "", subRegionCode: "", regionName: "" });
            onClose();
            if (onRegistrationSuccess) onRegistrationSuccess();
          });
      } else {
        swal({ icon: "error", title: "Error", text: responseText });
      }
    } catch (err) {
      swal({ icon: "error", title: "Error", text: "An error occurred while registering. Please try again." });
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
          <h2>Subregion Registration</h2>
        </div>
      </div>
      <form className="subregion-form" onSubmit={handleSubmit}>
        {/* Region Dropdown */}
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
        {/* Subregion Name */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subRegionName">
              <FaClipboardList className="icon" /> Subregion Name
            </label>
            <input 
              type="text" 
              id="subRegionName" 
              placeholder="Enter subregion name" 
              value={formData.subRegionName}
              onChange={handleChange}
              required 
            />
          </div>
        </div>
        {/* Subregion Code */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subRegionCode">
              <FaMapMarkerAlt className="icon" /> Subregion Code
            </label>
            <input 
              type="text" 
              id="subRegionCode" 
              placeholder="Enter subregion code" 
              value={formData.subRegionCode}
              onChange={handleChange}
              required 
            />
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn">Register Subregion</button>
      </form>
    </div>
  );
};

export default SubregionRegistration;
