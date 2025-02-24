import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import GenericModal from '../GenericModal';
import RegionalManagerRegistration from './RegionalManagerRegistration';
import RegionalManagerUpdate from './RegionalManagerUpdate';
import RegionalManagerView from './RegionalManagerView';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

const RegionalManagersTable = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const groupData = useSelector((state) => state.auth.groupData);
  
  const [regionalManagers, setRegionalManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecordForUpdate, setSelectedRecordForUpdate] = useState(null);
  const [selectedRecordForView, setSelectedRecordForView] = useState(null);

  const fetchRegionalManagers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/region-manager/all`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch regional managers.');
      }
      const data = await response.json();
      setRegionalManagers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchRegionalManagers();
    }
  }, [accessToken]);

  const filteredRegionalManagers = regionalManagers.filter(manager => {
    const fullName = `${manager.firstName} ${manager.lastName}`.toLowerCase();
    const regionName = (manager.regionName || '').toLowerCase();
    const emailVal = (manager.email || '').toLowerCase();
    const groupName = (manager.groupName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      fullName.includes(term) ||
      regionName.includes(term) ||
      emailVal.includes(term) ||
      groupName.includes(term)
    );
  });

  const handleDelete = async (email) => {
    const manager = regionalManagers.find(m => m.email === email);
    if (!manager) {
      Swal.fire({ icon: "error", title: "Error", text: "Manager not found." });
      return;
    }
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete manager "${manager.firstName} ${manager.lastName}" with email "${manager.email}", please type "yes":`,
      icon: "warning",
      input: "text",
      inputPlaceholder: "Type yes to confirm",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#2B9843",
      preConfirm: (inputValue) => {
        if (inputValue !== "yes") {
          Swal.showValidationMessage('You must type "yes" to confirm deletion.');
        }
        return inputValue;
      }
    });
    if (result.isConfirmed && result.value === "yes") {
      try {
        const response = await fetch(`${BASE_URL}/region-manager/delete?email=${encodeURIComponent(email)}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Delete failed");
        }
        const successMessage = await response.text();
        Swal.fire({ icon: "success", title: "Deleted!", text: successMessage, confirmButtonColor: "#2B9843" });
        setRegionalManagers(regionalManagers.filter(m => m.email !== email));
      } catch (err) {
        Swal.fire({ icon: "error", title: "Delete Failed", text: err.message });
      }
    }
  };

  const handleEdit = (record) => {
    setSelectedRecordForUpdate(record);
    setShowUpdateModal(true);
  };

  const handleView = (record) => {
    setSelectedRecordForView(record);
    setShowViewModal(true);
  };

  if (loading) {
    return <div className="registered-table">Loading regional managers...</div>;
  }
  if (error) {
    return <div className="registered-table">Error: {error}</div>;
  }

  const isModalOpen = showRegistrationModal || showUpdateModal || showViewModal;

  return (
    <>
      {isModalOpen ? (
        <>
          {showRegistrationModal && (
            <GenericModal onClose={() => setShowRegistrationModal(false)}>
              <RegionalManagerRegistration 
                onClose={() => setShowRegistrationModal(false)} 
                onRegistrationSuccess={fetchRegionalManagers} 
              />
            </GenericModal>
          )}
          {showUpdateModal && selectedRecordForUpdate && (
            <GenericModal onClose={() => { setShowUpdateModal(false); setSelectedRecordForUpdate(null); }}>
              <RegionalManagerUpdate 
                record={selectedRecordForUpdate} 
                onClose={() => { setShowUpdateModal(false); setSelectedRecordForUpdate(null); }} 
                onUpdateSuccess={fetchRegionalManagers} 
              />
            </GenericModal>
          )}
          {showViewModal && selectedRecordForView && (
            <GenericModal onClose={() => { setShowViewModal(false); setSelectedRecordForView(null); }}>
              <RegionalManagerView 
                record={selectedRecordForView} 
                onClose={() => { setShowViewModal(false); setSelectedRecordForView(null); }} 
              />
            </GenericModal>
          )}
        </>
      ) : (
        <div className="registered-table">
          <div className="table-header">
            <img 
              src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Regional Managers" 
              className="header-image" 
            />
            <div className="header-overlay">
              <h2>Regional Managers</h2>
            </div>
          </div>
          <div className="table-content">
            <div className="table-controls">
              <button 
                className="register-btn" 
                onClick={() => {
                  if (!groupData?.permissions?.createRegionManager) {
                    Swal.fire({ 
                      icon: 'error', 
                      title: 'Access Denied', 
                      text: 'You do not have permission to register a regional manager.' 
                    });
                    return;
                  }
                  setShowRegistrationModal(true);
                }}
              >
                Register
              </button>
            </div>
            <input 
              type="text"
              placeholder="Search by name, region, email or group..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Region</th>
                  <th>Group Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegionalManagers.map((manager, index) => (
                  <tr key={manager.id}>
                    <td data-label="SN">{index + 1}</td>
                    <td data-label="Full Name">{manager.firstName} {manager.lastName}</td>
                    <td data-label="Email">{manager.email}</td>
                    <td data-label="Region">{manager.regionName}</td>
                    <td data-label="Group Name">{manager.groupName}</td>
                    <td data-label="Status">
                      <span className={`status ${manager.active ? 'active' : 'inactive'}`}>
                        {manager.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <button 
                        className="action-btn update-btn" 
                        onClick={() => {
                          if (!groupData?.permissions?.updateRegionManager) {
                            Swal.fire({ 
                              icon: 'error', 
                              title: 'Access Denied', 
                              text: 'You do not have permission to update a regional manager.' 
                            });
                            return;
                          }
                          handleEdit(manager);
                        }}
                      >
                        Update
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => {
                          if (!groupData?.permissions?.deleteRegionManager) {
                            Swal.fire({ 
                              icon: 'error', 
                              title: 'Access Denied', 
                              text: 'You do not have permission to delete a regional manager.' 
                            });
                            return;
                          }
                          handleDelete(manager.email);
                        }}
                      >
                        Delete
                      </button>
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => {
                          if (!groupData?.permissions?.readRegionManager) {
                            Swal.fire({ 
                              icon: 'error', 
                              title: 'Access Denied', 
                              text: 'You do not have permission to view a regional manager.' 
                            });
                            return;
                          }
                          handleView(manager);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRegionalManagers.length === 0 && (
              <div className="no-data">No regional managers found</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RegionalManagersTable;
