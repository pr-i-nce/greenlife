import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import GenericModal from '../GenericModal';
import SubRegionalManagerRegistration from './SubRegionalManagerRegistration';
import SubRegionalManagerUpdate from './SubRegionalManagerUpdate';
import SubRegionalManagerView from './SubRegionalManagerView';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

const SubRegionalManagersTable = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const groupData = useSelector((state) => state.auth.groupData);
  const [subManagers, setSubManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  const fetchSubManagers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/sub-region-manager/all`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sub regional managers.');
      }
      const data = await response.json();
      setSubManagers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSubManagers();
    }
  }, [accessToken]);

  const filteredSubManagers = subManagers.filter(manager => {
    const fullName = `${manager.firstName} ${manager.lastName}`.toLowerCase();
    const regionName = (manager.regionName || '').toLowerCase();
    const subRegionName = (manager.subRegionName || '').toLowerCase();
    const emailVal = (manager.email || '').toLowerCase();
    const groupName = (manager.groupName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      fullName.includes(term) ||
      regionName.includes(term) ||
      subRegionName.includes(term) ||
      emailVal.includes(term) ||
      groupName.includes(term)
    );
  });

  const handleDelete = async (email) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the manager with email: ${email}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BASE_URL}/sub-region-manager/delete?email=${encodeURIComponent(email)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(errMsg || 'Delete failed');
          }
          const successMessage = await response.text();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: successMessage,
          });
          setSubManagers(subManagers.filter(manager => manager.email !== email));
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message,
          });
        }
      }
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
  };

  const handleView = (record) => {
    setViewRecord(record);
  };

  if (loading) return <div className="registered-table">Loading sub regional managers...</div>;
  if (error) return <div className="registered-table">Error: {error}</div>;

  return (
    <>
      {(showRegistrationModal || editingRecord || viewRecord) ? (
        <>
          {showRegistrationModal && (
            <GenericModal onClose={() => setShowRegistrationModal(false)}>
              <SubRegionalManagerRegistration 
                onClose={() => setShowRegistrationModal(false)}
                onRegistrationSuccess={fetchSubManagers}
              />
            </GenericModal>
          )}
          {editingRecord && (
            <GenericModal onClose={() => setEditingRecord(null)}>
              <SubRegionalManagerUpdate 
                record={editingRecord}
                onClose={() => setEditingRecord(null)}
                onUpdateSuccess={fetchSubManagers}
              />
            </GenericModal>
          )}
          {viewRecord && (
            <GenericModal onClose={() => setViewRecord(null)}>
              <SubRegionalManagerView 
                record={viewRecord}
                onClose={() => setViewRecord(null)}
              />
            </GenericModal>
          )}
        </>
      ) : (
        <div className="registered-table">
          <div className="table-header">
            <img 
              src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600" 
              alt="Sub Regional Managers" 
              className="header-image" 
            />
            <div className="header-overlay">
              <h2>Area Managers</h2>
            </div>
          </div>
          <div className="table-content">
            <div className="table-controls">
              <button 
                className="register-btn" 
                onClick={() => {
                  if (!groupData?.permissions?.createSubRegionManager) {
                    Swal.fire({
                      icon: 'error',
                      title: 'Access Denied',
                      text: 'You do not have permission to register a sub regional manager.'
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
              placeholder="Search by name, region, subregion, email or group..."
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
                  <th>Region Name</th>
                  <th>Area Name</th>
                  <th>Group Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubManagers.map((manager, index) => (
                  <tr key={manager.id}>
                    <td data-label="SN">{index + 1}</td>
                    <td data-label="Full Name">{manager.firstName} {manager.lastName}</td>
                    <td data-label="Email">{manager.email}</td>
                    <td data-label="Region Name">{manager.regionName}</td>
                    <td data-label="Area Name">{manager.subRegionName}</td>
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
                          if (!groupData?.permissions?.updateSubRegionManager) {
                            Swal.fire({
                              icon: 'error',
                              title: 'Access Denied',
                              text: 'You do not have permission to update a sub regional manager.'
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
                          if (!groupData?.permissions?.deleteSubRegionManager) {
                            Swal.fire({
                              icon: 'error',
                              title: 'Access Denied',
                              text: 'You do not have permission to delete a sub regional manager.'
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
                          if (!groupData?.permissions?.readSubRegionManager) {
                            Swal.fire({
                              icon: 'error',
                              title: 'Access Denied',
                              text: 'You do not have permission to view a sub regional manager.'
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
          </div>
        </div>
      )}
    </>
  );
};

export default SubRegionalManagersTable;
