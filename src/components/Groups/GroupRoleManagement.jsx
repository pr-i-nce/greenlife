import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';

const roleMapping = {
  agent: ['createAgent', 'readAgent', 'updateAgent', 'deleteAgent'],
  distributor: ['createDistributor', 'readDistributor', 'updateDistributor', 'deleteDistributor'],
  region: ['createRegion', 'readRegion', 'updateRegion', 'deleteRegion'],
  product: ['createProduct', 'readProduct', 'updateProduct', 'deleteProduct'],
  regionalManager: ['createRegionManager', 'readRegionManager', 'updateRegionManager', 'deleteRegionManager'],
  subRegion: ['createSubRegion', 'readSubRegion', 'updateSubRegion', 'deleteSubRegion'],
  subRegionManager: ['createSubRegionManager', 'readSubRegionManager', 'updateSubRegionManager', 'deleteSubRegionManager'],
  commission: ['createCommission', 'readCommission', 'updateCommission', 'deleteCommission'],
  group: ['createGroup', 'readGroup', 'updateGroup', 'deleteGroup']
};

const GroupRoleManagement = ({ group, onClose, onUpdateSuccess, initialRoles }) => {
  const [roleData, setRoleData] = useState(initialRoles || {});

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setRoleData({ ...roleData, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { 
      groupName: group.groupName,
      ...roleData
    };

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://jituze.greenlife.co.ke/rest/group/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (data && data.groupId) {
        const existingLocalData = JSON.parse(localStorage.getItem('roles') || '{}');
        const existingPermissions = existingLocalData.permissions || {};

        const updatedPermissions = { ...existingPermissions, ...roleData };

        const commissionDefaults = {
          createCommission: false,
          readCommission: false,
          updateCommission: false,
          deleteCommission: false
        };

        const finalPermissions = { ...commissionDefaults, ...updatedPermissions };

        const updatedLocalData = {
          groupName: group.groupName,
          permissions: finalPermissions
        };

        localStorage.setItem('roles', JSON.stringify(updatedLocalData));

        Swal.fire({ 
          icon: 'success', 
          title: 'Success', 
          text: data.message || 'Roles updated successfully!', 
          confirmButtonColor: '#2B9843'
        });
        onClose();
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: 'Roles not updated. Empty response.' 
        });
      }
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message || 'Error updating roles' 
      });
    }
  };

  return (
    <div className="roles-container">
      <h2 className="roles-header">
        Manage Roles for {group.groupName} ({group.groupId})
      </h2>
      <form className="roles-form" onSubmit={handleSubmit}>
        {Object.keys(roleMapping).map((key) => (
          <div key={key} className="role-group">
            <h3 className="role-group-title">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h3>
            <div className="role-group-checkboxes">
              {roleMapping[key].map((perm) => (
                <div key={perm} className="role-checkbox">
                  <input
                    type="checkbox"
                    id={perm}
                    name={perm}
                    checked={roleData[perm] || false}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor={perm}>
                    {perm.startsWith('create')
                      ? 'Create'
                      : perm.startsWith('read')
                      ? 'Read'
                      : perm.startsWith('update')
                      ? 'Update'
                      : 'Delete'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="submit-btn">
          Save Roles
        </button>
      </form>
    </div>
  );
};

export default GroupRoleManagement;  