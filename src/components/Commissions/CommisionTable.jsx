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

function CommissionsTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [commissionsData, setCommissionsData] = useState([]);
  const [currentTab, setCurrentTab] = useState('approval1');

  const fetchCommissions = () => {
    fetch(`${BASE_URL}/sales/approved`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
      .then((data) => {
        if (Array.isArray(data)) {
          setCommissionsData(data);
          console.log('Commissions data:', data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching commissions data:', error);
      });
  };

  useEffect(() => {
    fetchCommissions();
  }, [accessToken]);

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

  const handleInitialPay = async (saleId) => {
    const sale = commissionsData.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to process initial commission payment for ${sale.first_name}?`
    );
    if (!confirmed) return;

    Swal.fire({
      ...swalOptions,
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`${BASE_URL}/commissions/initial/pay?id=${sale.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error('Network error');
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'Commission Payment Successful',
        text: `Payment processed for ${sale.first_name}`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing commission payment:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process commission payment. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleApproval1 = async (saleId) => {
    const sale = commissionsData.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to approve commission (Approval1) for ${sale.first_name}?`
    );
    if (!confirmed) return;

    Swal.fire({
      ...swalOptions,
      title: 'Processing Approval1...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`${BASE_URL}/commissions/approval1/approve?id=${sale.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error('Network error');
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'Approval1 Successful',
        text: `Approval processed for ${sale.first_name}`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing Approval1:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process Approval1. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleApproval2 = async (saleId) => {
    const sale = commissionsData.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to approve commission (Approval2) for ${sale.first_name}?`
    );
    if (!confirmed) return;

    Swal.fire({
      ...swalOptions,
      title: 'Processing Approval2...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`${BASE_URL}/commissions/approval2/approve?id=${sale.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error('Network error');
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'Approval2 Successful',
        text: `Approval processed for ${sale.first_name}`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing Approval2:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process Approval2. Please try again.',
        icon: 'error'
      });
    }
  };

  const handlePayAllInitial = async () => {
    if (currentTab !== 'initial') return;
    const confirmed = await confirmAction(
      `Are you sure you want to process commission payments for all records in Initial Commission?`
    );
    if (!confirmed) return;

    Swal.fire({
      ...swalOptions,
      title: 'Processing All Initial Payments...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const promises = commissionsData.map((sale) => {
        const endpoint = `${BASE_URL}/commissions/initial/pay?id=${sale.id}`;
        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        });
      });
      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        if (!response.ok) throw new Error('Network error');
      });
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'Initial Payments Successful',
        text: `Payments processed for all records in Initial Commission`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing initial payments:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process initial payments for all. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleApproveAllApproval1 = async () => {
    if (currentTab !== 'approval1') return;
    const confirmed = await confirmAction(
      `Are you sure you want to approve all commissions for Approval1?`
    );
    if (!confirmed) return;

    Swal.fire({
      ...swalOptions,
      title: 'Processing All Approval1...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const promises = commissionsData.map((sale) => {
        const endpoint = `${BASE_URL}/commissions/approval1/approve?id=${sale.id}`;
        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        });
      });
      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        if (!response.ok) throw new Error('Network error');
      });
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'All Approval1 Successful',
        text: `All Approval1 records processed successfully`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing all Approval1:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process all Approval1 records. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleApproveAllApproval2 = async () => {
    if (currentTab !== 'approval2') return;
    const confirmed = await confirmAction(
      `Are you sure you want to approve all commissions for Approval2?`
    );
    if (!confirmed) return;

    Swal.fire({
      ...swalOptions,
      title: 'Processing All Approval2...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const promises = commissionsData.map((sale) => {
        const endpoint = `${BASE_URL}/commissions/approval2/approve?id=${sale.id}`;
        return fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        });
      });
      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        if (!response.ok) throw new Error('Network error');
      });
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'All Approval2 Successful',
        text: `All Approval2 records processed successfully`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing all Approval2:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process all Approval2 records. Please try again.',
        icon: 'error'
      });
    }
  };

  const filteredCommissions = commissionsData.filter((sale) => {
    const status = sale.commission_status || 'initial';
    return status === currentTab;
  });

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
          {filteredCommissions.length > 0 ? (
            filteredCommissions.map((sale, index) => (
              <tr key={sale.id}>
                <td data-label="SN">{index + 1}</td>
                <td className="first-name-col" data-label="Agent Name">
                  {sale.first_name || 'N/A'} {sale.last_name || 'N/A'}
                </td>
                <td data-label="Phone Number">{sale.phone_number || 'N/A'}</td>
                <td data-label="Email">{sale.email || 'N/A'}</td>
                <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                <td className="region-name-col" data-label="Region">{sale.region_name || 'N/A'}</td>
                <td data-label="Sub Region">{sale.sub_region || 'N/A'}</td>
                <td data-label="Amount">{sale.amount || 'N/A'}</td>
                <td data-label="Initial Commission">{sale.initial_commission || 'N/A'}</td>
                <td data-label="Approval1 Status">{sale.approval1_status || 'N/A'}</td>
                <td data-label="Approval2 Status">{sale.approval2_status || 'N/A'}</td>
                <td data-label="Actions">
                  {currentTab === 'initial' && (
                    <button className="action-btn view-btn" onClick={() => handleInitialPay(sale.id)}>
                      Pay
                    </button>
                  )}
                  {currentTab === 'approval1' && (
                    <button className="action-btn view-btn" onClick={() => handleApproval1(sale.id)}>
                      Approve
                    </button>
                  )}
                  {currentTab === 'approval2' && (
                    <button className="action-btn view-btn" onClick={() => handleApproval2(sale.id)}>
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
      <div className="tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className={`tab-btn ${currentTab === 'approval1' ? 'active' : ''}`} onClick={() => setCurrentTab('approval1')}>
            Approval1
          </button>
          <button className={`tab-btn ${currentTab === 'approval2' ? 'active' : ''}`} onClick={() => setCurrentTab('approval2')}>
            Approval2
          </button>
          <button className={`tab-btn ${currentTab === 'initial' ? 'active' : ''}`} onClick={() => setCurrentTab('initial')}>
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
