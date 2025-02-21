import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaClipboardList, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';

const RegionsUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const { accessToken } = useContext(GlobalContext);
  const [formData, setFormData] = useState({ regionName: "", regionCode: "" });
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    setFormData({
      regionName: record.regionName || "",
      regionCode: record.regionCode || ""
    });
  }, [record]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.regionName.trim() || !formData.regionCode.trim()) {
      setError("All fields are required.");
      Swal.fire({ icon: "error", title: "Update Error", text: "All fields are required." });
      return;
    }
    setError("");
    const payload = { regionName: formData.regionName, regionCode: formData.regionCode };
    try {
      setUpdating(true);
      const response = await fetch(`https://jituze.greenlife.co.ke/rest/region/update?regionCode=${encodeURIComponent(record.regionCode)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Update failed");
      }
      const updatedRecord = await response.json();
      onClose();
      if (onUpdateSuccess) onUpdateSuccess();
      Swal.fire({ icon: "success", title: "Update Successful", text: "Region updated successfully!", confirmButtonColor: "#2B9843" });
    } catch (err) {
      setError(err.message);
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
    } finally {
      setUpdating(false);
    }
  };
  return (
    <div className="region-container">
      <div className="region-header">
        <img src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
             alt="Update Region" className="region-header-image" />
        <div className="region-header-overlay">
          <h2>Update Region</h2>
        </div>
      </div>
      <form className="region-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regionName"><FaClipboardList className="icon" /> Region Name</label>
            <input type="text" id="regionName" placeholder="Enter region name" value={formData.regionName} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="regionCode"><FaMapMarkerAlt className="icon" /> Region Code</label>
            <input type="text" id="regionCode" placeholder="Enter region code" value={formData.regionCode} onChange={handleChange} required />
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn" disabled={updating}>
          {updating ? "Updating..." : "Update Region"}
        </button>
      </form>
    </div>
  );
};

export default RegionsUpdate;
