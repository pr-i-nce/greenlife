import React, { useState, useEffect } from 'react';
import '../../styles/registeredTables.css';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#0a803e',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function PaidCommissionsTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [commissionsData, setCommissionsData] = useState([]);

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

  const renderTable = () => (
    <div className="table-content">
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th className="first-name-col">Agent Name</th>
            <th>Distributor</th>
            <th className="region-name-col">Region</th>
            <th>Sub Region</th>
            <th>Amount</th>
            <th>Commission</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {commissionsData.length > 0 ? (
            commissionsData.map((sale, index) => {
              const commission = sale.initial_commission || 'N/A';
              const paymentStatus = sale.payment_status || 'N/A'; 
              return (
                <tr key={sale.id}>
                  <td data-label="SN">{index + 1}</td>
                  <td className="first-name-col" data-label="Agent Name">
                    {sale.first_name || 'N/A'} {sale.last_name || 'N/A'}
                  </td>
                  <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                  <td className="region-name-col" data-label="Region">
                    {sale.region_name || 'N/A'}
                  </td>
                  <td data-label="Sub Region">{sale.sub_region || 'N/A'}</td>
                  <td data-label="Amount">{sale.amount || 'N/A'}</td>
                  <td data-label="Commission">{commission}</td>
                  <td data-label="Payment Status">{paymentStatus}</td>
                </tr>
              );
            })
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
          alt="Paid Commissions"
          className="header-image"
        />
        <div className="header-overlay">
          <h2>Paid Commissions Records</h2>
        </div>
      </div>
      {renderTable()}
    </div>
  );
}

export default PaidCommissionsTable;
