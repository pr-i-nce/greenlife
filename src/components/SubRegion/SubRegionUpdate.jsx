import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaClipboardList, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';

const SubregionUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const { accessToken } = useContext(GlobalContext);
  const [formData, setFormData] = useState({ subRegionName: "", subRegionCode: "" });
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    setFormData({
      subRegionName: record.subRegionName || "",
      subRegionCode: record.subRegionCode || ""
    });
  }, [record]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subRegionName.trim() || !formData.subRegionCode.trim()) {
      setUpdateError("All fields are required.");
      Swal.fire({ icon: "error", title: "Update Error", text: "All fields are required." });
      return;
    }
    setUpdateError("");
    const payload = { subRegionName: formData.subRegionName, subRegionCode: formData.subRegionCode };
    try {
      setUpdating(true);
      const response = await fetch(`https://jituze.greenlife.co.ke/rest/subregion/update?subRegionCode=${encodeURIComponent(record.subRegionCode)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Update failed");
      }
      const updatedRecord = await response.json();
      setUpdateError("");
      onClose();
      if (onUpdateSuccess) onUpdateSuccess();
      Swal.fire({ icon: "success", title: "Update Successful", text: "Subregion updated successfully!", confirmButtonColor: "#2B9843" });
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
        <img src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Update Subregion" className="subregion-header-image" />
        <div className="subregion-header-overlay">
          <h2>Update Subregion</h2>
        </div>
      </div>
      <form className="subregion-form" onSubmit={handleSubmit}>
        <div className="grid-container">
          <div className="grid-item">
            <label htmlFor="subRegionName"><FaClipboardList className="icon" /> Subregion Name</label>
            <input type="text" id="subRegionName" placeholder="Enter subregion name" value={formData.subRegionName} onChange={handleChange} required />
          </div>
          <div className="grid-item">
            <label htmlFor="subRegionCode"><FaMapMarkerAlt className="icon" /> Subregion Code</label>
            <input type="text" id="subRegionCode" placeholder="Enter subregion code" value={formData.subRegionCode} onChange={handleChange} required />
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
