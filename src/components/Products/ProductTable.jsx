import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import GenericModal from '../GenericModal';
import ProductRegistration from './ProductRegistration';
import ProductUpdate from './ProductUpdate';
import ProductView from './ProductView';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

function ProductTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const groupData = useSelector((state) => state.auth.groupData);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [registerMode, setRegisterMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/product/all`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [accessToken]);

  const filteredProducts = products.filter(product =>
    (product.productDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (product) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `To confirm deletion of "${product.productDescription}", please type "yes" below:`,
      input: 'text',
      inputPlaceholder: 'Type yes to confirm',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      preConfirm: (inputValue) => {
        if (inputValue !== 'yes') {
          Swal.showValidationMessage('You must type "yes" to confirm deletion.');
        }
        return inputValue;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value === 'yes') {
        try {
          const response = await fetch(`${BASE_URL}/product/${product.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const responseText = await response.text();
          if (response.ok) {
            Swal.fire('Deleted!', responseText, 'success');
            setProducts(products.filter(p => p.id !== product.id));
          } else {
            Swal.fire('Error', responseText, 'error');
          }
        } catch (err) {
          Swal.fire('Error', err.message, 'error');
        }
      }
    });
  };

  const handleView = (product) => {
    setViewRecord(product);
  };

  const handleEdit = (product) => {
    setEditingRecord(product);
  };

  if (registerMode) {
    return (
      <div className="rm-container">
        <GenericModal onClose={() => setRegisterMode(false)}>
          <ProductRegistration onClose={() => setRegisterMode(false)} onRegistrationSuccess={fetchProducts} />
        </GenericModal>
      </div>
    );
  }

  if (editingRecord) {
    return (
      <div className="rm-container">
        <GenericModal onClose={() => setEditingRecord(null)}>
          <ProductUpdate record={editingRecord} onClose={() => setEditingRecord(null)} onUpdateSuccess={fetchProducts} />
        </GenericModal>
      </div>
    );
  }

  if (viewRecord) {
    return (
      <div className="rm-container">
        <GenericModal onClose={() => setViewRecord(null)}>
          <ProductView record={viewRecord} onClose={() => setViewRecord(null)} />
        </GenericModal>
      </div>
    );
  }

  return (
    <div className="registered-table">
      <div className="table-header">
        <img src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Products" className="header-image" />
        <div className="header-overlay">
          <h2>Registered Products</h2>
        </div>
      </div>
      <div className="table-content">
        <div className="table-controls">
          <button
            className="register-btn"
            onClick={() => {
              if (!groupData?.permissions?.createProduct) {
                Swal.fire({
                  icon: 'error',
                  title: 'Access Denied',
                  text: 'You do not have permission to register a product.'
                });
                return;
              }
              setRegisterMode(true);
            }}
          >
            Register Product
          </button>
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Product Description</th>
              <th>Price</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr key={product.id}>
                  <td data-label="SN">{index + 1}</td>
                  <td data-label="Product Description">{product.productDescription}</td>
                  <td data-label="Price">{product.price}</td>
                  <td data-label="Unit">{product.unit}</td>
                  <td data-label="Actions">
                    <button
                      className="action-btn update-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.updateProduct) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: 'You do not have permission to update a product.'
                          });
                          return;
                        }
                        handleEdit(product);
                      }}
                    >
                      Update
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.deleteProduct) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: 'You do not have permission to delete a product.'
                          });
                          return;
                        }
                        handleDelete(product);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="action-btn view-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.readProduct) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: 'You do not have permission to view a product.'
                          });
                          return;
                        }
                        handleView(product);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
