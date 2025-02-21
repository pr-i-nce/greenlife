import React from 'react';
import '../../styles/registeredTables.css';

const ProductDetails = ({ records, onClose }) => {
  const displayValue = (value) =>
    value !== null && value !== undefined && String(value).trim() !== '' ? value : 'N/A';

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="View Product"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Product Details</h2>
        </div>
      </div>
      <div className="rm-form">
        <table className="product-details-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Sold Unit(s)</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {records && records.length > 0 ? (
              records.map((record, index) => (
                <tr key={record.id || index}>
                  <td>{displayValue(record.id)}</td>
                  <td>{displayValue(record.productName)}</td>
                  <td>{displayValue(record.price)}</td>
                  <td>{displayValue(record.unit)}</td>
                  <td>{displayValue(record.createdBy)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="form-row" style={{ textAlign: 'center', marginTop: '10px' }}>
          <button type="button" onClick={onClose} className="submit-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
