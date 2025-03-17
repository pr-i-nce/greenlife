import React from 'react';
import '../../styles/registeredTables.css';

const ProductView = ({ record }) => {
  const displayValue = (value) =>
    value !== null && value !== undefined && String(value).trim() !== '' ? value : 'null';

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img 
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="View Product" 
          className="rm-header-image" 
        />
        <div className="rm-header-overlay">
          <h2>Product Details</h2>
        </div>
      </div>
      <div className="rm-form">
        <div className="form-row">
          <div className="form-group">
            <label>ID:</label>
            <input type="text" value={displayValue(record.id)} readOnly />
          </div>
          <div className="form-group">
            <label>Product Description:</label>
            <input type="text" value={displayValue(record.productDescription)} readOnly />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price:</label>
            <input type="text" value={displayValue(record.price)} readOnly />
          </div>
          <div className="form-group">
            <label>Unit:</label>
            <input type="text" value={displayValue(record.unit)} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
