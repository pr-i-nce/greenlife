import React from 'react';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';

const GroupView = ({ group }) => {
  return (
    <div className="region-container">
      {/* Header with an image and title */}
      <div className="region-header">
        <img
          src="https://images.pexels.com/photos/3184634/pexels-photo-3184634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Group Details"
          className="region-header-image"
        />
        <div className="region-header-overlay">
          <h2>{group.groupName} Details</h2>
        </div>
      </div>
      
      {/* Details Form */}
      <div className="region-form">
        <div className="grid-container">
          {/* Basic Information */}
          <div className="grid-item">
            <label>Group Name:</label>
            <p>{group.groupName}</p>
          </div>
          <div className="grid-item">
            <label>Group ID:</label>
            <p>{group.groupId}</p>
          </div>
          <div className="grid-item">
            <label>Created By:</label>
            <p>{group.createdBy}</p>
          </div>
          <div className="grid-item">
            <label>Created Date:</label>
            <p>{group.createdDate}</p>
          </div>

          {/* Separator / Title for permissions */}
          <div className="grid-item full-width">
            <h3>Permissions</h3>
          </div>

          {/* Agent Permissions */}
          <div className="grid-item">
            <label>Create Agent:</label>
            <p>{group.createAgent ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Agent:</label>
            <p>{group.readAgent ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Agent:</label>
            <p>{group.updateAgent ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Agent:</label>
            <p>{group.deleteAgent ? 'Yes' : 'No'}</p>
          </div>

          {/* Distributor Permissions */}
          <div className="grid-item">
            <label>Create Distributor:</label>
            <p>{group.createDistributor ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Distributor:</label>
            <p>{group.readDistributor ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Distributor:</label>
            <p>{group.updateDistributor ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Distributor:</label>
            <p>{group.deleteDistributor ? 'Yes' : 'No'}</p>
          </div>

          {/* Region Permissions */}
          <div className="grid-item">
            <label>Create Region:</label>
            <p>{group.createRegion ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Region:</label>
            <p>{group.readRegion ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Region:</label>
            <p>{group.updateRegion ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Region:</label>
            <p>{group.deleteRegion ? 'Yes' : 'No'}</p>
          </div>

          {/* Product Permissions */}
          <div className="grid-item">
            <label>Create Product:</label>
            <p>{group.createProduct ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Product:</label>
            <p>{group.readProduct ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Product:</label>
            <p>{group.updateProduct ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Product:</label>
            <p>{group.deleteProduct ? 'Yes' : 'No'}</p>
          </div>

          {/* Region Manager Permissions */}
          <div className="grid-item">
            <label>Create Region Manager:</label>
            <p>{group.createRegionManager ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Region Manager:</label>
            <p>{group.readRegionManager ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Region Manager:</label>
            <p>{group.updateRegionManager ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Region Manager:</label>
            <p>{group.deleteRegionManager ? 'Yes' : 'No'}</p>
          </div>

          {/* Sub Region Permissions */}
          <div className="grid-item">
            <label>Create Sub Region:</label>
            <p>{group.createSubRegion ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Sub Region:</label>
            <p>{group.readSubRegion ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Sub Region:</label>
            <p>{group.updateSubRegion ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Sub Region:</label>
            <p>{group.deleteSubRegion ? 'Yes' : 'No'}</p>
          </div>

          {/* Sub Region Manager Permissions */}
          <div className="grid-item">
            <label>Create Sub Region Manager:</label>
            <p>{group.createSubRegionManager ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Sub Region Manager:</label>
            <p>{group.readSubRegionManager ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Sub Region Manager:</label>
            <p>{group.updateSubRegionManager ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Sub Region Manager:</label>
            <p>{group.deleteSubRegionManager ? 'Yes' : 'No'}</p>
          </div>

          {/* Commission Permissions */}
          <div className="grid-item">
            <label>Create Commission:</label>
            <p>{group.createCommission ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Commission:</label>
            <p>{group.readCommission ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Commission:</label>
            <p>{group.updateCommission ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Commission:</label>
            <p>{group.deleteCommission ? 'Yes' : 'No'}</p>
          </div>

          {/* Group Permissions */}
          <div className="grid-item">
            <label>Create Group:</label>
            <p>{group.createGroup ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Read Group:</label>
            <p>{group.readGroup ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Update Group:</label>
            <p>{group.updateGroup ? 'Yes' : 'No'}</p>
          </div>
          <div className="grid-item">
            <label>Delete Group:</label>
            <p>{group.deleteGroup ? 'Yes' : 'No'}</p>
          </div>

          {/* Manage Roles */}
          <div className="grid-item full-width">
            <label>Manage Roles:</label>
            <p>{group.manageRoles ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupView;
