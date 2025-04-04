import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { BASE_URL } from '../apiClient';
import { useSelector } from 'react-redux';
import GenericModal from '../GenericModal';
import SalesDetailsTable from '../Sales/SalesDetailsTable';
import AgentDetailsTable from './AgentDetailsTable'; // For viewing batch details
import apiClient from '../apiClient';
import { usePagination } from '../PaginationContext';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

// Simple confirmation dialog (no text input) for confirm/approve actions.
const confirmAction = async (promptText) => {
  const result = await Swal.fire({
    ...swalOptions,
    title: promptText,
    showCancelButton: true,
    confirmButtonText: 'Okay',
    cancelButtonText: 'Cancel',
  });
  if (result.isConfirmed) {
    return true;
  } else {
    Swal.fire({
      ...swalOptions,
      title: 'Action canceled',
      icon: 'info',
    });
    return false;
  }
};

// Confirmation dialog for the Pay action that requires text input.
const confirmPay = async (promptText) => {
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
      icon: 'info',
    });
    return false;
  }
};

// New function to view receipt images.
const handleViewImage = (reciept_image_path, groupData) => {
  if (!groupData?.permissions?.viewRecieptImage) {
    Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to view receipt images.' });
    return;
  }
  const imageUrl = `${BASE_URL}/serve/getImage/${reciept_image_path}`;
  Swal.fire({
    ...swalOptions,
    title: 'Receipt Image',
    html: `<img src="${imageUrl}" style="width:100%; height:auto; max-height:80vh;" />`,
    heightAuto: false,
    showConfirmButton: true,
    confirmButtonText: 'Close'
  });
};

function CommissionsTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const groupData = useSelector((state) => state.auth.groupData);
  const [approval1Data, setApproval1Data] = useState([]);
  const [approval2Data, setApproval2Data] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [currentTab, setCurrentTab] = useState('approval1');
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  // New state for handling batch details modal
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [selectedRefNo, setSelectedRefNo] = useState(null);

  const { pages, setPageForTab, rowsPerPage } = usePagination();

  // Ref for the pages container to enable horizontal scrolling of page buttons.
  const pagesContainerRef = useRef(null);

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

  const fetchApproval1 = () => {
    apiClient.get('/sales/approved')
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setApproval1Data(data);
          console.log('Approval1 data:', data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching confirmation:', error);
      });
  };

  const fetchApproval2 = () => {
    apiClient.get('/sales/approved1')
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setApproval2Data(data);
          console.log('Approval2 data:', data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching approval:', error);
      });
  };

  const fetchInitial = () => {
    apiClient.get('/sales/agent')
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setInitialData(data);
          console.log('Initial commissions data:', data);
        } else {
          return Promise.reject('Invalid data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching initial commissions:', error);
      });
  };

  useEffect(() => {
    if (currentTab === 'approval1') {
      fetchApproval1();
    } else if (currentTab === 'approval2') {
      fetchApproval2();
    } else if (currentTab === 'initial') {
      fetchInitial();
    }
    setPageForTab(currentTab, 1);
  }, [currentTab, accessToken]);

  const handleApproval1 = async (id) => {
    if (!groupData?.permissions?.approve1) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to confirm commission.'
      });
      return;
    }
    const sale = approval1Data.find((s) => s.id === id);
    const confirmed = await confirmAction(
      `Are you sure you want to confirm commission for ${sale ? sale.first_name : 'this sale'}?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      await apiClient.put('/sales/update1', null, {
        params: { id, newStatus: 'Confirmed' },
      });
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Success',
        text: 'Sale confirmed successfully!',
        icon: 'success',
      });
      fetchApproval1();
    } catch (error) {
      console.error('Error in Approval1:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: error.message,
        icon: 'error',
      });
    }
  };

  const handleApproval2 = async (id) => {
    if (!groupData?.permissions?.approve2) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to approve commission.'
      });
      return;
    }
    const sale = approval2Data.find((s) => s.id === id);
    const confirmed = await confirmAction(
      `Are you sure you want to approve commission for ${sale ? sale.first_name : 'this sale'}?`
    );
    if (!confirmed) return;

    showLoadingAlert();
    try {
      await apiClient.put('/sales/approve', null, {
        params: { id, newStatus: 'Approved' },
      });
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Success',
        text: 'Sale approved successfully!',
        icon: 'success',
      });
      fetchApproval2();
    } catch (error) {
      console.error('Error in Approval-tab:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: error.message,
        icon: 'error',
      });
    }
  };

  // Modified handleInitialPay remains for non-batch pay actions (if needed)
  const handleInitialPay = async (id) => {
    if (!groupData?.permissions?.pay) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to pay commission.'
      });
      return;
    }
    const confirmed = await confirmPay(`Are you sure you want to pay commission for Agent ID: ${id}?`);
    if (!confirmed) return;
    apiClient.post(`/credit-transfer?id=${id}`)
      .then(() => {
        Swal.fire({
          title: 'Success!',
          text: `Initial commission paid successfully for Agent ID: ${id}`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error!',
          text: `Failed to pay initial commission for Agent ID: ${id}`,
          icon: 'error',
          confirmButtonText: 'Try Again'
        });
        console.error('Error paying initial commission:', error);
      });
  };

  const handleViewDetails = (agentId) => {
    if (!groupData?.permissions?.readCommission) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to view commission details.'
      });
      return;
    }
    setSelectedAgentId(agentId);
    setShowSalesDetails(true);
  };

  // New functions for batch actions
  const handleCloseBatch = async (refNo) => {
    const confirmed = await confirmAction(`Are you sure you want to close batch ${refNo}?`);
    if (!confirmed) return;
    showLoadingAlert();
    try {
      await apiClient.put('/batch/close', null, { params: { refNo } });
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Success',
        text: 'Batch closed successfully!',
        icon: 'success',
      });
      // Optionally refresh data if needed.
    } catch (error) {
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: error.message,
        icon: 'error',
      });
    }
  };

  const handlePayBatch = async (refNo) => {
    if (!groupData?.permissions?.pay) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to pay commission.'
      });
      return;
    }
    const confirmed = await confirmPay(`Are you sure you want to pay commission for batch ${refNo}?`);
    if (!confirmed) return;
    try {
      await apiClient.post('/batch/pay', null, { params: { refNo } });
      Swal.fire({
        title: 'Success!',
        text: `Batch paid successfully for Ref No: ${refNo}`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: `Failed to pay batch for Ref No: ${refNo}`,
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
      console.error('Error paying batch:', error);
    }
  };

  const handleViewBatch = (refNo) => {
    setSelectedRefNo(refNo);
    setShowBatchDetails(true);
  };

  // Render modals if active
  if (showSalesDetails) {
    return (
      <GenericModal onClose={() => setShowSalesDetails(false)} showBackButton={false}>
        <SalesDetailsTable
          agentId={selectedAgentId}
          onBack={() => setShowSalesDetails(false)}
        />
      </GenericModal>
    );
  }

  if (showBatchDetails) {
    return (
      <GenericModal onClose={() => setShowBatchDetails(false)} showBackButton={false}>
        <AgentDetailsTable
          refNo={selectedRefNo}
          onBack={() => setShowBatchDetails(false)}
        />
      </GenericModal>
    );
  }

  const renderTable = (data, tabName) => {
    // For the Confirmation tab (approval1), keep the original table format with added receipt view button.
    if (tabName === 'approval1') {
      const currentPage = pages[tabName] || 1;
      const indexOfLastRow = currentPage * rowsPerPage;
      const indexOfFirstRow = indexOfLastRow - rowsPerPage;
      const paginatedData = data.slice(indexOfFirstRow, indexOfLastRow);
      const totalPages = Math.ceil(data.length / rowsPerPage);
      return (
        <>
          <div className="table-content">
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th className="first-name-col">Agent Name</th>
                  <th>Phone Number</th>
                  <th>Distributor</th>
                  <th className="region-name-col">Region</th>
                  <th>Sub Region</th>
                  <th>Amount</th>
                  <th>Created Date</th>
                  <th>Created Time</th>
                  <th>Commission</th>
                  <th>Confirmation</th>
                  <th>Approval</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((sale, index) => (
                    <tr key={`${sale.id}-${index}`}>
                      <td data-label="SN">{index + 1 + indexOfFirstRow}</td>
                      <td className="first-name-col" data-label="Agent Name">
                        {sale.first_name || 'N/A'} {sale.last_name || 'N/A'}
                      </td>
                      <td data-label="Phone Number">{sale.phone_number || 'N/A'}</td>
                      <td data-label="Distributor">{sale.distributor || 'N/A'}</td>
                      <td className="region-name-col" data-label="Region">
                        {sale.region_name || 'N/A'}
                      </td>
                      <td data-label="Sub Region">{sale.sub_region || 'N/A'}</td>
                      <td data-label="Amount">{sale.amount || 'N/A'}</td>
                      <td data-label="Created Date">
                        {sale.created_date ? sale.created_date.split('T')[0] : 'N/A'}
                      </td>
                      <td data-label="Created Time">
                        {sale.created_date ? sale.created_date.split('T')[1].split('.')[0] : 'N/A'}
                      </td>
                      <td data-label="Commission">{sale.initial_commission || 'N/A'}</td>
                      <td data-label="Confirmation">{sale.approval1 || 'N/A'}</td>
                      <td data-label="Approval">{sale.approval2 || 'N/A'}</td>
                      <td data-label="Receipt">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewImage(sale.reciept_image_path, groupData)}
                        >
                          View Receipt
                        </button>
                      </td>
                      <td data-label="Actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleApproval1(sale.id)}
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => pagesContainerRef.current && pagesContainerRef.current.scrollBy({ left: -50, behavior: 'smooth' })}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              &#x25C0;
            </button>
            <div ref={pagesContainerRef} style={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '300px' }}>
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
            <button
              onClick={() => pagesContainerRef.current && pagesContainerRef.current.scrollBy({ left: 50, behavior: 'smooth' })}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              &#x25B6;
            </button>
          </div>
        </>
      );
    } else if (tabName === 'approval2' || tabName === 'initial') {
      // New table format for Approval and Payment tabs
      const currentPage = pages[tabName] || 1;
      const indexOfLastRow = currentPage * rowsPerPage;
      const indexOfFirstRow = indexOfLastRow - rowsPerPage;
      const paginatedData = data.slice(indexOfFirstRow, indexOfLastRow);
      const totalPages = Math.ceil(data.length / rowsPerPage);
      return (
        <>
          <div className="table-content">
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th>State</th>
                  <th>Ref No</th>
                  <th>No of Sales</th>
                  <th>Commission</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={item.refNo + '-' + index}>
                      <td data-label="SN">{index + 1 + indexOfFirstRow}</td>
                      <td data-label="State">{item.state || 'N/A'}</td>
                      <td data-label="Ref No">{item.refNo || 'N/A'}</td>
                      <td data-label="No of Sales">{item.no_of_sales || 'N/A'}</td>
                      <td data-label="Commission">{item.commission || 'N/A'}</td>
                      <td data-label="Actions">
                        {tabName === 'approval2' && (
                          <>
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleCloseBatch(item.refNo)}
                            >
                              Close Batch
                            </button>
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewBatch(item.refNo)}
                            >
                              View
                            </button>
                          </>
                        )}
                        {tabName === 'initial' && (
                          <>
                            <button
                              className="action-btn view-btn"
                              onClick={() => handlePayBatch(item.refNo)}
                            >
                              Pay
                            </button>
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewBatch(item.refNo)}
                            >
                              View
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => pagesContainerRef.current && pagesContainerRef.current.scrollBy({ left: -50, behavior: 'smooth' })}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              &#x25C0;
            </button>
            <div ref={pagesContainerRef} style={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '300px' }}>
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
            <button
              onClick={() => pagesContainerRef.current && pagesContainerRef.current.scrollBy({ left: 50, behavior: 'smooth' })}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              &#x25B6;
            </button>
          </div>
        </>
      );
    }
  };

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
          <button className={`tab-btn ${currentTab === 'approval1' ? 'active' : ''}`} onClick={() => setCurrentTab('approval1')}>
            Confirmation
          </button>
          <button className={`tab-btn ${currentTab === 'approval2' ? 'active' : ''}`} onClick={() => setCurrentTab('approval2')}>
            Approval
          </button>
          <button className={`tab-btn ${currentTab === 'initial' ? 'active' : ''}`} onClick={() => setCurrentTab('initial')}>
            Payment
          </button>
        </div>
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
          <h2>{currentTab === 'initial' ? 'Agent Details' : 'Commissions Records'}</h2>
        </div>
      </div>
      {renderControls()}
      {currentTab === 'approval1'
        ? renderTable(approval1Data, currentTab)
        : currentTab === 'approval2'
        ? renderTable(approval2Data, currentTab)
        : renderTable(initialData, currentTab)}
    </div>
  );
}

export default CommissionsTable;
