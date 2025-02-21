import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { GlobalContext } from '../GlobalContext';
import ProductDetails from './ProductDetails';
import GenericModal from '../GenericModal';

const API_BASE = 'https://jituze.greenlife.co.ke/rest';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function SalesTable() {
  const { accessToken } = useContext(GlobalContext);
  const [salesData, setSalesData] = useState([]);
  const [acceptedSales, setAcceptedSales] = useState([]);
  const [rejectedSales, setRejectedSales] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const fetchAllSales = () => {
    fetch(`${API_BASE}/sales/all`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
      .then((data) => {
        if (Array.isArray(data)) {
          setSalesData(data);
          console.log('Sales data:', data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching all sales data:', error);
      });
  };

  const fetchAcceptedSales = () => {
    fetch(`${API_BASE}/sales/approved`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
      .then((data) => {
        if (Array.isArray(data)) {
          setAcceptedSales(data);
          console.log('Accepted sales data:', data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching accepted sales data:', error);
      });
  };

  const fetchRejectedSales = () => {
    fetch(`${API_BASE}/sales/rejected`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
      .then((data) => {
        if (Array.isArray(data)) {
          setRejectedSales(data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching rejected sales data:', error);
      });
  };

  useEffect(() => {
    if (currentTab === 'all') {
      fetchAllSales();
    } else if (currentTab === 'accepted') {
      fetchAcceptedSales();
    } else if (currentTab === 'rejected') {
      fetchRejectedSales();
    }
  }, [currentTab, accessToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTab === 'all') {
        fetchAllSales();
      } else if (currentTab === 'accepted') {
        fetchAcceptedSales();
      } else if (currentTab === 'rejected') {
        fetchRejectedSales();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentTab, accessToken]);

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

  const handleAccept = async (saleId) => {
    const sale = salesData.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to accept sale for createdBy ${sale.createdBy}?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      const response = await fetch(
        `${API_BASE}/sales/update?id=${sale.id}&newStatus=Approved`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) throw new Error('Network error');
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'Sale Accepted',
        text: `Sale accepted for createdBy ${sale.createdBy}`
      });
      fetchAllSales();
      fetchAcceptedSales();
    } catch (error) {
      console.error('Error accepting sale:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not accept sale. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleReject = async (saleId) => {
    const sale = salesData.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to reject sale for ${sale.createdBy}?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      const response = await fetch(
        `${API_BASE}/sales/update?id=${sale.id}&newStatus=Rejected`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) throw new Error('Network error');
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Sale Rejected',
        text: `Sale rejected for createdBy ${sale.createdBy}`
      });
      fetchAllSales();
      fetchRejectedSales();
    } catch (error) {
      console.error('Error rejecting sale:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not reject sale. Please try again.',
        icon: 'error'
      });
    }
  };

  const moveAcceptedToRejected = async (saleId) => {
    const sale = acceptedSales.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to reject sale for createdBy ${sale.createdBy}?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      const response = await fetch(
        `${API_BASE}/sales/update?id=${sale.id}&newStatus=Rejected`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) throw new Error('Network error');
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Sale Rejected',
        text: `Sale rejected for createdBy ${sale.createdBy}`
      });
      fetchAcceptedSales();
      fetchRejectedSales();
    } catch (error) {
      console.error('Error updating sale status:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not update sale status. Please try again.',
        icon: 'error'
      });
    }
  };

  const moveRejectedToAccepted = async (saleId) => {
    const sale = rejectedSales.find((s) => s.id === saleId);
    if (!sale) return;
    const confirmed = await confirmAction(
      `Are you sure you want to accept sale for createdBy ${sale.createdBy}?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      const response = await fetch(
        `${API_BASE}/sales/update?id=${sale.id}&newStatus=Approved`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) throw new Error('Network error');
      Swal.close();
      Swal.fire({
        ...swalOptions,
        icon: 'success',
        title: 'Sale Accepted',
        text: `Sale accepted for createdBy ${sale.createdBy}`
      });
      fetchAcceptedSales();
      fetchRejectedSales();
    } catch (error) {
      console.error('Error updating sale status:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not update sale status. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleViewImage = (receiptImagePath) => {
    const imageUrl = `${API_BASE}/serve/getImage/${receiptImagePath}`;
    console.log('Image URL:', imageUrl);
    Swal.fire({
      ...swalOptions,
      title: 'Receipt Image',
      html: `<img src="${imageUrl}" style="width:100%; height:auto; max-height:80vh;" />`,
      heightAuto: false,
      showConfirmButton: true,
      confirmButtonText: 'Close'
    });
  };

  const renderTable = (data, tabName) => (
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
            {tabName === 'accepted' && (
              <>
                <th>Initial commission</th>
                <th>Final commission</th>
              </>
            )}
            <th>Status</th>
            <th>Created by</th>
            <th>Product details</th>
            <th>Receipt image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((sale, index) => (
              <tr key={sale.id}>
                <td data-label="SN">{index + 1}</td>
                <td className="first-name-col" data-label="Agent Name">{sale.firstName || 'N/A'}</td>
                <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                <td className="region-name-col" data-label="Region">{sale.regionName || 'N/A'}</td>
                <td data-label="Sub Region">{sale.subRegion || 'N/A'}</td>
                <td data-label="Amount">{sale.amount || 'N/A'}</td>
                {tabName === 'accepted' && (
                  <>
                    <td data-label="Initial Commission">{sale.initialCommission || 'N/A'}</td>
                    <td data-label="Final Commission">{sale.finalCommission || 'N/A'}</td>
                  </>
                )}
                <td data-label="Status">{sale.status || 'Pending'}</td>
                <td data-label="Created By">{sale.createdBy || 'N/A'}</td>
                <td data-label="Receipt Image">
                  {sale.recieptImagePath ? (
                  <button className="action-btn view-btn" onClick={() => setSelectedProduct(sale)}>
                  View Details
                </button>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td data-label="Receipt Image">
                  {sale.recieptImagePath ? (
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewImage(sale.recieptImagePath)}
                    >
                      View
                    </button>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td data-label="Actions">
                  {tabName === 'all' && (
                    <>
                      <button className="action-btn view-btn" onClick={() => handleAccept(sale.id)}>
                        Accept
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleReject(sale.id)}>
                        Reject
                      </button>
                    </>
                  )}
                  {tabName === 'accepted' && (
                    <>
                      <button className="action-btn delete-btn" onClick={() => moveAcceptedToRejected(sale.id)}>
                        Reject
                      </button>
                    </>
                  )}
                  {tabName === 'rejected' && (
                    <button className="action-btn view-btn" onClick={() => moveRejectedToAccepted(sale.id)}>
                      Accept
                    </button>
                  )}

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tabName === 'accepted' ? 12 : 10} style={{ textAlign: 'center', padding: '20px' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    let dataToRender;
    if (currentTab === 'all') {
      dataToRender = salesData.filter(
        (sale) => sale.status && sale.status.toLowerCase() === 'pending'
      );
    } else if (currentTab === 'accepted') {
      dataToRender = acceptedSales;
    } else {
      dataToRender = rejectedSales;
    }
    return renderTable(dataToRender, currentTab);
  };

  return (
    <div className="registered-table">
      {selectedProduct ? (
        <GenericModal onClose={() => setSelectedProduct(null)}>
          <ProductDetails records={[selectedProduct]} onClose={() => setSelectedProduct(null)} />
        </GenericModal>
      ) : (
        <>
          <div className="table-header">
            <img
              src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Sales"
              className="header-image"
            />
            <div className="header-overlay">
              <h2>Sales Records</h2>
            </div>
          </div>

          <div className="table-controls">
            <div className="tabs">
              <button className={`tab-btn ${currentTab === 'all' ? 'active' : ''}`} onClick={() => setCurrentTab('all')}>
                New sales
              </button>
              <button className={`tab-btn ${currentTab === 'accepted' ? 'active' : ''}`} onClick={() => setCurrentTab('accepted')}>
                Accepted sales
              </button>
              <button className={`tab-btn ${currentTab === 'rejected' ? 'active' : ''}`} onClick={() => setCurrentTab('rejected')}>
                Rejected sales
              </button>
            </div>
          </div>

          {renderContent()}
        </>
      )}
    </div>
  );
}

export default SalesTable;
