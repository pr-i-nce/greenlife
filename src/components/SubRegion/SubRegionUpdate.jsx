import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { FaClipboardList, FaMapMarkerAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

const SubregionUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [formData, setFormData] = useState({ subRegionName: "", subRegionCode: "", regionName: "" });
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [regions, setRegions] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

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
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load regions." });
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchRegions();
    }
  }, [accessToken]);

  useEffect(() => {
    setFormData({
      subRegionName: record.subRegionName || "",
      subRegionCode: record.subRegionCode || "",
      regionName: record.regionName || ""
    });
  }, [record]);

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
      setUpdateError("All fields are required.");
      Swal.fire({ icon: "error", title: "Update Error", text: "All fields are required." });
      return;
    }
    setUpdateError("");
    const payload = { 
      subRegionName: formData.subRegionName, 
      subRegionCode: formData.subRegionCode,
      regionName: formData.regionName
    };
    try {
      setUpdating(true);
      const response = await fetch(
        `${BASE_URL}/subregion/update?subRegionCode=${encodeURIComponent(record.subRegionCode)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Update failed");
      }
      const updatedRecord = await response.json();
      setUpdateError("");
      onClose();
      if (onUpdateSuccess) onUpdateSuccess();
      Swal.fire({
        icon: "success",
        title: "Update Successful",
        text: "Subregion updated successfully!",
        confirmButtonColor: "#2B9843"
      });
    } catch (err) {
      setUpdateError(err.message);
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="subregion-container">
      <div className="subregion-header">
        <img
          src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Update Subregion"
          className="subregion-header-image"
        />
        <div className="subregion-header-overlay">
          <h2>Update Area</h2>
        </div>
      </div>
      <form className="subregion-form" onSubmit={handleSubmit}>
        <div className="grid-container">

          <div className="grid-item">
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

          <div className="grid-item">
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

          <div className="grid-item">
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
        {updateError && <p className="error-message">{updateError}</p>}
        <button type="submit" className="submit-btn" disabled={updating}>
          {updating ? "Updating..." : "Update Subregion"}
        </button>
      </form>
    </div>
  );
};

export default SubregionUpdate;
