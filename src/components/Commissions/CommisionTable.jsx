import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { GlobalContext } from '../GlobalContext';

const API_BASE = 'https://jituze.greenlife.co.ke/rest';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#0a803e',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function CommissionsTable() {
  const { accessToken } = useContext(GlobalContext);
  const [commissionsData, setCommissionsData] = useState([]);
  const [currentTab, setCurrentTab] = useState('initial'); 

  const fetchCommissions = () => {
    fetch(`${API_BASE}/sales/approved`, {
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
      `Are you sure you want to process initial commission payment for ${sale.firstName}?`
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
      const response = await fetch(`${API_BASE}/commissions/initial/pay?id=${sale.id}`, {
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
        title: 'Initial Commission Payment Successful',
        text: `Payment processed for ${sale.firstName}`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing initial commission payment:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process initial commission payment. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleFinalPay = async (saleId) => {
    const sale = commissionsData.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to process final commission payment for ${sale.firstName}?`
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
      const response = await fetch(`${API_BASE}/commissions/final/pay?id=${sale.id}`, {
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
        title: 'Final Commission Payment Successful',
        text: `Payment processed for ${sale.firstName}`
      });
      fetchCommissions();
    } catch (error) {
      console.error('Error processing final commission payment:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not process final commission payment. Please try again.',
        icon: 'error'
      });
    }
  };

  const handlePayAll = async () => {
    const confirmed = await confirmAction(
      `Are you sure you want to process ${currentTab === 'initial' ? 'initial' : 'final'} commission payments for all commissions?`
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
      const promises = commissionsData.map((sale) => {
        const endpoint = currentTab === 'initial' 
          ? `${API_BASE}/commissions/initial/pay?id=${sale.id}` 
          : `${API_BASE}/commissions/final/pay?id=${sale.id}`;
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
        title: `${currentTab === 'initial' ? 'Initial' : 'Final'} Commission Payments Successful`,
        text: `Payments processed for all commissions`
      });
      fetchCommissions();
    } catch (error) {
      console.error(`Error processing ${currentTab} commission payments:`, error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: `Could not process ${currentTab} commission payments for all. Please try again.`,
        icon: 'error'
      });
    }
  };

  const renderTable = () => (
    <div className="table-content">
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th className="first-name-col">Agent name</th>
            <th>Phone number</th>
            <th>Email</th>
            <th>Distributor</th>
            <th className="region-name-col">Region</th>
            <th>Sub region</th>
            <th>Amount</th>
            {currentTab === 'initial' && <th>Initial commission</th>}
            {currentTab === 'final' && <th>Final commission</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {commissionsData.length > 0 ? (
            commissionsData.map((sale, index) => (
              <tr key={sale.id}>
                <td data-label="SN">{index + 1}</td>
                <td className="first-name-col" data-label="Agent Name">{sale.first_name || 'N/A'} {sale.last_name || 'N/A'}</td>
                <td data-label="Phone number">{sale.phone_number || 'N/A'}</td>
                <td data-label="Email">{sale.email || 'N/A'}</td>
                <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                <td className="region-name-col" data-label="Region">{sale.region_name || 'N/A'}</td>
                <td data-label="Sub Region">{sale.sub_region || 'N/A'}</td>
                <td data-label="Amount">{sale.amount || 'N/A'}</td>
                {currentTab === 'initial' && (
                  <td data-label="Initial Commission">{sale.initial_commission || 'N/A'}</td>
                )}
                {currentTab === 'final' && (
                  <td data-label="Final Commission">{sale.final_commission || 'N/A'}</td>
                )}
                <td data-label="Actions">
                  {currentTab === 'initial' && (
                    <button className="action-btn view-btn" onClick={() => handleInitialPay(sale.id)}>
                      Pay
                    </button>
                  )}
                  {currentTab === 'final' && (
                    <button className="action-btn view-btn" onClick={() => handleFinalPay(sale.id)}>
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

      <div className="table-controls">
        <div className="tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button
              className={`tab-btn ${currentTab === 'initial' ? 'active' : ''}`}
              onClick={() => setCurrentTab('initial')}
            >
              Initial commissions
            </button>
            <button
              className={`tab-btn ${currentTab === 'final' ? 'active' : ''}`}
              onClick={() => setCurrentTab('final')}
            >
              Final commissions
            </button>
          </div>
          <button className="action-btn view-btn" onClick={handlePayAll}>
            {currentTab === 'initial' ? 'Pay All Initial' : 'Pay All Final'}
          </button>
        </div>
      </div>

      {renderTable()}
    </div>
  );
}

export default CommissionsTable;
