import React, { useState } from 'react';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { FaClipboardList } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';
import apiClient from '../apiClient';

const CategoryRegistration = ({ onClose, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({ category: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category.trim()) {
      setError('Category name is required.');
      swal({ title: 'Validation Error', text: 'Category name is required.', icon: 'error', button: 'OK' });
      return;
    }
    setError('');
    try {
      const response = await apiClient.post('/category', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      const responseText = response.data;
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({ 
          icon: 'success', 
          title: 'Success', 
          text: "Category registered successfully!", 
          confirmButtonColor: '#2B9843' 
        }).then(() => {
          setFormData({ category: '' });
          onClose();
          if (onRegistrationSuccess) onRegistrationSuccess();
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: responseText });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data || err.message || 'Error creating category' });
    }
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img 
          src="https://images.pexels.com/photos/3184634/pexels-photo-3184634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Category Registration" 
          className="rm-header-image" 
        />
        <div className="rm-header-overlay">
          <h2>Category Registration</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              <FaClipboardList className="icon" /> Category Name
            </label>
            <input 
              type="text" 
              id="category" 
              placeholder="Enter category name" 
              value={formData.category} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn">
          Register Category
        </button>
      </form>
    </div>
  );
};

export default CategoryRegistration;
