import React, { useState, useEffect, useContext } from 'react';
import '../../styles/registeredTables.css';
import { GlobalContext } from '../GlobalContext';

const API_BASE = 'https://jituze.greenlife.co.ke/rest';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#0a803e',
  cancelButtonColor: '#e74c3c`',
  color: '#283e56',
};

function PaidCommissionsTable() {
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

  const renderTable = () => (
    <div className="table-content">
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th className="first-name-col">Agent name</th>
            <th>Distributor</th>
            <th className="region-name-col">Region</th>
            <th>Sub region</th>
            <th>Amount</th>
            {currentTab === 'initial' && <th>Initial commission</th>}
            {currentTab === 'final' && <th>Final commission</th>}
            <th>Payment status</th>
          </tr>
        </thead>
        <tbody>
          {commissionsData.length > 0 ? (
            commissionsData.map((sale, index) => {
              const initialStatus = sale.initialCommission && sale.initialCommission > 0 ? "Paid" : "Not Paid";
              const finalStatus = sale.finalCommission && sale.finalCommission > 0 ? "Paid" : "Not Paid";
              return (
                <tr key={sale.id}>
                  <td data-label="SN">{index + 1}</td>
                  <td className="first-name-col" data-label="Agent Name">{sale.firstName || 'N/A'}</td>
                  <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                  <td className="region-name-col" data-label="Region">{sale.regionName || 'N/A'}</td>
                  <td data-label="Sub Region">{sale.subRegion || 'N/A'}</td>
                  <td data-label="Amount">{sale.amount || 'N/A'}</td>
                  {currentTab === 'initial' && (
                    <>
                      <td data-label="Initial Commission">{sale.initialCommission || 'N/A'}</td>
                      <td data-label="Payment Status">{initialStatus}</td>
                    </>
                  )}
                  {currentTab === 'final' && (
                    <>
                      <td data-label="Final Commission">{sale.finalCommission || 'N/A'}</td>
                      <td data-label="Payment Status">{finalStatus}</td>
                    </>
                  )}
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

      <div className="table-controls">
        <div className="tabs">
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
      </div>

      {renderTable()}
    </div>
  );
}

export default PaidCommissionsTable;
