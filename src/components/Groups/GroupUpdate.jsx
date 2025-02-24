import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaClipboardList } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';

const GroupUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [formData, setFormData] = useState({ groupName: '', groupId: '' });
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setFormData({ groupName: record.groupName || '', groupId: record.groupId || '' });
  }, [record]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.groupName.trim() || !formData.groupId.trim()) {
      setError('All fields are required.');
      Swal.fire({ icon: 'error', title: 'Update Error', text: 'All fields are required.' });
      return;
    }
    setError('');
    try {
      setUpdating(true);
      const response = await fetch(`${BASE_URL}/group/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });
      const responseText = await response.text();
      if (response.ok) {
        onClose();
        if (onUpdateSuccess) onUpdateSuccess();
        Swal.fire({ icon: 'success', title: 'Update Successful', text: 'Group updated successfully!', confirmButtonColor: '#2B9843' });
      } else {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: responseText });
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="region-container">
      <div className="region-header">
        <img 
          src="https://images.pexels.com/photos/3184634/pexels-photo-3184634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Update Group" 
          className="region-header-image" 
        />
        <div className="region-header-overlay">
          <h2>Update Group</h2>
        </div>
      </div>
      <form className="region-form" onSubmit={handleSubmit}>
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
        <button type="submit" className="submit-btn" disabled={updating}>
          {updating ? 'Updating...' : 'Update Group'}
        </button>
      </form>
    </div>
  );
};

export default GroupUpdate;
