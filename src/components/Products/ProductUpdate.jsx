import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import apiClient from '../apiClient';
import '../../styles/registeredTables.css';

const ProductUpdate = ({ record, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({ productDescription: '', price: '', unit: '', category: '' });
  const [updating, setUpdating] = useState(false);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    setFormData({
      productDescription: record.productDescription || '',
      price: record.price || '',
      unit: record.unit || '',
      category: record.category || ''
    });
  }, [record]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get('/category/all');
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const response = await apiClient.put(`/product/update?id=${record.id}`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      const responseText = response.data;
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({ icon: 'success', title: 'Update Successful', text: "Product updated successfully!" });
        onClose();
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        Swal.fire({ icon: 'error', title: 'Update Failed', text: responseText });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.response?.data || err.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img 
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Update Product" 
          className="rm-header-image" 
        />
        <div className="rm-header-overlay">
          <h2>Update Product</h2>
        </div>
      </div>
      <form className="rm-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="productDescription">Product Description</label>
            <input 
              type="text" 
              id="productDescription" 
              placeholder="Enter product description" 
              value={formData.productDescription} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input 
              type="number" 
              id="price" 
              placeholder="Enter price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input 
              type="text" 
              id="unit" 
              placeholder="Enter unit" 
              value={formData.unit} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category" 
              value={formData.category} 
              onChange={handleChange} 
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.category}>{cat.category}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="submit-btn" disabled={updating}>
          {updating ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductUpdate;