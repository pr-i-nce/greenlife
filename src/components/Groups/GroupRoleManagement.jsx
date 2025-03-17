import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';
import { useSelector } from 'react-redux';
import apiClient from '../apiClient';

const roleMapping = {
  agent: [
    'createAgent', // Create a new agent.
    'readAgent',   // View agent details.
    'updateAgent', // Update agent information.
    'deleteAgent'  // Delete an agent.
  ],
  distributor: [
    'createDistributor', // Add a new distributor.
    'readDistributor',   // View distributor details.
    'updateDistributor', // Update distributor information.
    'deleteDistributor'  // Remove a distributor.
  ],
  region: [
    'createRegion', // Create a new region.
    'readRegion',   // View region details.
    'updateRegion', // Update region information.
    'deleteRegion'  // Delete a region.
  ],
  product: [
    'createProduct', // Add a new product.
    'readProduct',   // View product details.
    'updateProduct', // Update product information.
    'deleteProduct'  // Delete a product.
  ],
  regionalManager: [
    'createRegionManager', // Add a regional manager.
    'readRegionManager',   // View regional manager details.
    'updateRegionManager', // Update regional manager information.
    'deleteRegionManager'  // Remove a regional manager.
  ],
  subRegion: [
    'createSubRegion', // Create a sub-region.
    'readSubRegion',   // View sub-region details.
    'updateSubRegion', // Update sub-region information.
    'deleteSubRegion'  // Delete a sub-region.
  ],
  subRegionManager: [
    'createSubRegionManager', // Add a sub-region manager.
    'readSubRegionManager',   // View sub-region manager details.
    'updateSubRegionManager', // Update sub-region manager information.
    'deleteSubRegionManager'  // Remove a sub-region manager.
  ],
  commission: [
    'createCommission', // Create a commission entry.
    'readCommission',   // View commission details.
    'updateCommission', // Update commission information.
    'deleteCommission'  // Delete a commission entry.
  ],
  group: [
    'createGroup', // Create a new group.
    'readGroup',   // View group details.
    'updateGroup', // Update group information.
    'deleteGroup'  // Delete a group.
  ],
  user: [
    'createUser',  // Create a new user.
    'editUser',    // Edit user details.
    'deleteUser',  // Delete a user.
    'viewUser',    // View user details.
    'manageRoles'  // Manage user roles and permissions.
  ],
  sales: [
    'rejectSales', // Reject a sales transaction.
    'acceptSales', // Accept a sales transaction.
    'viewSales',   // View overall sales data.
    'viewDetails'  // View detailed sale information.
  ],
  approval: [
    'approve1', // First-level approval (e.g., initial validation).
    'approve2'  // Second-level approval (e.g., final confirmation).
  ],
  payment: [
    'viewRecieptImage',   // View images of payment receipts.
    'pay',                // Process a payment.
    // 'viewPayment',        // View payment details.
    'viewPaidCommissions' // View details of paid commissions.
  ]
};

const GroupRoleManagement = ({ group, onClose, onUpdateSuccess, initialRoles }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  const defaultPermissions = {};
  Object.keys(roleMapping).forEach((key) => {
    roleMapping[key].forEach((perm) => {
      defaultPermissions[perm] = false;
    });
  });

  const [roleData, setRoleData] = useState({ ...defaultPermissions, ...initialRoles });

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
      const response = await apiClient.put('/group/update', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;

      if (data && data.groupId) {
        const existingLocalData = JSON.parse(localStorage.getItem('roles') || '{}');
        const existingPermissions = existingLocalData.permissions || {};

        const finalPermissions = { ...defaultPermissions, ...existingPermissions, ...roleData };

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
        text: err.response?.data || err.message || 'Error updating roles'
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
              {roleMapping[key].map((perm) => {
                let label = '';

                if (key === 'sales') {
                  if (perm === 'rejectSales') label = 'Reject Sales';
                  else if (perm === 'acceptSales') label = 'Accept Sales';
                  else if (perm === 'viewSales') label = 'View Sales';
                  else if (perm === 'viewDetails') label = 'View Sale Details';
                } else if (key === 'approval') {
                  if (perm === 'approve1') label = 'Confirm';
                  else if (perm === 'approve2') label = 'Approve';
                } else if (key === 'payment') {
                  if (perm === 'viewRecieptImage') label = 'View Receipt Image';
                  else if (perm === 'pay') label = 'Make Payment';
                  // else if (perm === 'viewPayment') label = 'View Payment';
                  else if (perm === 'viewPaidCommissions') label = 'View Paid Commissions';
                } else {
                  label = perm.startsWith('create')
                    ? 'Create'
                    : perm.startsWith('read')
                    ? 'Read'
                    : perm.startsWith('update')
                    ? 'Update'
                    : perm.startsWith('delete')
                    ? 'Delete'
                    : perm.startsWith('edit')
                    ? 'Edit'
                    : perm;
                }

                return (
                  <div key={perm} className="role-checkbox">
                    <input
                      type="checkbox"
                      id={perm}
                      name={perm}
                      checked={roleData[perm] || false}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor={perm}>{label}</label>
                  </div>
                );
              })}
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
