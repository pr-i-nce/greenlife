import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaPercentage } from 'react-icons/fa';
import GenericModal from '../GenericModal';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';

const CommissionUpdate = ({ commission, onClose, onUpdateSuccess }) => {
  const { accessToken } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    commissionType: "",
    initialCommission: "",
    lastCommission: ""
  });
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (commission) {
      setFormData({
        commissionType: commission.commissionType || "",
        initialCommission: commission.initialCommission || "",
        lastCommission: commission.lastCommission || ""
      });
    }
  }, [commission]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.commissionType.trim() ||
      formData.initialCommission === "" ||
      formData.lastCommission === ""
    ) {
      setUpdateError("All fields are required.");
      Swal.fire({
        icon: "error",
        title: "Update Error",
        text: "All fields are required."
      });
      return;
    }

    setUpdateError("");
    const updatedData = {
      commissionType: formData.commissionType,
      initialCommission: parseFloat(formData.initialCommission),
      lastCommission: parseFloat(formData.lastCommission)
    };

    try {
      setUpdating(true);
      const response = await fetch(
        `https://jituze.greenlife.co.ke/rest/commission/update?commissionType=${encodeURIComponent(formData.commissionType)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(updatedData)
        }
      );

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Update failed");
      }

      const updatedRecord = await response.json();

      Swal.fire({
        icon: "success",
        title: "Update Successful",
        text: "Commission updated successfully!"
      }).then(() => {
        onUpdateSuccess(updatedRecord);
      });
    } catch (err) {
      setUpdateError(err.message);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <GenericModal onClose={onClose}>
      <div className="rm-container">
        <div className="rm-header">
          <img
            src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Commission Settings"
            className="rm-header-image"
          />
          <div className="rm-header-overlay">
            <h2>Update Commission</h2>
          </div>
        </div>
        <form className="rm-form" onSubmit={handleUpdateSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="commissionType">
                <FaPercentage className="icon" /> Commission Type
              </label>
              <input
                type="text"
                id="commissionType"
                placeholder="Enter commission type"
                value={formData.commissionType}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="initialCommission">
                <FaPercentage className="icon" /> First Commission (%)
              </label>
              <input
                type="text"
                id="initialCommission"
                placeholder="Enter initial commission percentage"
                value={formData.initialCommission}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastCommission">
                <FaPercentage className="icon" /> Second Commission (%)
              </label>
              <input
                type="text"
                id="lastCommission"
                placeholder="Enter last commission percentage"
                value={formData.lastCommission}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {updateError && <p className="error-message">{updateError}</p>}
          <button type="submit" className="submit-btn" disabled={updating}>
            {updating ? 'Updating...' : 'Update Commission'}
          </button>
        </form>
      </div>
    </GenericModal>
  );
};

export default CommissionUpdate;
