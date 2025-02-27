import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#0a803e',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

// Confirmation helper (similar to SalesTable)
const confirmAction = async (promptText) => {
  const { value } = await Swal.fire({
    ...swalOptions,
    title: promptText,
    input: 'text',
    inputPlaceholder: 'Type "yes" to confirm',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to type yes to confirm!';
      }
    }
  });
  if (value && value.toLowerCase() === 'yes') {
    return true;
  } else {
    Swal.fire({
      ...swalOptions,
      title: 'Action canceled',
      icon: 'info'
    });
    return false;
  }
};

// Loading alert helper (similar to SalesTable)
const showLoadingAlert = () => {
  Swal.fire({
    ...swalOptions,
    title: 'Processing...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

function CommissionsTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [commissionsData, setCommissionsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('approval1');

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      let url = '';
      if (currentTab === 'approval1') {
        url = `${BASE_URL}/sales/approved`;
      } else if (currentTab === 'approval2') {
        url = `${BASE_URL}/sales/approved1`;
      } else if (currentTab === 'initial') {
        url = `${BASE_URL}/sales/approved2`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new Error('Network error');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setCommissionsData(data);
        console.log('Commissions data:', data);
      } else {
        return Promise.reject('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching commissions data:', error);
      Swal.fire({
        ...swalOptions,
        title: 'Error fetching data',
        text: error.message,
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [accessToken, currentTab]);

  const handleInitialPay = (id) => {
    console.log('Pay initial commission for sale id:', id);
    // Implement the pay logic here.
  };

  const handleApproval1 = async (id) => {
    // Optionally, find the sale record for display purposes.
    const sale = commissionsData.find((s) => s.id === id);
    const confirmed = await confirmAction(
      `Are you sure you want to approve commission for ${sale ? sale.first_name : 'this sale'}?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      // Update using PUT (mirroring SalesTable logic)
      const response = await fetch(
        `${BASE_URL}/sales/update1?id=${id}&newStatus=Accepted`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) {
        throw new Error('Approval1 request failed');
      }
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Success',
        text: 'Sale approved successfully for Approval1',
        icon: 'success'
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error in Approval1:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: error.message,
        icon: 'error'
      });
    }
  };

  const handleApproval2 = async (id) => {
    const sale = commissionsData.find((s) => s.id === id);
    const confirmed = await confirmAction(
      `Are you sure you want to approve commission for ${sale ? sale.first_name : 'this sale'} (Approval2)?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      // Note: Adjust the endpoint if your backend expects a different route for Approval2
      const response = await fetch(
        `${BASE_URL}/sales/approve?id=${id}&newStatus=Accepted`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) {
        throw new Error('Approval2 request failed');
      }
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Success',
        text: 'Sale approved successfully for Approval2',
        icon: 'success'
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error in Approval2:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: error.message,
        icon: 'error'
      });
    }
  };

  const handlePayAllInitial = () => {
    console.log('Pay all initial commissions');
    // Implement the pay-all logic here.
  };

  const handleApproveAllApproval1 = () => {
    console.log('Approve all approval1 commissions');
    // Implement the approve-all logic here.
  };

  const handleApproveAllApproval2 = () => {
    console.log('Approve all approval2 commissions');
    // Implement the approve-all logic here.
  };

  const renderTable = () => (
    <div className="table-content">
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th className="first-name-col">Agent Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Distributor</th>
            <th className="region-name-col">Region</th>
            <th>Sub Region</th>
            <th>Amount</th>
            <th>Initial Commission</th>
            <th>Approval1 Status</th>
            <th>Approval2 Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {commissionsData.length > 0 ? (
            commissionsData.map((sale, index) => (
              <tr key={sale.id}>
                <td data-label="SN">{index + 1}</td>
                <td className="first-name-col" data-label="Agent Name">
                  {sale.first_name || 'N/A'} {sale.last_name || 'N/A'}
                </td>
                <td data-label="Phone Number">{sale.phone_number || 'N/A'}</td>
                <td data-label="Email">{sale.email || 'N/A'}</td>
                <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                <td className="region-name-col" data-label="Region">
                  {sale.region_name || 'N/A'}
                </td>
                <td data-label="Sub Region">{sale.sub_region || 'N/A'}</td>
                <td data-label="Amount">{sale.amount || 'N/A'}</td>
                <td data-label="Initial Commission">
                  {sale.initial_commission || 'N/A'}
                </td>
                <td data-label="Approval1 Status">
                  {sale.approval1 || 'N/A'}
                </td>
                <td data-label="Approval2 Status">
                  {sale.approval2 || 'N/A'}
                </td>
                <td data-label="Actions">
                  {currentTab === 'initial' && (
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleInitialPay(sale.id)}
                    >
                      Pay
                    </button>
                  )}
                  {currentTab === 'approval1' && (
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleApproval1(sale.id)}
                    >
                      Approve
                    </button>
                  )}
                  {currentTab === 'approval2' && (
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleApproval2(sale.id)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderControls = () => (
    <div className="table-controls">
      <div
        className="tabs"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <button
            className={`tab-btn ${currentTab === 'approval1' ? 'active' : ''}`}
            onClick={() => setCurrentTab('approval1')}
          >
            Approval1
          </button>
          <button
            className={`tab-btn ${currentTab === 'approval2' ? 'active' : ''}`}
            onClick={() => setCurrentTab('approval2')}
          >
            Approval2
          </button>
          <button
            className={`tab-btn ${currentTab === 'initial' ? 'active' : ''}`}
            onClick={() => setCurrentTab('initial')}
          >
            Initial Commission
          </button>
        </div>
        {currentTab === 'initial' && (
          <button className="action-btn view-btn" onClick={handlePayAllInitial}>
            Pay All
          </button>
        )}
        {currentTab === 'approval1' && (
          <button className="action-btn view-btn" onClick={handleApproveAllApproval1}>
            Approve All
          </button>
        )}
        {currentTab === 'approval2' && (
          <button className="action-btn view-btn" onClick={handleApproveAllApproval2}>
            Approve All
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div>Loading commission records...</div>;
  }

  return (
    <div className="registered-table">
      <div className="table-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Commissions"
          className="header-image"
        />
        <div className="header-overlay">
          <h2>Commissions Records</h2>
        </div>
      </div>
      {renderControls()}
      {renderTable()}
    </div>
  );
}

export default CommissionsTable;
