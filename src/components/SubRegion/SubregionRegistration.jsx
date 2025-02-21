import React, { useState, useContext } from 'react';
import swal from 'sweetalert';
import { FaClipboardList, FaMapMarkerAlt } from 'react-icons/fa';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';

const SubregionRegistration = ({ onClose, onRegistrationSuccess }) => {
  const { accessToken } = useContext(GlobalContext);
  const [formData, setFormData] = useState({ subRegionName: "", subRegionCode: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subRegionName.trim() || !formData.subRegionCode.trim()) {
      setError("All fields are required.");
      swal({ title: "Validation Error", text: "All fields are required.", icon: "error", button: "OK" });
      return;
    }
    setError("");
    const payload = { subRegionName: formData.subRegionName, subRegionCode: formData.subRegionCode };
    try {
      const response = await fetch("https://jituze.greenlife.co.ke/rest/subregion", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      if (response.ok) {
        swal({ icon: "success", title: "Success", text: responseText, confirmButtonColor: "#2B9843" }).then(() => {
          setFormData({ subRegionName: "", subRegionCode: "" });
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
    <div 
      className="subregion-container" 
      style={{ overflowY: "auto", maxHeight: "90vh" }} 
    >
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
