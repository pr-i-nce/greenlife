import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { useSelector } from 'react-redux';
import ProductDetails from './ProductDetails';
import GenericModal from '../GenericModal';
import { BASE_URL } from '../apiClient';
import { usePagination } from '../PaginationContext';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function SalesTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [salesData, setSalesData] = useState([]);
  const [acceptedSales, setAcceptedSales] = useState([]);
  const [rejectedSales, setRejectedSales] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { pages, setPageForTab, rowsPerPage } = usePagination();

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

  // Fetch sales data by region using the new endpoint
  const fetchRegionSales = () => {
    fetch(`${BASE_URL}/sales/region`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
      .then((data) => {
        if (Array.isArray(data)) {
          setSalesData(data);
          console.log('Region sales data:', data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching region sales data:', error);
      });
  };

  const fetchAcceptedSales = () => {
    fetch(`${BASE_URL}/sales/region-accepted`, {
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
    fetch(`${BASE_URL}/sales/region-rejected`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Network error')))
      .then((data) => {
        if (Array.isArray(data)) {
          setRejectedSales(data);
          console.log('Rejected sales data:', data);
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
      fetchRegionSales();
    } else if (currentTab === 'accepted') {
      fetchAcceptedSales();
    } else if (currentTab === 'rejected') {
      fetchRejectedSales();
    }
    setPageForTab(currentTab, 1);
  }, [currentTab, accessToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTab === 'all') {
        fetchRegionSales();
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
        `${BASE_URL}/sales/update?id=${sale.id}&newStatus=Approved`,
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
      fetchRegionSales();
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
        `${BASE_URL}/sales/update?id=${sale.id}&newStatus=Rejected`,
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
      fetchRegionSales();
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
        `${BASE_URL}/sales/update?id=${sale.id}&newStatus=Rejected`,
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
        `${BASE_URL}/sales/update?id=${sale.id}&newStatus=Approved`,
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

  const handleViewImage = (reciept_image_path) => {
    const imageUrl = `${BASE_URL}/serve/getImage/${reciept_image_path}`;
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

  const handleViewProductDetails = async (ref_id) => {
    Swal.fire({
      ...swalOptions,
      title: 'Fetching Product Details...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const response = await fetch(`${BASE_URL}/sales/sold-products?id=${ref_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const productDetails = Array.isArray(data.object) ? data.object : [];
      console.log('Product details:', productDetails);
      Swal.close();
      setSelectedProduct(productDetails);
    } catch (error) {
      console.error('Error fetching product details:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not fetch product details. Please try again.',
        icon: 'error'
      });
    }
  };

  const renderTable = (data, tabName) => {
    const currentPage = pages[tabName] || 1;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const paginatedData = data.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return (
      <div>
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
                {tabName === 'accepted' && <th>Initial commission</th>}
                <th>Status</th>
                <th>Product details</th>
                <th>Receipt image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((sale, index) => (
                  <tr key={sale.id}>
                    <td data-label="SN">{index + 1 + indexOfFirstRow}</td>
                    <td className="first-name-col" data-label="Agent Name">
                      {sale.first_name || 'N/A'} {sale.last_name || 'N/A'}
                    </td>
                    <td data-label="Phone number">{sale.phone_number || 'N/A'}</td>
                    <td data-label="Email">{sale.email || 'N/A'}</td>
                    <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                    <td className="region-name-col" data-label="Region">{sale.region_name || 'N/A'}</td>
                    <td data-label="Sub Region">{sale.sub_region || 'N/A'}</td>
                    <td data-label="Amount">{sale.amount || 'N/A'}</td>
                    {tabName === 'accepted' && (
                      <td data-label="Initial Commission">{sale.initial_commission || 'N/A'}</td>
                    )}
                    <td data-label="Status">{sale.status || 'Pending'}</td>
                    <td data-label="Product Details">
                      <button className="action-btn view-btn" onClick={() => handleViewProductDetails(sale.ref_id)}>
                        View Details
                      </button>
                    </td>
                    <td data-label="Receipt Image">
                      <button className="action-btn view-btn" onClick={() => handleViewImage(sale.reciept_image_path)}>
                        View
                      </button>
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
                        <button className="action-btn delete-btn" onClick={() => moveAcceptedToRejected(sale.id)}>
                          Reject
                        </button>
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
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => setPageForTab(tabName, page)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: (pages[tabName] || 1) === page ? '#0a803e' : '#f0f0f0',
                color: (pages[tabName] || 1) === page ? '#fff' : '#000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    );
  };

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
          <ProductDetails records={selectedProduct} onClose={() => setSelectedProduct(null)} />
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
