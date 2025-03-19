import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import GenericModal from '../GenericModal';
import CategoryRegistration from './CategoryRegister';
import { useSelector } from 'react-redux';
import apiClient from '../apiClient';
import '../../styles/registeredTables.css';
import { usePagination } from '../PaginationContext';
import { FaArrowLeft } from 'react-icons/fa';

function CategoryTable({ onBack }) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  //const groupData = useSelector((state) => state.auth.groupData);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [registerMode, setRegisterMode] = useState(false);

  const { pages, setPageForTab, rowsPerPage } = usePagination();
  const currentPage = pages.all || 1;

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/category/all');
      setCategories(data);
    } catch (err) {
      // Handle error if needed
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [accessToken]);

  useEffect(() => {
    setPageForTab('all', 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const filteredCategories = categories.filter(category =>
    (category.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = async (category) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `To confirm deletion of "${category.categoryName}", please type "yes" below:`,
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
          const { data: responseText } = await apiClient.delete(`/category/delete?id=${category.id}`);
          Swal.fire('Deleted!', responseText, 'success');
          setCategories(categories.filter(c => c.id !== category.id));
        } catch (err) {
          Swal.fire('Error', err.response?.data || err.message, 'error');
        }
      }
    });
  };

  if (registerMode) {
    return (
      <GenericModal onClose={() => setRegisterMode(false)}>
        <CategoryRegistration onClose={() => setRegisterMode(false)} onRegistrationSuccess={fetchCategories} />
      </GenericModal>
    );
  }

  return (
    <div className="registered-table">
      <div className="table-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Categories"
          className="header-image"
        />
        <div className="header-overlay">
          <h2>Registered Categories</h2>
        </div>
      </div>
      <div className="table-content">
        <div className="table-controls">
          <button 
            className="modal-close-btn" 
            onClick={onBack}
            style={{ margin: '1rem' }}
          >
            <FaArrowLeft className="icon" /> Back
          </button>
          <button
            className="register-btn"
            onClick={() => {
              setRegisterMode(true);
            }}
          >
            Register Category
          </button>
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category, index) => (
                <tr key={category.id}>
                  <td data-label="SN">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td data-label="Category Name">{category.category}</td>
                  <td data-label="Actions">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        handleDelete(category);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">No categories found</td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredCategories.length >= rowsPerPage && (
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPageForTab('all', page)}
                style={{
                  margin: '0 5px',
                  padding: '5px 10px',
                  backgroundColor: currentPage === page ? '#0a803e' : '#f0f0f0',
                  color: currentPage === page ? '#fff' : '#000',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryTable;
