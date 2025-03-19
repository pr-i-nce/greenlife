import React from 'react';
import '../../styles/registeredTables.css';

const DistributorView = ({ record }) => {
  const rows = [
    [
      { label: 'ID', value: record.id || 'null' },
      { label: 'Business Name', value: record.businessName || 'null' }
    ],
    [
      { label: 'Region', value: record.regionName || 'null' },
      { label: 'Subregion', value: record.subRegionName || 'null' }
    ],
    [
      { label: 'Phone Number', value: record.phoneNumber || 'null' },
      { label: 'Email', value: record.email || 'null' }
    ],
    [
      { label: 'Status', value: record.active ? 'Active' : 'Inactive' }
    ],
    [
      { label: 'Created By', value: record.createdBy || 'null' },
      { label: 'Updated By', value: record.updatedBy || 'null' }
    ],
    [
      { label: 'Deleted By', value: record.deletedBy || 'null' },
      { label: 'Deactivated By', value: record.deactivatedBy || 'null' }
    ],
    [
      { label: 'Created Date', value: record.createdDate ? record.createdDate.toString() : 'null' },
      { label: 'Updated Date', value: record.updatedDate ? record.updatedDate.toString() : 'null' }
    ],
    [
      { label: 'Deleted Date', value: record.deletedDate ? record.deletedDate.toString() : 'null' },
      { label: 'Deactivated Date', value: record.deactivatedDate ? record.deactivatedDate.toString() : 'null' }
    ]
  ];

  return (
    <div className="rm-container">
      <div className="rm-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="View Distributor"
          className="rm-header-image"
        />
        <div className="rm-header-overlay">
          <h2>Distributor Details</h2>
        </div>
      </div>
      <form className="rm-form">
        {rows.map((row, rowIndex) => (
          <div className="form-row" key={rowIndex}>
            {row.map((field, index) => (
              <div className="form-group" key={index}>
                <label>{field.label}:</label>
                <input type="text" value={field.value} readOnly />
              </div>
            ))}
          </div>
        ))}
      </form>
    </div>
  );
};

export default DistributorView;
