import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { useSelector } from 'react-redux';
import apiClient, { BASE_URL } from '../apiClient';
import GenericModal from '../GenericModal';
import SalesDetailsTable from '../Sales/SalesDetailsTable';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { usePagination } from '../PaginationContext';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function CommissionsTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [approval1Data, setApproval1Data] = useState([]);
  const [approval2Data, setApproval2Data] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [currentTab, setCurrentTab] = useState('approval1');
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTab === 'approval1') {
        fetchApproval1();
      } else if (currentTab === 'approval2') {
        fetchApproval2();
      } else if (currentTab === 'initial') {
        fetchInitial();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentTab, accessToken]);

  const handleApproval1 = async (id) => {
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

  const handleInitialPay = (id) => {
    console.log('Pay initial commission for sale id:', id);
    // Implement your pay logic here.
  };

  const handlePrint = () => {
    const originalShowState = showSalesDetails;
    if (!showSalesDetails) {
      setShowSalesDetails(true);
    }
    setTimeout(() => {
      const printableArea = document.getElementById('printable-area');
      if (!printableArea) return;
      html2canvas(printableArea).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('agent-sales.pdf');
      });
      if (!originalShowState) {
        setShowSalesDetails(false);
      }
    }, 500);
  };

  const handleViewDetails = (agentId) => {
    setSelectedAgentId(agentId);
    setShowSalesDetails(true);
  };

  // If the Sales Details modal is active, render only the modal.
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

  const renderTable = (data, tabName) => {
    const currentPage = pages[tabName] || 1;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const paginatedData = data.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    // For the payment table (initial tab), leave as is.
    if (tabName === 'initial') {
      return (
        <>
          <div id="printable-area" className="table-content">
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th className="first-name-col">Agent Name</th>
                  <th>Phone Number</th>
                  <th>Distributor</th>
                  <th className="region-name-col">Region</th>
                  <th>Sub Region</th>
                  <th>Total Sales</th>
                  <th>Total Commission</th>
                  <th>Total Sales Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => {
                    const agent = item.agent || {};
                    return (
                      <tr key={(agent.agentId || item.id) + '-' + index}>
                        <td data-label="SN">{index + 1 + indexOfFirstRow}</td>
                        <td data-label="Agent Name">
                          {agent.first_name || 'N/A'} {agent.last_name || 'N/A'}
                        </td>
                        <td data-label="Phone Number">{agent.phone_number || 'N/A'}</td>
                        <td data-label="Distributor">{agent.distributor || 'N/A'}</td>
                        <td data-label="Region">{agent.region || 'N/A'}</td>
                        <td data-label="Sub Region">{agent.sub_region || 'N/A'}</td>
                        <td data-label="Total Sales">{agent.totalSales || 'N/A'}</td>
                        <td data-label="Total Commission">{agent.totalCommission || 'N/A'}</td>
                        <td data-label="Total Sales Count">{agent.totalSalesCount || 'N/A'}</td>
                        <td data-label="Actions">
                          <button
                            className="action-btn view-btn no-print screen-only"
                            onClick={() => handleViewDetails(agent.agentId)}
                          >
                            View Sales Details
                          </button>
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleInitialPay(agent.agentId)}
                          >
                            Pay
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
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
        </>
      );
    } else {
      // For approval1 and approval2 tabs: add Created Date and Created Time columns.
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
                      <td data-label="Actions">
                        {currentTab === 'approval1' && (
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleApproval1(sale.id)}
                          >
                            Confirm
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
                    <td colSpan="13" style={{ textAlign: 'center', padding: '20px' }}>
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
                onClick={() => setPageForTab(currentTab, page)}
                style={{
                  margin: '0 5px',
                  padding: '5px 10px',
                  backgroundColor: (pages[currentTab] || 1) === page ? '#0a803e' : '#f0f0f0',
                  color: (pages[currentTab] || 1) === page ? '#fff' : '#000',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {page}
              </button>
            ))}
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
        {currentTab === 'approval1' && (
          <button className="action-btn view-btn" onClick={() => fetchApproval1()}>
            Refresh
          </button>
        )}
        {currentTab === 'approval2' && (
          <button className="action-btn view-btn" onClick={() => fetchApproval2()}>
            Refresh
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
