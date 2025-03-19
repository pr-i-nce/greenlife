import React from 'react';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';

const GroupView = ({ group }) => {
  const permissions = [
    { label: 'Agent', keys: ['createAgent', 'readAgent', 'updateAgent', 'deleteAgent'] },
    { label: 'Distributor', keys: ['createDistributor', 'readDistributor', 'updateDistributor', 'deleteDistributor'] },
    { label: 'Region', keys: ['createRegion', 'readRegion', 'updateRegion', 'deleteRegion'] },
    { label: 'Product', keys: ['createProduct', 'readProduct', 'updateProduct', 'deleteProduct'] },
    { label: 'Region Manager', keys: ['createRegionManager', 'readRegionManager', 'updateRegionManager', 'deleteRegionManager'] },
    { label: 'Sub Region', keys: ['createSubRegion', 'readSubRegion', 'updateSubRegion', 'deleteSubRegion'] },
    { label: 'Sub Region Manager', keys: ['createSubRegionManager', 'readSubRegionManager', 'updateSubRegionManager', 'deleteSubRegionManager'] },
    { label: 'Commission', keys: ['createCommission', 'readCommission', 'updateCommission', 'deleteCommission'] },
    { label: 'Group', keys: ['createGroup', 'readGroup', 'updateGroup', 'deleteGroup'] },
  ];

  return (
    <div className="region-container">
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

      <div className="region-form">
        <div className="grid-container">
          {/* Basic Info */}
          {['groupName', 'groupId', 'createdBy', 'createdDate'].map((field) => (
            <div className="grid-item" key={field}>
              <label>{field.replace(/([A-Z])/g, ' $1').trim()}:</label>
              <p>{group[field]}</p>
            </div>
          ))}

          {/* Permissions */}
          {permissions.map(({ label, keys }) => (
            <React.Fragment key={label}>
              <div className="grid-item full-width">
                <h3>{label} Permissions</h3>
              </div>
              {keys.map((key) => (
                <div className="grid-item" key={key}>
                  <label>{key.replace(/([A-Z])/g, ' $1').trim()}:</label>
                  <p>{group[key] ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </React.Fragment>
          ))}

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
