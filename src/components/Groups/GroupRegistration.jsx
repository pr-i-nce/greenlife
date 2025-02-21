import React, { useState, useContext } from 'react';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';
import { GlobalContext } from '../../components/GlobalContext';

const GroupRegistration = ({ onClose, onRegistrationSuccess }) => {
  const { accessToken } = useContext(GlobalContext);
  const [formData, setFormData] = useState({ groupName: '', groupId: '' });
  const [error, setError] = useState('');
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.groupName.trim() || !formData.groupId.trim()) {
      setError('All fields are required.');
      swal({ title: 'Validation Error', text: 'All fields are required.', icon: 'error', button: 'OK' });
      return;
    }
    setError('');
    try {
      const response = await fetch('https://jituze.greenlife.co.ke/rest/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(formData)
      });
      const responseText = await response.text();
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Success', text: "Group registered successfully!", confirmButtonColor: '#2B9843' }).then(() => {
          setFormData({ groupName: '', groupId: '' });
          onClose();
          if (onRegistrationSuccess) onRegistrationSuccess();
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: responseText });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Error creating group' });
    }
  };
  return (
    <div className="region-container">
      <div className="region-header">
        <img src="https://images.pexels.com/photos/3184634/pexels-photo-3184634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Group Registration" className="region-header-image" />
        <div className="region-header-overlay">
          <h2>Group Registration</h2>
        </div>
      </div>
      <form className="region-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupName"><FaClipboardList className="icon" /> Group Name</label>
            <input type="text" id="groupName" placeholder="Enter group name" value={formData.groupName} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupId"><FaClipboardList className="icon" /> Group Id</label>
            <input type="text" id="groupId" placeholder="Enter group id" value={formData.groupId} onChange={handleChange} required />
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn">Register Group</button>
      </form>
    </div>
  );
};

export default GroupRegistration;
