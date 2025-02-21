import React, { useState, useContext } from 'react';
import swal from 'sweetalert';
import { FaPercentage } from 'react-icons/fa';
import GenericModal from '../GenericModal';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';

const CommissionRegister = ({ onClose, onRegisterSuccess }) => {
  const { accessToken } = useContext(GlobalContext);
  const [commissionType, setCommissionType] = useState("");
  const [initialCommission, setInitialCommission] = useState("");
  const [lastCommission, setLastCommission] = useState("");
  const [regError, setRegError] = useState("");

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!commissionType.trim() || !initialCommission.trim() || !lastCommission.trim()) {
      setRegError("All fields are required.");
      swal({ title: "Validation Error", text: "All fields are required.", icon: "error", button: "OK" });
      return;
    }
    setRegError("");
    const payload = {
      commissionType,
      initialCommission: parseFloat(initialCommission),
      lastCommission: parseFloat(lastCommission)
    };
    try {
      const response = await fetch("https://jituze.greenlife.co.ke/rest/commission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      if (response.ok) {
        swal({ icon: "success", title: "Success" }).then(() => {
          setCommissionType("");
          setInitialCommission("");
          setLastCommission("");
          onRegisterSuccess();
        });
      } else {
        swal({ icon: "error", title: "Error", text: responseText });
      }
    } catch (err) {
      swal({ icon: "error", title: "Error", text: "An error occurred while registering. Please try again." });
    }
  };

  return (
    <GenericModal onClose={onClose}>
      <div className="rm-container">
        <div className="rm-header">
          <img 
            src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Commission Settings" 
            className="rm-header-image" 
          />
          <div className="rm-header-overlay">
            <h2>Set Commission</h2>
          </div>
        </div>
        <form className="rm-form" onSubmit={handleRegistrationSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="commissionType">
                <FaPercentage className="icon" /> Commission Type
              </label>
              <input 
                type="text" 
                id="commissionType" 
                placeholder="Enter commission type" 
                value={commissionType} 
                onChange={(e) => setCommissionType(e.target.value)} 
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
                value={initialCommission} 
                onChange={(e) => setInitialCommission(e.target.value)} 
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
                value={lastCommission} 
                onChange={(e) => setLastCommission(e.target.value)} 
                required 
              />
            </div>
          </div>
          {regError && <p className="error-message">{regError}</p>}
          <button type="submit" className="submit-btn">Set Commission</button>
        </form>
      </div>
    </GenericModal>
  );
};

export default CommissionRegister;
