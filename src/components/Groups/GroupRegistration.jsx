import React, { useState } from 'react';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { FaClipboardList } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';
import apiClient from '../apiClient';

const GroupRegistration = ({ onClose, onRegistrationSuccess }) => {
  // const accessToken = useSelector((state) => state.auth.accessToken);
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
      const response = await apiClient.post('/group', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      const responseText = response.data;
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({ 
          icon: 'success', 
          title: 'Success', 
          text: "Group registered successfully!", 
          confirmButtonColor: '#2B9843' 
        }).then(() => {
          setFormData({ groupName: '', groupId: '' });
          onClose();
          if (onRegistrationSuccess) onRegistrationSuccess();
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: responseText });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data || err.message || 'Error creating group' });
    }
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img 
          src="https://images.pexels.com/photos/3184634/pexels-photo-3184634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Group Registration" 
          className="rm-header-image" 
        />
        <div className="rm-header-overlay">
          <h2>Group Registration</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupName">
              <FaClipboardList className="icon" /> Group Name
            </label>
            <input 
              type="text" 
              id="groupName" 
              placeholder="Enter group name" 
              value={formData.groupName} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupId">
              <FaClipboardList className="icon" /> Group Id
            </label>
            <input 
              type="text" 
              id="groupId" 
              placeholder="Enter group id" 
              value={formData.groupId} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn">
          Register Group
        </button>
      </form>
    </div>
  );
};

export default GroupRegistration;
